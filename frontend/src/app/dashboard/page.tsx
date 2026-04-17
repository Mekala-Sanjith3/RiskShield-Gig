"use client";

import Link from "next/link";
import { useRiskShield } from "../../context/RiskShieldContext";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar,
  PieChart, Pie, ResponsiveContainer, Cell, ReferenceLine
} from "recharts";
import { useEffect, useState } from "react";

interface ForecastDay {
  date: string; day: string; predicted_risk: number;
  predicted_claims: number; rain_mm: number; city: string;
}

export default function DashboardPage() {
  const {
    worker, weeklyEarnings, weeklyTarget, riskScore, riskLevel,
    premium, policyTier, policyActive, policyStartDate, recentAlert, claims,
    payouts, riskHistory, weather, simulateLoading, claimJustTriggered,
    isPolling, lastChecked, simulateRainstorm, simulateBatchTrigger, simulateFraudClaim,
  } = useRiskShield();

  const [forecast, setForecast] = useState<ForecastDay[]>([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/admin/forecast")
      .then(r => r.json()).then(d => setForecast(d.forecast || []))
      .catch(() => {});
  }, []);

  const completion = Math.min(100, Math.round((weeklyEarnings / weeklyTarget) * 100));
  const riskColor = riskScore >= 70 ? "text-red-600" : riskScore >= 40 ? "text-amber-600" : "text-emerald-600";
  const riskBg = riskScore >= 70 ? "bg-red-50 border-red-200" : riskScore >= 40 ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200";
  const riskLabel = riskScore >= 70 ? "High Risk" : riskScore >= 40 ? "Elevated" : "Stable";

  // Live chart data — real polling history + fallback seeds
  const seedHistory = [
    { time: "Mon 09:00", score: 20 }, { time: "Tue 10:00", score: 30 },
    { time: "Wed 14:00", score: 65 }, { time: "Thu 11:00", score: 40 },
  ];
  const chartData = riskHistory.length >= 2
    ? riskHistory.map(p => ({ time: p.time, score: p.score }))
    : [...seedHistory, { time: "Now", score: riskScore }];

  // Earnings protected from claims this week
  const totalProtected = claims
    .filter(c => c.status === "APPROVED" || c.status === "PAID")
    .reduce((s, c) => s + (c.payout || 0), 0);
  const protectedPct = Math.min(100, Math.round((totalProtected / weeklyTarget) * 100));

  // Policy dates
  const policyStart = policyStartDate ? new Date(policyStartDate) : null;
  const policyEnd = policyStart ? new Date(policyStart.getTime() + 7 * 86400000) : null;
  const daysRemaining = policyEnd ? Math.max(0, Math.ceil((policyEnd.getTime() - Date.now()) / 86400000)) : 0;

  // Coverage dots (Mon–Sun)
  const weekDays = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const todayIdx = (new Date().getDay() + 6) % 7;

  // Risk breakdown pie
  const riskBreakdownData = [
    { name: "Weather", value: riskScore >= 70 ? 75 : 40, color: "#3b82f6" },
    { name: "AQI", value: riskScore >= 70 ? 15 : 35, color: "#f59e0b" },
    { name: "Traffic", value: riskScore >= 70 ? 10 : 25, color: "#ef4444" },
  ];

  // Most recent claim for payout timeline
  const latestClaim = claims[0] || null;
  const timelineSteps = [
    { label: "Claim Triggered", done: !!latestClaim, ref: latestClaim?.id },
    { label: "Fraud Check", done: !!latestClaim, ref: latestClaim ? `Score: ${latestClaim.fraudScore ?? 0}%` : null },
    { label: "Approved", done: latestClaim?.status === "APPROVED" || latestClaim?.status === "PAID" },
    { label: "Payout Initiated", done: !!latestClaim?.payoutRef, ref: latestClaim?.payoutRef },
    { label: "Money in Account", done: !!latestClaim?.payoutRef },
  ];

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-12 px-4 py-8 sm:px-6 lg:px-16">

        {/* Sidebar */}
        <aside className="hidden w-72 flex-shrink-0 flex-col lg:flex">
          <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">RiskShield-Gig</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{worker ? worker.name : "Gig Commander"}</p>
              {worker && <p className="mt-0.5 text-[11px] text-slate-400">{worker.platform} · {worker.city}</p>}
            </div>
            <nav className="space-y-1 text-sm">
              <Link href="/dashboard" className="flex items-center justify-between rounded-xl bg-blue-600 px-3 py-2 font-medium text-white shadow-md shadow-blue-500/20">
                <span>Dashboard</span><span className="h-1.5 w-1.5 rounded-full bg-white/70" />
              </Link>
              <Link href="/buy-policy" className="block rounded-xl px-3 py-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors">Buy Policy</Link>
              <Link href="/claims" className="flex items-center justify-between rounded-xl px-3 py-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors">
                <span>Claims</span>
                {claims.length > 0 && <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">{claims.length}</span>}
              </Link>
              <Link href="/admin" className="block rounded-xl px-3 py-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors">Admin Analytics</Link>
            </nav>
            <div className="mt-6 border-t border-slate-100 pt-5 space-y-2">
              <button onClick={simulateRainstorm} disabled={simulateLoading}
                className={`w-full rounded-xl border px-3 py-2.5 text-[11px] font-semibold transition ${simulateLoading ? "border-blue-200 bg-blue-50 text-blue-400 cursor-wait" : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 shadow-sm"}`}>
                {simulateLoading ? "Simulating..." : "Simulate Rainstorm"}
              </button>
              <button onClick={simulateBatchTrigger}
                className="w-full rounded-xl border border-purple-200 bg-purple-50 px-3 py-2.5 text-[11px] font-bold shadow-sm transition hover:bg-purple-100 text-purple-700">
                Batch Auto-Claims Trigger
              </button>
              <button onClick={simulateFraudClaim}
                className="w-full rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[11px] font-bold shadow-sm transition hover:bg-red-100 text-red-700">
                Simulate Fraud Claim (Demo)
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <section className="flex flex-1 flex-col gap-5 pb-10">

          {/* Claim Triggered Banner */}
          {claimJustTriggered && latestClaim && (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-lg">✅</span>
              <div className="flex-1">
                <p className="text-sm font-bold text-emerald-800">Parametric Claim Processed — {latestClaim.id}</p>
                <p className="text-xs text-emerald-600">
                  {latestClaim.reason} · Payout: <strong>₹{latestClaim.payout}</strong> · Status: <strong>{latestClaim.status}</strong>
                  {latestClaim.payoutRef && <span> · Ref: <strong>{latestClaim.payoutRef}</strong></span>}
                </p>
              </div>
              <Link href="/claims" className="rounded-lg bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm hover:bg-emerald-700 transition">View →</Link>
            </div>
          )}

          {/* Alert bar */}
          {recentAlert && !claimJustTriggered && (
            <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 shadow-sm ${riskScore >= 70 ? "border-red-200 bg-red-50 text-red-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
              <span className={`h-2 w-2 animate-pulse rounded-full ${riskScore >= 70 ? "bg-red-500" : "bg-amber-500"}`} />
              <p className="text-sm font-medium">{recentAlert}</p>
            </div>
          )}

          {/* Header */}
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">Live Dashboard</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900 tracking-tight">Income Shield Overview</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${policyActive ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" : "bg-slate-100 text-slate-500 ring-1 ring-slate-200"}`}>
                Policy: {policyActive ? "ACTIVE" : "INACTIVE"}
              </span>
              <Link href="/buy-policy" className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition">
                {policyActive ? "Modify Coverage" : "Activate Policy"}
              </Link>
            </div>
          </header>

          {/* Row 1: Earnings + Risk Score */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
              <p className="text-xs font-medium text-slate-500">Weekly Earnings</p>
              <p className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900">
                ₹{weeklyEarnings.toFixed(0)}<span className="ml-1 text-sm font-medium text-slate-400">/ ₹{weeklyTarget}</span>
              </p>
              <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-blue-600 transition-all duration-700" style={{ width: `${completion}%` }} />
              </div>
              <p className="mt-2 text-xs text-slate-500">{completion}% of weekly income target reached</p>
            </div>

            <div className={`rounded-2xl border p-6 shadow-sm transition-all duration-500 hover:shadow-md ${riskBg}`}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-500">AI Risk Score</p>
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${riskScore >= 70 ? "bg-red-100 text-red-700" : riskScore >= 40 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                  {riskLabel}
                </span>
              </div>
              <p className={`mt-2 text-5xl font-black tracking-tight transition-all duration-500 ${riskColor}`}>{riskScore}%</p>
              <p className="mt-3 text-xs text-slate-500">
                {riskScore >= 70 ? "High risk — Coverage auto-scales. Claim engine armed." : "Stable conditions. Monitoring weather, AQI, and traffic."}
              </p>
              {isPolling && <p className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-blue-600"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />ML Scanning...</p>}
            </div>
          </div>

          {/* Row 2: Earnings Protected + Coverage Card + Premium */}
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Earnings Protected Widget */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm hover:shadow-md transition">
              <p className="text-xs font-medium text-emerald-700">Earnings Protected</p>
              <p className="mt-2 text-2xl font-bold text-emerald-800">₹{totalProtected.toFixed(0)}</p>
              <p className="mt-1 text-xs text-emerald-600">{protectedPct}% of weekly target covered</p>
              <div className="mt-3 flex gap-1">
                {weekDays.map((d, i) => (
                  <div key={d} className="flex flex-col items-center gap-1">
                    <div className={`h-2 w-2 rounded-full ${i <= todayIdx && policyActive ? "bg-emerald-500" : "bg-slate-200"}`} />
                    <span className="text-[9px] text-slate-400">{d[0]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Coverage Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
              <p className="text-xs font-medium text-slate-500">Active Plan</p>
              {policyActive ? (
                <>
                  <p className="mt-2 text-sm font-bold text-slate-900">{policyTier === "PREMIUM" ? "Premium Protection" : "Basic Protection"}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {policyStart ? `Started ${policyStart.toLocaleDateString("en-IN", { day:"numeric", month:"short" })}` : "Active"}
                    {" · "}<span className="font-semibold text-blue-600">{daysRemaining}d remaining</span>
                  </p>
                  <Link href="/buy-policy" className="mt-3 inline-block rounded-lg bg-blue-600 px-3 py-1 text-[11px] font-bold text-white hover:bg-blue-700 transition">Renew</Link>
                </>
              ) : (
                <>
                  <p className="mt-2 text-sm font-bold text-slate-400">No Active Policy</p>
                  <Link href="/buy-policy" className="mt-3 inline-block rounded-lg bg-blue-600 px-3 py-1 text-[11px] font-bold text-white hover:bg-blue-700 transition">Activate Now</Link>
                </>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
              <p className="text-xs font-medium text-slate-500">Weekly Premium</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">₹{premium.toFixed(2)}</p>
              <p className="mt-1 text-xs text-slate-400">Risk-adjusted · Auto-renewed</p>
            </div>
          </div>

          {/* Row 3: Live Risk Chart + Payout Timeline */}
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-800">Live Risk Score History</p>
                <div className="flex items-center gap-2">
                  {isPolling && <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-bold text-blue-600 ring-1 ring-blue-200"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />LIVE</span>}
                  <span className="text-[10px] text-slate-400">Updated {lastChecked || "..."}</span>
                </div>
              </div>
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                    <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }} formatter={(v: number) => [`${v}%`, "Risk Score"]} />
                    <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="4 2" label={{ value: "Trigger", position: "right", fontSize: 10, fill: "#ef4444" }} />
                    <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: "#3b82f6", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6, fill: "#2563eb" }} animationDuration={800} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Payout Timeline */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
              <p className="text-sm font-semibold text-slate-800 mb-4">Payout Status Timeline</p>
              {latestClaim ? (
                <div className="space-y-3">
                  {timelineSteps.map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${step.done ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"}`}>
                        {step.done ? "✓" : i + 1}
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${step.done ? "text-slate-800" : "text-slate-400"}`}>{step.label}</p>
                        {step.ref && <p className="text-[11px] text-slate-400 font-mono">{step.ref}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center py-8">
                  <p className="text-sm text-slate-400 text-center">No claims yet.<br />Simulate a rainstorm to see the payout flow.</p>
                </div>
              )}

              {/* Recent payouts */}
              {payouts.length > 0 && (
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">Recent Payouts</p>
                  {payouts.slice(0, 2).map((p, i) => (
                    <div key={i} className="flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2 mb-1">
                      <div>
                        <p className="text-xs font-bold text-emerald-800">{p.display_ref}</p>
                        <p className="text-[10px] text-emerald-600">{p.upi_id}</p>
                      </div>
                      <p className="text-sm font-bold text-emerald-700">₹{p.amount}</p>
                    </div>
                  ))}
                  <Link href="/payment" className="text-[11px] font-semibold text-blue-600 hover:underline">View all payouts →</Link>
                </div>
              )}
            </div>
          </div>

          {/* Row 4: 7-Day Forecast + Risk Breakdown */}
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
            {/* 7-Day Forecast */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
              <p className="text-sm font-semibold text-slate-800 mb-1">7-Day Risk Forecast</p>
              <p className="text-xs text-slate-400 mb-4">ML prediction · Open-Meteo weather data</p>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={forecast} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }} formatter={(v: number, n: string) => [n === "predicted_risk" ? `${v}%` : v, n === "predicted_risk" ? "Risk" : "Claims"]} />
                    <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="4 2" />
                    <Bar dataKey="predicted_risk" name="predicted_risk" radius={[4, 4, 0, 0]} barSize={28}>
                      {forecast.map((d, i) => (
                        <Cell key={i} fill={d.predicted_risk >= 70 ? "#ef4444" : d.predicted_risk >= 45 ? "#f59e0b" : "#22c55e"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Risk Breakdown Pie */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Risk Breakdown</p>
                  <p className="text-xs text-slate-400 mt-0.5">Primary triggers dynamically scored</p>
                </div>
                <p className="text-2xl font-bold text-amber-500">{riskScore}%</p>
              </div>
              <div className="h-[180px] flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={riskBreakdownData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={6} dataKey="value" stroke="none" animationDuration={1200}>
                      {riskBreakdownData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-slate-800">100%</span>
                  <span className="text-[9px] text-slate-400 font-bold tracking-widest mt-0.5">TOTAL ML<br/>FACTORS</span>
                </div>
              </div>
              <div className="flex justify-center gap-6 mt-2 pt-3 border-t border-slate-100">
                {riskBreakdownData.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-medium text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Weather */}
          {weather && (
            <div className={`rounded-2xl border p-4 ${weather.rain > 0 ? "border-blue-200 bg-blue-50" : "border-slate-100 bg-white"}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{weather.isLive ? "Live Weather" : "Simulated"} · {weather.city}</p>
                  <p className="mt-1 text-sm font-bold text-slate-800 capitalize">{weather.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-slate-900">{weather.temperature}°C</p>
                  <p className="text-[11px] text-slate-500">{weather.windSpeed}m/s{weather.rain > 0 ? ` · ${weather.rain}mm/hr` : ""}</p>
                </div>
              </div>
            </div>
          )}

          <footer className="mt-4 flex items-center justify-between border-t border-slate-200 pt-6 text-[11px] font-medium text-slate-400">
            <span>{worker ? `${worker.name} · ${worker.city} · ${worker.platform}` : "Guest (demo mode)"}</span>
            <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Secured by AI Oracle Net · National MET</span>
          </footer>
        </section>
      </div>
    </main>
  );
}
