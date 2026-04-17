/**
 * claimService.js — ML-Enhanced Fraud Detection & Claim Processing
 * RiskShield-Gig v3.0
 *
 * Pipeline for each claim:
 *   1. GPS Spoofing Check   — compare reported city vs last-known zone
 *   2. Speed-Jump Detection — flag impossible city-to-city travel
 *   3. Accelerometer Check  — flag zero-movement during delivery
 *   4. Weather Validation   — cross-check rain via Open-Meteo historical
 *   5. ML Fraud Score       — IsolationForest via Flask /fraud-score
 *   6. Decision             — APPROVED / PENDING / REJECTED
 *   7. Payout               — Razorpay UPI payout on APPROVED
 */

const axios = require("axios");
const { validateWeatherClaim } = require("../weatherService");
const { processPayout } = require("./payoutService");

const ML_SERVICE = process.env.ML_SERVICE_URL || "http://localhost:5001";

// ── In-Memory Stores ────────────────────────────────────────────────────────

const policies = [
  { worker_id: 1, status: "ACTIVE", zone_id: 1, city: "Bengaluru" },
  { worker_id: 2, status: "ACTIVE", zone_id: 1, city: "Bengaluru" },
  { worker_id: 3, status: "INACTIVE", zone_id: 1, city: "Mumbai" },
];

let claims = [];

/**
 * Tracks last-known location of each worker.
 * Updated on each claim creation.
 * { worker_id -> { city, zone_id, timestamp } }
 */
const workerLocations = {};

/**
 * Get a worker's recent claim history (last 30 days).
 */
function getWorkerClaimHistory(workerId) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return claims.filter(
    (c) =>
      String(c.worker_id) === String(workerId) &&
      new Date(c.createdAt) > thirtyDaysAgo
  );
}

// ── GPS Spoofing Detection ──────────────────────────────────────────────────

// Approximate distances (km) between major Indian gig cities
const CITY_DISTANCES = {
  "bengaluru-mumbai": 842,   "bengaluru-delhi": 1740,
  "bengaluru-hyderabad": 570, "bengaluru-chennai": 290,
  "bengaluru-pune": 840,     "bengaluru-kolkata": 1660,
  "mumbai-delhi": 1150,      "mumbai-pune": 150,
  "mumbai-chennai": 1030,    "mumbai-hyderabad": 620,
  "delhi-jaipur": 270,       "delhi-lucknow": 500,
  "delhi-kolkata": 1310,     "delhi-chennai": 1760,
  "hyderabad-chennai": 520,  "kolkata-chennai": 1370,
};

function getCityDistance(cityA, cityB) {
  const a = (cityA || "").toLowerCase().trim();
  const b = (cityB || "").toLowerCase().trim();
  if (a === b) return 0;
  const keyAB = `${a}-${b}`;
  const keyBA = `${b}-${a}`;
  return CITY_DISTANCES[keyAB] || CITY_DISTANCES[keyBA] || 500; // default 500km
}

/**
 * Detect GPS spoofing signals for a worker's claim.
 * Returns: { locationMismatch, speedJump, accelFlatline, flags, score }
 */
function detectGPSSpoofing(workerId, reportedCity) {
  const lastLocation = workerLocations[String(workerId)];
  const flags = [];
  let score = 0;

  // -- Location Mismatch: compare with last known city ----------------------
  let locationMismatchScore = 0;
  let speedJumpKmh = 0;

  if (lastLocation && lastLocation.city) {
    const lastCity = lastLocation.city.toLowerCase().trim();
    const currentCity = (reportedCity || "").toLowerCase().trim();

    if (lastCity !== currentCity) {
      const distance = getCityDistance(lastCity, currentCity);
      locationMismatchScore = Math.min(100, distance / 20);

      if (locationMismatchScore > 40) {
        flags.push(`LOCATION_MISMATCH: ${lastCity} -> ${currentCity} (${distance}km)`);
        score += 30;
      }

      // -- Speed Jump: check if travel is physically impossible ---------------
      const timeSinceLastMs = Date.now() - new Date(lastLocation.timestamp).getTime();
      const timeSinceLastMin = timeSinceLastMs / 60000;

      if (timeSinceLastMin > 0) {
        speedJumpKmh = distance / (timeSinceLastMin / 60);

        // > 200 km/h is suspicious (can't drive that fast between Indian cities)
        if (speedJumpKmh > 200) {
          flags.push(
            `SPEED_ANOMALY: ${lastCity} -> ${currentCity} at ${Math.round(speedJumpKmh)}km/h in ${Math.round(timeSinceLastMin)}min`
          );
          score += 35;
        }
      }
    }
  }

  // -- Accelerometer Flatline (simulated) -----------------------------------
  // In production this would come from the worker's mobile app SDK.
  // For now: simulate based on claim frequency (high freq + no movement = suspicious)
  const recentClaims = getWorkerClaimHistory(workerId);
  const claimFrequency = recentClaims.length;

  let accelFlatlinePct = Math.random() * 25; // normal baseline: 0-25%
  if (claimFrequency >= 5) {
    // High claim frequency + "always stationary" = suspicious
    accelFlatlinePct = 50 + Math.random() * 40; // 50-90%
    flags.push(
      `ACCEL_FLATLINE: ${Math.round(accelFlatlinePct)}% zero-movement with ${claimFrequency} claims in 30d`
    );
    score += 25;
  }

  return {
    locationMismatchScore: Math.round(locationMismatchScore),
    speedJumpKmh: Math.round(speedJumpKmh),
    accelFlatlinePct: Math.round(accelFlatlinePct),
    flags,
    score: Math.min(100, score),
  };
}


