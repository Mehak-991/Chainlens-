import logging
from typing import Dict, Any, List
from app.repositories.graph_repository import GraphRepository

logger = logging.getLogger("chainlens.service")

class SupplyChainService:
    def __init__(self, repository: GraphRepository):
        self.repository = repository

    def analyze_supplier_impact(self, supplier_id: str) -> Dict[str, Any]:
        """Calculates derived risk parameters and compiles analysis records for a supplier."""
        # 1. Existence check
        if not self.repository.get_supplier_exists(supplier_id):
            return {
                "supplier_exists": False,
                "error": f"Supplier with ID '{supplier_id}' not found."
            }

        # 2. Collect query metrics
        metrics = self.repository.get_impact_metrics(supplier_id)
        critical_deps = self.repository.get_critical_dependencies(supplier_id)
        alternatives = self.repository.get_alternatives(supplier_id)
        active_events = self.repository.get_active_risk_events(supplier_id)
        high_severity_active_risk_count = self.repository.get_high_severity_active_risk_count(supplier_id)

        # 3. Apply deterministic risk score formula
        affected_products = metrics["affected_products"]
        affected_factories = metrics["affected_factories"]
        single_source_components = len(critical_deps)

        raw_score = (
            (affected_products * 2) +
            (affected_factories * 3) +
            (single_source_components * 4) +
            (high_severity_active_risk_count * 5)
        )

        # Normalization using capped linear scaling formula
        normalized_score = min(100, round(raw_score / 1.5))

        # Risk categories mapping
        if normalized_score < 40:
            tier = "LOW"
        elif normalized_score < 70:
            tier = "MEDIUM"
        else:
            tier = "HIGH"

        return {
            "supplier_exists": True,
            "supplier_id": supplier_id,
            "metrics": {
                "supplied_components": metrics["affected_components"],
                "affected_products": affected_products,
                "affected_factories": affected_factories,
                "affected_regions": metrics["affected_regions"]
            },
            "risk_analysis": {
                "raw_score": raw_score,
                "normalized_score": normalized_score,
                "risk_tier": tier,
                "high_severity_active_events_count": high_severity_active_risk_count
            },
            "critical_dependencies": critical_deps,
            "alternatives": alternatives,
            "active_risk_events": active_events
        }

    def get_impact_paths(self, supplier_id: str) -> List[Dict[str, Any]]:
        """Returns path node maps for visualization endpoints."""
        if not self.repository.get_supplier_exists(supplier_id):
            return []
        return self.repository.get_impact_paths(supplier_id)
