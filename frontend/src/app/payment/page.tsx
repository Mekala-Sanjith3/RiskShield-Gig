"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRiskShield } from "../../context/RiskShieldContext";
import Link from "next/link";

export default function PaymentPage() {
  const router = useRouter();
  const { policyTier, premium, activatePolicy, payouts, worker } = useRiskShield();

  const [cardNumber, setCardNumber] = useState("");
  const [name, setName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [flip, setFlip] = useState(false);
  const [method, setMethod] = useState("card");
  const [upiId, setUpiId] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [latestPayout, setLatestPayout] = useState<any>(null);
  const [tab, setTab] = useState<"checkout"|"receipt"|"history">("checkout");

  const displayPlan = policyTier === "PREMIUM" ? "Premium Protection" : policyTier === "BASIC" ? "Basic Protection" : "Selected Plan";

  const formatCardNumber = (v: string) => v.replace(/\D/g,"").replace(/(.{4})/g,"$1 ").trim();
  const formatExpiry = (v: string) => { const c = v.replace(/\D/g,""); return c.length <= 2 ? c : `${c.slice(0,2)}/${c.slice(2,4)}`; };

  // Load latest payout from session
  useEffect(() => {
    if (payouts.length > 0) setLatestPayout(payouts[0]);
  }, [payouts]);

  const handlePayment = () => {
    if (loading || success) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      if (policyTier !== "NONE") activatePolicy(policyTier, premium);
      setTimeout(() => router.push("/dashboard"), 2500);
    }, 2000);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html:`
        .perspective { perspective: 1000px; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        .loader { border: 3px solid rgba(255,255,255,0.3); border-top: 3px solid #fff; border-radius: 50%; width: 20px; height: 20px; animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .success-glow { box-shadow: 0 0 50px rgba(16,185,129,0.5); }
        .card-wave { background:#fff; position:absolute; right:0; top:0; bottom:0; width:34%; clip-path:polygon(20% 0,100% 0,100% 100%,0% 100%); z-index:10; }
      `}} />

      {success && (
        <div className="fixed inset-0 bg-white/98 flex flex-col justify-center items-center z-[100] animate-in fade-in duration-500">
          <div className="w-28 h-28 border-[8px] border-emerald-500 rounded-full flex items-center justify-center mb-8 bg-emerald-50 shadow-2xl success-glow animate-bounce">
            <span className="text-6xl text-emerald-600 font-black">✓</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900">Payment Successful</h2>
          <p className="text-lg font-bold text-emerald-600 mt-2">Policy Protected · No Interruption Ahead</p>
        </div>
      )}

      <div className="min-h-screen bg-[#F0F5FA] text-slate-900">
        {/* Tabs */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-100 shadow-sm">
          <div className="mx-auto max-w-5xl px-6 flex items-center gap-8 py-4">
            <Link href="/dashboard" className="text-sm font-medium text-slate-400 hover:text-slate-700 transition">← Dashboard</Link>
            {(["checkout","receipt","history"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`pb-1 text-sm font-bold capitalize border-b-2 transition ${tab === t ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-700"}`}>
                {t === "receipt" ? "UPI Receipt" : t === "history" ? "Payout History" : "Checkout"}
              </button>
            ))}
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-6 py-12">

          {/* ── Checkout Tab ─────────────────────────────────────────────── */}
          {tab === "checkout" && (
            <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-12">
              {/* Virtual Card */}
              <div className="flex flex-col items-center">
                <div className="w-[420px] h-[240px] perspective transition-all duration-700 hover:-translate-y-2">
                  <div className={`relative w-full h-full duration-700 ease-out transform ${flip ? "rotate-y-180" : ""}`} style={{ transformStyle:"preserve-3d" }}>
                    <div className="absolute w-full h-full bg-gradient-to-br from-[#1c2e4a] to-[#0c1626] rounded-3xl p-7 shadow-2xl backface-hidden ring-1 ring-white/10 overflow-hidden">
                      <div className="card-wave" />
                      <div className="relative z-20 flex justify-between items-start mb-6">
                        <span className="text-lg font-extrabold tracking-tight text-white">RiskShield Bank</span>
                        <div className="text-2xl font-black italic tracking-tighter text-[#1c2e4a]">VISA</div>
                      </div>
                      <div className="relative z-20 mt-4 text-xl tracking-[0.15em] font-mono text-white/95">{cardNumber || "•••• •••• •••• ••••"}</div>
                      <div className="relative z-20 mt-4 flex justify-between items-end">
                        <div>
                          <p className="text-[9px] uppercase font-black tracking-widest text-white/50 mb-1">Card Holder</p>
                          <p className="text-sm font-bold tracking-widest text-white">{name || "YOUR NAME"}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] uppercase font-black tracking-widest text-[#1c2e4a]/60 mb-0.5">Expires</p>
                          <p className="text-sm font-black text-[#1c2e4a]">{expiry || "MM/YY"}</p>
                        </div>
                      </div>
                    </div>
                    <div className="absolute w-full h-full bg-gradient-to-br from-[#0c1626] to-[#04090f] rounded-3xl shadow-2xl rotate-y-180 backface-hidden overflow-hidden flex flex-col">
                      <div className="bg-black/90 h-12 w-full mt-8" />
                      <div className="p-6">
                        <div className="bg-slate-200/90 h-10 w-[80%] rounded flex items-center justify-end px-3 border-l-4 border-blue-500 ml-auto">
                          <p className="text-slate-900 font-mono text-lg font-black italic">{cvv || "•••"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-8 w-full max-w-[420px] p-5 bg-blue-50/50 border border-blue-200 rounded-2xl flex items-start gap-3 shadow-sm">
                  <div className="bg-white p-2 rounded-xl shadow-sm border border-blue-100">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-blue-900 uppercase tracking-widest">Security Protocol</h4>
                    <p className="text-xs text-blue-700/80 leading-relaxed mt-1">End-to-end encrypted · PCI-DSS compliant · Powered by Razorpay</p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="w-full max-w-[440px] bg-white p-8 rounded-[3rem] shadow-2xl shadow-blue-900/10 border border-white">
                <div className="mb-6">
                  <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">{displayPlan}</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">₹{premium.toFixed(2)} <span className="text-sm font-normal text-slate-400">/ week</span></p>
                </div>

                <div className="flex gap-6 mb-8 border-b border-slate-100 relative">
                  {["card","upi"].map(m => (
                    <button key={m} onClick={() => { setMethod(m); if (m==="upi") setFlip(false); }}
                      className={`pb-3 text-sm font-bold uppercase tracking-widest transition relative ${method===m ? "text-blue-600" : "text-slate-400 hover:text-slate-700"}`}>
                      {m === "card" ? "Credit Card" : "UPI / GPay"}
                      {method===m && <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-blue-600 rounded-full" />}
                    </button>
                  ))}
                </div>

                {method === "card" ? (
                  <div className="space-y-5">
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Card Number</p>
                      <input maxLength={19} value={cardNumber} placeholder="0000 0000 0000 0000"
                        className="w-full px-4 py-3.5 bg-[#F8FAFC] border border-slate-100 rounded-2xl text-base font-mono focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition"
                        onChange={e => setCardNumber(formatCardNumber(e.target.value))} onFocus={() => setFlip(false)} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Card Holder Name</p>
                      <input value={name} placeholder="FULL NAME"
                        className="w-full px-4 py-3.5 bg-[#F8FAFC] border border-slate-100 rounded-2xl text-base font-bold uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition"
                        onChange={e => setName(e.target.value.toUpperCase())} onFocus={() => setFlip(false)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Expiry</p>
                        <input maxLength={5} value={expiry} placeholder="MM/YY"
                          className="w-full px-4 py-3.5 bg-[#F8FAFC] border border-slate-100 rounded-2xl text-base font-mono focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition text-center"
                          onChange={e => setExpiry(formatExpiry(e.target.value))} onFocus={() => setFlip(false)} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">CVV</p>
                        <input maxLength={4} value={cvv} type="password" placeholder="•••"
                          className="w-full px-4 py-3.5 bg-[#F8FAFC] border border-slate-100 rounded-2xl text-base font-mono focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition text-center"
                          onFocus={() => setFlip(true)} onBlur={() => setFlip(false)} onChange={e => setCvv(e.target.value)} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">UPI / VPA</p>
                      <input value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="yourname@okaxis"
                        className="w-full px-4 py-3.5 bg-[#F8FAFC] border border-slate-100 rounded-2xl text-base focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition" />
                    </div>
                    <div className="p-5 rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/50 flex gap-3 items-center">
                      <span className="text-2xl">⚡</span>
                      <div>
                        <p className="text-sm font-bold text-emerald-800">Auto-mandate enabled</p>
                        <p className="text-xs text-emerald-600">Weekly parametric payouts via Razorpay UPI</p>
                      </div>
                    </div>
                  </div>
                )}

                <button onClick={handlePayment} disabled={loading || success}
                  className="mt-8 w-full bg-[#1e78d9] text-white py-4 rounded-[2rem] text-base font-black shadow-2xl shadow-blue-600/30 hover:bg-[#1565c0] transition-all flex justify-center items-center uppercase tracking-widest">
                  {loading ? <div className="loader" /> : success ? "Activated ✓" : `Pay ₹${premium.toFixed(2)} & Activate`}
                </button>
                <p className="text-center text-[10px] text-slate-400 mt-3">By clicking, you agree to the parametric settlement terms.</p>
              </div>
            </div>
          )}

          {/* ── UPI Receipt Tab ───────────────────────────────────────────── */}
          {tab === "receipt" && (
            <div className="flex justify-center">
              {latestPayout ? (
                <div className="w-full max-w-sm">
                  {/* GPay-style receipt */}
                  <div className="rounded-3xl bg-white shadow-2xl overflow-hidden border border-slate-100">
                    {/* Header */}
                    <div className="bg-gradient-to-br from-blue-600 to-blue-800 px-6 py-8 text-center">
                      <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">✅</span>
                      </div>
                      <p className="text-blue-200 text-xs font-bold uppercase tracking-widest">Payment Successful</p>
                      <p className="text-white text-4xl font-black mt-2">₹{latestPayout.amount}</p>
                      <p className="text-blue-200 text-sm mt-1">Sent to {latestPayout.upi_id}</p>
                    </div>

                    {/* Details */}
                    <div className="px-6 py-6 space-y-4">
                      {[
                        { label: "Transaction ID", value: latestPayout.display_ref },
                        { label: "UTR Number", value: latestPayout.display_utr },
                        { label: "Gateway", value: "Razorpay UPI" },
                        { label: "Status", value: latestPayout.status },
                        { label: "Timestamp", value: new Date(latestPayout.timestamp).toLocaleString("en-IN") },
                        { label: "Reason", value: latestPayout.claim_reason },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between items-start">
                          <span className="text-xs font-medium text-slate-400">{label}</span>
                          <span className="text-sm font-bold text-slate-700 text-right max-w-[55%] break-words">{value}</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-slate-100 px-6 py-4 text-center">
                      <p className="text-[10px] text-slate-400">Powered by RiskShield Parametric Engine · Razorpay</p>
                    </div>
                  </div>
                  <button onClick={() => setTab("history")} className="mt-4 w-full rounded-2xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 transition">
                    View All Payouts →
                  </button>
                </div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-slate-400 text-lg">No payout receipt yet.</p>
                  <p className="text-slate-300 text-sm mt-2">Simulate a rainstorm from the dashboard to trigger a payout.</p>
                  <Link href="/dashboard" className="mt-6 inline-block rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 transition">Go to Dashboard →</Link>
                </div>
              )}
            </div>
          )}

          {/* ── Payout History Tab ───────────────────────────────────────── */}
          {tab === "history" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">Payout History</p>
                  <h2 className="text-xl font-bold text-slate-900 mt-1">All UPI Payouts</h2>
                </div>
                <span className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">
                  Total: ₹{payouts.reduce((s, p) => s + p.amount, 0).toFixed(0)}
                </span>
              </div>

              {payouts.length === 0 ? (
                <div className="text-center py-20 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-slate-400">No payouts yet. Trigger a claim to see history.</p>
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  <div className="grid grid-cols-5 px-5 py-3 border-b border-slate-100 bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <span>Date</span><span>Reason</span><span>UPI / Ref</span><span>Amount</span><span>Status</span>
                  </div>
                  {payouts.map((p, i) => (
                    <div key={i} className="grid grid-cols-5 px-5 py-4 border-b border-slate-50 hover:bg-slate-50 transition items-center">
                      <span className="text-xs text-slate-500">{new Date(p.timestamp).toLocaleDateString("en-IN", { day:"numeric", month:"short" })}</span>
                      <span className="text-xs font-medium text-slate-700 truncate">{p.claim_reason}</span>
                      <div>
                        <p className="text-xs font-mono text-blue-600">{p.display_ref}</p>
                        <p className="text-[10px] text-slate-400">{p.upi_id}</p>
                      </div>
                      <span className="text-sm font-bold text-emerald-700">₹{p.amount}</span>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 w-fit">{p.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
