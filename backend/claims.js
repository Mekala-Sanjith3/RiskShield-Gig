/**
 * claims.js — In-memory parametric claims store
 * RiskShield-Gig Auto-Claim Engine
 */

const claims = [];

/**
 * Creates and stores a new auto-approved parametric claim.
 * @param {string} userId
 * @param {string} reason - e.g., "Heavy Rain · Orders stalled > 3h"
 * @param {number} payout - Payout amount in USD
 * @param {string} [trigger] - Trigger type: "RAIN" | "HEATWAVE" | "AQI" | "SURGE"
 */
function createClaim(userId, reason, payout, trigger = "RAIN") {
  const claim = {
    id: `CLM-${Date.now()}`,
    userId,
    reason,
    payout,
    trigger,
    status: "APPROVED",
    createdAt: new Date().toISOString(),
  };

  claims.unshift(claim); // newest first
  return claim;
}

/**
 * Returns all claims, optionally filtered by userId.
 */
function getClaims(userId = null) {
  if (userId) return claims.filter((c) => c.userId === userId);
  return claims;
}

module.exports = { claims, createClaim, getClaims };
