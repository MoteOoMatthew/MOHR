# HR System

A modular web-based HR system with multi-user logins and privilege levels.

## Features
- User authentication (JWT)
- Role-based access (admin, HR, employee)
- Modular architecture (modules can be added/removed)

## Getting Started

### Prerequisites
- Node.js
- Docker (for PostgreSQL)

### Backend Setup
1. `cd hr-system/backend`
2. Copy `.env` or edit as needed
3. Start PostgreSQL with Docker:
   ```sh
   docker run --name hrdb -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=hrdb -p 5432:5432 -d postgres
   ```
4. Initialize the database:
   ```sh
   cat src/db.sql | docker exec -i hrdb psql -U postgres -d hrdb
   ```
5. Install dependencies:
   ```sh
   npm install
   ```
6. Start backend:
   ```sh
   node src/index.js
   ```

### Frontend Setup
1. `cd hr-system/frontend`
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start frontend (e.g., with Vite, Create React App, or similar)

### Default Roles
- `admin`, `hr`, `employee`

### Adding Modules
- Place backend modules in `backend/modules/`
- Frontend modules can be loaded dynamically (see Dashboard placeholder)

---
This is a minimal scaffold. Expand as needed for your organization!