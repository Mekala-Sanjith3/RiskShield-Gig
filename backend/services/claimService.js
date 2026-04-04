const policies = [
  { worker_id: 1, status: "ACTIVE", zone_id: 1 },
  { worker_id: 2, status: "ACTIVE", zone_id: 1 },
  { worker_id: 3, status: "INACTIVE", zone_id: 1 },
];

let claims = [];

function calculateFraud(worker_id) {
  let score = 0;

  // Mock signals mimicking real-world checks
  if (Math.random() > 0.7) score += 30; // location mismatch (GPS vs Reported)
  if (Math.random() > 0.5) score += 25; // inactive worker (Not logged in to gig app)
  if (Math.random() > 0.6) score += 20; // no movement (Accelerometer flatline)
  if (Math.random() > 0.8) score += 15; // previous rejected claims history
  
  return score;
}

async function createClaimsForZone(zone_id) {
  console.log(`[ClaimService] Processing batch triggers for Zone ${zone_id}...`);

  // Filter active policies for the affected zone
  const activePolicies = policies.filter(p => p.status === "ACTIVE" && p.zone_id === zone_id);

  let newClaimsCount = 0;

  for (let policy of activePolicies) {
    const fraudScore = calculateFraud(policy.worker_id);

    let status = "APPROVED";
    if (fraudScore > 70) status = "REJECTED";
    else if (fraudScore > 40) status = "PENDING"; // Manual review needed

    const basePayout = 500;

    const claim = {
      id: `CLM-Z${zone_id}-${Date.now()}-${policy.worker_id}`,
      worker_id: policy.worker_id,
      trigger: "RAIN",
      triggerDetails: "Heavy rainfall exceeding 15mm/hr",
      fraudScore,
      status,
      payout: status === "APPROVED" ? basePayout : 0,
      createdAt: new Date().toISOString()
    };

    claims.unshift(claim); // Prepend to show newest first
    newClaimsCount++;

    console.log(`[ClaimService] Claim Generated -> Worker: ${claim.worker_id} | Status: ${claim.status} | Fraud Score: ${claim.fraudScore}`);
  }
  
  return newClaimsCount;
}

function createClaim(userId, reason, payout, trigger = "RAIN") {
  const fraudScore = calculateFraud(userId);
  let status = "APPROVED";
  if (fraudScore > 70) status = "REJECTED";
  else if (fraudScore > 40) status = "PENDING";

  const claim = {
    id: `CLM-${Date.now()}-${userId}`,
    worker_id: userId,
    reason,
    payout: status === "APPROVED" ? payout : 0,
    trigger,
    fraudScore,
    status,
    createdAt: new Date().toISOString(),
  };

  claims.unshift(claim);
  return claim;
}

module.exports = { createClaimsForZone, createClaim, calculateFraud, claims, policies };
