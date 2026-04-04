"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useRiskShield } from "../../context/RiskShieldContext";

export default function PaymentPage() {
  const router = useRouter();
  const { policyTier, premium, activatePolicy } = useRiskShield();
  
  // Virtual Card State
  const [cardNumber, setCardNumber] = useState("");
  const [name, setName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [flip, setFlip] = useState(false);
  
  // Payment Flow State
  const [method, setMethod] = useState("card");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const displayPlan = policyTier === "PREMIUM" ? "Premium Protection" : policyTier === "BASIC" ? "Basic Protection" : "Selected Plan";
  const displayPremium = premium ? `$${premium.toFixed(2)}` : "$0.00";

  const formatCardNumber = (num: string) => {
    return num.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiry = (val: string) => {
    const code = val.replace(/\D/g, "");
    if (code.length <= 2) return code;
    return `${code.slice(0, 2)}/${code.slice(2, 4)}`;
  };

  const handlePayment = () => {
    if (loading || success) return;
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      
      // Play sound gracefully
      try {
        const audio = new Audio("/success.mp3");
        audio.play().catch(e => console.log("Audio playback prevented:", e));
      } catch (e) {
        console.log("Audio not supported");
      }

      // Ensure policy is active in global context
      if (policyTier !== "NONE") {
         activatePolicy(policyTier, premium);
      }

      // Redirect payload
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
      
    }, 2000);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .perspective { perspective: 1000px; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        
        .loader {
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top: 3px solid #ffffff;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
        
        .success-glow {
          box-shadow: 0 0 50px rgba(16, 185, 129, 0.5);
        }

        .card-wave {
          background: #ffffff;
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          width: 34%;
          clip-path: polygon(20% 0, 100% 0, 100% 100%, 0% 100%);
          z-index: 10;
        }
      `}} />

      {/* SUCCESS OVERLAY */}
      {success && (
        <div className="fixed inset-0 bg-white/98 flex flex-col justify-center items-center z-[100] animate-in fade-in duration-500">
           <div className="w-28 h-28 border-[8px] border-emerald-500 rounded-full flex items-center justify-center mb-8 animate-bounce bg-emerald-50 shadow-2xl success-glow">
            <span className="text-6xl text-emerald-600 font-black">✓</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Payment Successful</h2>
          <p className="text-lg font-bold text-emerald-600 mt-2">
            Policy Protected · No Interruption Ahead
          </p>
        </div>
      )}

      <div className="min-h-screen bg-[#F0F5FA] flex flex-col items-center justify-center p-6 text-slate-900 pb-20">
        
        <div className="text-center mb-16 animate-in fade-in slide-in-from-top-6 duration-700">
          <h1 className="text-4xl font-black tracking-tight text-[#0A2540]">Finalize Protection Checkout</h1>
          <p className="text-lg font-bold text-slate-500 mt-2">
            Selected Plan: <span className="text-blue-600 font-black">{displayPlan}: {displayPremium} / week</span>
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-10 lg:gap-24 max-w-7xl w-full">
          
          {/* Left Column: Visual Assets */}
          <div className="flex flex-col items-center max-w-[450px]">
             
             {/* 💳 RE-DESIGNED VIRTUAL CARD */}
             <div className="w-[560px] h-[320px] perspective z-20 transition-all duration-700 hover:-translate-y-2 group">
                <div className={`relative w-full h-full duration-700 ease-out transform ${flip ? "rotate-y-180" : ""}`} style={{ transformStyle: 'preserve-3d' }}>
                  
                  {/* FRONT */}
                  <div className="absolute w-full h-full bg-gradient-to-br from-[#1c2e4a] to-[#0c1626] rounded-3xl p-8 shadow-2xl backface-hidden ring-1 ring-white/10 overflow-hidden">
                    {/* The Wave Graphic */}
                    <div className="card-wave"></div>
                    
                    <div className="relative z-20 flex justify-between items-start mb-8">
                       <div className="flex items-center gap-2.5">
                          <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                           <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12v4.7c0 4.67-3.13 8.87-7 10-3.87-1.13-7-5.33-7-10v-4.7l7-3.12z"/>
                          </svg>
                          <span className="text-lg font-extrabold tracking-tight">RiskShield Bank</span>
                       </div>
                       <div className="text-3xl font-black italic tracking-tighter text-[#1c2e4a]">VISA</div>
                    </div>

                    <div className="relative z-20 flex items-center gap-4 mb-4">
                       {/* Chip */}
                       <div className="w-12 h-9 bg-gradient-to-br from-slate-300 to-slate-500 rounded-lg border border-slate-400 overflow-hidden relative shadow-inner">
                          <div className="absolute inset-0 grid grid-cols-2 gap-2 p-1 opacity-20">
                            {[...Array(4)].map((_, i) => <div key={i} className="border border-black"></div>)}
                          </div>
                       </div>
                       {/* Wireless payment */}
                       <svg className="w-7 h-7 text-slate-300 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2a10 10 0 0 1 10 10M10 2a14 14 0 0 1 14 14M6 2a18 18 0 0 1 18 18" opacity="0.3"/>
                          <path d="M12 4a8 8 0 0 1 8 8" opacity="0.6"/>
                          <path d="M12 8a4 4 0 0 1 4 4" />
                       </svg>
                    </div>

                    <div className="relative z-20 mt-8 text-2xl tracking-[0.15em] font-mono text-white/95 whitespace-nowrap">
                      {cardNumber || "•••• •••• •••• ••••"}
                    </div>

                    <div className="relative z-20 mt-8 flex justify-between items-end">
                       <div>
                          <p className="text-[10px] uppercase font-black tracking-widest text-white/50 mb-1">Card Holder</p>
                          <p className="text-base font-bold tracking-widest text-white">{name || "YOUR NAME"}</p>
                       </div>
                       <div className="text-right flex flex-col items-center">
                          <p className="text-[10px] uppercase font-black tracking-widest text-[#1c2e4a]/60 mb-0.5">Expires</p>
                          <p className="text-sm font-black text-[#1c2e4a]">{expiry || "MM/YY"}</p>
                          {/* Small secondary logo on wave */}
                          <div className="text-xl font-black italic tracking-tighter text-[#1c2e4a] mt-2">VISA</div>
                       </div>
                    </div>
                  </div>

                  {/* BACK */}
                  <div className="absolute w-full h-full bg-gradient-to-br from-[#0c1626] to-[#04090f] rounded-3xl shadow-2xl rotate-y-180 backface-hidden overflow-hidden flex flex-col">
                    <div className="bg-black/90 h-14 w-full mt-10"></div>
                    <div className="p-8 pb-4 flex flex-col flex-grow">
                        <div className="bg-slate-200/90 h-11 w-[80%] rounded flex items-center justify-end px-4 border-l-4 border-[#1A76D1] ml-auto">
                           <p className="text-slate-900 font-mono text-xl font-black tracking-widest italic">{cvv || "•••"}</p>
                        </div>
                        <div className="mt-6 text-[9px] opacity-40 text-justify text-white/80 font-mono leading-tight">
                          Parametric Policy Holder Card. RiskShield Bank ensures zero-touch claims based on verified real-world events. Misuse tracked by AI. Return to nearest logistics hub.
                        </div>
                    </div>
                  </div>
                </div>
             </div>

             {/* 🛡️ SECURITY PROTOCOL BOX */}
             <div className="mt-20 w-full p-6 bg-blue-50/50 border border-blue-200 rounded-2xl flex items-start gap-4 shadow-sm animate-in fade-in duration-1000">
                <div className="bg-white p-2 rounded-xl shadow-sm border border-blue-100">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                </div>
                <div>
                   <h4 className="text-sm font-black text-blue-900 uppercase tracking-widest">Security Protocol</h4>
                   <p className="text-xs font-semibold text-blue-700/80 leading-relaxed mt-1">
                     Your card data is end-to-end encrypted. We support PCI-DSS compliant transactions for automated weekly income protection.
                   </p>
                </div>
             </div>
          </div>

          {/* Right Column: Interactive Form */}
          <div className="w-full max-w-[480px] bg-white p-10 rounded-[3rem] shadow-2xl shadow-blue-900/10 border border-white relative z-10 animate-in slide-in-from-right-8 duration-700">
             
             {/* Aero-Tabs Selector */}
             <div className="flex items-center gap-8 mb-10 border-b border-slate-50 relative">
                <button 
                  onClick={() => setMethod('card')}
                  className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative ${method === 'card' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-800'}`}
                >
                  Credit Card
                  {method === 'card' && <div className="absolute bottom-[-1px] left-0 right-0 h-1 bg-blue-600 rounded-full animate-in slide-in-from-left-4 duration-300"></div>}
                </button>
                <button 
                  onClick={() => { setMethod('upi'); setFlip(false); }}
                  className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative ${method === 'upi' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-800'}`}
                >
                  UPI Gateway
                  {method === 'upi' && <div className="absolute bottom-[-1px] left-0 right-0 h-1 bg-blue-600 rounded-full animate-in slide-in-from-right-4 duration-300"></div>}
                </button>
             </div>

             <div className="space-y-6 min-h-[250px]">
                {method === 'card' ? (
                   <div className="animate-in fade-in slide-in-from-left-4 duration-500 space-y-6">
                      <div className="group">
                         <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 transition-colors group-focus-within:text-blue-500">Card Number</p>
                         <div className="relative flex items-center">
                            <input
                              maxLength={19}
                              value={cardNumber}
                              placeholder="0000 0000 0000 0000"
                              className="w-full pl-5 pr-12 py-4 bg-[#F8FAFC] border border-slate-100 rounded-2xl text-base font-mono focus:outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-500 transition-all shadow-sm"
                              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                              onFocus={() => setFlip(false)}
                            />
                            <svg className="absolute right-4 w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <rect width="18" height="12" x="3" y="6" rx="2"/><path d="M3 10h18"/>
                            </svg>
                         </div>
                      </div>

                      <div className="group">
                         <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 transition-colors group-focus-within:text-blue-500">Card Holder Name</p>
                         <input
                           value={name}
                           placeholder="JOHN DOE"
                           className="w-full px-5 py-4 bg-[#F8FAFC] border border-slate-100 rounded-2xl text-base font-bold uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-500 transition-all shadow-sm"
                           onChange={(e) => setName(e.target.value.toUpperCase())}
                           onFocus={() => setFlip(false)}
                         />
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                         <div className="group">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 transition-colors group-focus-within:text-blue-500">Expiry Date</p>
                            <input
                              maxLength={5}
                              value={expiry}
                              placeholder="MM/YY"
                              className="w-full px-5 py-4 bg-[#F8FAFC] border border-slate-100 rounded-2xl text-base font-mono focus:outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-500 transition-all shadow-sm text-center"
                              onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                              onFocus={() => setFlip(false)}
                            />
                         </div>
                         <div className="group">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 transition-colors group-focus-within:text-blue-500">Security Code</p>
                            <input
                              maxLength={4}
                              value={cvv}
                              type="password"
                              placeholder="CVV"
                              className="w-full px-5 py-4 bg-[#F8FAFC] border border-slate-100 rounded-2xl text-base font-mono focus:outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-500 transition-all shadow-sm text-center"
                              onFocus={() => setFlip(true)}
                              onBlur={() => setFlip(false)}
                              onChange={(e) => setCvv(e.target.value)}
                            />
                         </div>
                      </div>
                   </div>
                ) : (
                   <div className="animate-in fade-in slide-in-from-right-4 duration-500 py-6 space-y-6">
                      <div className="group">
                         <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 transition-colors group-focus-within:text-blue-500">Virtual Payment Address (VPA)</p>
                         <input
                           placeholder="user@okaxis"
                           className="w-full px-5 py-4 bg-[#F8FAFC] border border-slate-100 rounded-2xl text-base focus:outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-500 transition-all shadow-sm"
                         />
                      </div>
                      <div className="p-6 rounded-3xl border-2 border-dashed border-emerald-200 bg-emerald-50/50 text-emerald-800 text-sm font-bold flex gap-3 items-center">
                         <span className="text-2xl">⚡</span>
                         Auto-mandate enabled for weekly parametric deductions.
                      </div>
                   </div>
                )}
             </div>

             <div className="mt-12 space-y-6">
                <button
                  onClick={handlePayment}
                  disabled={loading || success}
                  className="w-full bg-[#1e78d9] text-white py-5 rounded-[2rem] text-lg font-black shadow-2xl shadow-blue-600/30 active:scale-[0.98] hover:bg-[#1565c0] transition-all flex justify-center items-center h-[72px] uppercase tracking-widest"
                >
                  {loading ? (
                    <div className="loader"></div>
                  ) : success ? (
                    "Activated ✓"
                  ) : (
                    "Pay & Activate Secure Connection"
                  )}
                </button>
                
                <div className="flex justify-center items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-slate-300">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></div>
                   End-to-End Encrypted via RiskShield AI
                </div>
             </div>
          </div>
        </div>
      </div>
    </>
);
}
