import os
import sys
import logging

# Set up project root imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("chainlens.validate_queries")

from app.database.driver import db
from app.repositories.graph_repository import GraphRepository
from app.services.supply_chain_service import SupplyChainService

def test_queries():
    logger.info("Connecting to verify Cypher Query Execution layer...")
    if not db.verify_connectivity():
        logger.error("Could not connect to CognoDB instance. Skipping query executions.")
        sys.exit(1)

    driver = db.get_driver()
    repo = GraphRepository(driver)
    service = SupplyChainService(repo)

    # 1. sup-01 (Hero supplier) validation
    supplier_id = "sup-01"
    logger.info(f"Validating queries for Hero Supplier '{supplier_id}'...")
    
    exists = repo.get_supplier_exists(supplier_id)
    print(f"Supplier exists: {exists}")

    analysis = service.analyze_supplier_impact(supplier_id)
    print(f"Analysis summary for {supplier_id}:")
    print(f"  Supplied Components count: {analysis['metrics']['supplied_components']}")
    print(f"  Downstream Products count: {analysis['metrics']['affected_products']}")
    print(f"  Affected Factories count: {analysis['metrics']['affected_factories']}")
    print(f"  Affected Regions count: {analysis['metrics']['affected_regions']}")
    print(f"  Critical single-source count: {len(analysis['critical_dependencies'])}")
    print(f"  Active Risk Events: {len(analysis['active_risk_events'])}")
    print(f"  Raw risk score: {analysis['risk_analysis']['raw_score']}")
    print(f"  Normalized risk score: {analysis['risk_analysis']['normalized_score']}")
    print(f"  Calculated risk tier: {analysis['risk_analysis']['risk_tier']}")

    # 2. Test edge case: Unknown supplier
    logger.info("Validating edge case: Unknown supplier 'sup-99'...")
    unknown_analysis = service.analyze_supplier_impact("sup-99")
    print(f"Unknown supplier exists: {unknown_analysis['supplier_exists']}")

    # 3. Test edge case: Supplier with no approved alternatives
    supplier_no_alts = "sup-05"
    logger.info(f"Validating edge case: Supplier '{supplier_no_alts}'...")
    no_alts_analysis = service.analyze_supplier_impact(supplier_no_alts)
    print(f"Supplier '{supplier_no_alts}' exists: {no_alts_analysis['supplier_exists']}")
    
    db.close()

if __name__ == "__main__":
    test_queries()
