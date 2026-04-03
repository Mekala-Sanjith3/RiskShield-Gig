const express = require("express");
const router = express.Router();
const { getPremium } = require("../services/mlService");

router.post("/register", async (req, res) => {
  const { name, phone, zone_id } = req.body;

  try {
    // Call ML service for risk assessment and premium calculation
    const mlResponse = await getPremium(zone_id);

    // Mock data for registration
    const response = {
      worker_id: 1, // Mock DB ID
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

module.exports = router;
