from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class ImpactMetrics(BaseModel):
    supplied_components: int
    affected_products: int
    affected_factories: int
    affected_regions: int

class RiskAnalysis(BaseModel):
    raw_score: int
    normalized_score: int
    risk_tier: str
    high_severity_active_events_count: int

class CriticalDependency(BaseModel):
    component_id: str
    component_name: str
    criticality: str
    supplier_count: int

class AlternativeMapping(BaseModel):
    component_id: str
    component_name: str
    potential_alternatives: List[str]
    approved_alternatives: List[Dict[str, Any]]

class RiskEventDetail(BaseModel):
    id: str
    type: str
    severity: str
    description: str
    start_date: str

class SupplierImpactAnalysis(BaseModel):
    supplier_exists: bool
    supplier_id: str
    metrics: ImpactMetrics
    risk_analysis: RiskAnalysis
    critical_dependencies: List[CriticalDependency]
    alternatives: List[AlternativeMapping]
    active_risk_events: List[RiskEventDetail]
