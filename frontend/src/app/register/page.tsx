"use client";

import Link from "next/link";
import { useState } from "react";
import { useRiskShield } from "../../context/RiskShieldContext";

const PLATFORMS = ["Swiggy", "Zomato", "Uber Eats", "Dunzo", "Rapido"];
const CITIES = ["Bengaluru", "Mumbai", "Delhi NCR", "Hyderabad", "Chennai"];

export default function RegistrationPage() {
  const { setWorker } = useRiskShield();
  const [fullName, setFullName] = useState("");
  const [city, setCity] = useState(CITIES[0]);
  const [platform, setPlatform] = useState(PLATFORMS[0]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    setWorker({ name: fullName, city, platform });
    try {
      await fetch("http://localhost:5000/api/workers/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fullName, city, platform }),
      }).catch(() => {
        // Backend optional for demo
      });
    } finally {
      setSubmitting(false);
      setDone(true);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1400px] flex-col px-6 py-12">
        {/* Header */}
        <header className="mb-10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
              <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <span className="text-sm font-bold text-slate-900">RiskShield-Gig</span>
          </Link>
          <Link
            href="/dashboard"
            className="text-xs font-medium text-slate-500 hover:text-slate-800 transition"
          >
            Skip to Dashboard →
          </Link>
        </header>

        <div className="grid flex-1 items-center gap-12 md:grid-cols-2">
          {/* Left: form */}
          <section>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-blue-600">
              Worker Registration
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Secure your gig.
            </h1>
            <p className="mt-3 max-w-md text-sm text-slate-500">
              Join the sentinel network protecting India&apos;s delivery partners from
              income loss due to weather, traffic, and pollution.
            </p>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              {!done ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600">
                      Full Name
                    </label>
                    <input
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full legal name"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-600">
                        City
                      </label>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition"
                      >
                        {CITIES.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-600">
                        Platform
                      </label>
                      <select
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value)}
                        className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition"
                      >
                        {PLATFORMS.map((p) => (
                          <option key={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <p className="flex items-start gap-2 text-[11px] text-slate-400">
                    <span className="mt-[1px] inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border border-slate-300 text-[9px] font-bold text-slate-400">
                      i
                    </span>
                    We use your city and platform data to calculate real-time risk
                    factors based on weather, traffic, and platform-specific hazards.
                  </p>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-blue-100 hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 transition"
                  >
                    {submitting ? "Registering..." : "Register & Calculate Risk →"}
                  </button>
                </form>
              ) : (
                <div className="space-y-5">
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">
                      ✓ Registered
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-800">
                      Welcome {fullName || "Driver"} — your profile is linked.
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Next, view your AI risk score and live protection status on the
                      dashboard.
                    </p>
                  </div>
                  <Link
                    href="/dashboard"
                    className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 transition"
                  >
                    Go to Gig Dashboard →
                  </Link>
                  <button
                    type="button"
                    onClick={() => setDone(false)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-500 hover:bg-slate-50 transition"
                  >
                    Register another worker
                  </button>
                </div>
              )}
            </div>

            <p className="mt-4 text-[10px] text-slate-400">
              ISO 27001 certified · No earnings data is shared with platforms.
            </p>
          </section>

          {/* Right: trust cards */}
          <aside className="hidden flex-col gap-4 md:flex">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold text-blue-600">
                Impact Report
              </p>
              <p className="mt-2 text-base font-bold text-slate-900">
                &ldquo;RiskShield helped me reduce my daily income exposure by 40%.&rdquo;
              </p>
              <p className="mt-3 text-xs text-slate-400">
                — Data from last monsoon season across 3 major cities.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold text-blue-600">
                Why we ask for city
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Weather and AQI triggers are hyper-local. We tune protection
                thresholds to your exact micro-climate, not country-level averages.
              </p>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-600 p-5 text-white shadow-sm">
              <p className="text-xs font-semibold text-blue-200">
                Live Platform Stats
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xl font-bold">12,847</p>
                  <p className="text-xs text-blue-200">Workers protected</p>
                </div>
                <div>
                  <p className="text-xl font-bold">$142K</p>
                  <p className="text-xs text-blue-200">Paid out this month</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
