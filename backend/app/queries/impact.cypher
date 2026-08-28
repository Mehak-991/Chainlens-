MATCH (s:Supplier {id: $supplier_id})
OPTIONAL MATCH path = (s)-[:SUPPLIES]->(c:Component)-[:USED_IN]->(p:Product)-[:PRODUCED_AT]->(f:Factory)-[:LOCATED_IN]->(r:Region)
RETURN path
