const express = require("express");
const router = express.Router();
const { getPremium } = require("../services/mlService");
const { getWorkerPayouts } = require("../services/payoutService");
const { getWorkerClaimHistory } = require("../services/claimService");

// ── POST /api/workers/register ──────────────────────────────────────────────
router.post("/register", async (req, res) => {
  const { name, phone, zone_id } = req.body;

  try {
    const mlResponse = await getPremium(zone_id);

    const response = {
      worker_id: 1,
      name,
      phone,
      risk_level: mlResponse.risk_level,
      premium_weekly: mlResponse.premium_weekly,
      risk_score: mlResponse.risk_score,
    };

    res.json(response);
  } catch (error) {
    console.error("Error in registration:", error.message);
    res.status(500).json({ error: "Failed to process registration" });
  }
});

// ── GET /api/workers/:id/payouts ─────────────────────────────────────────────
/**
 * Returns payout history for a specific worker.
 * Used by the worker dashboard payout history table.
 */
router.get("/:id/payouts", (req, res) => {
  const { id } = req.params;
  const workerPayouts = getWorkerPayouts(id);

  const totalPaid = workerPayouts.reduce((sum, p) => sum + (p.amount || 0), 0);

  res.json({
    worker_id: id,
    payouts: workerPayouts,
    total_paid: totalPaid,
    count: workerPayouts.length,
  });
});

// ── GET /api/workers/:id/claims ──────────────────────────────────────────────
router.get("/:id/claims", (req, res) => {
  const { id } = req.params;
  const history = getWorkerClaimHistory(id);
  res.json({ worker_id: id, claims: history, count: history.length });
});

module.exports = router;
