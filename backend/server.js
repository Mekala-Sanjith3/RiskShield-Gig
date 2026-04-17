/**
 * RiskShield-Gig API Server v3.0
 *
 * Architecture:
 *   Express → WeatherService (OpenWeatherMap) → ML Flask → Risk Engine → Claims
 *
 * Endpoints:
 *   POST /simulate-rain  — Manual trigger (demo/hackathon mode)
 *   POST /check-risk     — Real-time auto evaluation (polls every 30s)
 *   GET  /claims         — Fetch all claims
 *   GET  /health         — System health check
 */

const express  = require("express");
const cors     = require("cors");
require("dotenv").config();

const { evaluateRisk }  = require("./riskEngine");
const { getClaims }     = require("./claims");
const { getWeather }    = require("./weatherService");

const app = express();
app.use(cors());
app.use(express.json());

// ── Existing Routes ─────────────────────────────────────────────────────────
app.use("/api/workers", require("./routes/workers"));
app.use("/api/claims", require("./routes/claims"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/zones/risk-profile", require("./routes/riskProfile"));

// ── Background Jobs ─────────────────────────────────────────────────────────
require("./jobs/triggerPoller");

// ── POST /simulate-rain — Manual Hackathon Demo ─────────────────────────────
/**
 * Forces riskScore to 85, runs ML pipeline and returns the resulting claim.
 * Useful for live hackathon demos without waiting for real rain.
 */
app.post("/simulate-rain", async (req, res) => {
  try {
    const user = {
      ...req.body,
      city: req.body.city || "Bengaluru",
      policyActive: req.body.policyActive ?? true,
    };

    // Run full pipeline but force simulate city weather with rain
    const result = await evaluateRisk({
      ...user,
      _forceRain: true,   // weatherService will simulate heavy rain
    });

    // Override score to 85 for demo impact
    const demoScore = Math.max(85, result.riskScore);

    res.json({
      success: true,
      message: result.claimTriggered
        ? "🌧 Rainstorm simulated — Parametric claim auto-approved via ML engine"
        : "🌧 Rainstorm simulated — no active policy, claim not triggered",
      riskScore:      demoScore,
      riskLevel:      "HIGH",
      weather:        result.weather,
      mlResult:       result.mlResult,
      claimTriggered: result.claimTriggered,
      claim:          result.claim,
    });
  } catch (err) {
    console.error("[/simulate-rain]", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /check-risk — Real-Time Auto Monitoring ────────────────────────────
/**
 * Called by frontend every 30 seconds.
 * Fetches real weather → ML scoring → auto-claim if threshold crossed.
 *
 * Body: { id, city, policyActive, weeklyIncome }
 */
app.post("/check-risk", async (req, res) => {
  try {
    const user = {
      id:           req.body.id || "guest",
      city:         req.body.city || "Bengaluru",
      policyActive: req.body.policyActive ?? false,
      weeklyIncome: req.body.weeklyIncome || 500,
    };

    const result = await evaluateRisk(user);

    res.json({
      success: true,
      riskScore:      result.riskScore,
      riskLevel:      result.riskLevel,
      weather:        result.weather,
      mlResult:       result.mlResult,
      claimTriggered: result.claimTriggered,
      claim:          result.claim,
    });
  } catch (err) {
    console.error("[/check-risk]", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /weather — Fetch Weather for a City ─────────────────────────────────
app.get("/weather", async (req, res) => {
  const city = req.query.city || "Bengaluru";
  try {
    const weather = await getWeather(city);
    res.json({ success: true, weather });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /claims — Fetch All Claims ──────────────────────────────────────────
app.get("/claims", (req, res) => {
  const userId = req.query.userId || null;
  res.json({ claims: getClaims(userId) });
});

// ── POST /simulate-fraud-claim — Fraud Demo Injection ───────────────────────
/**
 * Injects a claim with obviously spoofed GPS coordinates.
 * Worker "registered" in Bengaluru claims from Delhi 5 min later.
 * Demonstrates the IsolationForest auto-rejection with ML reasoning.
 */
app.post("/simulate-fraud-claim", async (req, res) => {
  try {
    const { createClaim, workerLocations } = require("./services/claimService");

    const fraudWorkerId = req.body.worker_id || "FRAUD-DEMO-99";

    // Plant a last-known location in Bengaluru
    workerLocations[String(fraudWorkerId)] = {
      city: "Bengaluru",
      zone_id: 1,
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 min ago
    };

    // Create claim from Delhi (1740km from Bengaluru in 5 min = ~20880 km/h)
    const fraudClaim = await createClaim(
      fraudWorkerId,
      "Heavy Rain · Orders stalled > 3h",
      500,
      "RAIN",
      { temperature: 38, rain: 55, wind: 12, humidity: 85 }, // claimed heavy rain
      "Delhi"  // claiming from Delhi while last seen in Bengaluru
    );

    res.json({
      success: true,
      message: "Fraud simulation complete — ML model evaluated claim",
      claim: fraudClaim,
      demo_scenario: {
        registered_city: "Bengaluru",
        claimed_city: "Delhi",
        distance_km: 1740,
        time_gap_min: 5,
        implied_speed_kmh: Math.round(1740 / (5 / 60)),
        verdict: fraudClaim.status,
        fraud_score: fraudClaim.fraudScore,
        flags: fraudClaim.fraudFlags,
        audit_trail: fraudClaim.fraudAuditTrail,
      },
    });
  } catch (err) {
    console.error("[/simulate-fraud-claim]", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /health — System Health ─────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "RiskShield-Gig API",
    version: "3.0",
    pipeline: "WeatherAPI -> ML Flask (sklearn) -> Risk Engine -> Fraud Detection -> Claims",
    features: ["RandomForest risk scoring", "IsolationForest fraud detection", "GPS spoofing detection", "Open-Meteo weather validation"],
    endpoints: ["/simulate-rain", "/check-risk", "/weather", "/claims"],
  });
});

// ── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\nRiskShield-Gig API v3.0 — port ${PORT}`);
  console.log(`   POST /simulate-rain  — Manual demo trigger`);
  console.log(`   POST /check-risk     — Real-time weather + ML evaluation`);
  console.log(`   GET  /weather        — Live weather data`);
  console.log(`   GET  /claims         — All claims`);
  console.log(`   Pipeline: Weather -> ML Flask:5001 (sklearn) -> Fraud Detection -> Claims\n`);
});
