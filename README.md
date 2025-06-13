# Glitchy World

## Dev Environment

### Prerequisites

- Deno
- Node.js

### Setup

1. Install Deno and Node.js.
2. Setup .env files:
   - Create `.env` file in /frontend folder. Example is provided as `.env.example`.
3. Start the backend server:
   ```bash
   cd backend
   deno install
   deno task dev
   ```
4. Start the frontend server:
   ```bash
   cd frontend
   deno install
   deno task dev
   ```
5. Open your browser and navigate to `http://localhost:5173` to view the application.
