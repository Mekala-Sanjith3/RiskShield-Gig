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

export interface Claim {
  id: string;
  reason?: string;
  triggerDetails?: string;
  worker_id?: number | string;
  fraudScore?: number;
  status: ClaimStatus;
  payout: number;
  trigger?: string;
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

interface RiskShieldState {
  worker: WorkerProfile | null;
  riskScore: number;
  riskLevel: string;
  weeklyEarnings: number;
  weeklyTarget: number;
  premium: number;
  policyTier: PolicyTier;
  policyActive: boolean;
  recentAlert: string | null;
  claims: Claim[];
  weather: WeatherData | null;
  simulateLoading: boolean;
  claimJustTriggered: boolean;
  isPolling: boolean;
  lastChecked: string | null;
  setWorker: (worker: WorkerProfile) => void;
  activatePolicy: (tier: PolicyTier, premium: number) => void;
  simulateRainstorm: () => Promise<void>;
  simulateBatchTrigger: () => Promise<void>;
}

const RiskShieldContext = createContext<RiskShieldState | undefined>(undefined);

const API_BASE = "http://localhost:5000";
const POLL_INTERVAL_MS = 30_000; // 30 seconds

export function RiskShieldProvider({ children }: { children: ReactNode }) {
  const [worker, setWorkerState] = useState<WorkerProfile | null>(null);
  const [riskScore, setRiskScore] = useState(24);
  const [riskLevel, setRiskLevel] = useState("STABLE");
  const [weeklyEarnings, setWeeklyEarnings] = useState(420);
  const [weeklyTarget] = useState(500);
  const [premium, setPremium] = useState(12.5);
  const [policyTier, setPolicyTier] = useState<PolicyTier>("NONE");
  const [policyActive, setPolicyActive] = useState(false);
  const [recentAlert, setRecentAlert] = useState<string | null>(
    "System stable · Clear skies"
  );
  const [claims, setClaims] = useState<Claim[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [simulateLoading, setSimulateLoading] = useState(false);
  const [claimJustTriggered, setClaimJustTriggered] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [lastChecked, setLastChecked] = useState<string | null>(null);
  
  // Local storage Hydration
  const [hydrated, setHydrated] = useState(false);

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
      }
    } catch (e) {
      console.error("Failed to load state from localStorage:", e);
    }
    setHydrated(true);
  }, []);

  // Save to local storage on changes
  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(
        "riskShieldState",
        JSON.stringify({
          worker,
          policyTier,
          premium,
          policyActive,
          claims,
          weeklyEarnings,
        })
      );
    }
  }, [worker, policyTier, premium, policyActive, claims, weeklyEarnings, hydrated]);

  // Refs for stable polling loop
  const policyActiveRef = useRef(policyActive);
  const workerRef = useRef(worker);
  const weeklyEarningsRef = useRef(weeklyEarnings);
  const claimsRef = useRef(claims);

  useEffect(() => { policyActiveRef.current = policyActive; }, [policyActive]);
  useEffect(() => { workerRef.current = worker; }, [worker]);
  useEffect(() => { weeklyEarningsRef.current = weeklyEarnings; }, [weeklyEarnings]);
  useEffect(() => { claimsRef.current = claims; }, [claims]);

  const setWorker = (value: WorkerProfile) => {
    setWorkerState(value);
  };

  const activatePolicy = (tier: PolicyTier, nextPremium: number) => {
    setPolicyTier(tier);
    setPremium(nextPremium);
    setPolicyActive(true);
  };

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
          id:           currentWorker?.name || "guest",
          city,
          policyActive: policyActiveRef.current,
          weeklyIncome: weeklyEarningsRef.current,
        }),
      });

      const data = await res.json();
      setLastChecked(new Date().toLocaleTimeString());

      // Update risk score from ML engine
      if (data.riskScore !== undefined) {
        setRiskScore(Math.round(data.riskScore));
        setRiskLevel(data.riskLevel || "STABLE");
      }

      // Update weather display
      if (data.weather) {
        setWeather(data.weather);
      }

      // Auto-claim triggered
      if (data.claimTriggered && data.claim) {
        const newClaim: Claim = {
          id:        data.claim.id,
          reason:    data.claim.reason,
          status:    "PAID",
          payout:    data.claim.payout,
          trigger:   data.claim.trigger,
          createdAt: data.claim.createdAt,
        };
        setClaims((prev) => [newClaim, ...prev]);
        setClaimJustTriggered(true);
        setWeeklyEarnings((prev) => Math.max(0, prev - data.claim.payout));
        setRecentAlert(
          `⚠ ${data.weather?.condition || "Weather"} Detected — Claim ${data.claim.id} Auto-Approved · $${data.claim.payout}`
        );
        setTimeout(() => setClaimJustTriggered(false), 5000);
      } else if (data.riskScore !== undefined) {
        // Update alert based on risk level
        if (data.riskScore >= 70) {
          setRecentAlert(
            `⚠ High Risk — ${data.weather?.description || "Adverse weather"} (${Math.round(data.riskScore)}%) · ML Engine monitoring`
          );
        } else {
          setRecentAlert(
            `✓ ML Monitor — ${data.weather?.condition || "Clear"} · Risk: ${Math.round(data.riskScore)}% · System stable`
          );
        }
      }
    } catch {
      // Backend offline — keep current state silently
    } finally {
      setIsPolling(false);
    }
  }, []); // stable — uses refs

  // ── Start poll on mount ───────────────────────────────────────────────────
  useEffect(() => {
    // Initial check after 2s
    const initial = setTimeout(checkRisk, 2000);
    // Then every 30s
    const interval = setInterval(checkRisk, POLL_INTERVAL_MS);
    return () => {
      clearTimeout(initial);
      clearInterval(interval);
    };
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
          id:           currentWorker?.name || "guest",
          city:         currentWorker?.city || "Bengaluru",
          policyActive: policyActiveRef.current,
          weeklyIncome: weeklyEarningsRef.current,
          trigger:      "RAIN",
        }),
      });

      const data = await res.json();

      setRiskScore(data.riskScore ?? 85);
      setRiskLevel("HIGH");
      if (data.weather) setWeather(data.weather);
      setWeeklyEarnings((prev) => Math.max(0, prev - 45));

      if (data.claimTriggered && data.claim) {
        const newClaim: Claim = {
          id:        data.claim.id,
          reason:    data.claim.reason,
          status:    "PAID",
          payout:    data.claim.payout,
          trigger:   data.claim.trigger,
          createdAt: data.claim.createdAt,
        };
        setClaims((prev) => [newClaim, ...prev]);
        setClaimJustTriggered(true);
        setRecentAlert(
          `⚠ Heavy Rain Detected — Claim ${data.claim.id} Auto-Approved via ML Engine · $${data.claim.payout} payout`
        );
      } else {
        setRecentAlert(
          "⛈ Heavy Rain Warning · Risk at 85% — Activate policy to auto-trigger claims"
        );
      }
    } catch {
      // Backend offline — local fallback
      const nextRisk = 85;
      setRiskScore(nextRisk);
      setRiskLevel("HIGH");
      setWeeklyEarnings((prev) => Math.max(0, prev - 45));
      setRecentAlert("⛈ Heavy Rain Warning · Auto-claim engine armed");

      if (policyActiveRef.current) {
        const newClaim: Claim = {
          id:        `TX-${String(claimsRef.current.length + 1).padStart(4, "0")}`,
          reason:    "Heavy Rain · Orders stalled > 3h",
          status:    "PAID",
          payout:    45,
          trigger:   "RAIN",
          createdAt: new Date().toISOString(),
        };
        setClaims((prev) => [newClaim, ...prev]);
        setClaimJustTriggered(true);
      }
    } finally {
      setSimulateLoading(false);
      setTimeout(() => setClaimJustTriggered(false), 5000);
    }
  }, [simulateLoading]);

  // ── Admin: Simulate Batch Auto-Trigger ────────────────────────────────────
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
      setRecentAlert(`ADMIN ERROR: Ensure backend is running.`);
    }
  }, []);

  return (
    <RiskShieldContext.Provider
      value={{
        worker,
        riskScore,
        riskLevel,
        weeklyEarnings,
        weeklyTarget,
        premium,
        policyTier,
        policyActive,
        recentAlert,
        claims,
        weather,
        simulateLoading,
        claimJustTriggered,
        isPolling,
        lastChecked,
        setWorker,
        activatePolicy,
        simulateRainstorm,
        simulateBatchTrigger,
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
