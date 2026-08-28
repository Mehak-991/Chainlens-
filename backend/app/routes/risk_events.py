from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
from app.database.driver import db
from app.repositories.graph_repository import GraphRepository
from app.services.supply_chain_service import SupplyChainService
from app.schemas.analysis import RiskEventDetail

router = APIRouter(prefix="/api/risk-events", tags=["Risk Events"])

def get_service() -> SupplyChainService:
    driver = db.get_driver()
    repository = GraphRepository(driver)
    return SupplyChainService(repository)

@router.get("", response_model=List[RiskEventDetail])
async def list_active_risk_events(service: SupplyChainService = Depends(get_service)):
    """List all active risk events in the network."""
    try:
        with service.repository.driver.session() as session:
            result = session.run("MATCH (e:RiskEvent {status: 'Active'}) RETURN e.id AS id, e.type AS type, e.severity AS severity, e.description AS description, e.start_date AS start_date ORDER BY e.start_date DESC")
            return [
                RiskEventDetail(
                    id=record["id"],
                    type=record["type"],
                    severity=record["severity"],
                    description=record["description"],
                    start_date=record["start_date"]
                ) for record in result
            ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database connection error: {str(e)}"
        )

@router.get("/supplier/{supplier_id}", response_model=List[RiskEventDetail])
async def get_supplier_risk_events(supplier_id: str, service: SupplyChainService = Depends(get_service)):
    """Get active risk events associated with a specific supplier."""
    if not service.repository.get_supplier_exists(supplier_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Supplier '{supplier_id}' not found."
        )
    return service.repository.get_active_risk_events(supplier_id)