// ── ML Fraud Score (IsolationForest via Flask) ──────────────────────────────

/**
 * Call the ML /fraud-score endpoint for full IsolationForest analysis.
 */
async function getMLFraudScore(workerId, reportedCity, lastCity, timeGapMin, weather, gpsSignals) {
  try {
    const claimHistory = getWorkerClaimHistory(workerId).map((c) => ({
      amount: c.payout || 0,
      timestamp: c.createdAt,
    }));

    const response = await axios.post(`${ML_SERVICE}/fraud-score`, {
      worker_id: String(workerId),
      location: {
        city: reportedCity,
        last_known_city: lastCity || reportedCity,
        time_gap_min: timeGapMin || 60,
      },
      claim_history: claimHistory,
      weather: weather || {},
      gps_signals: {
        accel_flatline_pct: gpsSignals?.accelFlatlinePct || 15,
      },
    }, { timeout: 5000 });

    return response.data;
  } catch (err) {
    console.warn("[ClaimService] ML fraud-score unavailable:", err.message);
    return null; // Fall back to GPS-only scoring
  }
}


// ── Fraud Calculation (replaces random-based calculateFraud) ────────────────

/**
 * Calculate fraud score using GPS spoofing + ML IsolationForest.
 * Returns: { score, flags, mlResult, weatherValid }
 */
async function calculateFraud(workerId, reportedCity, weather) {
  // 1. GPS Spoofing Detection
  const gps = detectGPSSpoofing(workerId, reportedCity);

  // 2. ML Fraud Score (IsolationForest)
  const lastLocation = workerLocations[String(workerId)];
  const timeGapMin = lastLocation
    ? (Date.now() - new Date(lastLocation.timestamp).getTime()) / 60000
    : 60;

  const mlResult = await getMLFraudScore(
    workerId,
    reportedCity,
    lastLocation?.city || reportedCity,
    timeGapMin,
    weather,
    gps
  );

  // 3. Weather Validation (for rain-triggered claims)
  let weatherValidation = null;
  if (weather && weather.rain > 0) {
    try {
      weatherValidation = await validateWeatherClaim(
        reportedCity,
        weather.rain,
        new Date().toISOString()
      );
    } catch (err) {
      console.warn("[ClaimService] Weather validation error:", err.message);
    }
  }

  // -- Combine all signals into a final score --------------------------------
  const allFlags = [...gps.flags];
  let combinedScore = gps.score;

  if (mlResult) {
    combinedScore = Math.max(combinedScore, Math.round(mlResult.fraud_probability * 100));
    if (mlResult.anomaly_flags) {
      mlResult.anomaly_flags.forEach((f) => {
        if (!allFlags.some((existing) => existing.includes(f))) {
          allFlags.push(f);
        }
      });
    }
  }

  if (weatherValidation && weatherValidation.flag === "FAKE_WEATHER_CLAIM") {
    allFlags.push(
      `FAKE_WEATHER: Claimed ${weatherValidation.claimed_rain_mm}mm rain, actual ${weatherValidation.actual_rain_mm}mm (${weatherValidation.discrepancy_pct}% off)`
    );
    combinedScore = Math.max(combinedScore, 75);
  }

  // Build structured fraud audit trail for DB / UI display
  const fraudAuditTrail = {
    gps_mismatch_km:     gps.locationMismatchScore,
    speed_jump_kmh:      gps.speedJumpKmh,
    accel_flatline_pct:  gps.accelFlatlinePct,
    weather_delta_pct:   weatherValidation?.discrepancy_pct ?? 0,
    claim_velocity_7d:   getWorkerClaimHistory(reportedCity).length, // reuse below
    isolation_score:     mlResult ? Math.round(mlResult.fraud_probability * 100) : 0,
    anomaly_flags:       allFlags,
  };

  return {
    score: Math.min(100, combinedScore),
    flags: allFlags,
    mlResult,
    weatherValidation,
    fraudAuditTrail,
    gpsDetails: {
      locationMismatch: gps.locationMismatchScore,
      speedJump: gps.speedJumpKmh,
      accelFlatline: gps.accelFlatlinePct,
    },
  };
}


// ── Claim Creation ──────────────────────────────────────────────────────────

