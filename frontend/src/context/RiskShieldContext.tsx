"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from "react";

export type PolicyTier = "NONE" | "BASIC" | "PREMIUM";
export type ClaimStatus = "PENDING" | "APPROVED" | "PAID" | "REJECTED";

export interface WorkerProfile {
  name: string;
  city: string;
  platform: string;
}

export interface FraudAuditTrail {
  gps_mismatch_km?: number;
  speed_jump_kmh?: number;
  accel_flatline_pct?: number;
  weather_delta_pct?: number;
  claim_velocity_7d?: number;
  isolation_score?: number;
  anomaly_flags?: string[];
}

export interface PayoutRecord {
  payout_id: string;
  claim_id: string;
  worker_id: string | number;
  amount: number;
  currency: string;
  upi_id: string;
  transfer_id: string;
  utr: string;
  display_ref: string;
  display_utr: string;
  status: string;
  gateway: string;
  timestamp: string;
  claim_reason: string;
}

export interface Claim {
  id: string;
  reason?: string;
  triggerDetails?: string;
  worker_id?: number | string;
  fraudScore?: number;
  fraudFlags?: string[];
  fraudAuditTrail?: FraudAuditTrail;
  verificationTier?: "INSTANT" | "OTP_REQUIRED" | "ADMIN_QUEUE";
  status: ClaimStatus;
  payout: number;
  currency?: string;
  trigger?: string;
  payoutRef?: string;
  payoutUTR?: string;
  payoutTimestamp?: string;
  createdAt: string;
}

export interface WeatherData {
  city: string;
  temperature: number;
  rain: number;
  windSpeed: number;
  humidity: number;
  condition: string;
  description: string;
  isLive: boolean;
  timestamp: string;
}

export interface RiskDataPoint {
  time: string;
  score: number;
  label: string;
}

interface RiskShieldState {
  worker: WorkerProfile | null;
  riskScore: number;
  riskLevel: string;
  weeklyEarnings: number;
  weeklyTarget: number;
  premium: number;
  policyTier: PolicyTier;
  policyActive: boolean;
  policyStartDate: string | null;
  recentAlert: string | null;
  claims: Claim[];
  payouts: PayoutRecord[];
  riskHistory: RiskDataPoint[];
  weather: WeatherData | null;
  simulateLoading: boolean;
  claimJustTriggered: boolean;
  isPolling: boolean;
  lastChecked: string | null;
  setWorker: (worker: WorkerProfile) => void;
  activatePolicy: (tier: PolicyTier, premium: number) => void;
  simulateRainstorm: () => Promise<void>;
  simulateBatchTrigger: () => Promise<void>;
  simulateFraudClaim: () => Promise<void>;
}

const RiskShieldContext = createContext<RiskShieldState | undefined>(undefined);

const API_BASE = "http://localhost:5000";
const POLL_INTERVAL_MS = 30_000;

