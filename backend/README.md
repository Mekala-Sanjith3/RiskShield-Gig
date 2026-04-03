# RiskShield-Gig Backend 🚀

This is the core API service for the RiskShield-Gig platform, built with Node.js and Express. It coordinates worker registration, interacts with the ML risk assessment service, and manages future policy/claim logic.

## 🛠️ Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **HTTP Client:** Axios (for ML service communication)
- **Middleware:** CORS, Express JSON Parser
- **Scheduling:** Node-cron (placeholder for trigger polling)

## 📂 Project Structure
- `server.js`: Entry point for the Express application.
- `routes/`: API route definitions (e.g., workers, policies).
- `services/`: External service integrations (e.g., ML core).
- `db/`: Database connection and models.
- `jobs/`: Background tasks and parametric trigger polling.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation
```bash
cd backend
npm install
```

### Running the Server
```bash
node server.js
```
The server will start on [http://localhost:5000](http://localhost:5000).

## 🔌 API Endpoints (Current)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/workers/register` | Registers a new worker and fetches ML-based risk assessment. |
