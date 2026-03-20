# 🚀 PayGuard-AI

### AI-Powered Parametric Insurance for India’s Gig Workers

---

## 📌 Problem Overview

Gig economy workers such as delivery partners face frequent income loss due to external disruptions like extreme weather, pollution, and sudden zone closures. These disruptions can reduce their earnings by 20–30%, with no existing safety net.

Our solution addresses this gap by building an **AI-powered parametric insurance platform** that automatically compensates workers for income loss — without requiring manual claims.

---

## 🎯 Target Persona

We focus on **food delivery partners (Zomato/Swiggy)** operating in urban areas.

### Why this persona?

* High dependency on outdoor conditions
* Strong correlation between weather and earnings
* High-frequency, short-duration tasks → ideal for parametric triggers

---

## 💡 Our Solution: PayGuard AI

We introduce a **fully automated income protection system** powered by AI and real-time data.

### Key Features:

* 📍 Hyperlocal risk-based insurance
* 🧠 AI-driven income prediction
* ⚡ Real-time parametric triggers
* 🔐 Intelligent fraud detection
* 💸 Instant automated payouts

---

## 🧠 AI/ML Integration

### 1. Risk Prediction Model

* Predicts probability of disruption using weather, AQI, and location data
* Output used for dynamic premium pricing

### 2. Income Prediction Model

* Estimates expected daily earnings using:

  * Time of day
  * Location
  * Historical patterns

### 3. Fraud Detection Model

* Detects anomalies such as:

  * GPS spoofing
  * Duplicate claims
  * Unusual inactivity

---

## 💰 Weekly Premium Model

Our pricing is based on a **weekly subscription model** aligned with gig worker earning cycles.

### Formula:

Premium = Base Rate + (Risk Score × Adjustment Factor)

### Example:

* Low-risk area → ₹20/week
* High-risk area → ₹50/week

---

## ⚡ Parametric Triggers

We use automated triggers based on external conditions:

| Trigger Type       | Condition         | Action         |
| ------------------ | ----------------- | -------------- |
| Rainfall           | > 50 mm           | Trigger payout |
| AQI                | > 300             | Trigger payout |
| Traffic disruption | Severe congestion | Trigger payout |

---

## 💸 Payout Mechanism

Payouts are calculated dynamically:

Payout = Predicted Income × Disruption Percentage

* Fully automated
* No manual claim required
* Instant transfer via payment gateway

---

## 🏗️ System Architecture

Our system consists of:

* Frontend: Mobile/Web app for workers
* Backend: API server handling logic
* AI Layer: Risk, income, and fraud models
* Data Layer: Weather, AQI, traffic APIs
* Trigger Engine: Event detection
* Claim Engine: Automated payout calculation

---

## 🔧 Tech Stack

* Frontend: React / Flutter
* Backend: Node.js / FastAPI
* AI/ML: Python (scikit-learn)
* Database: MongoDB / PostgreSQL
* APIs: OpenWeatherMap, AQI APIs
* Payments: Razorpay (test mode)

---

## 📈 Future Enhancements

* Real-time integration with delivery platforms
* Advanced predictive analytics dashboard
* Blockchain-based claim transparency

---

## 🎥 Demo Plan

We will simulate:

1. A disruption event (e.g., heavy rain)
2. Automatic trigger detection
3. AI-based payout calculation
4. Instant payment to the worker

---

## 🏁 Conclusion

Adaptive Income Shield AI transforms traditional insurance into a **real-time, automated financial safety net** for gig workers, ensuring stability, trust, and fairness in the face of unpredictable disruptions.

---
