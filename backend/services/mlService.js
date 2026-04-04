const axios = require("axios");

async function getPremium(zone_id) {
  try {
    const res = await axios.get(`http://localhost:5001/ml/premium?zone_id=${zone_id}`);
    return res.data;
  } catch (error) {
    console.error("Error connecting to ML service:", error.message);
    // Return default values if ML service is down
    return {
      risk_level: "MEDIUM",
      premium_weekly: 30,
      risk_score: 60,
    };
  }
}

module.exports = { getPremium };
