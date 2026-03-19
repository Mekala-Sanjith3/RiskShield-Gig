# RiskShield-Gig

**AI-Powered Parametric Insurance for Gig Delivery Workers**

Guidewire DEVTrails 2026 | Team: Prime AutoBots

---

## The Problem

India has over 12 million gig delivery workers. Most of them earn between ₹10,000 and ₹15,000 a month — roughly ₹600 to ₹800 a day — working for platforms like Swiggy and Zomato. When a heavy rainstorm hits, when a city-wide curfew is announced, or when flooding shuts down entire zones, these workers simply stop earning. There is no compensation. No claim to file. No safety net.

A worker in Hyderabad during the 2024 monsoon season could lose 8 to 10 working days. That is anywhere between ₹4,800 and ₹8,000 gone — with no recourse. Traditional insurance products do not address this. They are too expensive, too complex, and built for a workforce that earns a salary, not a daily wage.

RiskShield-Gig exists to close that gap.

---

## What We Are Building

RiskShield-Gig is a parametric insurance platform that monitors real-world disruption events — weather, pollution, curfews — and automatically pays out to affected workers the moment a verified trigger is hit. No forms. No manual claims. No waiting.

The worker pays a small weekly premium. When a covered disruption occurs in their active zone, the system detects it, validates it, and transfers money to their UPI account — often within minutes.

---

## Target Persona

**Segment:** Food delivery partners on Swiggy and Zomato
**Geography:** Urban Hyderabad and Guntur
**Income profile:** ₹600–800/day, week-to-week earners
**Insurance awareness:** Very low. Most have never held an insurance policy.
**Device access:** Android smartphone, UPI-enabled bank account

**A day in Raju's life:**

Raju is a Swiggy delivery partner based in Kondapur, Hyderabad. He logs in at 10 AM and typically completes 12 to 15 deliveries by 9 PM. On a good week he takes home around ₹4,500. During monsoon season, there are weeks where he cannot step out at all. Last July, he lost four straight days to flooding. ₹2,800 gone. His rent does not pause for the rain. RiskShield-Gig would have detected the flood alert, verified Raju's active zone, and paid him automatically — before he even knew a claim had been processed.

---

## How the Platform Works

### Onboarding

A new worker signs up using their phone number and completes a lightweight KYC — just their Aadhaar number, delivery platform ID, and UPI handle. The AI engine pulls their zone data and delivery history to build an initial risk profile. The whole process takes under three minutes.

### Weekly Premium Subscription

Once onboarded, the worker is shown their weekly premium based on their zone risk level. They subscribe weekly — because gig workers think in weeks, not months or years. Premiums are deducted automatically each Monday.

| Risk Level | Weekly Premium | Basis |
|------------|---------------|-------|
| Low | ₹20 | Zone with historically low disruption frequency |
| Medium | ₹30 | Moderate flood or AQI risk history |
| High | ₹40 | Flood-prone or high-pollution zones |

Premiums are capped at approximately 5% of average weekly income to keep the product genuinely affordable.

### Disruption Monitoring

The system runs continuous checks against live data feeds — weather APIs, AQI monitors, government flood and curfew alerts, and traffic conditions. When a parameter crosses a defined threshold in a zone where active subscribers are located, the claim pipeline is triggered.

| Trigger Event | Threshold | Data Source |
|---------------|-----------|-------------|
| Heavy rainfall | Above 50mm/hr | OpenWeatherMap |
| Severe air pollution | AQI above 350 | CPCB / OpenAQ |
| Flood alert | Red alert issued | IMD / State disaster APIs |
| Curfew or zone shutdown | Official notification confirmed | Government / news APIs |
| Platform outage | Delivery platform unavailable | Mock platform health API |

### Payout Calculation

```
Payout = (Average Daily Earnings x Disruption Hours) / Standard Working Hours
```

Capped at ₹500 per disruption day, with a maximum weekly payout of ₹2,500. The cap keeps the loss ratio sustainable while covering the majority of a worker's actual income loss on a bad day.

---

## Platform Choice

We are building a web application, accessible via mobile browser, with Progressive Web App capabilities so workers can add it to their home screen and use it like a native app — without the friction of an app store download. This matters for our target user: a delivery worker who may be running a budget Android phone with limited storage. A browser-based flow keeps onboarding instant and eliminates a major drop-off point.

---

## AI and Machine Learning Integration

### Dynamic Premium Pricing

We use a risk scoring model trained on historical disruption data, zone-level weather patterns, delivery activity density, and seasonal flooding records. The model outputs a weekly risk score per zone, which maps directly to the premium tier. As the platform collects more data, the model refines its predictions — workers in genuinely low-risk micro-zones will see their premiums adjust downward over time.

Key input features:
- Rainfall intensity and frequency (last 6 months)
- Average AQI levels by zone
- Historical flood zone classification
- Delivery activity density (orders completed per km²)
- Seasonal disruption probability

### Fraud Detection

Claims are validated through a multi-signal fraud engine before any payout is released. The model looks at movement patterns, device signals, platform activity, and cross-worker behavior to produce a fraud risk score. GPS coordinates alone carry less than 20% weight in the final score — this is by design.

The scoring model is built on Isolation Forest for anomaly detection, combined with rule-based checks for known fraud patterns.

---

## Adversarial Defense and Anti-Spoofing Strategy

