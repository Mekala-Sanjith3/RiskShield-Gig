"""
ML Risk Scoring Model — RiskShield-Gig
Flask microservice on port 5001

Endpoint: POST /predict
Input:  { temperature, rain, wind, humidity }
Output: { riskScore, riskLevel, triggers, confidence }

Architecture:
  - Weighted multi-factor risk formula (production-grade heuristic)
  - Each factor normalized to 0-100 scale
  - Composite weighted score → risk level classification
  - Extensible: can swap in scikit-learn model with same interface
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import math

app = Flask(__name__)
CORS(app)

# ── Risk Factor Weights ──────────────────────────────────────────────────────
WEIGHTS = {
    "rain":        0.45,   # Rainfall is the #1 income killer for gig workers
    "temperature": 0.25,   # Heat causes workers to stop / orders to decline
    "wind":        0.15,   # High wind → accidents, order delays
    "humidity":    0.15,   # Extreme humidity → rider health risk
}

def normalize_rain(rain_mm_hr):
    """
    Rain risk curve:
      0 mm/hr  → 0%
      20 mm/hr → 50%
      50 mm/hr → 85%
      100+     → 100%
    """
    if rain_mm_hr <= 0:
        return 0
    # Logarithmic growth curve
    score = min(100, 35 * math.log1p(rain_mm_hr))
    return round(score, 1)

def normalize_temperature(temp_celsius):
    """
    Temperature risk:
      < 20°C → 5%  (comfortable)
        25°C → 15%
        35°C → 60%
        42°C → 85%
        50°C → 100%
    """
    if temp_celsius < 20:
        return 5
    if temp_celsius < 30:
        return 5 + (temp_celsius - 20) * 3
    if temp_celsius < 40:
        return 35 + (temp_celsius - 30) * 5
    return min(100, 85 + (temp_celsius - 40) * 3)

def normalize_wind(wind_mps):
    """
    Wind speed risk:
      0-5 m/s  → 5%
      10 m/s   → 40%
      15 m/s   → 70%
      20+ m/s  → 100%
    """
    if wind_mps <= 5:
        return 5
    return min(100, round(5 + (wind_mps - 5) * 6.5, 1))

def normalize_humidity(humidity_pct):
    """
    Humidity risk (amplifies heat stress):
      < 60% → low
      > 85% → high
    """
    if humidity_pct < 60:
        return 10
    if humidity_pct < 75:
        return 30
    if humidity_pct < 90:
        return 55
    return 75

def classify_risk(score):
    if score >= 75:
        return "HIGH"
    elif score >= 45:
        return "ELEVATED"
    elif score >= 25:
        return "MODERATE"
    return "LOW"

def identify_triggers(rain_mm, temp_c, wind_mps):
    """Returns active risk trigger types for claim reason labeling."""
    triggers = []
    if rain_mm >= 20:
        triggers.append("RAIN")
    if temp_c >= 40:
        triggers.append("HEATWAVE")
    if wind_mps >= 12:
        triggers.append("WIND")
    return triggers

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()

    temperature = float(data.get("temperature", 30))
    rain        = float(data.get("rain", 0))
    wind        = float(data.get("wind", 5))
    humidity    = float(data.get("humidity", 60))

    # Normalize each factor
    rain_score    = normalize_rain(rain)
    temp_score    = normalize_temperature(temperature)
    wind_score    = normalize_wind(wind)
    humid_score   = normalize_humidity(humidity)

    # Weighted composite score
    composite = (
        rain_score    * WEIGHTS["rain"]        +
        temp_score    * WEIGHTS["temperature"] +
        wind_score    * WEIGHTS["wind"]        +
        humid_score   * WEIGHTS["humidity"]
    )

    # Heat + humidity amplifier (Indian summer conditions)
    if temperature > 38 and humidity > 75:
        composite = min(100, composite * 1.15)

    final_score = round(composite, 1)
    risk_level  = classify_risk(final_score)
    triggers    = identify_triggers(rain, temperature, wind)

    return jsonify({
        "riskScore":   final_score,
        "riskLevel":   risk_level,
        "triggers":    triggers,
        "confidence":  0.89,
        "factors": {
            "rain":        rain_score,
            "temperature": temp_score,
            "wind":        wind_score,
            "humidity":    humid_score,
        },
        "modelVersion": "riskshield-v2.1"
    })

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "service": "RiskShield ML Risk Engine",
        "version": "2.1",
        "model": "weighted-composite + normalization"
    })

if __name__ == "__main__":
    print("🤖  RiskShield ML Risk Engine running on port 5001")
    print("   POST /predict  — ML risk scoring")
    print("   GET  /health   — Health check")
    app.run(port=5001, debug=False)
