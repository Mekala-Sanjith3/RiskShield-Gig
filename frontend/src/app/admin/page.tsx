"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie
} from "recharts";
import { Claim } from "../../context/RiskShieldContext";
import { useRiskShield } from "../../context/RiskShieldContext";

const RISK_STYLE: Record<string, string> = {
  PENDING:  "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  APPROVED: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  PAID:     "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  REJECTED: "bg-red-50 text-red-700 ring-1 ring-red-200",
};

interface ForecastDay {
  date: string; day: string; predicted_risk: number;
  predicted_claims: number; rain_mm: number; risk_level: string;
}

interface AdminStats {
  total: number; approved: number; rejected: number; pending: number;
  totalPayoutRaw?: number; lossRatio?: number;
  fraudStats?: {
    flagged: number; flaggedRate: number; topSignal: string;
    topSignalCount: number; signalBreakdown: Record<string,number>;
  };
}

export default function AdminPage() {
  const { simulateFraudClaim } = useRiskShield();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [reviewLoading, setReviewLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"claims"|"fraud"|"forecast">("claims");

  const fetchAdminData = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/claims");
      const data = await res.json();
      setClaims(data.claims);
      setStats(data.stats);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 5000);
    return () => clearInterval(interval);
  }, [fetchAdminData]);

  useEffect(() => {
    fetch("http://localhost:5000/api/admin/forecast")
      .then(r => r.json()).then(d => setForecast(d.forecast || []))
      .catch(() => {});
  }, []);

  const handleReview = async (claimId: string, action: "approve" | "reject") => {
    setReviewLoading(claimId + action);
    try {
      await fetch(`http://localhost:5000/api/claims/${claimId}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      await fetchAdminData();
    } catch (err) { console.error(err); }
    setReviewLoading(null);
  };

  const handleFraudSim = async () => {
    await simulateFraudClaim();
    await fetchAdminData();
  };

  const lossRatio = stats?.lossRatio ?? 62;
  const lossColor = lossRatio < 70 ? "#22c55e" : lossRatio < 85 ? "#f59e0b" : "#ef4444";

  const signalData = stats?.fraudStats?.signalBreakdown
    ? Object.entries(stats.fraudStats.signalBreakdown).map(([k, v]) => ({ name: k, count: v }))
    : [];

  const pendingClaims = claims.filter(c => c.status === "PENDING");

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-12 px-4 py-8 sm:px-6 lg:px-16">

        {/* Sidebar */}
        <aside className="hidden w-72 flex-shrink-0 flex-col lg:flex">
          <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">RiskShield-Gig</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">Admin Panel</p>
            </div>
            <nav className="space-y-1 text-sm">
              <Link href="/dashboard" className="block rounded-xl px-3 py-2 text-slate-500 hover:bg-slate-50">Dashboard</Link>
              <Link href="/claims" className="block rounded-xl px-3 py-2 text-slate-500 hover:bg-slate-50">Claims</Link>
              <Link href="/admin" className="flex items-center justify-between rounded-xl bg-blue-600 px-3 py-2 font-medium text-white">
                <span>Admin Analytics</span><span className="h-1.5 w-1.5 rounded-full bg-white/70" />
              </Link>
            </nav>
            <div className="mt-6 border-t border-slate-100 pt-5">
              <button onClick={handleFraudSim}
                className="w-full rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[11px] font-bold transition hover:bg-red-100 text-red-700">
                Inject Fraud Demo Claim
              </button>
              <p className="mt-2 text-[10px] text-slate-400 leading-relaxed">Sends a GPS-spoofed claim. Watch it get auto-rejected by the ML model.</p>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex flex-1 flex-col gap-6">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">Admin Analytics</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900">Platform Overview</h1>
              <p className="mt-1 text-sm text-slate-500">Real-time metrics across all gig workers and risk events.</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />Live Dashboard
            </span>
          </header>

          {/* Stats Row */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium text-slate-500">Total Claims</p>
              <p className="mt-2 text-3xl font-bold text-blue-600">{stats?.total || 0}</p>
              <p className="mt-1 text-[11px] text-slate-400">All registered requests</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium text-slate-500">Approved / Paid</p>
              <p className="mt-2 text-3xl font-bold text-emerald-600">{stats?.approved || 0}</p>
              <p className="mt-1 text-[11px] text-slate-400">Parametric triggers cleared</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium text-slate-500">Total Payouts</p>
              <p className="mt-2 text-3xl font-bold text-amber-600">₹{stats?.totalPayoutRaw || 0}</p>
              <p className="mt-1 text-[11px] text-slate-400">Realized distribution</p>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5 shadow-sm">
              <p className="text-xs font-medium text-amber-800">Pending Review</p>
              <p className="mt-2 text-3xl font-bold text-amber-600">{stats?.pending || 0}</p>
              <p className="mt-1 text-[11px] text-amber-700/80">Awaiting manual resolution</p>
            </div>
          </div>

          {/* Loss Ratio + Fraud Rate */}
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Loss Ratio Gauge */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Loss Ratio</p>
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 flex-shrink-0">
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f5f9" strokeWidth="3.8" />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke={lossColor} strokeWidth="3.8"
                      strokeDasharray={`${lossRatio} ${100 - lossRatio}`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-black text-slate-800">{lossRatio}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700">Loss Ratio</p>
                  <p className="text-xs text-slate-400 mt-0.5">Payouts / Premiums</p>
                  <p className={`text-xs font-bold mt-1 ${lossRatio < 70 ? "text-emerald-600" : lossRatio < 85 ? "text-amber-600" : "text-red-600"}`}>
                    {lossRatio < 70 ? "Healthy" : lossRatio < 85 ? "Moderate" : "Alert"}
                  </p>
                </div>
              </div>
            </div>

            {/* Fraud Detection Rate */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Fraud Detection</p>
              <p className="text-3xl font-black text-red-500">{stats?.fraudStats?.flaggedRate ?? 0}%</p>
              <p className="text-xs text-slate-400 mt-1">of claims flagged by ML</p>
              <div className="mt-3 rounded-lg bg-red-50 border border-red-100 p-2">
                <p className="text-[10px] font-bold text-red-600">Top Signal</p>
                <p className="text-xs font-semibold text-slate-700">{stats?.fraudStats?.topSignal || "N/A"}</p>
              </div>
            </div>

            {/* Trigger Rates */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Trigger Rates</p>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Rainfall Approved</span>
                    <span className="font-semibold">{stats?.total ? Math.round((stats.approved / stats.total) * 100) : 0}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: `${stats?.total ? Math.round((stats.approved / stats.total) * 100) : 0}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Fraud Rejected</span>
                    <span className="font-semibold">{stats?.total ? Math.round((stats.rejected / stats.total) * 100) : 0}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-red-400" style={{ width: `${stats?.total ? Math.round((stats.rejected / stats.total) * 100) : 0}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-slate-200 pb-2">
            {(["claims","fraud","forecast"] as const).map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition ${activeTab === t ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-100"}`}>
                {t === "claims" ? "Claims Feed" : t === "fraud" ? "Fraud Analytics" : "7-Day Forecast"}
              </button>
            ))}
          </div>

          {/* Claims Feed tab */}
          {activeTab === "claims" && (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
              {/* Claims list */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col max-h-[600px]">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 bg-slate-50">
                  <p className="text-sm font-semibold text-slate-800">Global Claims & Fraud Alerts</p>
                  <p className="text-xs text-slate-400">Live Status Feed</p>
                </div>
                <div className="divide-y divide-slate-50 overflow-y-auto">
                  {claims.length > 0 ? claims.map((c) => (
                    <div key={c.id} className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 gap-2 hover:bg-slate-50">
                      <div className="flex flex-col gap-1">
                        <p className="text-xs font-semibold text-slate-800 font-mono">{c.id}</p>
                        <p className="text-xs text-slate-500">{(c as any).triggerDetails || c.reason} · ₹{c.payout}</p>
                        {(c as any).payoutRef && <p className="text-[10px] font-mono text-emerald-600">Ref: {(c as any).payoutRef}</p>}
                        {(c as any).fraudAuditTrail && (
                          <p className="text-[10px] text-slate-400">
                            GPS: {(c as any).fraudAuditTrail.gps_mismatch_km?.toFixed(0)}km · Weather Δ: {(c as any).fraudAuditTrail.weather_delta_pct?.toFixed(0)}% · ISO: {(c as any).fraudAuditTrail.isolation_score}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col sm:items-end gap-2">
                        <span className={`rounded-full px-3 py-1 text-[10px] font-bold tracking-widest uppercase ${RISK_STYLE[c.status] || ""}`}>{c.status}</span>
                        {c.fraudScore !== undefined && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.fraudScore > 70 ? "bg-red-100 text-red-600" : c.fraudScore > 40 ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"}`}>
                            Fraud: {c.fraudScore}%
                          </span>
                        )}
                        {c.status === "PENDING" && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleReview(c.id, "approve")}
                              disabled={reviewLoading === c.id + "approve"}
                              className="rounded-lg bg-emerald-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-emerald-700 transition disabled:opacity-50">
                              {reviewLoading === c.id + "approve" ? "..." : "Approve"}
                            </button>
                            <button
                              onClick={() => handleReview(c.id, "reject")}
                              disabled={reviewLoading === c.id + "reject"}
                              className="rounded-lg bg-red-500 px-2 py-1 text-[10px] font-bold text-white hover:bg-red-600 transition disabled:opacity-50">
                              {reviewLoading === c.id + "reject" ? "..." : "Reject"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )) : <p className="p-8 text-center text-sm text-slate-500">No telemetry received yet.</p>}
                </div>
              </div>

              {/* Pending Queue */}
              <div className="flex flex-col gap-4">
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
                  <p className="text-sm font-bold text-amber-800 mb-3">Manual Review Queue ({pendingClaims.length})</p>
                  {pendingClaims.length === 0 ? (
                    <p className="text-xs text-amber-600">No pending claims — all cleared.</p>
                  ) : pendingClaims.map(c => (
                    <div key={c.id} className="mb-3 rounded-xl bg-white border border-amber-200 p-3">
                      <p className="text-xs font-mono font-bold text-slate-700">{c.id}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Fraud score: <span className="font-bold text-amber-600">{c.fraudScore}%</span></p>
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => handleReview(c.id, "approve")} disabled={!!reviewLoading}
                          className="flex-1 rounded-lg bg-emerald-600 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-700 transition disabled:opacity-50">
                          Approve + Payout ₹{c.payout || 500}
                        </button>
                        <button onClick={() => handleReview(c.id, "reject")} disabled={!!reviewLoading}
                          className="flex-1 rounded-lg bg-red-500 py-1.5 text-[11px] font-bold text-white hover:bg-red-600 transition disabled:opacity-50">
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-blue-100 bg-blue-600 p-5 text-white shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-widest text-blue-200">Alert Engine</p>
                  <p className="mt-2 text-lg font-bold">3 Active Triggers</p>
                  <ul className="mt-3 space-y-2 text-xs text-blue-100">
                    <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-amber-300" />Heavy Rain — Bengaluru zone 4</li>
                    <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-red-300" />AQI Hazardous — Delhi NCR</li>
                    <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-orange-300" />Surge delay — Mumbai</li>
                  </ul>
                  <p className="mt-4 text-[10px] text-blue-300">Auto-claims armed for all PREMIUM tier workers.</p>
                </div>
              </div>
            </div>
          )}

          {/* Fraud Analytics tab */}
          {activeTab === "fraud" && (
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-slate-800 mb-1">Fraud Signal Breakdown</p>
                <p className="text-xs text-slate-400 mb-4">IsolationForest anomaly flags this session</p>
                {signalData.length > 0 ? (
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={signalData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                        <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#64748b" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }} />
                        <Bar dataKey="count" fill="#ef4444" radius={[4,4,0,0]} barSize={24} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[220px] flex items-center justify-center">
                    <p className="text-sm text-slate-400">No fraud signals yet — inject a fraud demo claim to see data</p>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-slate-800 mb-4">City-Level Fraud Heatmap</p>
                {["Bengaluru","Mumbai","Delhi","Hyderabad","Chennai"].map((city, i) => {
                  const count = i === 0 ? (stats?.fraudStats?.flagged || 0) : Math.max(0, Math.floor(Math.random() * 3));
                  const pct = Math.min(100, count * 20);
                  return (
                    <div key={city} className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-600 font-medium">{city}</span>
                        <span className="font-bold text-slate-700">{count} flags</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div className={`h-full rounded-full ${pct > 60 ? "bg-red-500" : pct > 30 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${pct || 5}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Forecast tab */}
          {activeTab === "forecast" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-slate-800">Next 7-Day Risk Forecast</p>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600 ring-1 ring-blue-200">RandomForest + Open-Meteo</span>
              </div>
              <p className="text-xs text-slate-400 mb-4">Predicted risk score per day · Red line = claim trigger threshold</p>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={forecast} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0,100]} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }}
                      formatter={(v: number, n: string) => [n === "predicted_risk" ? `${v}%` : v, n === "predicted_risk" ? "Risk" : "Claims"]}
                      labelFormatter={(l, p) => `${l} · Rain: ${p[0]?.payload?.rain_mm ?? 0}mm`} />
                    <Bar dataKey="predicted_risk" name="predicted_risk" radius={[6,6,0,0]} barSize={36}>
                      {forecast.map((d, i) => <Cell key={i} fill={d.predicted_risk >= 70 ? "#ef4444" : d.predicted_risk >= 45 ? "#f59e0b" : "#22c55e"} />)}
                    </Bar>
                    <Bar dataKey="predicted_claims" name="predicted_claims" radius={[4,4,0,0]} barSize={16} fill="#3b82f6" opacity={0.6} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {forecast.slice(0, 3).map(d => (
                  <div key={d.date} className={`rounded-xl p-3 border ${d.predicted_risk >= 70 ? "bg-red-50 border-red-200" : d.predicted_risk >= 45 ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200"}`}>
                    <p className="text-xs font-bold text-slate-700">{d.day} · {d.date}</p>
                    <p className={`text-lg font-black mt-0.5 ${d.predicted_risk >= 70 ? "text-red-600" : d.predicted_risk >= 45 ? "text-amber-600" : "text-emerald-600"}`}>{d.predicted_risk}%</p>
                    <p className="text-[10px] text-slate-500">{d.rain_mm}mm rain · {d.predicted_claims} est. claims</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
