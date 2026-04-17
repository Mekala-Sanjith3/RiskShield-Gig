"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRiskShield } from "../../context/RiskShieldContext";

const STATUS_STYLES: Record<string, string> = {
  Paid: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  PAID: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  APPROVED: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  PENDING: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  REJECTED: "bg-red-50 text-red-700 ring-1 ring-red-200",
  Processing: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  Reviewing: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
};

const SEED_CLAIMS = [
  { id: "CLM-2026-001", date: "Apr 01, 2026", type: "Heavy Rain", status: "Paid", payout: 450, description: "Rainfall exceeded 50mm/hr trigger. Auto-claim initiated.", isLive: false, fraudScore: 8 },
  { id: "CLM-2026-002", date: "Mar 28, 2026", type: "AQI Spike", status: "Paid", payout: 300, description: "AQI crossed 300 (Hazardous). 3-hour coverage offset applied.", isLive: false, fraudScore: 5 },
  { id: "CLM-2026-003", date: "Mar 22, 2026", type: "Traffic Surge", status: "Processing", payout: 225, description: "Delivery delay exceeded 45 min due to traffic congestion.", isLive: false, fraudScore: 22 },
  { id: "CLM-2026-004", date: "Mar 15, 2026", type: "Heatwave", status: "Paid", payout: 180, description: "Temperature exceeded 42°C for over 4 hours.", isLive: false, fraudScore: 3 },
  { id: "CLM-2026-005", date: "Mar 10, 2026", type: "Heavy Rain", status: "Reviewing", payout: 550, description: "Multiple rainfall triggers in a 6-hour window.", isLive: false, fraudScore: 68 },
];

