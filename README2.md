# PayGuard AI
Automated parametric insurance platform for gig workers (food delivery partners). Predicts income loss due to external disruptions (e.g., severe weather, AQI) and automatically triggers payouts without manual claims.

## Architecture
- **Frontend**: React (Vite) + Tailwind CSS + Lucide Icons. Provides a user dashboard to monitor active policies and an Admin Panel to trigger environmental simulations.
- **Backend API**: Node.js + Express + MongoDB. Manages JWT authentication, policies, wallet balances, and acts as the Trigger Engine handling mock payouts.
- **AI Service**: Python + FastAPI. Microservice predicting risk scores, income simulation, and fraud detection based on environmental parameters.

## Prerequisites
- Node.js (v18+)
- Python (3.9+)
- MongoDB running locally on `mongodb://127.0.0.1:27017` (Or update `.env` in `backend` with your MongoDB Atlas URI)

## Installation & Setup

### 1. AI Service
```bash
cd ai-service
python -m venv venv
.\venv\Scripts\Activate  # On Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn main:app --port 8000
```

### 2. Backend API
```bash
cd backend
npm install
npm start
```
*(Ensure MongoDB is running locally before starting the backend)*

### 3. Frontend App
```bash
cd frontend
npm install
npm run dev
```

## End-to-End Demo Flow
1. Access the web application via the URL provided by Vite (e.g., `http://localhost:5173`).
2. **Register & Login** as a "Gig Worker".
3. From your dashboard, purchase an active Weekly premium policy.
4. **Register & Login** using a different email as an "Admin".
5. Over in the Admin panel, locate the **Trigger Simulator**.
6. Enter the Target User ID (the MongoDB ObjectId of the worker registered in step 2), simulate a "Heavy Rain" or "Storm" condition with high Rainfall and AQI data.
7. Click "Run Trigger Engine".
8. The backend contacts the Python AI Service, detects severe risk (Score > 0.8), computes the protected income, and automatically issues a payout transaction to the worker's wallet!

---
*Created as part of the advanced agentic coding PBL prompt.*
