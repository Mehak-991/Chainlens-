import sys
import os
import logging

# Ensure project root is in path for scripts run directly
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("chainlens.setup")

from app.database.driver import db
from app.database.schema import initialize_schema

def main():
    logger.info("Starting database connectivity verification and schema setup...")
    
    # 1. Connect and verify connectivity
    if not db.verify_connectivity():
        logger.error("Failed to connect to CognoDB Cloud. Verify configurations and try again.")
        sys.exit(1)
        
    logger.info("Successfully connected to CognoDB Cloud.")
    
    # 2. Get driver and initialize constraints/indexes
    try:
        driver = db.get_driver()
        initialize_schema(driver)
        
        # 3. Simple verification test query
        with driver.session() as session:
            result = session.run("RETURN 1 AS ok").single()
            if result and result["ok"] == 1:
                logger.info("Harmless verification query (RETURN 1) returned success.")
            else:
                logger.warning("Verification query did not return expected output.")
                
        logger.info("Database validation and schema setup completed successfully!")
    except Exception as e:
        logger.error(f"Error during schema verification/setup: {e}")
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    main()
