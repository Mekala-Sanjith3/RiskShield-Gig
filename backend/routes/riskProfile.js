const express = require("express");
const router = express.Router();

// Mock AI Explainability response for a specific zone
router.get("/:id", (req, res) => {
  res.json({
    zone_name: "Demo Zone (Bengaluru)",
    risk_score: 65,
    risk_level: "MEDIUM",
    premium_weekly: 30,
    factors: {
      rainfall: 70,
      aqi: 60,
      flood_risk: 80,
      delivery_density: 50,
      seasonal_risk: 65
    },
    explanation: "High flood risk and rainfall increased premium"
  });
});

module.exports = router;
