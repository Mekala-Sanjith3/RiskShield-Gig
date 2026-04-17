const express = require("express");
const router = express.Router();
const { claims, createClaim } = require("../services/claimService");
const { processPayout } = require("../services/payoutService");

// ── GET /api/claims/worker/:id ─────────────────────────────────────────────
router.get("/worker/:id", (req, res) => {
  const workerClaims = claims.filter((c) => String(c.worker_id) === String(req.params.id));
  res.json(workerClaims);
});

// ── GET /api/claims/all ────────────────────────────────────────────────────
router.get("/all", (req, res) => {
  res.json(claims);
});

// ── PATCH /api/claims/:id/review ───────────────────────────────────────────
/**
 * Admin manual review — Approve or Reject a PENDING claim.
 * Body: { action: "approve" | "reject", admin_note?: string }
 *
 * On approve → triggers Razorpay payout, sets status to APPROVED.
 * On reject  → sets status to REJECTED with admin note.
 */
router.patch("/:id/review", async (req, res) => {
  const { id } = req.params;
  const { action, admin_note } = req.body;

  const claim = claims.find((c) => c.id === id);
  if (!claim) {
    return res.status(404).json({ success: false, error: "Claim not found" });
  }
  if (claim.status !== "PENDING") {
    return res.status(400).json({ success: false, error: `Claim is already ${claim.status}` });
  }
  if (!["approve", "reject"].includes(action)) {
    return res.status(400).json({ success: false, error: "action must be 'approve' or 'reject'" });
  }

  if (action === "approve") {
    claim.status = "APPROVED";
    claim.adminNote = admin_note || "Manually approved by admin";
    claim.reviewedAt = new Date().toISOString();

    // Re-compute payout if it was zeroed (PENDING claims have payout=0)
    if (claim.payout === 0) {
      claim.payout = 500; // base parametric payout
    }

    // Trigger Razorpay payout
    try {
      const payoutRecord = await processPayout(
        claim,
        `worker${claim.worker_id}@okaxis`,
        `Worker ${claim.worker_id}`
      );
      claim.payoutRef = payoutRecord.display_ref;
      claim.payoutUTR = payoutRecord.display_utr;
      claim.payoutTimestamp = payoutRecord.timestamp;

      return res.json({
        success: true,
        message: `Claim ${id} approved and payout of ₹${claim.payout} initiated`,
        claim,
        payout: payoutRecord,
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: `Payout failed: ${err.message}` });
    }
  }

  // Reject
  claim.status = "REJECTED";
  claim.adminNote = admin_note || "Rejected by admin";
  claim.reviewedAt = new Date().toISOString();
  claim.payout = 0;

  res.json({
    success: true,
    message: `Claim ${id} rejected`,
    claim,
  });
});

// ── GET /api/claims/:id ────────────────────────────────────────────────────
router.get("/:id", (req, res) => {
  const claim = claims.find((c) => c.id === req.params.id);
  if (!claim) return res.status(404).json({ error: "Claim not found" });
  res.json(claim);
});

module.exports = router;
