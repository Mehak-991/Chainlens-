import logging
from neo4j import Driver

logger = logging.getLogger("chainlens.schema")

# Define all uniqueness constraints (id is unique for all node types)
CONSTRAINTS = [
    "CREATE CONSTRAINT supplier_id_unique IF NOT EXISTS FOR (s:Supplier) REQUIRE s.id IS UNIQUE",
    "CREATE CONSTRAINT component_id_unique IF NOT EXISTS FOR (c:Component) REQUIRE c.id IS UNIQUE",
    "CREATE CONSTRAINT product_id_unique IF NOT EXISTS FOR (p:Product) REQUIRE p.id IS UNIQUE",
    "CREATE CONSTRAINT factory_id_unique IF NOT EXISTS FOR (f:Factory) REQUIRE f.id IS UNIQUE",
    "CREATE CONSTRAINT region_id_unique IF NOT EXISTS FOR (r:Region) REQUIRE r.id IS UNIQUE",
    "CREATE CONSTRAINT industry_id_unique IF NOT EXISTS FOR (i:Industry) REQUIRE i.id IS UNIQUE",
    "CREATE CONSTRAINT risk_event_id_unique IF NOT EXISTS FOR (e:RiskEvent) REQUIRE e.id IS UNIQUE"
]

# Define critical indexes for properties used in filtering or lookups
INDEXES = [
    "CREATE INDEX supplier_name_index IF NOT EXISTS FOR (s:Supplier) ON (s.name)",
    "CREATE INDEX risk_event_status_index IF NOT EXISTS FOR (e:RiskEvent) ON (e.status)",
    "CREATE INDEX risk_event_severity_index IF NOT EXISTS FOR (e:RiskEvent) ON (e.severity)"
]

def initialize_schema(driver: Driver) -> None:
    """Executes constraints and indexes definitions against the database.
    
    This function is idempotent. Schema changes are committed synchronously.
    """
    logger.info("Initializing graph schema constraints and indexes...")
    with driver.session() as session:
        # 1. Create uniqueness constraints
        for constraint_cypher in CONSTRAINTS:
            try:
                logger.debug(f"Applying constraint: {constraint_cypher}")
                session.run(constraint_cypher)
            except Exception as e:
                logger.error(f"Failed to create constraint: {e}")
                raise

        # 2. Create indexes
        for index_cypher in INDEXES:
            try:
                logger.debug(f"Applying index: {index_cypher}")
                session.run(index_cypher)
            except Exception as e:
                logger.error(f"Failed to create index: {e}")
                raise

    logger.info("Graph schema initialized successfully.")
