# 🌐 ChainLens — Supply Chain Dependency & Risk Explorer

ChainLens is an interactive graph-based analytics application designed to trace and analyze supply chain vulnerabilities. It identifies critical dependencies and explores potential supplier disruption risks across complex multi-tier logistics networks.

The system helps procurement operations and supply chain analysts evaluate what happens if a supplier becomes disrupted. By modeling entities as a graph, it tracks dependencies across:

> **Supplier → Component → Product → Factory → Region**

This structural alignment allows analysts to view downstream blast radiuses, map single-source components, detect alternative supplier possibilities, and view active risk events directly impacting logistics capabilities.

---

## ✨ Core Features

* **Interactive Graph Visualization**: Explore supply chain topologies with a fully interactive network graph (Zoom, Pan, Fit, Node Inspection).
* **Impact Analysis**: Instantly calculate the downstream blast radius (affected products, factories, and regions) when a supplier goes offline.
* **Risk Scoring**: Automatic risk tiering (High/Medium/Low) based on active severity alerts and critical bottlenecks.
* **Single-Source Detection**: Automatically identify components that are exclusively provided by a single supplier.

---

## 🛠️ Technology Stack

* **Frontend**: React + Vite + TypeScript + Cytoscape.js
* **Backend**: Python + FastAPI
* **Database**: CognoDB Cloud (Neo4j)
* **Driver**: Official Neo4j Python Driver (Bolt Protocol)

---

## 🚀 Quick Start (Development)

If you have already completed the initial setup, you can start the entire application from the project root with a single command:

```bash
npm run dev
```

* **Backend (FastAPI)** will run at `http://localhost:8000`
* **Frontend (Vite)** will run at `http://localhost:3000`

*(Press `Ctrl + C` in the terminal to stop both services simultaneously).*

---

## ⚙️ Initial Setup (First-Time Only)

Follow these steps to set up the project on a new machine.

### 1. Root Dependencies
From the project root (`ChainLens/`), install the root orchestrator:
```bash
npm install
```

### 2. Database (CognoDB) Setup
1. Create a CognoDB Cloud instance (or Neo4j Sandbox).
2. Get your Bolt URI (e.g., `bolt+s://<id>.databases.cognodb.cloud`) and password.

### 3. Backend Setup
```bash
cd backend
python -m venv .venv
.venv\Scripts\pip install -r requirements.txt
copy .env.example .env
```
Edit the newly created `backend/.env` file and add your database credentials:
```text
COGNODB_URI=bolt+s://your-cognodb-host
COGNODB_USER=neo4j
COGNODB_PASSWORD=your-password
```

**Initialize Database (Run Once):**
```bash
python app/database/setup.py
python ../seed/seed.py
```
*(Return to root: `cd ..`)*

### 4. Frontend Setup
```bash
cd frontend
npm install
copy .env.example .env
cd ..
```
*(No need to edit `frontend/.env` as the defaults connect to localhost:8000).*

**Setup Complete!** You can now run `npm run dev` from the root directory.

---

## 📂 Repository Structure

```text
chainlens/
├── backend/            # FastAPI application codebase (Python)
├── frontend/           # React SPA client code (Vite + TS)
├── seed/               # Data files and database populate script
├── docs/               # Architecture design models & documentation
├── package.json        # Root orchestrator for running both services
└── README.md
```
