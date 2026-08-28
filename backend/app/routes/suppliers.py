from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
from app.database.driver import db
from app.repositories.graph_repository import GraphRepository
from app.services.supply_chain_service import SupplyChainService
from app.schemas.supplier import SupplierBase
from app.schemas.analysis import SupplierImpactAnalysis

router = APIRouter(prefix="/api/suppliers", tags=["Suppliers"])

def get_service() -> SupplyChainService:
    driver = db.get_driver()
    repository = GraphRepository(driver)
    return SupplyChainService(repository)

@router.get("", response_model=List[SupplierBase])
async def list_suppliers(service: SupplyChainService = Depends(get_service)):
    """List all suppliers in the database."""
    try:
        with service.repository.driver.session() as session:
            result = session.run("MATCH (s:Supplier) RETURN s.id AS id, s.name AS name, s.tier AS tier, s.country AS country, s.status AS status ORDER BY s.id")
            return [
                SupplierBase(
                    id=record["id"],
                    name=record["name"],
                    tier=record["tier"],
                    country=record["country"],
                    status=record["status"]
                ) for record in result
            ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database connection error: {str(e)}"
        )

@router.get("/{supplier_id}/impact", response_model=SupplierImpactAnalysis)
async def get_supplier_impact(supplier_id: str, service: SupplyChainService = Depends(get_service)):
    """Retrieve full downstream impact analysis and derived risk ratings for a supplier."""
    analysis = service.analyze_supplier_impact(supplier_id)
    if not analysis["supplier_exists"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=analysis.get("error", "Supplier not found")
        )
    return analysis

@router.get("/{supplier_id}/critical-dependencies", response_model=List[Dict[str, Any]])
async def get_supplier_critical_dependencies(supplier_id: str, service: SupplyChainService = Depends(get_service)):
    """List downstream components supplied by this supplier that have no alternative supplier."""
    if not service.repository.get_supplier_exists(supplier_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Supplier '{supplier_id}' not found."
        )
    return service.repository.get_critical_dependencies(supplier_id)

@router.get("/{supplier_id}/alternatives", response_model=List[Dict[str, Any]])
async def get_supplier_alternatives(supplier_id: str, service: SupplyChainService = Depends(get_service)):
    """Discover potential alternative suppliers and pre-approved alternative channels."""
    if not service.repository.get_supplier_exists(supplier_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Supplier '{supplier_id}' not found."
        )
    return service.repository.get_alternatives(supplier_id)

@router.get("/{supplier_id}/paths", response_model=List[Dict[str, Any]])
async def get_supplier_paths(supplier_id: str, service: SupplyChainService = Depends(get_service)):
    """Retrieve node and edge paths representing the multi-hop supply chain blast radius."""
    if not service.repository.get_supplier_exists(supplier_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Supplier '{supplier_id}' not found."
        )
    return service.get_impact_paths(supplier_id)
