MATCH (s:Supplier {id: $supplier_id})
MATCH (s)-[:SUPPLIES]->(c:Component)
OPTIONAL MATCH (other:Supplier)-[:SUPPLIES]->(c)
WHERE other <> s
WITH c, count(DISTINCT other) AS alternative_supplier_count
WHERE alternative_supplier_count = 0
RETURN c.id AS component_id,
       c.name AS component_name,
       c.criticality AS criticality,
       0 AS supplier_count
