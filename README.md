# ChainLens — Supply Chain Dependency & Risk Explorer
## Project Overview

ChainLens is an interactive graph-based analytics application designed to trace and analyze supply chain vulnerabilities. It identifies critical dependencies and explores potential supplier disruption risks across complex multi-tier logistics networks.

The system helps procurement operations and supply chain analysts evaluate what happens if a supplier becomes disrupted. By modeling entities as a graph, it tracks dependencies across:
**Supplier → Component → Product → Factory → Region**

This structural alignment allows analysts to view downstream blast radiuses, map single-source components, detect alternative supplier possibilities, and view active risk events directly impacting logistics capabilities.

## Technology Stack

* **Backend**: Python + FastAPI
* **Frontend**: React + Vite + TypeScript
* **Database**: CognoDB Cloud
* **Driver**: Official Neo4j Python Driver
* **Protocol**: Bolt

## Repository Structure

```text
chainlens/
├── backend/            # FastAPI application codebase
│   ├── app/            # Source code package (routes, services, schemas, queries)
│   ├── requirements.txt
│   └── .env.example
├── frontend/           # Vite + React + TypeScript SPA client code
│   ├── src/            # Components, pages, hooks, services
│   ├── package.json
│   └── .env.example
├── seed/               # Data files and database populate script
├── docs/               # Architecture design models & documentation
└── README.md
```

## CognoDB Setup

1. Create a CognoDB Cloud instance or a compatible Neo4j sandbox instance.
2. Obtain the Bolt connection URI (e.g. `bolt+s://<instance-id>.databases.cognodb.cloud`).
3. Save the generated credentials securely.
4. Configure local environment variables:
   Create a `.env` file in the `backend/` directory using `backend/.env.example` as a template and populate the values:
   ```text
   APP_ENV=development
   COGNODB_URI=bolt+s://your-cognodb-host
   COGNODB_USER=cognodb
   COGNODB_PASSWORD=your-saved-password
   ```
5. Run the schema initialization script:
   ```bash
   python app/database/setup.py
   ```
6. Run the seed data population script:
   ```bash
   python ../seed/seed.py
   ```
7. Verify the `/api/health` endpoint turns healthy:
   ```bash
   curl http://localhost:8000/api/health
   ```

## Development

Once set up (see **Local Setup** below), start the entire application from the project root:

```bash
npm run dev
```

This single command automatically starts:

- **[BACKEND]** FastAPI/Uvicorn → `http://localhost:8000`
- **[FRONTEND]** Vite → `http://localhost:3000`

Press `Ctrl + C` to stop both processes simultaneously.

## Local Setup

> **One-time setup only.** After this, use `npm run dev` from the project root.

### 1. Install Root Dependencies

From the project root (`ChainLens/`):

```bash
npm install
```

### 2. Backend Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\pip install -r requirements.txt
copy .env.example .env
```

Edit `backend/.env` with your CognoDB credentials (see **CognoDB Setup** above).

Return to the project root:

```bash
cd ..
```

### 3. Frontend Setup

```bash
cd frontend
npm install
copy .env.example .env
cd ..
```

### 4. Start Development

From the project root:

```bash
npm run dev
```

---

> **Independent startup (optional)**
>
> Backend only:
> ```bash
> cd backend
> .venv\Scripts\uvicorn app.main:app --reload --port 8000
> ```
>
> Frontend only:
> ```bash
> cd frontend
> npm run dev
> ```

## Phase 7 Status

Phase 7 integrates Cytoscape.js into the React dashboard client layout. It renders deduplicated downstream dependency nodes (Supplier, Component, Product, Factory, Region) and directed relationships (SUPPLIES, USED_IN, PRODUCED_AT, LOCATED_IN), providing full zoom, pan, fit, and node/edge inspector panels.