### The Threat

Organized fraud rings have demonstrated the ability to exploit basic parametric systems by using GPS spoofing applications to fake their location inside a disruption zone while sitting safely at home. A syndicate of even a few hundred workers doing this simultaneously can drain a platform's liquidity pool in hours.

Single-signal GPS verification is not sufficient. RiskShield-Gig uses a layered verification architecture where GPS is just one of many inputs.

### How We Tell Real from Fake

A genuine delivery worker caught in a disruption looks very different in data compared to someone spoofing their location from home. The table below captures the key behavioral differences our system exploits:

| Signal | Genuine Worker | GPS Spoofer |
|--------|---------------|-------------|
| Movement pattern | Natural two-wheeler speed and route | Static position or instant teleportation |
| Platform activity | Recent orders attempted or active | Zero platform activity |
| Device sensors | Accelerometer and gyroscope confirm motion | No sensor activity |
| Network consistency | Cell tower location matches GPS | Mismatch between GPS and network signal |
| Claim history | Consistent with past behavior | Sudden first-time claim during major event |

Each of these signals is weighted and combined into a single Fraud Risk Score between 0 and 100. A worker cannot easily fake all these dimensions simultaneously.

### Data Points Beyond GPS

**Location intelligence:** GPS coordinates are cross-validated against WiFi and cell tower triangulation. The worker must be within an active delivery zone, not just within a disruption zone boundary.

**Movement analysis:** We track speed and route continuity. A two-wheeler in a flooded zone moves slowly but consistently. A spoofed location is typically static or jumps distances that are physically impossible within the logged timeframe.

**Device signals:** We detect rooted devices, enabled mock location flags, and known GPS spoofing applications. Device IDs are tracked across sessions to flag new devices appearing only during high-claim events.

**Behavioral data:** We cross-reference delivery platform activity logs. A worker whose GPS says they were stuck in a flood zone but who had zero active orders and no login activity in the prior two hours is treated as a high-risk claim.

**Crowd intelligence:** We compare a flagged worker's claim against the pattern of nearby verified workers. If 90% of workers in the same 2km radius show natural movement consistent with a genuine disruption, and one worker shows a completely static pattern, that is a strong anomaly signal. We also watch for coordinated claim spikes — dozens of workers submitting claims within seconds of each other from the same geo-cluster is a fraud ring signature.

### Handling Flagged Claims Fairly

Our biggest design constraint here is avoiding false positives. A genuine worker in heavy rain may have poor GPS signal, a slow network, and interrupted platform connectivity — all of which could superficially resemble a spoofed claim. We address this through a tiered response system rather than a binary approve/reject:

| Fraud Risk Score | Response | Worker Experience |
|-----------------|----------|------------------|
| 0 – 40 | Instant payout processed | No action needed from worker |
| 41 – 70 | Soft verification: OTP + selfie | 60-second step, clearly explained |
| 71 – 100 | Manual review queue (resolved within 24 hours) | Worker notified with reason and timeline |

Workers flagged in the medium band due to a likely network drop — rather than active spoofing — can submit a one-tap appeal that routes them to OTP-only verification instead of full manual review. Trust scores build over time, so a worker with 12 months of clean claim history is treated differently from an account created three days ago.

---

## System Architecture

```
Worker App (React PWA)
        |
   API Gateway
        |
Backend Services (Node.js / Spring Boot)
        |
  ______________________________
  |          |         |        |
Weather     AQI    Traffic   Platform
  API       API      API    Activity
        |
  AI Risk Engine (Python / Scikit-learn)
        |
  Parametric Trigger System
        |
  Fraud Detection Engine
        |
    Payout Engine
        |
  Payment Gateway (Razorpay Test / UPI Simulator)
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Progressive Web App) |
| Backend | Node.js with Express / Spring Boot |
| Database | PostgreSQL |
| AI / ML | Python — Scikit-learn (Isolation Forest, Random Forest) |
| Weather | OpenWeatherMap API (free tier) |
| Air Quality | CPCB / OpenAQ API |
| Traffic | Mock API (Google Maps in later phases) |
| Payments | Razorpay test mode / UPI simulator |

---

## Development Plan

**Phase 1 (Current) — Ideation and Foundation**
Research, persona definition, system architecture, premium model design, and adversarial defense strategy documented.

**Phase 2 — Automation and Protection**
Build core flows: worker registration, policy management, dynamic premium calculation, parametric trigger engine, and basic claims management. Integrate 3 to 5 live or mock disruption APIs.

**Phase 3 — Scale and Optimise**
Advanced fraud detection (GPS spoofing defense live), instant payout simulation via Razorpay test mode, intelligent dashboards for workers and insurers, final pitch preparation.

---

## Future Scope

- Blockchain-based claim audit trail for full transparency
- Live integration with Swiggy and Zomato platform APIs for real-time activity validation
- WhatsApp-based notifications and verification for workers who prefer it over the app
- Expansion to e-commerce (Amazon / Flipkart) and quick commerce (Zepto / Blinkit) delivery segments
- Personalized pricing based on individual earning history rather than zone averages alone

---

## Demo Video



---

## Team

**Prime AutoBots**

| Name | Role |
|------|------|
| Sanjith | |
| Vamsee Krishna | |
| Gade Naga Chetan |  |
| Yashwanth | |
