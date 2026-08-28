import os
from typing import Dict, List, Any, Optional
from neo4j import Driver

# Helper to read cypher files
def read_query(filename: str) -> str:
    path = os.path.join(os.path.dirname(__file__), "..", "queries", filename)
    with open(path, "r", encoding="utf-8") as f:
        return f.read()

class GraphRepository:
    def __init__(self, driver: Driver):
        self.driver = driver
        self._impact_query = read_query("impact.cypher")
        self._alternatives_query = read_query("alternatives.cypher")
        self._critical_dependencies_query = read_query("critical_dependencies.cypher")
        self._risk_events_query = read_query("risk_events.cypher")

    def get_supplier_exists(self, supplier_id: str) -> bool:
        """Check if a supplier exists in the database."""
        query = "MATCH (s:Supplier {id: $supplier_id}) RETURN count(s) > 0 AS exists"
        with self.driver.session() as session:
            result = session.run(query, supplier_id=supplier_id).single()
            return result["exists"] if result else False

    def get_impact_metrics(self, supplier_id: str) -> Dict[str, int]:
        """Calculates counts of components, products, factories, and regions downstream of a supplier."""
        query = """
        MATCH (s:Supplier {id: $supplier_id})
        OPTIONAL MATCH (s)-[:SUPPLIES]->(c:Component)
        OPTIONAL MATCH (c)-[:USED_IN]->(p:Product)
        OPTIONAL MATCH (p)-[:PRODUCED_AT]->(f:Factory)
        OPTIONAL MATCH (f)-[:LOCATED_IN]->(r:Region)
        RETURN
            count(DISTINCT c) AS affected_components,
            count(DISTINCT p) AS affected_products,
            count(DISTINCT f) AS affected_factories,
            count(DISTINCT r) AS affected_regions
        """
        with self.driver.session() as session:
            result = session.run(query, supplier_id=supplier_id).single()
            if result:
                return {
                    "affected_components": result["affected_components"],
                    "affected_products": result["affected_products"],
                    "affected_factories": result["affected_factories"],
                    "affected_regions": result["affected_regions"]
                }
            return {
                "affected_components": 0,
                "affected_products": 0,
                "affected_factories": 0,
                "affected_regions": 0
            }

    def get_critical_dependencies(self, supplier_id: str) -> List[Dict[str, Any]]:
        """Finds components supplied by this supplier that have no alternative supplier."""
        with self.driver.session() as session:
            records = session.run(self._critical_dependencies_query, supplier_id=supplier_id)
            return [
                {
                    "component_id": record["component_id"],
                    "component_name": record["component_name"],
                    "criticality": record["criticality"],
                    "supplier_count": record["supplier_count"]
                }
                for record in records
            ]

    def get_alternatives(self, supplier_id: str) -> List[Dict[str, Any]]:
        """Retrieves dynamic potential alternatives and approved alternatives for this supplier."""
        with self.driver.session() as session:
            records = session.run(self._alternatives_query, supplier_id=supplier_id)
            return [
                {
                    "component_id": record["component_id"],
                    "component_name": record["component_name"],
                    "potential_alternatives": record["potential_alternatives"],
                    "approved_alternatives": record["approved_alternatives"]
                }
                for record in records
            ]

    def get_active_risk_events(self, supplier_id: str) -> List[Dict[str, Any]]:
        """Retrieves active risk events affecting this supplier."""
        with self.driver.session() as session:
            records = session.run(self._risk_events_query, supplier_id=supplier_id)
            return [
                {
                    "id": record["id"],
                    "type": record["type"],
                    "severity": record["severity"],
                    "description": record["description"],
                    "start_date": record["start_date"]
                }
                for record in records
            ]

    def get_high_severity_active_risk_count(self, supplier_id: str) -> int:
        """Count High severity active risk events for a supplier."""
        query = """
        MATCH (s:Supplier {id: $supplier_id})-[:AFFECTED_BY]->(e:RiskEvent)
        WHERE e.status = "Active" AND e.severity = "High"
        RETURN count(e) AS cnt
        """
        with self.driver.session() as session:
            result = session.run(query, supplier_id=supplier_id).single()
            return result["cnt"] if result else 0

    def get_impact_paths(self, supplier_id: str) -> List[Dict[str, Any]]:
        """Retrieves raw path nodes and edges representing blast radius traversal."""
        with self.driver.session() as session:
            records = session.run(self._impact_query, supplier_id=supplier_id)
            paths = []
            for record in records:
                path_obj = record["path"]
                if path_obj:
                    # Convert Neo4j path metadata to list representation
                    paths.append({
                        "nodes": [{"id": node.get("id"), "label": list(node.labels)[0], "name": node.get("name")} for node in path_obj.nodes],
                        "relationships": [rel.type for rel in path_obj.relationships]
                    })
            return paths
