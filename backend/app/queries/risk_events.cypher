MATCH (s:Supplier {id: $supplier_id})
MATCH (s)-[:AFFECTED_BY]->(e:RiskEvent)
WHERE e.status = "Active"
RETURN e.id AS id,
       e.type AS type,
       e.severity AS severity,
       e.description AS description,
       e.start_date AS start_date
ORDER BY e.start_date DESC
