# Enterprise Inventory & Order Management System (IMS)

A production-grade, full-stack enterprise resource tracking platform built using a containerized decoupled architecture. This application manages live product warehouses, maintains synchronized customer registries, enforces real-time transactional order processing limits, and delivers automated database-driven inventory threshold logic.

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

## ✨ Core System Features

* **Dynamic Analytics Dashboard:** Aggregates real-time warehouse metrics including Total Products, Customer Registers, Active Order volume, and Low Stock Indicators.
* **Strict Business Constraint Engines:** Prevents database execution anomalies by enforcing automated unique SKU validation rules, customer email collisions checks, and order processing blocks when requested inventory exceeds physical stock limits.
* **Automated Stock Reconciliation:** Multi-table transactions atomically calculate total pricing bounds, deduct product counts upon order checkout validation, and track cross-referenced bridge table connections.
* **Interactive API Portals:** Integrated Swagger Documentation framework running directly out of the `/docs` server route endpoint.
* **Fluid Responsive Touch Interface:** Native mobile-first drawer menus using touch-friendly breakpoint switches for smartphones and desktop panels.

---

## 📦 Directory Structure

```text
inventory-management-system/
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
💻 Local Setup & Execution Guide
1. Prerequisites
Ensure you have Docker Desktop, Python 3.10+, and Node.js installed locally on your system.

2. Launching the Backend Core
Bash
cd backend
python -m venv venv
source venv/Scripts/activate   # On Windows Git Bash
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
3. Launching the Frontend UI
Bash
cd frontend
npm install
npm run dev
---
