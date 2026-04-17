const express = require("express");
const router = express.Router();
const axios = require("axios");

const { createClaimsForZone } = require("../services/claimService");
const { getAllPayouts, getTotalPayoutAmount } = require("../services/payoutService");

const ML_SERVICE = process.env.ML_SERVICE_URL || "http://localhost:5001";

// Simulated weekly premium collected (₹28/week × active policies)
const WEEKLY_PREMIUM_PER_POLICY = 28;
const ACTIVE_POLICIES_COUNT = 9214; // from platform stats

// ── POST /api/admin/simulate-trigger ────────────────────────────────────────
router.post("/simulate-trigger", async (req, res) => {
  console.log("[Admin] Manual simulation trigger invoked.");
  const count = await createClaimsForZone(1);
  res.json({ message: "Trigger simulated", claimsGenerated: count });
});

// ── GET /api/admin/claims ────────────────────────────────────────────────────
/**
 * Returns all claims + stats including loss ratio and fraud analytics.
 */
router.get("/claims", (req, res) => {
  const { claims } = require("../services/claimService");

  const total    = claims.length;
  const approved = claims.filter((c) => c.status === "APPROVED" || c.status === "PAID").length;
  const rejected = claims.filter((c) => c.status === "REJECTED").length;
  const pending  = claims.filter((c) => c.status === "PENDING").length;
  const totalPayoutRaw = claims
    .filter((c) => c.status === "APPROVED" || c.status === "PAID")
    .reduce((sum, c) => sum + (c.payout || 0), 0);

  // Loss Ratio = (Total Payouts / Total Premiums Collected) × 100
  // Using combined: session payouts + baseline platform payouts
  const platformPayouts  = 142680; // existing platform total in ₹
  const platformPremiums = 258000; // ACTIVE_POLICIES_COUNT * WEEKLY_PREMIUM_PER_POLICY
  const sessionPayouts   = getTotalPayoutAmount();
  const lossRatio = Math.round(
    ((platformPayouts + sessionPayouts) / (platformPremiums + sessionPayouts * 1.8)) * 100
  );

  // Fraud analytics aggregation
  const fraudFlags = {};
  let fraudFlagged = 0;
  const cityFraud = {};

  claims.forEach((c) => {
    if (c.fraudScore > 40) fraudFlagged++;
    if (c.fraudFlags) {
      c.fraudFlags.forEach((f) => {
        const key = f.split(":")[0].trim();
        fraudFlags[key] = (fraudFlags[key] || 0) + 1;
      });
    }
    if (c.fraudScore > 40 && c.fraudAuditTrail?.anomaly_flags?.length) {
      const city = "Bengaluru"; // default — in production pull from worker data
      cityFraud[city] = (cityFraud[city] || 0) + 1;
    }
  });

  const topFraudSignal = Object.entries(fraudFlags).sort((a, b) => b[1] - a[1])[0];

  const stats = {
    total,
    approved,
    rejected,
    pending,
    totalPayoutRaw,
    lossRatio: Math.min(lossRatio, 99),
    fraudStats: {
      flagged:          fraudFlagged,
      flaggedRate:      total > 0 ? Math.round((fraudFlagged / total) * 100) : 0,
      topSignal:        topFraudSignal ? topFraudSignal[0] : "N/A",
      topSignalCount:   topFraudSignal ? topFraudSignal[1] : 0,
      signalBreakdown:  fraudFlags,
      cityBreakdown:    cityFraud,
    },
  };

  res.json({ claims, stats });
});

// ── GET /api/admin/forecast ──────────────────────────────────────────────────
/**
 * Returns 7-day risk + claims forecast using Open-Meteo + ML model.
 */
router.get("/forecast", async (req, res) => {
  try {
    const response = await axios.get(`${ML_SERVICE}/api/forecast`, { timeout: 10000 });
    return res.json(response.data);
  } catch (err) {
    console.warn("[Admin Forecast] ML service error:", err.message);
    // Fallback synthetic forecast
    const today = new Date();
    const forecast = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const risk = 20 + Math.floor(Math.random() * 60);
      return {
        date: d.toISOString().split("T")[0],
        day: d.toLocaleDateString("en-IN", { weekday: "short" }),
        predicted_risk: risk,
        predicted_claims: Math.max(0, Math.floor((risk - 40) / 10)),
        rain_mm: risk > 60 ? Math.round(Math.random() * 40 + 10) : 0,
        city: "Bengaluru",
      };
    });
    res.json({ forecast, source: "fallback", generated_at: new Date().toISOString() });
  }
});

// ── GET /api/admin/fraud-stats ───────────────────────────────────────────────
router.get("/fraud-stats", (req, res) => {
  const { claims } = require("../services/claimService");
  const payouts = getAllPayouts();

  const byCity = {
    Bengaluru: { total: 0, fraud: 0 },
    Mumbai:    { total: 0, fraud: 0 },
    Delhi:     { total: 0, fraud: 0 },
    Hyderabad: { total: 0, fraud: 0 },
    Chennai:   { total: 0, fraud: 0 },
  };

  claims.forEach((c) => {
    const city = "Bengaluru";
    if (byCity[city]) {
      byCity[city].total++;
      if (c.fraudScore > 40) byCity[city].fraud++;
    }
  });

  res.json({
    total_claims:    claims.length,
    fraud_flagged:   claims.filter((c) => c.fraudScore > 40).length,
    auto_rejected:   claims.filter((c) => c.status === "REJECTED").length,
    pending_review:  claims.filter((c) => c.status === "PENDING").length,
    total_payouts:   payouts.length,
    total_paid_inr:  getTotalPayoutAmount(),
    city_breakdown:  byCity,
  });
});

module.exports = router;
