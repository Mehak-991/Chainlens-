MATCH (s:Supplier {id: $supplier_id})
OPTIONAL MATCH (s)-[:SUPPLIES]->(c:Component)
OPTIONAL MATCH (alt:Supplier)-[:SUPPLIES]->(c) WHERE alt <> s
OPTIONAL MATCH (s)-[rel:ALTERNATIVE_TO]->(knownAlt:Supplier)
RETURN c.id AS component_id,
       c.name AS component_name,
       collect(DISTINCT alt.id) AS potential_alternatives,
       collect(DISTINCT {id: knownAlt.id, compatibility: rel.compatibility, switching_days: rel.switching_days}) AS approved_alternatives
