const express = require("express");
const router = express.Router();
const { claims } = require("../services/claimService");

// Fetch claims for a specific worker
router.get("/worker/:id", (req, res) => {
  const workerClaims = claims.filter(c => c.worker_id == req.params.id);
  res.json(workerClaims);
});

// Fetch all claims globally (e.g. for admin dashboard)
router.get("/all", (req, res) => {
  res.json(claims);
});

module.exports = router;
