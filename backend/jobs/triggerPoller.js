const cron = require("node-cron");
const { createClaimsForZone } = require("../services/claimService");

function simulateTrigger() {
  console.log("\n[Poller] ⚠️ Background Environmental Trigger Detected (e.g. Heavy Rain)");
  console.log("[Poller] Initiating batch parametric claim creation for impacted zones...");
  
  // Call claim creation for Zone 1
  createClaimsForZone(1);
}

// Run every 1 minute to demonstrate background automation
cron.schedule("* * * * *", () => {
  simulateTrigger();
});

module.exports = { simulateTrigger };