/**
 * Process and create claims for all active policies in a zone.
 * Used by background poller and admin simulate-trigger.
 */
async function createClaimsForZone(zone_id) {
  console.log(`[ClaimService] Processing batch triggers for Zone ${zone_id}...`);

  const activePolicies = policies.filter(
    (p) => p.status === "ACTIVE" && p.zone_id === zone_id
  );

  let newClaimsCount = 0;

  for (let policy of activePolicies) {
    const fraudResult = await calculateFraud(
      policy.worker_id,
      policy.city || "Bengaluru",
      null // no specific weather for batch triggers
    );

    let status = "APPROVED";
    if (fraudResult.score > 70) status = "REJECTED";
    else if (fraudResult.score > 40) status = "PENDING"; // Manual review needed

    const basePayout = 500;

    const claim = {
      id: `CLM-Z${zone_id}-${Date.now()}-${policy.worker_id}`,
      worker_id: policy.worker_id,
      trigger: "RAIN",
      triggerDetails: "Heavy rainfall exceeding 15mm/hr",
      fraudScore: fraudResult.score,
      fraudFlags: fraudResult.flags,
      fraudDetails: fraudResult.mlResult,
      fraudAuditTrail: fraudResult.fraudAuditTrail,
      status,
      payout: status === "APPROVED" ? basePayout : 0,
      currency: "INR",
      createdAt: new Date().toISOString(),
    };

    claims.unshift(claim);
    newClaimsCount++;

    // Auto-trigger Razorpay payout on APPROVED claims
    if (status === "APPROVED" && claim.payout > 0) {
      processPayout(claim, `worker${policy.worker_id}@okaxis`, `Worker ${policy.worker_id}`)
        .catch((err) => console.error(`[ClaimService] Payout failed for ${claim.id}:`, err.message));
    }

    // Update worker location tracker
    workerLocations[String(policy.worker_id)] = {
      city: policy.city || "Bengaluru",
      zone_id: zone_id,
      timestamp: new Date().toISOString(),
    };

    console.log(
      `[ClaimService] Claim Generated -> Worker: ${claim.worker_id} | ` +
      `Status: ${claim.status} | Fraud Score: ${claim.fraudScore} | ` +
      `Flags: [${claim.fraudFlags.join(", ")}]`
    );
  }

  return newClaimsCount;
}

/**
 * Create a single claim for a user (called from riskEngine.js auto-claim).
 * Now includes full fraud pipeline: GPS + ML + Weather validation.
 */
async function createClaim(userId, reason, payout, trigger = "RAIN", weather = null, reportedCity = null, upiId = null) {
  const city = reportedCity || "Bengaluru";
  const fraudResult = await calculateFraud(userId, city, weather);

  // Tiered verification: 0-40 instant, 41-70 pending OTP, 71+ admin queue
  let status = "APPROVED";
  let verificationTier = "INSTANT";
  if (fraudResult.score > 70) { status = "REJECTED"; verificationTier = "ADMIN_QUEUE"; }
  else if (fraudResult.score > 40) { status = "PENDING"; verificationTier = "OTP_REQUIRED"; }

  const finalPayout = status === "APPROVED" ? payout : 0;

  const claim = {
    id: `CLM-${Date.now()}-${userId}`,
    worker_id: userId,
    reason,
    payout: finalPayout,
    currency: "INR",
    trigger,
    fraudScore: fraudResult.score,
    fraudFlags: fraudResult.flags,
    fraudDetails: fraudResult.mlResult,
    fraudAuditTrail: fraudResult.fraudAuditTrail,
    weatherValidation: fraudResult.weatherValidation,
    gpsDetails: fraudResult.gpsDetails,
    verificationTier,
    status,
    payoutRef: null,
    createdAt: new Date().toISOString(),
  };

  claims.unshift(claim);

  // Auto-trigger Razorpay payout on APPROVED (instant tier)
  if (status === "APPROVED" && finalPayout > 0) {
    processPayout(claim, upiId || `worker${userId}@okaxis`, `Worker ${userId}`)
      .then((payoutRecord) => {
        claim.payoutRef = payoutRecord.display_ref;
        claim.payoutUTR = payoutRecord.display_utr;
        claim.payoutTimestamp = payoutRecord.timestamp;
      })
      .catch((err) => console.error(`[ClaimService] Payout failed for ${claim.id}:`, err.message));
  }

  // Update worker location tracker
  workerLocations[String(userId)] = {
    city: city,
    zone_id: null,
    timestamp: new Date().toISOString(),
  };

  console.log(
    `[ClaimService] Claim Created -> Worker: ${userId} | Status: ${status} | Tier: ${verificationTier} | ` +
    `Fraud: ${fraudResult.score} | Flags: [${fraudResult.flags.join(", ")}]`
  );

  return claim;
}

module.exports = {
  createClaimsForZone,
  createClaim,
  calculateFraud,
  getWorkerClaimHistory,
  claims,
  policies,
  workerLocations,
};
