import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto flex max-w-screen-2xl flex-col gap-24 px-6 pb-20 pt-10 lg:pt-20">
        {/* Top nav */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <span className="text-sm font-bold tracking-tight text-slate-900">
              RiskShield-Gig
            </span>
          </div>
          <nav className="hidden items-center gap-8 text-sm text-slate-500 md:flex">
            <Link href="/dashboard" className="hover:text-slate-900 transition">
              Dashboard
            </Link>
            <Link href="/buy-policy" className="hover:text-slate-900 transition">
              Buy Policy
            </Link>
            <Link href="/claims" className="hover:text-slate-900 transition">
              Claims
            </Link>
            <Link
              href="/register"
              className="rounded-full border border-slate-200 bg-white px-4 py-1.5 font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition"
            >
              Login
            </Link>
          </nav>
          <Link
            href="/register"
            className="inline-flex items-center rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition md:px-5"
          >
            Get Started
          </Link>
        </header>

        {/* Hero */}
        <section className="grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-blue-600">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
              Gig Sentinel v1.0
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Protect Your Income from{" "}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                Unpredictable Risks
              </span>
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-slate-500 sm:text-lg">
              An AI-powered income protection system for delivery partners.
              Dynamic risk scoring, real-time weather triggers, and automated
              payouts keep your weekly earnings stable even when conditions
              turn bad.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-blue-200 hover:bg-blue-700 transition"
              >
                Start Risk Assessment →
              </Link>
              <Link
                href="/dashboard"
                className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition"
              >
                View Live Dashboard
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-8 text-sm">
              <div>
                <p className="font-bold text-slate-900">12,800+</p>
                <p className="text-slate-400">gig workers protected</p>
              </div>
              <div>
                <p className="font-bold text-slate-900">&lt; 15 min</p>
                <p className="text-slate-400">automated payout time</p>
              </div>
              <div>
                <p className="font-bold text-slate-900">99.4%</p>
                <p className="text-slate-400">claim accuracy rate</p>
              </div>
            </div>
          </div>

          {/* Hero visual */}
          <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-800">This week&apos;s shield</span>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                AUTO-CLAIMS ON
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Projected Earnings</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  $420
                  <span className="text-sm font-normal text-slate-400"> / $500</span>
                </p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full w-[84%] rounded-full bg-blue-600" />
                </div>
                <p className="mt-2 text-[11px] text-slate-400">
                  84% to income target this week
                </p>
              </div>
              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                <div className="flex items-baseline justify-between">
                  <p className="text-xs text-slate-500">AI Risk Score</p>
                  <span className="text-[11px] font-semibold text-amber-600">
                    Heavy Rain Watch
                  </span>
                </div>
                <p className="text-3xl font-bold text-amber-600">78%</p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Real-time triggers from weather + AQI data.
                </p>
              </div>
            </div>
            <div className="mt-2 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs">
                <p className="text-slate-400">Weekly Premium</p>
                <p className="mt-1 text-sm font-bold text-slate-900">$12.50</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs">
                <p className="text-slate-400">Coverage Limit</p>
                <p className="mt-1 text-sm font-bold text-slate-900">$1,250</p>
              </div>
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-xs">
                <p className="text-emerald-600">Last Claim Payout</p>
                <p className="mt-1 text-sm font-bold text-emerald-700">$45.00 · Heavy Rain</p>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="space-y-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
              Simple Steps
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Peace of Mind in 3 Steps
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Register once, and RiskShield-Gig continuously monitors external
              risk factors so your income stays predictable.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                num: "01",
                title: "Connect App",
                desc: "Register with your city and platform so the engine can learn your earning pattern.",
              },
              {
                num: "02",
                title: "Dynamic Risk Scoring",
                desc: "AI combines weather, AQI, and historical disruption data to set real-time risk and premium.",
              },
              {
                num: "03",
                title: "Automatic Payouts",
                desc: "When risk crosses threshold, claims are filed and settled automatically — no forms, no calls.",
              },
            ].map((step) => (
              <div
                key={step.num}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition"
              >
                <p className="text-2xl font-bold text-blue-100">{step.num}</p>
                <h3 className="mt-2 text-base font-bold text-slate-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-slate-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Trust & Transparency / ML Architecture */}
        <section className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-8 sm:p-12 lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center shadow-inner">
           <div>
             <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase tracking-widest text-blue-700">Transparency First</span>
             <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900">Explainable AI. No Black Boxes.</h2>
             <p className="mt-4 text-base leading-relaxed text-slate-600">
                RiskShield-Gig uses an advanced ensemble model (Random Forest & GBM) to evaluate external risk. Every premium increase and every automated claim payout comes with a transparent ledger trail showing exactly why the decision was made.
             </p>
             <ul className="mt-6 space-y-4">
               <li className="flex gap-3">
                 <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white font-black text-sm shadow-sm md:mt-0">1</div>
                 <div>
                   <h3 className="font-bold text-slate-900 leading-tight">Data Ingestion</h3>
                   <p className="text-sm text-slate-500 mt-1">Real-time web hooks from OpenWeather and AQI telemetry.</p>
                 </div>
               </li>
               <li className="flex gap-3">
                 <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white font-black text-sm shadow-sm">2</div>
                 <div>
                   <h3 className="font-bold text-slate-900 leading-tight">Fraud Filtering</h3>
                   <p className="text-sm text-slate-500 mt-1">Geospatial anomaly detection blocks spoofed location data.</p>
                 </div>
               </li>
               <li className="flex gap-3">
                 <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white font-black text-sm shadow-sm">3</div>
                 <div>
                   <h3 className="font-bold text-slate-900 leading-tight">Zero-Touch Execution</h3>
                   <p className="text-sm text-slate-500 mt-1">Pre-funded parametric ledgers bypass manual review queues.</p>
                 </div>
               </li>
             </ul>
           </div>
           
           <div className="mt-10 lg:mt-0 relative group">
             <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-600 to-cyan-400 opacity-25 blur transition duration-1000 group-hover:opacity-50"></div>
             <div className="relative rounded-2xl bg-white p-6 shadow-xl border border-slate-100">
               <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                 <span className="text-xs font-bold uppercase tracking-widest text-slate-400">System Activity</span>
                 <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-emerald-600">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500"></span>
                    ML Online
                 </span>
               </div>
               <div className="space-y-4 font-mono text-xs">
                 <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-slate-500">[10:44:01] INGEST:</span>
                    <span className="text-slate-800 font-semibold">City="Kondapur" Rain=65mm/h</span>
                 </div>
                 <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-slate-500">[10:44:03] INFER:</span>
                    <span className="text-blue-600 font-semibold font-bold">Fraud_Score=0.04 (Clear)</span>
                 </div>
                 <div className="flex justify-between items-center bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                    <span className="text-emerald-600 font-bold">[10:44:04] EXECUTE:</span>
                    <span className="text-emerald-700 font-bold">Claim Auto-Approved: $45</span>
                 </div>
               </div>
             </div>
           </div>
        </section>

        {/* Final CTA */}
        <section className="mt-4 rounded-3xl bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-12 text-white shadow-lg">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-bold">Ready to secure your earnings?</h2>
              <p className="mt-2 text-sm text-blue-100">
                Join gig workers who treat bad weather as just another protected
                event, not a lost day of income.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/register"
                className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-blue-600 shadow-md hover:bg-blue-50 transition"
              >
                Get Started Now
              </Link>
              <Link
                href="/buy-policy"
                className="rounded-xl border border-white/30 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/10 transition"
              >
                Explore Plans
              </Link>
            </div>
          </div>
        </section>
      </div>

      <footer className="border-t border-slate-100 py-6 text-center text-[11px] text-slate-400">
        © 2026 RiskShield-Gig Sentinel · Precise risk modeling for the gig economy.
      </footer>
    </main>
  );
}
