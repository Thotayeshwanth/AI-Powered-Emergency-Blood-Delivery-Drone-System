# AI-Powered Emergency Blood Delivery Drone System

Enterprise-grade hospital and drone logistics command center platform for emergency blood delivery and cold-chain monitoring.

---

## Project Structure

```text
3.1 Project/
├── frontend/             # React + Vite + Tailwind + Leaflet + Recharts application
│   ├── src/              # Application source (components, pages, stores, services)
│   ├── public/           # Static assets
│   ├── index.html        # HTML entry point with fonts & metadata
│   ├── vite.config.js    # Vite configuration
│   ├── tailwind.config.js# Medical & aerospace design tokens
│   └── package.json      # Frontend dependencies
│
├── backend/              # Node.js + Express.js + Socket.IO server
│   ├── server.js         # Main server entry point
│   ├── routes/           # REST API endpoints (/api/auth, /api/blood, etc.)
│   ├── socket/           # Real-time Socket.IO telemetry broadcast
│   ├── data/             # In-memory mock database
│   └── package.json      # Backend dependencies
│
└── package.json          # Root script runner for both tiers
```

---

## Getting Started

### 1. Run the Frontend (Port 5173)

From the project root:
```bash
npm run dev:frontend
```
Or directly from `frontend/`:
```bash
cd frontend
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

### 2. Run the Backend API (Port 5000)

From the project root:
```bash
npm run dev:backend
```
Or directly from `backend/`:
```bash
cd backend
npm run dev
```

---

## API Endpoints Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status |
| `POST` | `/api/auth/login` | Mock authentication & JWT token |
| `GET` | `/api/dashboard` | Aggregated system KPIs & emergency callout |
| `GET` | `/api/blood/inventory` | Real-time blood units across all 8 groups |
| `POST` | `/api/blood/inventory/replenish` | Replenish donor blood units |
| `GET` | `/api/blood/requests` | List all emergency blood requests |
| `POST` | `/api/blood/requests` | Submit an emergency blood request |
| `PATCH` | `/api/blood/requests/:id/approve` | Approve request & reserve inventory |
| `PATCH` | `/api/blood/requests/:id/dispatch` | Assign drone & clear for flight |
| `GET` | `/api/drones` | Retrieve drone fleet status & telemetry |
| `GET` | `/api/drones/:id/location` | Real-time GPS coordinates of drone |
| `POST` | `/api/drones/:id/command` | Teleoperation flight commands (HOLD, RTB) |
| `GET` | `/api/deliveries` | Active & completed flight deliveries |
| `POST` | `/api/deliveries/:id/verify` | Hospital digital handover verification PIN |
| `GET` | `/api/temperature/:deliveryId` | Cold container DS18B20 sensor telemetry |

---

## Real-Time Socket.IO Channels

The backend automatically broadcasts continuous telemetry updates to connected clients:
- `drone:location`: Live latitude, longitude, altitude, airspeed, and heading.
- `temperature:update`: Thermal sensor cold box readings (2°C – 6°C safe corridor).
- `system:ready`: Initial handshake confirmation upon WebSocket connection.
