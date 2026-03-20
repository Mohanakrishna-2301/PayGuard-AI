from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random

app = FastAPI(title="PayGuard AI Service", version="1.0.0")

# Allow frontend and backend to communicate
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RiskInput(BaseModel):
    weather_condition: str  # e.g., 'heavy_rain', 'clear'
    rainfall_mm: float
    aqi: int
    location: str

class IncomeInput(BaseModel):
    user_id: str
    time_of_day: str  # e.g., 'morning', 'evening'
    location: str
    historical_avg_income: float

class FraudInput(BaseModel):
    user_id: str
    gps_coordinates: str
    claim_frequency_30d: int
    is_device_rooted: bool

@app.get("/")
def read_root():
    return {"status": "AI Service is running"}

@app.post("/predict/risk")
def predict_risk(data: RiskInput):
    """
    Mock AI Risk Prediction Model
    Calculates a risk score from 0.0 to 1.0 based on weather, AQI, and location heuristics.
    """
    risk_score = 0.0
    
    # Weather factors
    weather = data.weather_condition.lower()
    if data.rainfall_mm > 50 or weather in ['heavy_rain', 'storm']:
        risk_score += 0.5
    elif data.rainfall_mm > 20 or weather == 'rain':
        risk_score += 0.2
        
    # AQI factors
    if data.aqi > 300:
        risk_score += 0.4
    elif data.aqi > 200:
        risk_score += 0.2
        
    risk_score = min(1.0, risk_score)
    
    risk_level = "Low"
    if risk_score >= 0.7:
        risk_level = "High"
    elif risk_score >= 0.4:
        risk_level = "Medium"
        
    # We trigger payout automatically if the condition is severe
    trigger_payout = risk_score >= 0.8
    
    return {
        "risk_score": round(risk_score, 2),
        "risk_level": risk_level,
        "trigger_payout": trigger_payout
    }

@app.post("/predict/income")
def predict_income(data: IncomeInput):
    """
    Mock AI Income Prediction Model
    Predicts expected daily income based on historical data.
    """
    base_income = data.historical_avg_income
    
    # Introduce random variance +/- 10%
    variance = base_income * random.uniform(-0.1, 0.1)
    predicted_income = base_income + variance
    
    return {
        "predicted_daily_income": round(predicted_income, 2),
        "currency": "INR",
        "confidence_score": round(random.uniform(0.85, 0.98), 2)
    }

@app.post("/detect/fraud")
def detect_fraud(data: FraudInput):
    """
    Mock AI Fraud Detection Model
    Detects GPS spoofing, fake claims, and abnormal frequencies.
    """
    fraud_probability = 0.0
    flags = []
    
    if data.is_device_rooted:
        fraud_probability += 0.4
        flags.append("Rooted device")
        
    if data.claim_frequency_30d > 3:
        fraud_probability += 0.5
        flags.append("High claim frequency")
        
    gps_lower = data.gps_coordinates.lower()
    if data.gps_coordinates == "0.0,0.0" or "mock" in gps_lower or "fake" in gps_lower:
        fraud_probability += 0.8
        flags.append("Suspicious or Mocked GPS")
        
    fraud_probability = min(1.0, fraud_probability)
    
    return {
        "fraud_probability": round(fraud_probability, 2),
        "is_fraudulent": fraud_probability >= 0.7,
        "flags": flags
    }
