# RiskShield-Gig ML Service 🧠

This is the AI core of the RiskShield-Gig platform, built using **Python** and **Flask**. The service provides real-time risk assessments, premium calculations, and fraud detection logic.

## 🛠️ Tech Stack
- **Language**: Python 3.x
- **Framework**: Flask (Micro web framework)
- **Data Logic**: Mock-based risk scoring (Phase 1), upgrading to Scikit-learn (Phase 2).
- **Security**: Basic validation and anomaly scoring headers.

## 📂 Project Structure
- `app.py`: Flask entry point with routing for risk and premium assessment.
- `models/`: (Future) Pickled machine learning models for risk and fraud.
- `utils/`: Calculation logic and helper functions.

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- pip (Python package manager)

### Installation
```bash
pip install flask
```

### Running the ML Service
```bash
cd ml-model
python app.py
```
The service will start on [http://localhost:5001](http://localhost:5001).

## 🔌 API Endpoints
| Method | Endpoint | Query Param | Description |
|--------|----------|-------------|-------------|
| GET | `/ml/premium` | `zone_id` | Returns risk level, weekly premium, and risk score for a zone. |

### Sample Response:
```json
{
  "risk_level": "HIGH",
  "premium_weekly": 55,
  "risk_score": 85
}
```

## 🧠 Risk Calculation Logic (Current)
Currently, the model uses zone-based risk tiers:
- **Zone 1 (High Mobility)**: 85/100 risk score, ₹55 premium.
- **Zone 2 (Residential)**: 25/100 risk score, ₹15 premium.
- **Other Zones**: 60/100 risk score, ₹30 premium.
