import os
import sys
import json
import logging
from neo4j import GraphDatabase

# Configure absolute paths to import backend drivers
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.core.config import settings

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("chainlens.seed")

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

def load_json(filename):
    with open(os.path.join(DATA_DIR, filename), "r", encoding="utf-8") as f:
        return json.load(f)

def run_seed():
    logger.info("Initializing connection to CognoDB Cloud...")
    driver = GraphDatabase.driver(
        settings.COGNODB_URI,
        auth=(settings.COGNODB_USER, settings.COGNODB_PASSWORD)
    )

    try:
        driver.verify_connectivity()
        logger.info("Connection established. Loading JSON files...")

        # Load nodes
        regions = load_json("regions.json")
        industries = load_json("industries.json")
        suppliers = load_json("suppliers.json")
        components = load_json("components.json")
        products = load_json("products.json")
        factories = load_json("factories.json")
        risk_events = load_json("risk_events.json")

        # Load relationships
        rels = load_json("relationships.json")

        with driver.session() as session:
            logger.info("Loading Nodes...")
            
            # Regions
            session.run(
                "UNWIND $rows AS row MERGE (r:Region {id: row.id}) SET r.name = row.name, r.country = row.country",
                rows=regions
            )
            # Industries
            session.run(
                "UNWIND $rows AS row MERGE (i:Industry {id: row.id}) SET i.name = row.name",
                rows=industries
            )
            # Suppliers
            session.run(
                "UNWIND $rows AS row MERGE (s:Supplier {id: row.id}) SET s.name = row.name, s.tier = row.tier, s.country = row.country, s.status = row.status",
                rows=suppliers
            )
            # Components
            session.run(
                "UNWIND $rows AS row MERGE (c:Component {id: row.id}) SET c.name = row.name, c.category = row.category, c.criticality = row.criticality",
                rows=components
            )
            # Products
            session.run(
                "UNWIND $rows AS row MERGE (p:Product {id: row.id}) SET p.name = row.name, p.category = row.category",
                rows=products
            )
            # Factories
            session.run(
                "UNWIND $rows AS row MERGE (f:Factory {id: row.id}) SET f.name = row.name, f.capacity_units_per_year = row.capacity_units_per_year, f.status = row.status",
                rows=factories
            )
            # RiskEvents
            session.run(
                "UNWIND $rows AS row MERGE (e:RiskEvent {id: row.id}) SET e.name = row.name, e.type = row.type, e.severity = row.severity, e.status = row.status, e.start_date = row.start_date, e.description = row.description",
                rows=risk_events
            )

            logger.info("Loading Relationships...")

            # Delete relationship types that are fully controlled by seed data
            # This ensures stale edges from previous runs are removed
            session.run("MATCH ()-[r:SUPPLIES]->() DELETE r")
            session.run("MATCH ()-[r:AFFECTED_BY]->() DELETE r")
            session.run("MATCH ()-[r:ALTERNATIVE_TO]->() DELETE r")

            # SUPPLIES
            session.run("""
                UNWIND $rows AS row
                MATCH (s:Supplier {id: row.from})
                MATCH (c:Component {id: row.to})
                MERGE (s)-[rel:SUPPLIES]->(c)
                SET rel.lead_time_days = row.lead_time_days,
                    rel.capacity_per_month = row.capacity_per_month,
                    rel.contract_status = row.contract_status
            """, rows=rels["SUPPLIES"])

            # USED_IN
            session.run("""
                UNWIND $rows AS row
                MATCH (c:Component {id: row.from})
                MATCH (p:Product {id: row.to})
                MERGE (c)-[rel:USED_IN]->(p)
                SET rel.quantity_per_product = row.quantity_per_product
            """, rows=rels["USED_IN"])

            # PRODUCED_AT
            session.run("""
                UNWIND $rows AS row
                MATCH (p:Product {id: row.from})
                MATCH (f:Factory {id: row.to})
                MERGE (p)-[rel:PRODUCED_AT]->(f)
                SET rel.annual_capacity = row.annual_capacity
            """, rows=rels["PRODUCED_AT"])

            # LOCATED_IN (Supplier)
            session.run("""
                UNWIND $rows AS row
                MATCH (s:Supplier {id: row.from})
                MATCH (r:Region {id: row.to})
                MERGE (s)-[:LOCATED_IN]->(r)
            """, rows=rels["LOCATED_IN_SUPPLIER"])

            # LOCATED_IN (Factory)
            session.run("""
                UNWIND $rows AS row
                MATCH (f:Factory {id: row.from})
                MATCH (r:Region {id: row.to})
                MERGE (f)-[:LOCATED_IN]->(r)
            """, rows=rels["LOCATED_IN_FACTORY"])

            # SERVES
            session.run("""
                UNWIND $rows AS row
                MATCH (s:Supplier {id: row.from})
                MATCH (i:Industry {id: row.to})
                MERGE (s)-[:SERVES]->(i)
            """, rows=rels["SERVES"])

            # AFFECTED_BY
            session.run("""
                UNWIND $rows AS row
                MATCH (s:Supplier {id: row.from})
                MATCH (e:RiskEvent {id: row.to})
                MERGE (s)-[rel:AFFECTED_BY]->(e)
                SET rel.impact_level = row.impact_level
            """, rows=rels["AFFECTED_BY"])

            # ALTERNATIVE_TO
            session.run("""
                UNWIND $rows AS row
                MATCH (s1:Supplier {id: row.from})
                MATCH (s2:Supplier {id: row.to})
                MERGE (s1)-[rel:ALTERNATIVE_TO]->(s2)
                SET rel.compatibility = row.compatibility,
                    rel.switching_days = row.switching_days
            """, rows=rels["ALTERNATIVE_TO"])

            logger.info("Data seeding finished. Running validation queries...")

            # Run Validation Queries and gather counts
            val_nodes = session.run("""
                MATCH (n)
                RETURN labels(n)[0] AS label, count(n) AS cnt
            """).data()
            node_counts = {item["label"]: item["cnt"] for item in val_nodes}

            val_rels = session.run("""
                MATCH ()-[r]->()
                RETURN type(r) AS rel_type, count(r) AS cnt
            """).data()
            rel_counts = {item["rel_type"]: item["cnt"] for item in val_rels}

            # Validating Constraints & Traversals
            # 1. Single source components
            single_source_count = session.run("""
                MATCH (s:Supplier)-[:SUPPLIES]->(c:Component)
                WITH c, count(s) AS suppliers_cnt
                WHERE suppliers_cnt = 1
                RETURN count(c) AS single_source_cnt
            """).single()["single_source_cnt"]

            # 2. Active Risk Events
            active_risks_cnt = session.run("""
                MATCH (e:RiskEvent {status: 'Active'})
                RETURN count(e) AS cnt
            """).single()["cnt"]

            # 3. High severity active risk events
            high_sev_active_cnt = session.run("""
                MATCH (e:RiskEvent {status: 'Active', severity: 'High'})
                RETURN count(e) AS cnt
            """).single()["cnt"]

            # 4. Hero supplier validation downstreams
            hero_downstream = session.run("""
                MATCH (s:Supplier {id: 'sup-01'})-[:SUPPLIES]->(c:Component)-[:USED_IN]->(p:Product)-[:PRODUCED_AT]->(f:Factory)-[:LOCATED_IN]->(r:Region)
                RETURN count(DISTINCT p) AS products_cnt,
                       count(DISTINCT f) AS factories_cnt,
                       count(DISTINCT r) AS regions_cnt
            """).single()

            hero_single_source_cmp = session.run("""
                MATCH (s:Supplier {id: 'sup-01'})-[:SUPPLIES]->(c:Component)
                OPTIONAL MATCH (other:Supplier)-[:SUPPLIES]->(c)
                WHERE other <> s
                WITH c, count(other) AS alternative_supplier_count
                WHERE alternative_supplier_count = 0
                RETURN count(c) AS single_source_cmp_cnt
            """).single()["single_source_cmp_cnt"]

            hero_potential_alts = session.run("""
                MATCH (s:Supplier {id: 'sup-01'})-[:SUPPLIES]->(c:Component)<-[:SUPPLIES]-(alt:Supplier)
                WHERE alt <> s
                RETURN count(DISTINCT alt) AS potential_alts_cnt
            """).single()["potential_alts_cnt"]

            hero_approved_alts = session.run("""
                MATCH (alt:Supplier)-[rel:ALTERNATIVE_TO]->(s:Supplier {id: 'sup-01'})
                RETURN count(alt) AS approved_alts_cnt
            """).single()["approved_alts_cnt"]

            hero_active_high_risks = session.run("""
                MATCH (s:Supplier {id: 'sup-01'})-[:AFFECTED_BY]->(e:RiskEvent {status: 'Active', severity: 'High'})
                RETURN count(e) AS active_high_risks_cnt
            """).single()["active_high_risks_cnt"]

            # Write Stats to console
            print("\n" + "="*40)
            print("GRAPH STATISTICS & SEED REPORT")
            print("="*40)
            print("Nodes:")
            for label in ["Supplier", "Component", "Product", "Factory", "Region", "Industry", "RiskEvent"]:
                print(f"  {label}: {node_counts.get(label, 0)}")
            print("Relationships:")
            total_rels = 0
            for rtype in ["SUPPLIES", "USED_IN", "PRODUCED_AT", "LOCATED_IN", "SERVES", "AFFECTED_BY", "ALTERNATIVE_TO"]:
                cnt = rel_counts.get(rtype, 0)
                total_rels += cnt
                print(f"  {rtype}: {cnt}")
            print(f"Total relationships: {total_rels}")
            print("-"*40)
            print(f"Single-source components: {single_source_count}")
            print(f"Active risk events: {active_risks_cnt}")
            print(f"High-severity active risk events: {high_sev_active_cnt}")
            print("-"*40)
            print("Hero supplier (sup-01) validation:")
            print(f"  Hero downstream products: {hero_downstream['products_cnt']}")
            print(f"  Hero downstream factories: {hero_downstream['factories_cnt']}")
            print(f"  Hero downstream regions: {hero_downstream['regions_cnt']}")
            print(f"  Single-source components supplied by Hero: {hero_single_source_cmp}")
            print(f"  Potential alternatives: {hero_potential_alts}")
            print(f"  Approved alternatives: {hero_approved_alts}")
            print(f"  Active High severity risk events: {hero_active_high_risks}")
            
            # Manual validation check values
            raw_score = (hero_downstream['products_cnt'] * 2) + \
                        (hero_downstream['factories_cnt'] * 3) + \
                        (hero_single_source_cmp * 4) + \
                        (hero_active_high_risks * 5)
            normalized_score = min(100, round(raw_score / 1.5))
            
            tier = "LOW"
            if normalized_score >= 70:
                tier = "HIGH"
            elif normalized_score >= 40:
                tier = "MEDIUM"
                
            print(f"  Calculated raw risk score: {raw_score}")
            print(f"  Calculated normalized risk score: {normalized_score}")
            print(f"  Calculated risk tier: {tier}")
            print("="*40 + "\n")

    except Exception as e:
        logger.error(f"Error seeding CognoDB graph dataset: {e}")
        sys.exit(1)
    finally:
        driver.close()

if __name__ == "__main__":
    run_seed()
