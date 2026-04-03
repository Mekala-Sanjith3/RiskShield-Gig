"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRiskShield } from "../../context/RiskShieldContext";
import { useEffect, useState } from "react";

const BASIC_PREMIUM = 12;
const PREMIUM_PREMIUM = 28;

export default function BuyPolicyPage() {
  const router = useRouter();
  const { policyTier, activatePolicy, riskScore, worker } = useRiskShield();
  const [xaiData, setXaiData] = useState<any>(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/zones/risk-profile/${worker?.city || 'default'}`)
      .then(res => res.json())
      .then(data => setXaiData(data))
      .catch(console.error);
  }, [worker]);

  const handleSelect = (tier: "BASIC" | "PREMIUM") => {
    const base = tier === "BASIC" ? BASIC_PREMIUM : PREMIUM_PREMIUM;
    const riskMultiplier = riskScore > 70 ? 1.3 : riskScore > 40 ? 1.15 : 1;
    const finalPremium = Number((base * riskMultiplier).toFixed(2));
    activatePolicy(tier, finalPremium);
  };

  const calculatedPremium =
    policyTier === "NONE"
      ? null
      : policyTier === "BASIC"
      ? +(BASIC_PREMIUM * (riskScore > 70 ? 1.3 : riskScore > 40 ? 1.15 : 1)).toFixed(2)
      : +(PREMIUM_PREMIUM * (riskScore > 70 ? 1.3 : riskScore > 40 ? 1.15 : 1)).toFixed(2);

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-900">
      <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-16">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
              Protection Plans
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              Secure Your Income
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Dynamic premiums based on your live risk score (
              <span className="font-semibold text-slate-700">{riskScore}%</span>)
            </p>
          </div>
          <Link
            href="/dashboard"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50 transition"
          >
            ← Dashboard
          </Link>
        </header>

        {/* Main 2-column grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left: Plan cards */}
          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold text-slate-700">
              Choose Your Plan
            </p>

            {/* Basic */}
            <button
              type="button"
              onClick={() => handleSelect("BASIC")}
              className={`flex flex-col rounded-2xl border p-6 text-left shadow-sm transition hover:shadow-md ${
                policyTier === "BASIC"
                  ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/30"
                  : "border-slate-200 bg-white hover:border-blue-300"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                    Essential Tier
                  </span>
                  <h2 className="mt-1 text-lg font-bold text-slate-900">
                    Basic Protection
                  </h2>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">
                    ${BASIC_PREMIUM}
                    <span className="text-sm font-normal text-slate-400">/wk</span>
                  </p>
                </div>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span>
                  Up to $150/day rain-stalled hour reimbursement
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span>
                  Heatwave subsidy above 35°C
                </li>
              </ul>
              <p className="mt-3 text-xs text-slate-400">
                Ideal for part-time riders in moderate monsoon zones.
              </p>
              {policyTier === "BASIC" && (
                <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-blue-600">
                  <span className="h-2 w-2 rounded-full bg-blue-600" />
                  Currently selected
                </p>
              )}
            </button>

            {/* Premium */}
            <button
              type="button"
              onClick={() => handleSelect("PREMIUM")}
              className={`flex flex-col rounded-2xl border p-6 text-left shadow-sm transition hover:shadow-md ${
                policyTier === "PREMIUM"
                  ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/30"
                  : "border-slate-200 bg-white hover:border-blue-300"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                    Full Sentinel
                  </span>
                  <h2 className="mt-1 text-lg font-bold text-slate-900">
                    Premium Protection
                  </h2>
                </div>
                <div className="flex flex-col items-end gap-1.5 text-right">
                  <span className="rounded-full bg-blue-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    Most Popular
                  </span>
                  <p className="text-2xl font-bold text-blue-600">
                    ${PREMIUM_PREMIUM}
                    <span className="text-sm font-normal text-slate-400">/wk</span>
                  </p>
                </div>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span>
                  Everything in Basic
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span>
                  Unhealthy AQI alerts & income offsets
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span>
                  Traffic surge delay compensation
                </li>
              </ul>
              <p className="mt-3 text-xs text-slate-400">
                Designed for full-time riders in high-disruption metro zones.
              </p>
              {policyTier === "PREMIUM" && (
                <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-blue-600">
                  <span className="h-2 w-2 rounded-full bg-blue-600" />
                  Currently selected
                </p>
              )}
            </button>
          </div>

          {/* Right: Policy summary panel */}
          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold text-slate-700">
              Policy Summary
            </p>

            <div className="sticky top-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              {/* Selected plan */}
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">
                  Selected Plan
                </p>
                <p className="mt-1 text-lg font-bold text-slate-900">
                  {policyTier === "PREMIUM"
                    ? "Premium Protection"
                    : policyTier === "BASIC"
                    ? "Basic Protection"
                    : "None selected"}
                </p>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-[11px] font-medium text-slate-500">
                    Risk Coverage
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    Rain · Heat · AQI · Surge
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-[11px] font-medium text-slate-500">
                    Activation
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    Immediate
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-[11px] font-medium text-slate-500">
                    Current Risk Score
                  </p>
                  <p className="mt-1 text-sm font-semibold text-blue-600">
                    {riskScore}%
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-[11px] font-medium text-slate-500">
                    Risk Multiplier
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {riskScore > 70 ? "×1.30" : riskScore > 40 ? "×1.15" : "×1.00"}
                  </p>
                </div>
              </div>

              {/* Calculated premium */}
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-xs font-medium text-blue-600">
                  Calculated Weekly Premium
                </p>
                <p className="mt-1 text-3xl font-bold text-blue-700">
                  {calculatedPremium ? `$${calculatedPremium}` : "--"}
                  <span className="ml-1 text-sm font-normal text-blue-400">
                    / week
                  </span>
                </p>
                <p className="mt-1 text-[11px] text-blue-500">
                  Risk-adjusted · Cancel anytime
                </p>
              </div>

              {/* Explainable AI (XAI) Factors */}
              {xaiData && (
                <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between mb-3">
                     <p className="text-xs font-bold uppercase tracking-widest text-slate-500">AI Risk Factors</p>
                     <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-500">XAI ENGINE</span>
                  </div>
                  
                  <div className="space-y-3">
                    {Object.entries(xaiData.factors).map(([key, value]) => (
                      <div key={key}>
                        <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                          <span className="uppercase">{key.replace('_', ' ')}</span>
                          <span>{value as number}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${(value as number) > 70 ? 'bg-amber-500' : (value as number) > 40 ? 'bg-blue-500' : 'bg-emerald-500'}`} 
                            style={{ width: `${value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-[11px] italic text-slate-500 leading-relaxed border-t border-slate-100 pt-3">
                    <span className="font-bold">AI Insight:</span> {xaiData.explanation}
                  </p>
                </div>
              )}

              {/* CTA */}
              <button
                type="button"
                onClick={() => {
                   if (policyTier === "NONE") {
                      handleSelect("PREMIUM");
                   }
                   router.push("/payment");
                }}
                className="w-full rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition"
              >
                {policyTier === "NONE"
                  ? "Activate Policy & Secure Income"
                  : "Confirm & Activate Policy"}
              </button>

              <p className="text-center text-[10px] text-slate-400">
                By clicking activate, you agree to the parametric settlement
                terms and automated risk monitoring protocol.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
