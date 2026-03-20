# RiskShield-Gig 🛡️

**AI-Powered Parametric Insurance for Gig Delivery Workers**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Guidewire DEVTrails](https://img.shields.io/badge/Hackathon-Guidewire%20DEVTrails-blueviolet)](https://devtrails.guidewire.com/)

Guidewire DEVTrails 2026 | Team: Prime AutoBots

---

## 📌 The Problem

India has over 12 million gig delivery workers. Most of them earn between ₹10,000 and ₹15,000 a month - roughly ₹600 to ₹800 a day - working for platforms like Swiggy and Zomato. When a heavy rainstorm hits, when a city-wide curfew is announced, or when flooding shuts down entire zones, these workers simply stop earning. There is no compensation. No claim to file. No safety net.

A worker in Hyderabad during the 2024 monsoon season could lose 8 to 10 working days. That is anywhere between ₹4,800 and ₹8,000 gone - with no recourse. Traditional insurance products do not address this. They are too expensive, too complex, and built for a workforce that earns a salary, not a daily wage.

**RiskShield-Gig exists to close that gap.**

---

## 💡 Proposed Solution

RiskShield-Gig is a parametric insurance platform that monitors real-world disruption events - weather, pollution, curfews - and automatically pays out to affected workers the moment a verified trigger is hit. No forms. No manual claims. No waiting.

The worker pays a small weekly premium. When a covered disruption occurs in their active zone, the system detects it, validates it, and transfers money to their UPI account - often within minutes.

> **Important:** This system strictly focuses on **income loss protection only**, excluding health, life, or vehicle-related coverage, as per hackathon constraints.

---

## 👤 Target Persona

**Segment:** Food delivery partners on Swiggy and Zomato
**Geography:** Urban Hyderabad and Guntur
**Income profile:** ₹600–800/day, week-to-week earners
**Insurance awareness:** Very low. Most have never held an insurance policy.
**Device access:** Android smartphone, UPI-enabled bank account

**A day in Raju's life:**
Raju is a Swiggy delivery partner based in Kondapur, Hyderabad. He logs in at 10 AM and typically completes 12 to 15 deliveries by 9 PM. On a good week he takes home around ₹4,500. During monsoon season, there are weeks where he cannot step out at all. Last July, he lost four straight days to flooding. ₹2,800 gone. His rent does not pause for the rain. RiskShield-Gig would have detected the flood alert, verified Raju's active zone, and paid him automatically - before he even knew a claim had been processed.

---

## 🔄 How the Platform Works

### 📋 Application Workflow

The platform follows a six-step lifecycle from registration to payout:

**Step 1 — Registration and KYC**
The worker signs up using their phone number and completes a lightweight KYC: Aadhaar number, delivery platform ID, and UPI handle. The AI engine pulls zone data and delivery history to build an initial risk profile. The process takes under three minutes.

**Step 2 — Risk Profiling and Premium Assignment**
Once registered, the AI model scores the worker's zone based on historical disruption data, seasonal weather patterns, and AQI levels. A weekly premium (₹20 / ₹30 / ₹40) is assigned based on the zone risk level.

**Step 3 — Weekly Subscription**
The worker reviews their premium and subscribes. Premiums are deducted automatically every Monday. Coverage is active for that calendar week the moment payment is confirmed.

**Step 4 — Continuous Disruption Monitoring**
The system polls external APIs every 15 minutes. When a trigger threshold is crossed in a zone with active subscribers, the claim pipeline is initiated automatically. No worker action is required.

**Step 5 — Fraud Validation**
Before any payout is released, the fraud engine calculates a risk score using movement data, device signals, platform activity, and crowd intelligence. Claims scoring below 40 are approved instantly. Claims scoring above 40 enter soft or manual verification.

**Step 6 — Instant Payout**
Validated claims are paid out to the worker's UPI handle within minutes. The worker receives a push notification confirming the amount and the trigger that caused it.

![RiskShield-Gig Worker Claim Process](https://raw.githubusercontent.com/Mekala-Sanjith3/RiskShield-Gig/main/frontend/public/Worker%20Claim%20Process.png)

### 🧾 Onboarding
A new worker signs up using their phone number and completes a lightweight KYC - just their Aadhaar number, delivery platform ID, and UPI handle. The AI engine pulls their zone data and delivery history to build an initial risk profile.

### 💼 Weekly Premium Subscription
Once onboarded, the worker is shown their weekly premium based on their zone risk level. Premiums are deducted automatically each Monday. Premiums are capped at approximately 5% of average weekly income to keep the product genuinely affordable.

| Risk Level | Weekly Premium | Basis |
|------------|---------------|-------|
| Low | ₹20 | Zone with historically low disruption frequency |
| Medium | ₹30 | Moderate flood or AQI risk history |
| High | ₹40 | Flood-prone or high-pollution zones |

### 💰 Payout Calculation

```
Payout = (Average Daily Earnings × Disruption Hours Lost) / Standard Working Hours
```
- Capped at **₹500 per disruption day**
- Maximum weekly payout: **₹2,500**

### ⚡ Disruption Monitoring & Parametric Triggers
The system runs continuous checks against live data feeds. When a parameter crosses a defined threshold, the claim pipeline is triggered automatically — no worker intervention needed.

| Trigger Event | Threshold | Data Source |
|---------------|-----------|-------------|
| Heavy rainfall | Above 50mm/hr | OpenWeatherMap |
| Severe air pollution | AQI above 350 | CPCB / OpenAQ |
| Flood alert | Red alert issued | IMD / State disaster APIs |
| Curfew or zone shutdown | Official notification confirmed | Government / news APIs |
| Platform outage | Delivery platform unavailable | Mock platform health API |

*If the trigger condition is met, the system assumes income loss and prepares the payout. This ensures a **zero-touch claim system**, where payouts are automatically triggered based on predefined external conditions without any manual intervention.*

---

## 🌐 Platform Choice: Web Application

We chose a **web application** over a native mobile app for the following reasons:

- **No install friction** — Workers access via smartphone browser. No app store download required.
- **Faster development** — A single React TypeScript codebase serves all devices within a 6-week sprint.
- **PWA capability** — Workers can add RiskShield-Gig to their home screen for an app-like experience with offline support and push notifications.
- **Accessibility** — Works on any Android smartphone with a browser, regardless of OS version or storage constraints.

---

## 📊 Key Platform Features (Aligned with Hackathon Requirements)

### 🧾 1. User Onboarding
- Delivery workers can register with basic details (location, platform, working zone)
- Personalized risk profiling is initialized at onboarding

---

### 💼 2. Policy Creation
- Workers can select weekly insurance plans
- AI dynamically calculates premium based on risk factors

---

### ⚡ 3. Automated Claim Triggering
- Claims are triggered automatically when parametric conditions are met
- No manual claim filing required

---

### 💸 4. Instant Payout System
- Once validated, payouts are processed instantly to worker wallets (simulated)
- Zero paperwork, zero delay

---

### 📊 5. Analytics Dashboard

#### For Workers:
- Weekly earnings protected
- Active coverage status
- Claim history

#### For Admin (Insurer):
- Fraud detection alerts
- Claim statistics and loss ratios
- Risk predictions for upcoming disruptions

---

## 🧠 AI and Machine Learning Integration

### Dynamic Premium Pricing
We use a risk scoring model trained on historical disruption data, zone-level weather patterns, and seasonal flooding records. The model outputs a weekly risk score per zone that maps directly to the premium tier. As the platform accumulates real claim data, the model refines zone-level predictions.

Key input features:
- Rainfall intensity and frequency (last 6 months)
- Average AQI levels by zone
- Historical flood zone classification
- Delivery activity density (orders completed per km²)
- Seasonal disruption probability score

### Fraud Detection
Claims are validated through a multi-signal fraud engine. The model looks at movement patterns, device signals, platform activity, and cross-worker behavior. GPS coordinates carry less than 20% weight in the final fraud risk score — the remaining weight comes from behavioral signals that a spoofer cannot easily fake.

The scoring model is built on **Isolation Forest** for anomaly detection, combined with rule-based checks for known fraud patterns. The model is retrained weekly on new claim data.

---

## 🛡️ Adversarial Defense and Anti-Spoofing Strategy

In a high-stakes parametric system, **GPS Spoofing** is the primary threat. A syndicate of bad actors using GPS spoofing apps to fake their location inside a disruption zone — while sitting safely at home — can drain a platform's liquidity pool in hours. RiskShield-Gig uses a layered verification architecture where GPS is just one of many inputs.

### ✅ How We Tell Real from Fake

| Signal | Genuine Worker | GPS Spoofer |
|--------|---------------|-------------|
| Movement pattern | Natural two-wheeler speed and route | Static position or instant teleportation |
| Platform activity | Recent orders attempted or active | Zero platform activity |
| Device sensors | Accelerometer and gyroscope confirm motion | No sensor activity |
| Network consistency | Cell tower location matches GPS | Mismatch between GPS and network signal |
| Claim history | Consistent with past behavior | Sudden first-time claim during major event |

### 📊 Data Points Beyond GPS
- **Location intelligence:** Cross-validated against WiFi and cell tower triangulation. Worker must be within an active delivery zone, not just within a disruption boundary.
- **Movement analysis:** Tracks speed and route continuity. Sudden location jumps of 5km+ in under 1 minute are flagged immediately.
- **Device signals:** Detects rooted devices, mock location flags, and known spoofing apps. Device IDs tracked across sessions.
- **Behavioral data:** Cross-references delivery platform activity logs. Zero orders + no login + static GPS = high fraud score.
- **Crowd intelligence:** Compares flagged worker claims against nearby verified workers. Coordinated claim spikes from the same geo-cluster trigger a fraud ring alert.

### 🧠 Fraud Detection Model
We use **Isolation Forest** (unsupervised anomaly detection) to catch:
- Sudden location jumps inconsistent with physical travel
- Identical claim patterns replicated across multiple users
- Synchronized claim submissions from a geo-cluster (coordinated fraud ring signal)

### ⚖️ UX Balance — Handling Flagged Claims Fairly

A genuine worker in heavy rain may have poor GPS signal and interrupted connectivity — which looks identical to spoofing on the surface. We address this through a tiered response system:

| Fraud Risk Score | Response | Worker Experience |
|-----------------|----------|------------------|
| 0 – 40 | ✅ Instant payout processed | No action needed from worker |
| 41 – 70 | 🔔 Soft verification: OTP + selfie | 60-second step, clearly explained |
| 71 – 100 | 🔍 Manual review queue (24hr) | Worker notified with reason and appeal option |

Workers flagged in the medium band due to a genuine network drop can submit a one-tap appeal — routed to OTP-only verification instead of full manual review. Trust scores build over time with clean claim history.

### 🔒 Additional Security Measures
- Rate limiting: maximum 2 claims per worker per week
- Dynamic trust score that builds with clean claim history
- Device blacklisting for confirmed fraud devices
- Progressive penalties: warning → temporary suspension → permanent ban

---

## ⚙️ System Architecture

![RiskShield-Gig System Architecture](https://raw.githubusercontent.com/Mekala-Sanjith3/RiskShield-Gig/main/frontend/public/System%20Architecture.png)

### 🔗 API Flow

```text
+---------------------------+
|   Worker App              |
|   React + TypeScript PWA  |
+-------------+-------------+
              |
       +------v------+
       |  API Gateway |
       +------+------+
              |
+-------------v--------------+
|   Backend Services          |
|   Node.js / Spring Boot     |
+---+--------+--------+-------+
    |        |        |       |
    v        v        v       v
Weather    AQI    Traffic  Platform
  API      API     API    Activity
              |
    +---------v----------+
    |  AI Risk Engine     |
    |  Python / Sklearn   |
    +---------+----------+
              |
    +---------v----------+
    | Parametric Trigger  |
    |      System         |
    +---------+----------+
              |
    +---------v----------+
    | Fraud Detection     |
    |     Engine          |
    +---------+----------+
              |
    +---------v----------+
    |   Payout Engine     |
    +---------+----------+
              |
    +---------v----------+
    | Razorpay Test Mode  |
    |   / UPI Simulator   |
    +--------------------+
              |
    +---------v----------+
    |   MySQL Database    |
    | (Users, Policies,   |
    |  Claims, Scores)    |
    +--------------------+
```

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React with TypeScript (TSX), Vite, Tailwind CSS (PWA) |
| Backend | Node.js with Express / Spring Boot |
| Database | MySQL |
| AI / ML | Python — Scikit-learn (Isolation Forest, Random Forest) |
| Weather | OpenWeatherMap API (free tier) |
| Air Quality | CPCB / OpenAQ API |
| Mapping | Mapbox (free tier) |
| Payments | Razorpay test mode / UPI simulator |

---

## 🗓️ Development Plan

### Phase 1 — Ideation and Foundation (Weeks 1–2, Current)
Research and persona definition complete. System architecture designed. Weekly premium model and payout formula defined. Parametric triggers identified with thresholds and data sources. Adversarial defense strategy documented. Tech stack finalized. GitHub repository initialized.

### Phase 2 — Automation and Protection (Weeks 3–4)
Build and ship core flows:
- Worker registration, KYC, and onboarding
- Insurance policy creation and weekly subscription management
- Dynamic premium calculation using the AI risk model
- Parametric trigger engine connected to 3–5 live or mock disruption APIs
- Claims management with automated initiation
- Basic fraud detection pipeline active

### Phase 3 — Scale and Optimise (Weeks 5–6)
- Advanced fraud detection with GPS spoofing defense live in production
- Instant payout simulation via Razorpay test mode and UPI simulator
- Worker dashboard: earnings protected, active coverage, claim history
- Admin dashboard: loss ratios, fraud alerts, predictive disruption analytics
- Final pitch deck and 5-minute demo video prepared for DemoJam at DevSummit 2026

---

## 🚀 Future Scope

- **Blockchain-based claim audit trail** for full transparency and regulatory compliance.
- **Live integration with Swiggy/Zomato APIs** for real-time activity validation.
- **WhatsApp-based notifications** and verification for improved accessibility.
- **Expansion to E-commerce delivery** (Amazon, Flipkart, Zepto, Blinkit).
- **Personalized premium pricing** based on individual earning patterns rather than zone averages alone.

---

## 🎥 Demo Video

[Watch our Phase 1 Demo](https://youtu.be/RnA6Skhpx0M)

---

## 👥 Team Prime AutoBots

| Name | Role |
|------|------|
| Sanjith | Lead Developer |
| Vamsee Krishna | AI & Security Specialist |
| Gade Naga Chetan | Frontend Developer |
| Yashwanth | Backend Developer |