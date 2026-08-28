import logging
from typing import Optional
from neo4j import GraphDatabase, Driver
from app.core.config import settings

logger = logging.getLogger("chainlens.database")

class DatabaseDriver:
    def __init__(self):
        self._driver: Optional[Driver] = None

    def connect(self) -> None:
        """Initialize the long-lived Neo4j driver connection pool."""
        if self._driver is not None:
            return

        uri = settings.COGNODB_URI
        user = settings.COGNODB_USER
        password = settings.COGNODB_PASSWORD

        try:
            logger.info(f"Connecting to CognoDB Cloud at: {uri} (User: {user})")
            self._driver = GraphDatabase.driver(
                uri,
                auth=(user, password)
            )
        except Exception as e:
            logger.error(f"Failed to create the Neo4j driver: {e}")
            self._driver = None
            raise

    def close(self) -> None:
        """Close the Neo4j driver connection pool."""
        if self._driver:
            logger.info("Closing CognoDB connection pool.")
            self._driver.close()
            self._driver = None

    def get_driver(self) -> Driver:
        """Get the driver instance. Reconnects if necessary."""
        if self._driver is None:
            self.connect()
        if self._driver is None:
            raise RuntimeError("Database driver is not initialized.")
        return self._driver

    def verify_connectivity(self) -> bool:
        """Verify that the driver can establish a connection and authenticate."""
        if self._driver is None:
            try:
                self.connect()
            except Exception:
                return False
        try:
            self._driver.verify_connectivity()
            return True
        except Exception as e:
            logger.error(f"CognoDB connectivity verification failed: {e}")
            return False

# Global single instance of DatabaseDriver to be shared by lifespan events
db = DatabaseDriver()
