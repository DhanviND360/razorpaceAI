# ⚡ RazorPace AI
> **Agentic Commerce Infrastructure powered by Razorpay**  
> *"The next customer may not be human."*

---

## 🎯 The Problem

E-commerce is undergoing a foundational paradigm shift: **from human click funnels to autonomous AI buyer agents**. Instead of humans manually searching, opening comparison tabs, and typing card numbers into forms, autonomous agents will discover products, negotiate with merchants, and execute purchases on behalf of users.

However, today's commerce ecosystem faces three critical barriers:

1. **Catalog Incompatibility (Machine-Unfriendly Catalogs):** E-commerce stores are designed for human browsing (HTML/images), lacking standardized, machine-readable schemas and endpoints for autonomous agents to inspect, verify, and trust.
2. **Lost Merchant Revenue in Agentic Flows:** Traditional checkouts are static. When an AI agent buys a single product, merchants miss the high-margin opportunities of contextual upselling and cross-selling.
3. **Financial Safety & Hallucination Risks:** LLMs cannot be trusted to execute financial transactions without deterministic safety bounds. An agent hallucinating a price, exceeding a user's budget, or ordering out-of-stock items can cause real financial loss.

---

## 💡 What RazorPace AI Does

**RazorPace AI** is the intelligence and safety layer connecting autonomous AI agents with **Razorpay's payment infrastructure**. It makes merchants discoverable, understandable, and transactable by AI, while protecting customer budgets and driving merchant basket value.

```
┌────────────────────────────────────────────────────────┐
│               1. Autonomous Buyer Agent                │
│    (Intent Extraction • Catalog Audit • Product Search)│
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│           2. Merchant Growth Operator Engine           │
│ (Deterministic Upsell Deltas • Synergistic Cross-Sells)│
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│           3. 7 Deterministic Policy Gates              │
│(Budget Cap • Stock Verification • Price Tamper Check)  │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│           4. Human-in-the-Loop Approval                │
│  (State freezes until customer explicitly approves)    │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│        5. Cryptographic Razorpay Settlement            │
│  (Razorpay Orders API • HMAC-SHA256 Signature Verify)  │
└────────────────────────────────────────────────────────┘
```

---

## 🔑 Core Features & How It Solves the Problem

### 1. Catalog AI-Readability Evaluator (0–100 Scoring)
* **What it does:** Dynamically evaluates merchant catalogs across 10 weighted dimensions (Product Structure, Attribute Completeness, Price Clarity, Inventory Tracking, Variant Depth, Reviews, Policies, Transaction Readiness, Machine-Readable Endpoints, Data Fill Rate).
* **The Solution:** Non-AI-ready or fraudulent merchants are rejected before search queries execute, protecting buyer agents from unreliable data.

### 2. Dual-Agent LangGraph Architecture
* **Autonomous Buyer Agent:** Parses complex natural language (e.g., *"Find whey protein under ₹5000 for muscle building"*), extracts goals and budget constraints, audits merchants, and ranks products with explainable criteria.
* **Merchant Growth Agent:** Analyzes buyer intent and inventory in real time to recommend specification-driven upgrades (e.g., cold-filtered isolate with +4g protein) and discounted recovery bundles (e.g., 15% off electrolyte BCAAs) — without exceeding the user's budget.

### 3. Seven Deterministic Financial Policy Gates
Sits between the AI agent and the Razorpay payment rail with zero extra LLM hallucination risk:
1. **Budget Ceiling:** Enforces hard price bounds against customer limits.
2. **Minimum Order Value (MOV):** Ensures compliance with merchant thresholds.
3. **Maximum Order Value (MaxOV):** Blocks high-exposure unauthorized carts.
4. **Active Inventory Check:** Validates real-time warehouse stock.
5. **Price Integrity Check:** Compares cart unit prices directly with catalog truth to detect price tampering.
6. **Cart Item Validity:** Asserts non-zero quantities and valid items.
7. **Total Arithmetic Consistency:** Cryptographically checks `subtotal == sum(price * qty)`.

### 4. Human Approval Gate & Razorpay Settlement
* **Human-in-the-Loop:** Agent execution halts once the cart and policies are validated. Payment orders cannot be placed without explicit user confirmation.
* **Razorpay Payment Rails:** Uses the official Razorpay Node SDK to generate test orders, opens the standard checkout interface, and verifies payments on the server using **HMAC-SHA256 signatures**.

### 5. Operator Intelligence Dashboard
* Provides merchants with real-time telemetry on AI-driven GMV, incremental basket lift generated by the growth agent, catalog audit scores, and an immutable session audit trail.

---

## 🛠️ Tech Stack

- **Framework:** Next.js (App Router), React, TypeScript
- **Agent Orchestration:** LangGraph.js, LangChain Core
- **LLM Engine:** Groq (`openai/gpt-oss-120b` fallback-resilient model)
- **Payments:** Razorpay Node SDK & Razorpay Standard Checkout
- **Styling:** Modern dark-mode aesthetic with custom CSS tokens and Tailwind CSS
- **Icons:** Lucide React

---

## 🚀 Quick Start

### 1. Clone & Install Dependencies
```bash
git clone <repo-url>
cd razorpace-ai
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in the keys:
```env
# Razorpay Test Mode Credentials (https://dashboard.razorpay.com/app/keys)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx

# Groq API Key (https://console.groq.com/keys)
LLM_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to test:
- **`/`**: Overview, architecture, and live scenario quick-picks.
- **`/buyer`**: Interactive AI Buyer sandbox (search, growth offers, policy gate, Razorpay payment).
- **`/merchant`**: Merchant revenue analytics, catalog readiness audits, and audit logs.
