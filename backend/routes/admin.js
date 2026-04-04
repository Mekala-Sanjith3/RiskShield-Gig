const express = require("express");
const router = express.Router();
const { createClaimsForZone } = require("../services/claimService");

// Hackathon Demo Route: Manually trigger the background batch automation
router.post("/simulate-trigger", async (req, res) => {
  console.log("[Admin] Manual simulation trigger invoked by judge.");
  const count = await createClaimsForZone(1);
  res.json({ message: "Trigger simulated", claimsGenerated: count });
});
// Live claims statistics and data fetch
router.get("/claims", (req, res) => {
  const { claims } = require("../services/claimService");

  const stats = {
    total: claims.length,
    approved: claims.filter(c => c.status === "APPROVED" || c.status === "PAID").length,
    rejected: claims.filter(c => c.status === "REJECTED").length,
    pending: claims.filter(c => c.status === "PENDING").length,
    totalPayoutRaw: claims.filter(c => c.status === "APPROVED" || c.status === "PAID")
                          .reduce((sum, c) => sum + (c.payout || 0), 0)
  };

  res.json({ claims, stats });
});

module.exports = router;
