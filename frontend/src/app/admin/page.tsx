"use client";

import Link from "next/link";

const USER_STATS = [
  { label: "Total Workers", value: "12,847", trend: "+340 this week", color: "text-blue-600" },
  { label: "Active Policies", value: "9,214", trend: "71.7% coverage rate", color: "text-emerald-600" },
  { label: "Claims Processed", value: "3,192", trend: "This month", color: "text-violet-600" },
  { label: "Total Payouts", value: "$142,680", trend: "Avg $44.7/claim", color: "text-amber-600" },
];

import { useEffect, useState } from "react";
import { Claim } from "../../context/RiskShieldContext";

const RISK_STYLE: Record<string, string> = {
  "PENDING": "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  "APPROVED": "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  "PAID": "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  "REJECTED": "bg-red-50 text-red-700 ring-1 ring-red-200",
};

interface AdminStats {
  total: number;
  approved: number;
  rejected: number;
  pending: number;
  totalPayoutRaw?: number;
}

export default function AdminPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/admin/claims");
        const data = await res.json();
        setClaims(data.claims);
        setStats(data.stats);
      } catch (err) {
        console.error("Failed to fetch admin data", err);
      }
    };
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 5000);
    return () => clearInterval(interval);
  }, []);
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-12 px-4 py-8 sm:px-6 lg:px-16">
        {/* Sidebar */}
        <aside className="hidden w-72 flex-shrink-0 flex-col lg:flex">
          <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
                RiskShield-Gig
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                Admin Panel
              </p>
            </div>
            <nav className="space-y-1 text-sm">
              <Link
                href="/dashboard"
                className="block rounded-xl px-3 py-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              >
                Dashboard
              </Link>
              <Link
                href="/buy-policy"
                className="block rounded-xl px-3 py-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              >
                Buy Policy
              </Link>
              <Link
                href="/claims"
                className="block rounded-xl px-3 py-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              >
                Claims
              </Link>
              <Link
                href="/admin"
                className="flex items-center justify-between rounded-xl bg-blue-600 px-3 py-2 font-medium text-white"
              >
                <span>Admin Analytics</span>
                <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
              </Link>
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex flex-1 flex-col gap-6">
          {/* Page header */}
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
                Admin Analytics
              </p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900">
                Platform Overview
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Real-time metrics across all gig workers and risk events.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              Live Dashboard
            </span>
          </header>

          {/* Live Stats grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
               <p className="text-xs font-medium text-slate-500">Total Claims</p>
               <p className="mt-2 text-3xl font-bold text-blue-600">{stats?.total || 0}</p>
               <p className="mt-1 text-[11px] text-slate-400">All registered system requests</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
               <p className="text-xs font-medium text-slate-500">Approved/Paid</p>
               <p className="mt-2 text-3xl font-bold text-emerald-600">{stats?.approved || 0}</p>
               <p className="mt-1 text-[11px] text-slate-400">Parametric Triggers Cleared</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
               <p className="text-xs font-medium text-slate-500">Total Payouts</p>
               <p className="mt-2 text-3xl font-bold text-amber-600">${stats?.totalPayoutRaw || 0}</p>
               <p className="mt-1 text-[11px] text-slate-400">Realized distribution</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-amber-50 p-5 shadow-sm">
               <p className="text-xs font-medium text-amber-800">Pending Review</p>
               <p className="mt-2 text-3xl font-bold text-amber-600">{stats?.pending || 0}</p>
               <p className="mt-1 text-[11px] text-amber-700/80">Awaiting manual resolution</p>
            </div>
          </div>

          {/* Main content grid */}
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            {/* Live Global Claims Feed & Fraud Analytics */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col max-h-[600px]">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 bg-slate-50">
                <p className="text-sm font-semibold text-slate-800">
                  Global Claims & Fraud Alerts
                </p>
                <p className="text-xs text-slate-400">Live Status Feed</p>
              </div>
              <div className="divide-y divide-slate-50 overflow-y-auto">
                {claims.length > 0 ? claims.map((c) => (
                  <div
                    key={c.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 gap-2 transition hover:bg-slate-50"
                  >
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-semibold text-slate-800 font-mono text-[12px]">{c.id}</p>
                      <p className="text-xs text-slate-500">
                        {c.triggerDetails || c.reason} · Payout: <strong>${c.payout}</strong>
                      </p>
                    </div>
                    <div className="flex flex-col sm:items-end gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-bold tracking-widest uppercase ${RISK_STYLE[c.status] || ''}`}
                      >
                        {c.status}
                      </span>
                      {c.fraudScore !== undefined && (
                        <p className="text-[11px] font-medium flex items-center gap-1.5">
                           Fraud Score: 
                           <span className={`px-2 py-0.5 rounded shadow-sm text-xs text-white ${
                             c.fraudScore > 70 ? "bg-red-500" :
                             c.fraudScore > 40 ? "bg-amber-500" : "bg-emerald-500"
                           }`}>
                             {c.fraudScore}% ({c.fraudScore > 70 ? 'Suspicious' : c.fraudScore > 40 ? 'Review' : 'Safe'})
                           </span>
                        </p>
                      )}
                    </div>
                  </div>
                )) : (
                   <p className="p-8 text-center text-sm text-slate-500">No telemetry or claims received yet.</p>
                )}
              </div>
            </div>

            {/* AI Decision Diagnostics */}
            <div className="flex flex-col gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="mb-4 text-sm font-semibold text-slate-800">
                  Global Trigger Rates
                </p>
                <div className="space-y-4">
                   <div>
                      <div className="mb-1.5 flex justify-between text-xs">
                        <span className="text-slate-600">Rainfall Exceeding Limits</span>
                        <span className="font-semibold text-slate-800">
                          {stats?.total ? Math.round((stats.approved / stats.total) * 100) : 0}%
                        </span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full bg-blue-500`}
                          style={{ width: `${stats?.total ? Math.round((stats.approved / stats.total) * 100) : 0}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="mb-1.5 flex justify-between text-xs">
                        <span className="text-slate-600">Rejected (Fraud Detected)</span>
                        <span className="font-semibold text-slate-800">
                          {stats?.total ? Math.round((stats.rejected / stats.total) * 100) : 0}%
                        </span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full bg-red-400`}
                          style={{ width: `${stats?.total ? Math.round((stats.rejected / stats.total) * 100) : 0}%` }}
                        />
                      </div>
                    </div>
                </div>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-600 p-5 text-white shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-widest text-blue-200">
                  Alert Engine
                </p>
                <p className="mt-2 text-lg font-bold">3 Active Triggers</p>
                <ul className="mt-3 space-y-2 text-xs text-blue-100">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
                    Heavy Rain warning — Bengaluru zone 4
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-300" />
                    AQI Hazardous — Delhi NCR
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-300" />
                    Surge delay alert — Mumbai
                  </li>
                </ul>
                <p className="mt-4 text-[10px] text-blue-300">
                  Auto-claims armed for all affected PREMIUM tier workers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
