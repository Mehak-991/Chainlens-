from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any, List
from app.database.driver import db
from app.repositories.graph_repository import GraphRepository

router = APIRouter(prefix="/api/graph", tags=["Graph Explorer"])

@router.get("", response_model=Dict[str, List[Dict[str, Any]]])
async def get_entire_graph():
    """Retrieve full nodes and relationships layout for rendering."""
    try:
        driver = db.get_driver()
        with driver.session() as session:
            # Match all nodes
            nodes_res = session.run("MATCH (n) RETURN id(n) AS identity, labels(n)[0] AS label, properties(n) AS props")
            nodes = []
            for record in nodes_res:
                props = dict(record["props"])
                # Extract clean unique ID
                uid = props.get("id", str(record["identity"]))
                nodes.append({
                    "id": uid,
                    "label": record["label"],
                    "name": props.get("name", uid),
                    "properties": props
                })

            # Match all relationships
            rels_res = session.run("MATCH (n)-[r]->(m) RETURN id(r) AS identity, type(r) AS type, n.id AS source, m.id AS target, properties(r) AS props")
            relationships = []
            for record in rels_res:
                relationships.append({
                    "id": str(record["identity"]),
                    "type": record["type"],
                    "source": record["source"] or "unknown",
                    "target": record["target"] or "unknown",
                    "properties": dict(record["props"])
                })

            return {"nodes": nodes, "relationships": relationships}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database connection error: {str(e)}"
        )
