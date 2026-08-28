# Cypher Query Specifications for ChainLens

This document details the Cypher queries executed within the **ChainLens** repository layer.

---

## 1. Supplier Impact (Blast Radius Paths)
* **Business Question**: If Supplier X is disrupted, which downstream components, products, factories, and regions are affected?
* **Graph Traversal**:
  $$(s:\text{Supplier}) \xrightarrow{\text{SUPPLIES}} (c:\text{Component}) \xrightarrow{\text{USED\_IN}} (p:\text{Product}) \xrightarrow{\text{PRODUCED\_AT}} (f:\text{Factory}) \xrightarrow{\text{LOCATED\_IN}} (r:\text{Region})$$
* **Parameters**: `$supplier_id` (string)
* **Cypher Query** (`impact.cypher`):
  ```cypher
  MATCH (s:Supplier {id: $supplier_id})
  OPTIONAL MATCH path = (s)-[:SUPPLIES]->(c:Component)-[:USED_IN]->(p:Product)-[:PRODUCED_AT]->(f:Factory)-[:LOCATED_IN]->(r:Region)
  RETURN path
  ```
* **Performance Consideration**: Traversal filters early on the unique, indexed `Supplier.id` node constraint, bounding lookup scopes.

---

## 2. Alternatives Discovery
* **Business Question**: Which other suppliers can supply the components provided by the selected supplier, and are there pre-approved fallback contracts?
* **Graph Traversal**:
  $$(s:\text{Supplier}) \xrightarrow{\text{SUPPLIES}} (c:\text{Component}) \xleftarrow{\text{SUPPLIES}} (alt:\text{Supplier})$$
  $$(s:\text{Supplier}) \xrightarrow{\text{ALTERNATIVE\_TO}} (knownAlt:\text{Supplier})$$
* **Parameters**: `$supplier_id` (string)
* **Cypher Query** (`alternatives.cypher`):
  ```cypher
  MATCH (s:Supplier {id: $supplier_id})
  OPTIONAL MATCH (s)-[:SUPPLIES]->(c:Component)
  OPTIONAL MATCH (alt:Supplier)-[:SUPPLIES]->(c) WHERE alt <> s
  OPTIONAL MATCH (s)-[rel:ALTERNATIVE_TO]->(knownAlt:Supplier)
  RETURN c.id AS component_id,
         c.name AS component_name,
         collect(DISTINCT alt.id) AS potential_alternatives,
         collect(DISTINCT {id: knownAlt.id, compatibility: rel.compatibility, switching_days: rel.switching_days}) AS approved_alternatives
  ```

---

## 3. Critical (Single-Source) Dependencies
* **Business Question**: Which components supplied by the supplier have zero alternative suppliers, meaning they present critical bottlenecks?
* **Graph Traversal**:
  $$(s:\text{Supplier}) \xrightarrow{\text{SUPPLIES}} (c:\text{Component})$$
* **Parameters**: `$supplier_id` (string)
* **Cypher Query** (`critical_dependencies.cypher`):
  ```cypher
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
  ```

---

## 4. Active Risk Events
* **Business Question**: What active risk events are currently affecting the chosen supplier?
* **Graph Traversal**:
  $$(s:\text{Supplier}) \xrightarrow{\text{AFFECTED\_BY}} (e:\text{RiskEvent})$$
* **Parameters**: `$supplier_id` (string)
* **Cypher Query** (`risk_events.cypher`):
  ```cypher
  MATCH (s:Supplier {id: $supplier_id})
  MATCH (s)-[:AFFECTED_BY]->(e:RiskEvent)
  WHERE e.status = "Active"
  RETURN e.id AS id,
         e.type AS type,
         e.severity AS severity,
         e.description AS description,
         e.start_date AS start_date
  ORDER BY e.start_date DESC
  ```