export function RiskShieldProvider({ children }: { children: ReactNode }) {
  const [worker, setWorkerState] = useState<WorkerProfile | null>(null);
  const [riskScore, setRiskScore] = useState(24);
  const [riskLevel, setRiskLevel] = useState("STABLE");
  const [weeklyEarnings, setWeeklyEarnings] = useState(420);
  const [weeklyTarget] = useState(500);
  const [premium, setPremium] = useState(12.5);
  const [policyTier, setPolicyTier] = useState<PolicyTier>("NONE");
  const [policyActive, setPolicyActive] = useState(false);
  const [policyStartDate, setPolicyStartDate] = useState<string | null>(null);
  const [recentAlert, setRecentAlert] = useState<string | null>("System stable · Clear skies");
  const [claims, setClaims] = useState<Claim[]>([]);
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [riskHistory, setRiskHistory] = useState<RiskDataPoint[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [simulateLoading, setSimulateLoading] = useState(false);
  const [claimJustTriggered, setClaimJustTriggered] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [lastChecked, setLastChecked] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // ── LocalStorage hydration ────────────────────────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem("riskShieldState");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.worker) setWorkerState(parsed.worker);
        if (parsed.policyTier) setPolicyTier(parsed.policyTier);
        if (parsed.premium) setPremium(parsed.premium);
        if (parsed.policyActive !== undefined) setPolicyActive(parsed.policyActive);
        if (parsed.claims) setClaims(parsed.claims);
        if (parsed.weeklyEarnings) setWeeklyEarnings(parsed.weeklyEarnings);
        if (parsed.policyStartDate) setPolicyStartDate(parsed.policyStartDate);
        if (parsed.riskHistory) setRiskHistory(parsed.riskHistory.slice(-20));
      }
    } catch (e) {
      console.error("Failed to load state from localStorage:", e);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem("riskShieldState", JSON.stringify({
        worker, policyTier, premium, policyActive, claims,
        weeklyEarnings, policyStartDate,
        riskHistory: riskHistory.slice(-20),
      }));
    }
  }, [worker, policyTier, premium, policyActive, claims, weeklyEarnings, policyStartDate, riskHistory, hydrated]);

  // ── Refs for stable polling loop ──────────────────────────────────────────
  const policyActiveRef = useRef(policyActive);
  const workerRef = useRef(worker);
  const weeklyEarningsRef = useRef(weeklyEarnings);
  const claimsRef = useRef(claims);

  useEffect(() => { policyActiveRef.current = policyActive; }, [policyActive]);
  useEffect(() => { workerRef.current = worker; }, [worker]);
  useEffect(() => { weeklyEarningsRef.current = weeklyEarnings; }, [weeklyEarnings]);
  useEffect(() => { claimsRef.current = claims; }, [claims]);

  const setWorker = (value: WorkerProfile) => setWorkerState(value);

  const activatePolicy = (tier: PolicyTier, nextPremium: number) => {
    setPolicyTier(tier);
    setPremium(nextPremium);
    setPolicyActive(true);
    setPolicyStartDate(new Date().toISOString());
  };

  // ── Push Notification on Claim Trigger ───────────────────────────────────
  useEffect(() => {
    if (!claimJustTriggered || !claims[0]) return;

    const fireNotification = async () => {
      if (!("Notification" in window)) return;
      if (Notification.permission === "default") {
        await Notification.requestPermission();
      }
      if (Notification.permission === "granted") {
        new Notification("RiskShield — Claim Triggered", {
          body: `Heavy rain detected · ₹${claims[0].payout} payout initiated · Ref: ${claims[0].payoutRef || claims[0].id}`,
          icon: "/favicon.ico",
          tag: "claim-trigger",
        });
      }
    };
    fireNotification();
  }, [claimJustTriggered]);

  // ── Fetch payout history ──────────────────────────────────────────────────
  const fetchPayouts = useCallback(async () => {
    const currentWorker = workerRef.current;
    if (!currentWorker) return;
    try {
      const res = await fetch(`${API_BASE}/api/workers/${currentWorker.name}/payouts`);
      if (res.ok) {
        const data = await res.json();
        setPayouts(data.payouts || []);
      }
    } catch { /* silent */ }
  }, []);

  // ── Real-time /check-risk poller ──────────────────────────────────────────
  const checkRisk = useCallback(async () => {
    const currentWorker = workerRef.current;
    const city = currentWorker?.city || "Bengaluru";

    try {
      setIsPolling(true);
      const res = await fetch(`${API_BASE}/check-risk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: currentWorker?.name || "guest",
          city,
          policyActive: policyActiveRef.current,
          weeklyIncome: weeklyEarningsRef.current,
        }),
      });

      const data = await res.json();
      const now = new Date();
      setLastChecked(now.toLocaleTimeString());

      if (data.riskScore !== undefined) {
        const score = Math.round(data.riskScore);
        setRiskScore(score);
        setRiskLevel(data.riskLevel || "STABLE");

        // Accumulate risk history for live chart (keep last 14 points)
        setRiskHistory((prev) => {
          const point: RiskDataPoint = {
            time: now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
            score,
            label: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][now.getDay()] +
                   " " + now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
          };
          return [...prev.slice(-13), point];
        });
      }

      if (data.weather) setWeather(data.weather);

      if (data.claimTriggered && data.claim) {
        const newClaim: Claim = {
          id:              data.claim.id,
          reason:          data.claim.reason,
          status:          "APPROVED",
          payout:          data.claim.payout,
          currency:        "INR",
          trigger:         data.claim.trigger,
          fraudScore:      data.claim.fraudScore,
          verificationTier: data.claim.verificationTier,
          payoutRef:       data.claim.payoutRef,
          payoutUTR:       data.claim.payoutUTR,
          createdAt:       data.claim.createdAt,
        };
        setClaims((prev) => [newClaim, ...prev]);
        setClaimJustTriggered(true);
        setWeeklyEarnings((prev) => Math.max(0, prev - data.claim.payout));
        setRecentAlert(
          `Heavy rain detected — Claim ${data.claim.id} auto-approved · ₹${data.claim.payout} sent via UPI`
        );
        setTimeout(() => setClaimJustTriggered(false), 6000);
        fetchPayouts();
      } else if (data.riskScore !== undefined) {
        setRecentAlert(
          data.riskScore >= 70
            ? `High Risk — ${data.weather?.description || "Adverse weather"} (${Math.round(data.riskScore)}%) · ML Engine monitoring`
            : `ML Monitor — ${data.weather?.condition || "Clear"} · Risk: ${Math.round(data.riskScore)}% · System stable`
        );
      }
    } catch { /* silent */ } finally {
      setIsPolling(false);
    }
  }, [fetchPayouts]);

  useEffect(() => {
    const initial = setTimeout(checkRisk, 2000);
    const interval = setInterval(checkRisk, POLL_INTERVAL_MS);
    return () => { clearTimeout(initial); clearInterval(interval); };
  }, [checkRisk]);

  // ── Manual Rainstorm Simulation ───────────────────────────────────────────
  const simulateRainstorm = useCallback(async () => {
    if (simulateLoading) return;
    setSimulateLoading(true);
    setClaimJustTriggered(false);

    try {
      const currentWorker = workerRef.current;
      const res = await fetch(`${API_BASE}/simulate-rain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: currentWorker?.name || "guest",
          city: currentWorker?.city || "Bengaluru",
          policyActive: policyActiveRef.current,
          weeklyIncome: weeklyEarningsRef.current,
          trigger: "RAIN",
        }),
      });

      const data = await res.json();
      setRiskScore(data.riskScore ?? 85);
      setRiskLevel("HIGH");
      if (data.weather) setWeather(data.weather);
      setWeeklyEarnings((prev) => Math.max(0, prev - 45));

      if (data.claimTriggered && data.claim) {
        const newClaim: Claim = {
          id:             data.claim.id,
          reason:         data.claim.reason,
          status:         "APPROVED",
          payout:         data.claim.payout,
          currency:       "INR",
          trigger:        data.claim.trigger,
          fraudScore:     data.claim.fraudScore,
          verificationTier: data.claim.verificationTier,
          payoutRef:      data.claim.payoutRef,
          createdAt:      data.claim.createdAt,
        };
        setClaims((prev) => [newClaim, ...prev]);
        setClaimJustTriggered(true);
        setRecentAlert(`Heavy Rain Detected — Claim ${data.claim.id} auto-approved via ML · ₹${data.claim.payout} UPI payout`);
        fetchPayouts();
      } else {
        setRecentAlert("Heavy Rain Warning · Risk at 85% — Activate policy to auto-trigger claims");
      }
    } catch {
      setRiskScore(85);
      setRiskLevel("HIGH");
      setWeeklyEarnings((prev) => Math.max(0, prev - 45));
      setRecentAlert("Heavy Rain Warning · Auto-claim engine armed");

      if (policyActiveRef.current) {
        const newClaim: Claim = {
          id: `TX-${String(claimsRef.current.length + 1).padStart(4, "0")}`,
          reason: "Heavy Rain · Orders stalled > 3h",
          status: "APPROVED",
          payout: 45,
          currency: "INR",
          trigger: "RAIN",
          createdAt: new Date().toISOString(),
        };
        setClaims((prev) => [newClaim, ...prev]);
        setClaimJustTriggered(true);
      }
    } finally {
      setSimulateLoading(false);
      setTimeout(() => setClaimJustTriggered(false), 6000);
    }
  }, [simulateLoading, fetchPayouts]);

  // ── Simulate Fraud Claim ──────────────────────────────────────────────────
  const simulateFraudClaim = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/simulate-fraud-claim`, { method: "POST" });
      const data = await res.json();
      if (data.claim) {
        const fraudClaim: Claim = {
          id:             data.claim.id,
          reason:         data.claim.reason || "FRAUD DEMO — GPS Spoofed",
          status:         data.claim.status,
          payout:         data.claim.payout,
          currency:       "INR",
          trigger:        "RAIN",
          fraudScore:     data.claim.fraudScore,
          fraudFlags:     data.claim.fraudFlags,
          fraudAuditTrail: data.claim.fraudAuditTrail,
          verificationTier: data.claim.verificationTier,
          createdAt:      data.claim.createdAt,
        };
        setClaims((prev) => [fraudClaim, ...prev]);
        setRecentAlert(
          `FRAUD DETECTED — GPS Spoofing flagged · Claim ${data.claim.id} AUTO-REJECTED · Score: ${data.claim.fraudScore}%`
        );
      }
      return data;
    } catch (e) {
      console.error("simulateFraudClaim error:", e);
    }
  }, []);

  // ── Admin: Batch Trigger ──────────────────────────────────────────────────
  const simulateBatchTrigger = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/simulate-trigger`, { method: "POST" });
      const data = await res.json();
      const claimsRes = await fetch(`${API_BASE}/api/claims/all`);
      const claimsData = await claimsRes.json();
      setClaims(claimsData);
      setRecentAlert(`ADMIN: Batch trigger complete — ${data.claimsGenerated} policies evaluated.`);
    } catch (e) {
      console.error(e);
      setRecentAlert("ADMIN ERROR: Ensure backend is running.");
    }
  }, []);

  return (
    <RiskShieldContext.Provider
      value={{
        worker, riskScore, riskLevel, weeklyEarnings, weeklyTarget,
        premium, policyTier, policyActive, policyStartDate,
        recentAlert, claims, payouts, riskHistory, weather,
        simulateLoading, claimJustTriggered, isPolling, lastChecked,
        setWorker, activatePolicy, simulateRainstorm, simulateBatchTrigger, simulateFraudClaim,
      }}
    >
      {children}
    </RiskShieldContext.Provider>
  );
}

export function useRiskShield() {
  const ctx = useContext(RiskShieldContext);
  if (!ctx) throw new Error("useRiskShield must be used within RiskShieldProvider");
  return ctx;
}
