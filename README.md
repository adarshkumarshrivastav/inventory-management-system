# Enterprise Inventory & Order Management System (IMS)

A production-grade, full-stack enterprise resource tracking platform built using a containerized, decoupled architecture. This application manages live product warehouses, maintains synchronized customer registries, enforces real-time transactional order processing limits, and delivers automated database-driven inventory threshold logic.

## 🚀 Live Production Links
* **Production UI Dashboard:** [Live Frontend Deployment](https://inventory-management-system-lg80wzkm2.vercel.app)
* **Production API Engine:** [Live FastAPI Service Gateway](https://inventory-backend-api-9rbf.onrender.com)
* **Docker Hub Container Registry:** [Public Image Repository](https://hub.docker.com/r/adarsh000999/inventory-backend)

---

## 🛠️ Tech Stack & System Architecture

### Frontend Layer
* **Framework:** React 18 (Structured via Vite compilation engine)
* **Styling:** Tailwind CSS (Engineered for fully adaptive, high-fidelity responsive liquid viewports)
* **State Management & Routing:** Client-side React Router DOM with asynchronous state handling

### Backend Core Layer
* **Framework:** FastAPI (Asynchronous high-performance Python framework)
* **Database ORM:** SQLAlchemy Core layer object-relational mapping
* **Database Engine:** PostgreSQL (Managed cloud instances communicating via isolated secure private routing grids)

### DevOps & Infrastructure Automation (CI/CD)
* **Containerization:** Custom engineered multi-layered `Dockerfile` context environments
* **CI/CD Pipeline:** GitHub Actions automated matrix runners tracking main branch pushes
* **Image Registry:** Remote deployment verification targeting global Docker Hub repositories
* **Hosting Grid:** Decoupled ecosystem splitting static client assets to Vercel/Netlify and isolated server containers to Render/Railway platforms

---

## 📡 Core System Architecture & Data Flow

The platform relies on a completely decoupled micro-architecture where client view layers stream payloads across an authenticated network bridge to an ephemeral cloud application container layer mapped to an active relational database instance.

text
 [ Mobile / Desktop Client ] 
             │ (HTTPS / JSON Payloads)
             ▼
   [ Vercel Edge Network ] ──▶ Serving React Client Assets
             │
             ▼ (Cross-Origin Resource Sharing Gateway Enabled)
  [ Render Container Grid ] ──▶ Pulling Application Image from Docker Hub Registry
             │
             ▼ (SQLAlchemy ORM Mapping Matrix)
 [ Cloud PostgreSQL Cluster ] ──▶ Executing Relational Transactions

✨ Core System Features
* **Dynamic Analytics Dashboard: Aggregates real-time warehouse metrics including Total Products, Customer Registers, Active Order volume, and Low Stock Indicators.
* **Strict Business Constraint Engines: Prevents database execution anomalies by enforcing automated unique SKU validation rules, customer email collisions checks, and order processing blocks when requested inventory exceeds physical stock limits.
* **Automated Stock Reconciliation: Multi-table transactions atomically calculate total pricing bounds, deduct product counts upon order checkout validation, and track cross-referenced bridge table connections.
* **Interactive API Portals: Integrated Swagger Documentation framework running directly out of the /docs server route endpoint.
* **Fluid Responsive Touch Interface: Native mobile-first drawer menus using touch-friendly breakpoint switches for smartphones and desktop panels.
* **💾 Relational Database Schema MappingsThe engine controls persistent transactional operations using a PostgreSQL schema managed via Python SQLAlchemy Object Relational Mapping (ORM) models with active foreign key constraints.
* Plaintext
* ┌──────────────────┐               ┌───────────────┐
  │     CUSTOMER     │               │    PRODUCT    │
  ├──────────────────┤               ├───────────────┤
  │ id (PK)          │               │ id (PK)       │
  │ name             │               │ name          │
  │ email (Unique)   │               │ sku (Unique)  │
  └────────┬─────────┘               └───────┬───────┘
           │ 1                               │ 1
           │                                 │
           │ 1..* │ 1..*
  ┌────────▼─────────┐               ┌───────▼───────┐
  │      ORDER       │               │  ORDER_ITEM   │
  ├──────────────────┤               ├───────────────┤
  │ id (PK)          │ 1        1..* │ id (PK)       │
  │ customer_id (FK) ├───────────────┤ order_id (FK) │
  │ total_amount     │               │ product_id(FK)│
  │ created_at       │               │ quantity      │
  └──────────────────┘               │ unit_price    │
                                     └───────────────┘
1. Product Model
Tracks inventory units available for commercial consumption.

Contains strict constraints ensuring item stock configurations cannot drop below zero integers.

2. Customer Model
Logs unique individual profiles accessing the architecture matrix.

Enforces structural database blocks protecting against matching unique email data indexing.

3. Order Model
The historical transaction shell mapped directly to a single parent customer.

Fields automatically calculated on execution runtime by looking up true transactional unit costs.

4. OrderItem Model
The explicit relational bridge entity recording quantity states and snapshots of unit cost matrices at the exact millisecond checkout commands are executed.
  
Method,Endpoint,Data Contract Payload,Description
GET,/,Returns HTMLResponse,High-fidelity live system status landing panel.
GET,/explore/products,Returns HTMLResponse,"Elegant, dark-themed responsive visual showcase grid of product inventory."
GET,/dashboard/stats,None,Aggregated key metrics dictionary supporting UI dashboard data calculations.
GET,/products,None,Array listing of all products currently indexed.
POST,/products,ProductCreate Schema,Inserts a new product tracking asset. Enforces unique SKU logic checks.
PUT,/products/{id},ProductCreate Schema,Completely overwrites target product information mappings.
DELETE,/products/{id},None,Purges the targeting object record out of the active schema tracking layer.
POST,/customers,CustomerCreate Schema,Registers a client email configuration target profile.
GET,/customers,None,Lists customer records.
POST,/orders,OrderCreate Schema,Atomic database checkout. Performs calculations and inventory logic checks.
GET,/orders,None,Fetches list charts detailing processed billing actions.

⚙️ Environment Configurations (.env)
To safely construct production executions outside local testing scopes, apply these matching parameter configurations across respective directory spaces:
respective directory spaces:Backend Layer Setup Variables (backend/.env)Code snippetDATABASE_URL=postgresql://db_username:db_secret_hash@cloud_provider_cluster:5432/inventory_db
CORS_ORIGINS=["*"]
ENVIRONMENT=production
Frontend UI Setup Variables (frontend/.env)Code snippetVITE_API_BASE_URL=[https://inventory-backend-api-9rbf.onrender.com](https://inventory-backend-api-9rbf.onrender.com)
📦 Directory StructurePlaintextinventory-management-system/
├── .github/workflows/
│   └── docker-publish.yml     # Automated CI/CD build configuration
├── backend/
│   ├── database.py            # SQLAlchemy server connector configurations
│   ├── main.py                # High-fidelity core API business controllers 
│   ├── models.py              # PostgreSQL database schemas
│   ├── schemas.py             # Pydantic data validation configurations
│   └── Dockerfile             # Lightweight container baseline image blueprints
├── frontend/
│   ├── src/                   # Responsive React design architectures
│   └── package.json           # Client dependency configurations
├── docker-compose.yml         # Local environment clustering blueprint
└── README.md                  # System documentation portfolio
💻 Local Setup & Execution Guide1. PrerequisitesEnsure you have Docker Desktop, Python 3.10+, and Node.js installed locally on your system.2. Launching the Backend CoreBashcd backend
python -m venv venv
source venv/Scripts/activate   # On Windows Git Bash
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
5. Launching the Frontend UIBashcd frontend
npm install
npm run dev
6. Running Entire Stack Locally via Docker ComposeTo test the production environment locally using a single command, execute the following from the project root:Bashdocker-compose up --build
🛠️ CI/CD Pipeline Automation EngineThis repository leverages an automated continuous integration pipeline runner to guarantee that changes are continuously integrated and ready for production cloud environments.Plaintext [ Git Push Main ] ──▶ [ GitHub Actions Runner ] ──▶ [ Security Env Injection ]
                                                             │
                                                             ▼
 [ Global Docker Hub ] ◀── [ Remote Target Stream ] ◀── [ Layer Compilation ]
Trigger Event: Automated workflows intercept code changes sent to the primary deployment path branch (main).Environment Validation: Runners launch virtualized cloud container layers, provision underlying runtime spaces, and load secure vault credentials (DOCKER_HUB_TOKEN).Compilation Matrix: Engine verifies python dependencies, reviews code integrity formats, and builds multi-layer microservice application image formats.Push Sequence: Validated distribution packages stream to your global repository workspace targeting label tag parameters (:latest).Continuous Deployment Webhook: Hosting cluster channels monitor successful image registry updates, immediately cycling memory environments to serve fresh builds without system downtime.***
