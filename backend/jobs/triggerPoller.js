const cron = require("node-cron");
const { createClaimsForZone } = require("../services/claimService");

async function simulateTrigger() {
  console.log("\n[Poller] Background Environmental Trigger Detected (e.g. Heavy Rain)");
  console.log("[Poller] Initiating batch parametric claim creation for impacted zones...");
  
  // Call claim creation for Zone 1 (now async with ML fraud pipeline)
  try {
    await createClaimsForZone(1);
  } catch (err) {
    console.error("[Poller] Error in batch claim creation:", err.message);
  }
}

// Run every 1 minute to demonstrate background automation
cron.schedule("* * * * *", () => {
  simulateTrigger();
});

module.exports = { simulateTrigger };
