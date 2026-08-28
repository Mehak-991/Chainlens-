# ChainLens Frontend Architecture

This B2B application frontend dashboard provides interactive supply-chain risk visualization and downstream impact reporting interfaces.

## Component Architecture

All page widgets reside under `frontend/src/components/` and separate presentation details from orchestration logic:
* **Header**: Renders navigation and monitors backend database connectivity status indicators.
* **SupplierSelector**: Dropdown list pulling from `GET /api/suppliers` mapping unique identifiers.
* **RiskSummary**: Highlights normalized risk gauges alongside vendor profiles (tier, status, country, ID).
* **MetricCard**: Visual number indicator cards mapping key counts.
* **RiskExplanation**: Visualizes the deterministic raw score components and normalization formula calculations dynamically.
* **CriticalDependencies**: Details components that lack pre-approved alternative suppliers.
* **AlternativeSuppliers**: Tabulates dynamic potential alternatives and explicit approved contracts (`ALTERNATIVE_TO`).
* **RiskEvents**: Cards displaying severity active event descriptions.
* **DependencyPaths**: Trace chain pipeline previews tracing blast radius traversals.

## Pages & Hooks

* `frontend/src/pages/Dashboard.tsx`: Controls central states management, registers API endpoint hook triggers, and composites child component grids.

## Configuration & Environment

Configuration is loaded from environment files:
* `VITE_API_BASE_URL`: API backend host url path.

Browser requests communicate only with the FastAPI backend endpoint. CognoDB credentials are never exposed or processed by client scripts directly.
