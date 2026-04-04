"use client";

import Link from "next/link";
import { useRiskShield } from "../../context/RiskShieldContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  ResponsiveContainer,
  Cell
} from "recharts";
import { useEffect, useState } from "react";

interface RiskProfile {
  zone_name: string;
  risk_score: number;
  risk_level: string;
  premium_weekly: number;
  factors: {
    rainfall: number;
    aqi: number;
    flood_risk: number;
    delivery_density: number;
    seasonal_risk: number;
  };
  explanation: string;
}

export default function DashboardPage() {
  const {
    worker,
    weeklyEarnings,
    weeklyTarget,
    riskScore,
    riskLevel,
    premium,
    policyActive,
    recentAlert,
    claims,
    weather,
    simulateLoading,
    claimJustTriggered,
    isPolling,
    lastChecked,
    simulateRainstorm,
    simulateBatchTrigger,
  } = useRiskShield();

  const [riskProfile, setRiskProfile] = useState<RiskProfile | null>(null);

  useEffect(() => {
    const fetchRiskProfile = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/zones/risk-profile/1");
        const data = await res.json();
        setRiskProfile(data);
      } catch (err) {
        console.error("Failed to fetch risk profile:", err);
      }
    };
    fetchRiskProfile();
  }, []);

  const completion = Math.min(
    100,
    Math.round((weeklyEarnings / weeklyTarget) * 100)
  );

  const riskColor =
    riskScore >= 70
      ? "text-red-600"
      : riskScore >= 40
      ? "text-amber-600"
      : "text-emerald-600";

  const riskBg =
    riskScore >= 70
      ? "bg-red-50 border-red-200"
      : riskScore >= 40
      ? "bg-amber-50 border-amber-200"
      : "bg-emerald-50 border-emerald-200";

  const riskLabel =
    riskScore >= 70 ? "High Risk" : riskScore >= 40 ? "Elevated" : "Stable";

  // Dynamic chart data responding to Live Risk updates
  const dynamicRiskEarningsData = [
    { day: "Mon", risk: 20, earnings: 90 },
    { day: "Tue", risk: 30, earnings: 110 },
    { day: "Wed", risk: 65, earnings: 60 },
    { day: "Thu", risk: 40, earnings: 100 },
    { day: "Today", risk: riskScore, earnings: Math.max(0, weeklyEarnings - 300) },
  ];

  const dynamicClaimsHistoryData = [
    { day: "Mon", claims: 0 },
    { day: "Tue", claims: 1 },
    { day: "Wed", claims: 3 },
    { day: "Thu", claims: 0 },
    { day: "Today", claims: claims.length },
  ];

  // Dynamic breakdown shifting based on risk
  const weatherRisk = riskScore >= 70 ? 75 : 40;
  const aqiRisk = riskScore >= 70 ? 15 : 35;
  const trafficRisk = riskScore >= 70 ? 10 : 25;
  
  const riskBreakdownData = [
    { name: "Weather", value: weatherRisk, color: "#3b82f6" }, 
    { name: "AQI", value: aqiRisk, color: "#f59e0b" },
    { name: "Traffic", value: trafficRisk, color: "#ef4444" },
  ];

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-12 px-4 py-8 sm:px-6 lg:px-16">
        {/* ── Sidebar ────────────────────────────────────────────────── */}
        <aside className="hidden w-72 flex-shrink-0 flex-col lg:flex">
          <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
                RiskShield-Gig
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {worker ? worker.name : "Gig Commander"}
              </p>
              {worker && (
                <p className="mt-0.5 text-[11px] text-slate-400">
                  {worker.platform} · {worker.city}
                </p>
              )}
            </div>
            <nav className="space-y-1 text-sm">
              <Link
                href="/dashboard"
                className="flex items-center justify-between rounded-xl bg-blue-600 px-3 py-2 font-medium text-white shadow-md shadow-blue-500/20"
              >
                <span>Dashboard</span>
                <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
              </Link>
              <Link
                href="/buy-policy"
                className="block rounded-xl px-3 py-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors"
              >
                Buy Policy
              </Link>
              <Link
                href="/claims"
                className="flex items-center justify-between rounded-xl px-3 py-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors"
              >
                <span>Claims</span>
                {claims.length > 0 && (
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                    {claims.length}
                  </span>
                )}
              </Link>
              <Link
                href="/admin"
                className="block rounded-xl px-3 py-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors"
              >
                Admin Analytics
              </Link>
            </nav>
            <div className="mt-6 border-t border-slate-100 pt-5">
              <button
                onClick={simulateRainstorm}
                disabled={simulateLoading}
                className={`w-full rounded-xl border px-3 py-2.5 text-[11px] font-semibold transition ${
                  simulateLoading
                    ? "border-blue-200 bg-blue-50 text-blue-400 cursor-wait"
                    : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 shadow-sm"
                }`}
              >
                {simulateLoading ? "⛈ Simulating…" : "⛈ Simulate Rainstorm (Local)"}
              </button>
              <button
                onClick={simulateBatchTrigger}
                className={`mt-3 w-full rounded-xl border border-purple-200 bg-purple-50 px-3 py-2.5 text-[11px] font-bold shadow-sm transition hover:bg-purple-100 text-purple-700`}
              >
                ⚙ Batch Auto-Claims Trigger
              </button>
              <p className="mt-2 text-[10px] text-slate-400 leading-relaxed">
                Triggers a high-risk weather event and runs backend cron batch evaluations.
              </p>
            </div>
          </div>
        </aside>

        {/* ── Main Content ───────────────────────────────────────────── */}
        <section className="flex flex-1 flex-col gap-5 pb-10">

          {/* Claim Triggered Flash Banner */}
          {claimJustTriggered && claims[0] && (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 shadow-emerald-500/10 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-lg">
                ✅
              </span>
              <div className="flex-1">
                <p className="text-sm font-bold text-emerald-800">
                  Parametric Claim Processed — {claims[0].id}
                </p>
                <p className="text-xs text-emerald-600">
                  {claims[0].reason || claims[0].triggerDetails} · Payout: <strong>${claims[0].payout}</strong> · Status:{" "}
                  <strong>{claims[0].status}</strong>
                  {claims[0].fraudScore !== undefined && (
                    <span> · Fraud Score: {claims[0].fraudScore}%</span>
                  )}
                </p>
              </div>
              <Link
                href="/claims"
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm hover:bg-emerald-700 transition"
              >
                View Claim →
              </Link>
            </div>
          )}

          {/* System Alert bar */}
          {recentAlert && !claimJustTriggered && (
            <div
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors duration-500 shadow-sm ${
                riskScore >= 70
                  ? "border-red-200 bg-red-50 text-red-800"
                  : "border-amber-200 bg-amber-50 text-amber-800"
              }`}
            >
              <span
                className={`h-2 w-2 animate-pulse rounded-full ${
                  riskScore >= 70 ? "bg-red-500" : "bg-amber-500"
                }`}
              />
              <p className="text-sm font-medium">
                {recentAlert}
              </p>
            </div>
          )}

          {/* Page header */}
          <header className="flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-500">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
                Live Dashboard
              </p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900 tracking-tight">
                Income Shield Overview
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm transition-colors ${
                  policyActive
                    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                    : "bg-slate-100 text-slate-500 ring-1 ring-slate-200"
                }`}
              >
                Policy: {policyActive ? "ACTIVE" : "INACTIVE"}
              </span>
              <Link
                href="/buy-policy"
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {policyActive ? "Modify Coverage" : "Activate Policy"}
              </Link>
            </div>
          </header>

          {/* Row 1: Earnings + Risk Score */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <p className="text-xs font-medium text-slate-500">Weekly Earnings</p>
              <p className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900">
                ${weeklyEarnings.toFixed(0)}
                <span className="ml-1 text-sm font-medium text-slate-400">
                  / ${weeklyTarget}
                </span>
              </p>
              <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-700 ease-out"
                  style={{ width: `${completion}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {completion}% of weekly income target reached
              </p>
            </div>

            {/* Risk Score — animates red on rainstorm */}
            <div
              className={`rounded-2xl border p-6 shadow-sm transition-all duration-500 hover:shadow-md ${riskBg}`}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-500">AI Risk Score</p>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-colors duration-500 ${
                    riskScore >= 70
                      ? "bg-red-100 text-red-700"
                      : riskScore >= 40
                      ? "bg-amber-100 text-amber-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {riskLabel}
                </span>
              </div>
              <p
                className={`mt-2 text-5xl font-black tracking-tight transition-all duration-500 ${riskColor}`}
              >
                {riskScore}%
              </p>
              <p className="mt-3 text-xs text-slate-500">
                {riskScore >= 70
                  ? "⚠ High risk — Coverage auto-scales. Claim engine armed."
                  : "Stable conditions. Monitoring weather, AQI, and traffic."}
              </p>
              {simulateLoading && (
                <p className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 animate-in fade-in">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
                  Evaluating risk conditions…
                </p>
              )}
            </div>
          </div>

          {/* AI Explainability Section */}
          {riskProfile && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-6 shadow-sm mb-2 transform transition hover:scale-[1.01] duration-300">
              <div className="flex items-center gap-2 mb-4">
                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-xs font-bold font-mono">AI</span>
                <p className="text-sm font-bold uppercase tracking-widest text-blue-900">
                  Risk Assessment Explained 
                </p>
                <div className="ml-auto">
                   <p className="text-xs font-bold bg-white text-blue-700 px-3 py-1 rounded-full shadow-sm border border-blue-100">
                     Calculated Premium: ₹{riskProfile.premium_weekly}/week
                   </p>
                </div>
              </div>
              <p className="text-[13px] text-blue-800 font-medium mb-6 animate-pulse">
                "{riskProfile.explanation}"
              </p>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                 {Object.entries(riskProfile.factors).map(([key, val]) => (
                    <div key={key}>
                      <div className="flex justify-between items-end mb-1.5">
                        <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">{key.replace("_", " ")}</span>
                        <span className="text-xs font-bold text-slate-800">{val}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-blue-200/50">
                        <div
                          className={`h-full rounded-full ${Number(val) > 70 ? 'bg-red-500' : Number(val) > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${val}%` }}
                        />
                      </div>
                    </div>
                 ))}
              </div>
            </div>
          )}

          {/* Row 2: Premium + Protected Earnings + Policy Plan */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
              <p className="text-xs font-medium text-slate-500">Weekly Premium</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 tracking-tight">
                ${premium.toFixed(2)}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Auto-adjusted with live risk score.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
              <p className="text-xs font-medium text-slate-500">Protected Earnings</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 tracking-tight">$1,250</p>
              <p className="mt-1 text-xs text-slate-400">
                Maximum payout cap for this week.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
              <p className="text-xs font-medium text-slate-500">Active Plan</p>
              <p className="mt-2 text-sm font-bold text-slate-900">
                Gig Elite Protection v3
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Auto claims · Surge protection · AQI guard
              </p>
            </div>
          </div>

          {/* Row 3: Recharts Line Chart + Live Risk Feed */}
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            
            {/* Risk vs Earnings Chart */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-800">
                  Risk vs Earnings Trend
                </p>
                <div className="flex gap-4 text-[11px] text-slate-500 font-medium bg-slate-50 px-3 py-1 rounded-full">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-blue-500 ring-2 ring-blue-100" />
                    Earnings
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-red-400 ring-2 ring-red-100" />
                    Risk Score
                  </span>
                </div>
              </div>
              
              <div className="flex-1 min-h-[260px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dynamicRiskEarningsData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                    <XAxis 
                      dataKey="day" 
                      tick={{ fontSize: 11, fill: '#64748b' }} 
                      axisLine={false} 
                      tickLine={false} 
                      dy={10}
                    />
                    <YAxis 
                      yAxisId="left" 
                      tick={{ fontSize: 11, fill: '#64748b' }} 
                      axisLine={false} 
                      tickLine={false} 
                      dx={-10}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right" 
                      tick={{ fontSize: 11, fill: '#64748b' }} 
                      axisLine={false} 
                      tickLine={false} 
                      dx={10}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip 
                      cursor={{ stroke: '#f1f5f9', strokeWidth: 2 }}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                      labelStyle={{ fontWeight: "bold", color: "#1e293b", marginBottom: "4px" }}
                    />
                    <Line 
                      yAxisId="left" 
                      type="monotone" 
                      dataKey="earnings" 
                      name="Earnings" 
                      stroke="#3b82f6" 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: "#fff" }} 
                      activeDot={{ r: 6, strokeWidth: 0, fill: "#2563eb" }} 
                      animationDuration={1500}
                    />
                    <Line 
                      yAxisId="right" 
                      type="monotone" 
                      dataKey="risk" 
                      name="Risk Score" 
                      stroke="#f87171" 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: '#f87171', strokeWidth: 2, stroke: "#fff" }} 
                      activeDot={{ r: 6, strokeWidth: 0, fill: "#ef4444" }} 
                      animationDuration={1500}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Live Risk Feed */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-800">Live Risk Feed</p>
                  {isPolling && (
                    <span className="flex items-center gap-1.5 rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-blue-600 ring-1 ring-blue-200">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
                      ML Scanning
                    </span>
                  )}
                </div>
                <button
                  onClick={simulateRainstorm}
                  disabled={simulateLoading}
                  className={`rounded-full border px-3 py-1 text-[10px] font-bold transition shadow-sm ${
                    simulateLoading
                      ? "border-blue-100 bg-blue-50 text-blue-300 cursor-wait"
                      : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white"
                  }`}
                >
                  {simulateLoading ? "…" : "Simulate ⛈"}
                </button>
              </div>

              {/* Live Weather Card */}
              {weather && (
                <div className={`mb-4 rounded-xl border p-4 transition-colors duration-500 shadow-[inset_0_1px_4px_rgba(0,0,0,0.02)] ${
                  weather.rain > 0 ? "border-blue-200 bg-blue-50" :
                  weather.temperature > 38 ? "border-amber-200 bg-amber-50" :
                  "border-slate-100 bg-slate-50"
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        {weather.isLive ? "🌐 Live Weather" : "☁ Simulated Data"} · {weather.city}
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-800 capitalize">
                        {weather.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-slate-900 tracking-tight">{weather.temperature}°C</p>
                      <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                        💨 {weather.windSpeed}m/s {weather.rain > 0 ? `· 🌧 ${weather.rain}mm/hr` : ""}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <ul className="space-y-2 text-xs">
                <li className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-3 py-2.5 shadow-sm">
                  <span className="text-slate-700 font-medium">
                    {riskScore >= 70 ? "⚠ Heavy Rain Warning" : "☀ Clear Skies"}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400">{lastChecked ? `${lastChecked}` : "just now"}</span>
                </li>
                <li className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-3 py-2.5 shadow-sm">
                  <span className="text-slate-700 font-medium">ML Prediction Engine</span>
                  <span className={`text-[10px] font-bold tracking-wide text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full`}>
                    riskshield-v2.1
                  </span>
                </li>
                <li className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-3 py-2.5 shadow-sm">
                  <span className="text-slate-700 font-medium">Automated Claims</span>
                  <span className={`text-[10px] font-bold tracking-wide px-2 py-0.5 rounded-full ${
                    policyActive ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
                  }`}>
                    {policyActive ? "ARMED ✓" : "IDLE"}
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Row 4: Analytics Overview */}
          <div className="mt-4 fade-in animate-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1 h-5 bg-blue-600 rounded-full"></span>
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-800">
                Analytics Overview
              </h2>
            </div>
            
            <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
              {/* Claims History Bar Chart */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
                <div className="mb-6 flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Claims History</p>
                    <p className="text-xs text-slate-500 mt-0.5">Auto-triggered payouts over time</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">{claims.length}</p>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Claims</p>
                  </div>
                </div>
                <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dynamicClaimsHistoryData} margin={{ top: 10, right: 10, bottom: 5, left: -20 }}>
                      <XAxis 
                        dataKey="day" 
                        tick={{ fontSize: 11, fill: '#64748b' }} 
                        axisLine={false} 
                        tickLine={false} 
                        dy={10} 
                      />
                      <YAxis 
                        tick={{ fontSize: 11, fill: '#64748b' }} 
                        axisLine={false} 
                        tickLine={false} 
                        allowDecimals={false} 
                        dx={-10}
                      />
                      <Tooltip 
                        cursor={{ fill: '#f8fafc' }} 
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        labelStyle={{ fontWeight: "bold", color: "#1e293b", marginBottom: "4px" }}
                      />
                      <Bar 
                        dataKey="claims" 
                        name="Claims Filed" 
                        fill="#3b82f6" 
                        radius={[6, 6, 0, 0]} 
                        barSize={32}
                        animationDuration={1500}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Risk Breakdown Pie Chart */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Risk Breakdown</p>
                    <p className="text-xs text-slate-500 mt-0.5">Primary triggers dynamically scored</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-amber-500">{riskScore}%</p>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Peak Risk</p>
                  </div>
                </div>
                
                <div className="h-[200px] flex items-center justify-center relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={riskBreakdownData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={85}
                        paddingAngle={6}
                        dataKey="value"
                        stroke="none"
                        animationDuration={1500}
                      >
                        {riskBreakdownData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ fontWeight: "bold" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Text representing total ML calculation */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-black text-slate-800 tracking-tighter">100%</span>
                    <span className="text-[9px] text-slate-400 font-bold tracking-widest mt-0.5">TOTAL ML<br/>FACTORS</span>
                  </div>
                </div>
                
                <div className="flex justify-center gap-6 mt-2 pt-3 border-t border-slate-100">
                  {riskBreakdownData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs font-medium text-slate-600">
                      <span className="w-2.5 h-2.5 rounded-full ring-2 ring-offset-1 ring-slate-50" style={{ backgroundColor: item.color }}></span>
                      {item.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-8 flex items-center justify-between border-t border-slate-200 pt-6 text-[11px] font-medium text-slate-400">
            <span>
              {worker
                ? `${worker.name} · ${worker.city} · ${worker.platform}`
                : "Guest driver (demo mode)"}
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Secured by AI Oracle Net · National MET
            </span>
          </footer>
        </section>
      </div>
    </main>
  );
}