export default function ClaimsPage() {
  const { claims: liveClaims, simulateRainstorm, simulateLoading, riskScore, policyActive, simulateFraudClaim } = useRiskShield();
  const [filter, setFilter] = useState("All");
  const [selectedClaim, setSelectedClaim] = useState<any>(null);
  const [otpClaim, setOtpClaim] = useState<any>(null);
  const [otp, setOtp] = useState("");
  const [otpTimer, setOtpTimer] = useState(60);
  const [otpVerified, setOtpVerified] = useState(false);
  const filters = ["All", "Paid", "Processing", "Reviewing", "PENDING", "REJECTED"];

  // OTP countdown
  useEffect(() => {
    if (!otpClaim) return;
    const t = setInterval(() => setOtpTimer(p => Math.max(0, p - 1)), 1000);
    return () => clearInterval(t);
  }, [otpClaim]);

  const liveMapped = liveClaims.map((c) => ({
    id: c.id,
    date: new Date(c.createdAt).toLocaleDateString("en-IN", { month: "short", day: "2-digit", year: "numeric" }),
    type: c.trigger ? ({ RAIN: "Heavy Rain", HEATWAVE: "Heatwave", AQI: "AQI Spike", SURGE: "Traffic Surge" }[c.trigger] ?? "Weather Event") : "Weather Event",
    status: c.status,
    payout: c.payout,
    currency: "INR",
    description: c.reason || c.triggerDetails,
    isLive: true,
    fraudScore: c.fraudScore ?? 0,
    fraudFlags: c.fraudFlags,
    fraudAuditTrail: c.fraudAuditTrail,
    verificationTier: c.verificationTier,
    payoutRef: c.payoutRef,
    payoutUTR: c.payoutUTR,
  }));

  const allClaims = [...liveMapped, ...SEED_CLAIMS];
  const filtered = filter === "All" ? allClaims : allClaims.filter(c => c.status.toLowerCase() === filter.toLowerCase());
  const totalPaid = allClaims.filter(c => c.status === "Paid" || c.status === "PAID" || c.status === "APPROVED").reduce((s, c) => s + c.payout, 0);

  const handleVerifyOtp = () => {
    if (otp === "123456" || otp.length === 6) {
      setOtpVerified(true);
      setTimeout(() => { setOtpClaim(null); setOtp(""); setOtpTimer(60); setOtpVerified(false); }, 2000);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-12 px-4 py-8 sm:px-6 lg:px-16">

        {/* Sidebar */}
        <aside className="hidden w-72 flex-shrink-0 flex-col lg:flex">
          <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">RiskShield-Gig</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">Gig Commander</p>
            </div>
            <nav className="space-y-1 text-sm">
              <Link href="/dashboard" className="block rounded-xl px-3 py-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800">Dashboard</Link>
              <Link href="/buy-policy" className="block rounded-xl px-3 py-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800">Buy Policy</Link>
              <Link href="/claims" className="flex items-center justify-between rounded-xl bg-blue-600 px-3 py-2 font-medium text-white">
                <span>Claims</span><span className="h-1.5 w-1.5 rounded-full bg-white/70" />
              </Link>
              <Link href="/admin" className="block rounded-xl px-3 py-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800">Admin Analytics</Link>
            </nav>
            <div className="mt-6 border-t border-slate-100 pt-5 space-y-2">
              <button onClick={simulateRainstorm} disabled={simulateLoading}
                className={`w-full rounded-xl border px-3 py-2.5 text-[11px] font-semibold transition ${simulateLoading ? "border-blue-200 bg-blue-50 text-blue-400 cursor-wait" : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"}`}>
                {simulateLoading ? "Simulating..." : "Simulate Rainstorm"}
              </button>
              <button onClick={simulateFraudClaim}
                className="w-full rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[11px] font-bold transition hover:bg-red-100 text-red-700">
                Inject Fraud Claim (Demo)
              </button>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 mt-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Live Risk Score</p>
                <p className={`mt-1 text-2xl font-bold ${riskScore >= 70 ? "text-red-600" : riskScore >= 40 ? "text-amber-600" : "text-emerald-600"}`}>{riskScore}%</p>
                <p className="text-[10px] text-slate-400">Policy: {policyActive ? "Active" : "Inactive"}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex flex-1 flex-col gap-6">
          {liveClaims.length > 0 && (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              <p className="text-sm font-semibold text-emerald-800">
                {liveClaims.length} parametric claim{liveClaims.length > 1 ? "s" : ""} auto-triggered · Total: ₹{liveClaims.reduce((s, c) => s + c.payout, 0).toFixed(2)}
              </p>
            </div>
          )}

          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">Claims History</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900">Your Parametric Claims</h1>
              <p className="mt-1 text-sm text-slate-500">All auto-triggered payouts based on real-time risk events.</p>
            </div>
            <Link href="/dashboard" className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50">← Back</Link>
          </header>

          {/* Summary cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium text-slate-500">Total Claims</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{allClaims.length}</p>
              <p className="mt-1 text-xs text-slate-400">{liveClaims.length} live · {SEED_CLAIMS.length} historical</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium text-slate-500">Total Paid Out</p>
              <p className="mt-2 text-3xl font-bold text-emerald-600">₹{totalPaid.toFixed(2)}</p>
              <p className="mt-1 text-xs text-slate-400">Settled automatically</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-blue-600 p-5 shadow-sm">
              <p className="text-xs font-medium text-blue-100">Policy Status</p>
              <p className="mt-2 text-lg font-bold text-white">{policyActive ? "Gig Elite Protection" : "No Active Policy"}</p>
              <p className="mt-1 text-xs text-blue-200">{policyActive ? "Auto-claims armed" : "Activate to enable"}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 border-b border-slate-200 pb-2">
            {filters.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${filter === f ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-100"}`}>
                {f}
              </button>
            ))}
          </div>

          {/* Claims list */}
          <div className="space-y-3">
            {filtered.map((claim, idx) => (
              <div key={claim.id} onClick={() => setSelectedClaim(claim)}
                className={`flex flex-col gap-4 rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md cursor-pointer sm:flex-row sm:items-center sm:justify-between ${claim.isLive ? "border-emerald-200 bg-emerald-50/30" : "border-slate-200"} ${claim.status === "REJECTED" ? "border-red-200 bg-red-50/20" : ""}`}
                style={{ animation: claim.isLive ? `fadeSlideIn 0.4s ease-out ${idx * 0.05}s both` : undefined }}>
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    {claim.isLive && <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold uppercase text-emerald-700"><span className="h-1 w-1 animate-pulse rounded-full bg-emerald-500" />Live</span>}
                    {claim.status === "REJECTED" && <span className="rounded-full bg-red-100 px-2 py-0.5 text-[9px] font-bold uppercase text-red-700">FRAUD BLOCKED</span>}
                    <p className="text-sm font-semibold text-slate-800">{claim.type} — {claim.id}</p>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[claim.status] ?? "bg-slate-100 text-slate-600"}`}>{claim.status}</span>
                    {/* Tiered verification badge */}
                    {claim.verificationTier === "INSTANT" && <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">Instant Payout</span>}
                    {claim.verificationTier === "OTP_REQUIRED" && (
                      <button onClick={e => { e.stopPropagation(); setOtpClaim(claim); setOtpTimer(60); }}
                        className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 hover:bg-amber-200 transition">
                        OTP Required →
                      </button>
                    )}
                    {claim.verificationTier === "ADMIN_QUEUE" && <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-bold text-red-700">Admin Queue</span>}
                  </div>
                  <p className="text-xs text-slate-500">{claim.description}</p>
                  <p className="text-[11px] text-slate-400">{claim.date}</p>
                  {claim.payoutRef && <p className="text-[11px] font-mono text-emerald-600">Ref: {claim.payoutRef}</p>}
                  {claim.fraudFlags && claim.fraudFlags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {claim.fraudFlags.slice(0, 2).map((f: string, i: number) => (
                        <span key={i} className="rounded bg-red-100 px-1.5 py-0.5 text-[9px] font-bold text-red-600">{f.split(":")[0]}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className={`text-xl font-bold ${claim.status === "REJECTED" ? "text-red-400 line-through" : "text-slate-900"}`}>₹{claim.payout.toFixed(2)}</p>
                  <p className="text-xs text-slate-400">Payout</p>
                  <p className="text-[10px] text-blue-600 font-semibold mt-1">View ML Analysis →</p>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-400">No claims found.</div>
            )}
          </div>
        </div>
      </div>

      {/* OTP Liveness Check Modal */}
      {otpClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-amber-50 border-b border-amber-100 p-6 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-1">Liveness Verification Required</p>
                <h3 className="text-lg font-bold text-slate-900">{otpClaim.id}</h3>
              </div>
              <button onClick={() => { setOtpClaim(null); setOtp(""); }} className="h-8 w-8 rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 flex items-center justify-center font-bold">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-center">
                <p className="text-sm font-semibold text-amber-800">Fraud score: {otpClaim.fraudScore}% — Mid-range risk detected</p>
                <p className="text-xs text-amber-600 mt-1">OTP verification + 60-second liveness check required</p>
              </div>
              {otpVerified ? (
                <div className="text-center py-4">
                  <p className="text-2xl mb-2">✅</p>
                  <p className="font-bold text-emerald-700">Identity Verified — Payout Released</p>
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-xs font-bold text-slate-500 mb-2">Enter 6-digit OTP sent to your registered mobile</p>
                    <input
                      value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="_ _ _ _ _ _"
                      className="w-full text-center text-2xl font-mono tracking-[0.4em] border border-slate-200 rounded-xl py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <p className="text-[11px] text-slate-400 mt-1 text-center">Use <strong>123456</strong> for demo</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className={`text-sm font-bold ${otpTimer < 15 ? "text-red-600" : "text-slate-600"}`}>
                      Expires in {otpTimer}s
                    </div>
                    <div className="h-2 w-32 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 transition-all rounded-full" style={{ width: `${(otpTimer / 60) * 100}%` }} />
                    </div>
                  </div>
                  <button onClick={handleVerifyOtp} disabled={otp.length < 6 || otpTimer === 0}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition disabled:opacity-40">
                    Verify & Release ₹{otpClaim.payout}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fraud Analysis Modal */}
      {selectedClaim && !otpClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-slate-50 border-b border-slate-100 p-6 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Fraud Analysis & Logic Tracer</p>
                <h3 className="text-lg font-bold text-slate-900">{selectedClaim.id}</h3>
              </div>
              <button onClick={() => setSelectedClaim(null)} className="h-8 w-8 rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 flex items-center justify-center font-bold">×</button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                  <p className="text-xs font-semibold text-slate-500">AI Fraud Score</p>
                  <p className={`text-3xl font-black mt-2 ${selectedClaim.fraudScore > 70 ? "text-red-500" : selectedClaim.fraudScore > 40 ? "text-amber-500" : "text-emerald-500"}`}>{selectedClaim.fraudScore ?? 4}%</p>
                  <p className="text-[10px] text-slate-400 mt-1">{selectedClaim.fraudScore > 70 ? "HIGH RISK" : selectedClaim.fraudScore > 40 ? "REVIEW" : "SAFE"}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 text-center">
                  <p className="text-xs font-semibold text-blue-600">Decision</p>
                  <p className="text-lg font-bold text-blue-800 mt-2">{selectedClaim.status}</p>
                  <p className="text-[10px] text-blue-500 mt-1">{selectedClaim.verificationTier || "Parametric"}</p>
                </div>
              </div>

              {/* Fraud Audit Trail */}
              {selectedClaim.fraudAuditTrail && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-slate-100 pb-2 mb-3">ML Audit Trail</p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(selectedClaim.fraudAuditTrail)
                      .filter(([k]) => k !== "anomaly_flags")
                      .map(([k, v]) => (
                        <div key={k} className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{k.replace(/_/g," ")}</p>
                          <p className="text-sm font-bold text-slate-700 mt-0.5">{typeof v === "number" ? v.toFixed(1) : String(v)}</p>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}

              {/* Fraud Flags */}
              {selectedClaim.fraudFlags && selectedClaim.fraudFlags.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-slate-100 pb-2 mb-3">Anomaly Flags</p>
                  {selectedClaim.fraudFlags.map((f: string, i: number) => (
                    <div key={i} className="flex items-center gap-3 text-sm bg-red-50 p-3 rounded-xl border border-red-100 mb-2">
                      <span className="text-red-500">⚠</span> {f}
                    </div>
                  ))}
                </div>
              )}

              {/* Payout ref */}
              {selectedClaim.payoutRef && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3">
                  <p className="text-xs font-bold text-emerald-700">₹{selectedClaim.payout} sent via UPI</p>
                  <p className="text-[11px] font-mono text-emerald-600">Ref: {selectedClaim.payoutRef} · UTR: {selectedClaim.payoutUTR}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </main>
  );
}
