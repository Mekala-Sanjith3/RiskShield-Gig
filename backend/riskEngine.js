/**
 * riskEngine.js — Real-Time AI-Powered Parametric Risk Engine
 * RiskShield-Gig v3.0
 *
 * Pipeline:
 *   City → OpenWeatherMap API → ML Flask Service → Risk Score → Auto-Claim
 *
 * Rules:
 *   riskScore >= 70 AND policyActive === true
 *   → AUTO-CREATE CLAIM → APPROVE → PAYOUT
 */

const axios = require("axios");
const { getWeather } = require("./weatherService");
const { createClaim } = require("./services/claimService");

const ML_SERVICE = "http://localhost:5001/predict";

// ── Trigger Label Map ─────────────────────────────────────────────────────
const TRIGGER_REASONS = {
  RAIN:     "Heavy Rain · Orders stalled > 3h",
  HEATWAVE: "Heatwave · Temperature exceeded 42°C",
  WIND:     "High Winds · Rider safety risk",
  AQI:      "AQI Hazardous · Unhealthy air conditions",
  SURGE:    "Traffic Surge · Delivery delay > 45 min",
};

/**
 * Calls the ML Flask microservice for weather-based risk scoring.
 * Returns the rule-based fallback score if ML service is offline.
 */
async function getMLRiskScore(weather) {
  try {
    const response = await axios.post(ML_SERVICE, {
      temperature: weather.temperature,
      rain:        weather.rain,
      wind:        weather.windSpeed,
      humidity:    weather.humidity ?? 65,
    }, { timeout: 3000 });

    return response.data;
  } catch {
    // ── Rule-based fallback when ML service is unavailable ────────────────
    console.warn("[RiskEngine] ML service offline — using rule-based fallback");
    const rainScore  = weather.rain   > 30 ? 85 : weather.rain > 0 ? 60 : 15;
    const tempScore  = weather.temperature > 40 ? 75 : weather.temperature > 35 ? 55 : 20;
    const windScore  = weather.windSpeed > 12 ? 65 : 20;
    const composite  = Math.max(rainScore, tempScore, windScore);
    const triggers   = [];
    if (weather.rain > 20)           triggers.push("RAIN");
    if (weather.temperature > 40)    triggers.push("HEATWAVE");
    if (weather.windSpeed > 12)      triggers.push("WIND");

    return {
      riskScore:    composite,
      riskLevel:    composite >= 70 ? "HIGH" : composite >= 45 ? "ELEVATED" : "LOW",
      triggers,
      confidence:   0.72,
      modelVersion: "rule-based-fallback",
    };
  }
}

/**
 * Calculates the parametric payout.
 * Base = 30% of weekly income, capped at $150.
 */
function calculatePayout(weeklyIncome) {
  const base = Math.round((weeklyIncome || 500) * 0.3);
  return Math.min(base, 150);
}

/**
 * Full pipeline: Weather → ML → Risk → Claim
 *
 * @param {Object} user
 * @param {string} user.id
 * @param {string} user.city
 * @param {boolean} user.policyActive
 * @param {number} user.weeklyIncome
 * @returns {Promise<Object>} { riskScore, riskLevel, weather, mlResult, claim }
 */
async function evaluateRisk(user) {
  const city = user.city || "Bengaluru";

  // Step 1: Fetch real-time weather
  const weather = await getWeather(city);

  // Step 2: ML risk scoring
  const mlResult = await getMLRiskScore(weather);
  const { riskScore, riskLevel, triggers } = mlResult;

  // Step 3: Auto-trigger claim if threshold met
  let claim = null;
  if (riskScore >= 70 && user.policyActive) {
    const payout = calculatePayout(user.weeklyIncome);
    const primaryTrigger = triggers[0] || "RAIN";
    const reason = TRIGGER_REASONS[primaryTrigger] || TRIGGER_REASONS.RAIN;
    // createClaim is now async — runs GPS spoofing + ML fraud checks
    claim = await createClaim(user.id || "guest", reason, payout, primaryTrigger, weather, city);
  }

  return {
    riskScore,
    riskLevel,
    weather,
    mlResult,
    claimTriggered: !!claim,
    claim,
  };
}

module.exports = { evaluateRisk, calculatePayout };
