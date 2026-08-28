# ChainLens Project QA Checklist

This checklist confirms verification of backend models, frontend UI flows, database lifecycle, security filters, and demo flows prior to submission.

## 1. Backend Connectivity & Health Check
- [x] Lifespan events initialize driver connection pools safely.
- [x] Connection pool driver instance is closed cleanly during teardown.
- [x] Database dropouts are caught globally mapping exceptions to HTTP 503 responses.
- [x] Health checks report status detail structures cleanly.

## 2. API Endpoints
- [x] `GET /api/suppliers` lists all database nodes.
- [x] `GET /api/suppliers/{id}/impact` retrieves nested JSON metrics and normalised risk scores.
- [x] `GET /api/suppliers/{id}/critical-dependencies` tracks single source items.
- [x] `GET /api/suppliers/{id}/alternatives` maps approved and potential configurations.
- [x] `GET /api/suppliers/{id}/paths` retrieves blast radius trace path topology.
- [x] Cypher queries are parameterized preventing injection vulnerabilities.

## 3. Frontend UI Layouts
- [x] Application compositions match B2B analytics aesthetic themes.
- [x] Suppliers selector loading actions switch details reactively.
- [x] RiskSummary renders profile cards alongside color-coded score gauge rings.
- [x] Explanations widgets display the frozen risk methodology weight matrix.
- [x] Skeletons and empty state panels prevent blank screen layouts.

## 4. Interactive Dependency Graph
- [x] Graph visualization unifies node coordinates based on Cytoscape.js canvas engines.
- [x] Node shapes distinguish Supplier, Component, Product, Factory, and Region.
- [x] Legend lists all node categories and traces.
- [x] Zoom (+/-), pan, layout auto-fit, and inspector detail properties panel work.
- [x] Switching suppliers clears visual elements to load fresh profiles.

## 5. Security & Build Check
- [x] Secrets are isolated in `.env` templates (omitted from repository commits).
- [x] Browser communications proxy through port 8000 routes.
- [x] TypeScript builds compile with zero errors.
