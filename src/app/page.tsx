import Link from 'next/link';
import { 
  ArrowRight, 
  ShieldCheck, 
  Cpu, 
  TrendingUp, 
  CheckCircle2, 
  Lock, 
  Activity, 
  FileCheck, 
  Scale 
} from 'lucide-react';

export default function Home() {
  return (
    <div className="dash-container" style={{ padding: '32px 24px 80px 24px' }}>
      {/* ============================================================ */}
      {/* 1. HERO SECTION: THE NEXT CUSTOMER MAY NOT BE HUMAN          */}
      {/* ============================================================ */}
      <section style={{ textAlign: 'center', marginBottom: '80px', paddingTop: '16px' }}>
        {/* Category Badge */}
        <div className="badge badge-indigo" style={{
          padding: '6px 14px',
          fontSize: '11px',
          letterSpacing: '0.06em',
          marginBottom: '28px',
        }}>
          <span style={{
            display: 'inline-block',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: 'var(--accent-primary)',
          }} />
          <span>Agentic Commerce Infrastructure</span>
          <span style={{ color: 'var(--border-strong)' }}>|</span>
          <span style={{ color: 'var(--accent-emerald)' }}>Powered by Razorpay</span>
        </div>

        {/* Primary Statement */}
        <h1 style={{
          fontSize: 'clamp(36px, 5.5vw, 64px)',
          fontWeight: 800,
          lineHeight: 1.08,
          letterSpacing: '-0.04em',
          color: '#ffffff',
          maxWidth: '960px',
          margin: '0 auto 20px auto',
        }}>
          THE NEXT CUSTOMER<br />
          <span style={{
            background: 'linear-gradient(180deg, #ffffff 40%, #71717a 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            MAY NOT BE HUMAN.
          </span>
        </h1>

        {/* Supporting Copy */}
        <p style={{
          fontSize: 'clamp(15px, 2vw, 18px)',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          maxWidth: '720px',
          margin: '0 auto 36px auto',
          letterSpacing: '-0.01em',
        }}>
          Make your merchant discoverable, understandable and transactable by AI — while your growth agent turns relevant intent into higher-value purchases.
        </p>

        {/* Primary Actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          flexWrap: 'wrap',
          marginBottom: '48px',
        }}>
          <Link
            href="/buyer"
            className="btn-primary"
            style={{
              padding: '12px 26px',
              fontSize: '13px',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <span>Enter Sandbox</span>
            <ArrowRight size={14} strokeWidth={2} />
          </Link>

          <Link
            href="/merchant"
            className="btn-secondary"
            style={{
              padding: '12px 24px',
              fontSize: '13px',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <Activity size={14} strokeWidth={1.75} color="var(--accent-emerald)" />
            <span>Operator Dashboard</span>
          </Link>
        </div>

        {/* Fintech Metric Ticker */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '24px',
          padding: '10px 20px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-hairline)',
          fontSize: '12px',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-muted)',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: 'var(--accent-primary)' }}>₹</span>
            <span>Deterministic Growth Engine</span>
          </div>
          <span style={{ color: 'var(--border-hairline)' }}>•</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={13} color="var(--accent-emerald)" strokeWidth={1.75} />
            <span>7 Financial Policy Gates</span>
          </div>
          <span style={{ color: 'var(--border-hairline)' }}>•</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Lock size={12} color="var(--accent-amber)" strokeWidth={1.75} />
            <span>HMAC-SHA256 Razorpay Settlement</span>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. THE PARADIGM SHIFT: CLICKS TO CONVERSATIONS              */}
      {/* ============================================================ */}
      <section style={{ marginBottom: '88px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--accent-primary)',
            marginBottom: '8px',
          }}>
            Macro Industry Shift
          </div>
          <h2 style={{
            fontSize: 'clamp(24px, 3.5vw, 36px)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: '#fff',
            margin: 0,
          }}>
            COMMERCE IS MOVING FROM CLICKS TO CONVERSATIONS.
          </h2>
          <p style={{
            fontSize: '15px',
            color: 'var(--text-secondary)',
            maxWidth: '640px',
            margin: '12px auto 0 auto',
            lineHeight: 1.5,
          }}>
            Artificial intelligence is becoming the new interface between buyers and merchants. Traditional browsing funnels are collapsing into real-time multi-agent negotiation.
          </p>
        </div>

        {/* Funnel Comparison: Traditional vs Emerging */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
        }}>
          {/* Traditional Card */}
          <div className="bento-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
              }}>
                <span style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--text-muted)',
                }}>
                  Legacy Web Paradigm
                </span>
                <span className="badge" style={{
                  fontSize: '10px',
                  padding: '2px 8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--text-faint)',
                }}>
                  HUMAN-INITIATED
                </span>
              </div>

              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Traditional Click Funnel
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.5 }}>
                Users manually search, browse pagination, compare browser tabs, manually add to cart, and enter card details through high-friction static checkouts.
              </p>
            </div>

            {/* Sequence Flow */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--text-muted)',
            }}>
              {['Search Query', 'Website Navigation', 'Product Inspection', 'Cart Assembly', 'Form Checkout', 'Manual Payment'].map((step, idx) => (
                <div key={idx} className="bento-card-inner" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                }}>
                  <span style={{ color: 'var(--text-faint)', width: '16px' }}>0{idx + 1}</span>
                  <span style={{ color: '#d4d4d8' }}>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Emerging Agentic Card */}
          <div className="bento-card" style={{
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            border: '1px solid rgba(99, 102, 241, 0.35)',
            background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.05) 0%, rgba(17, 17, 21, 1) 100%)',
          }}>
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
              }}>
                <span style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--accent-primary)',
                }}>
                  Emerging Architecture
                </span>
                <span className="badge badge-indigo" style={{
                  fontSize: '10px',
                  padding: '2px 8px',
                }}>
                  AGENT-TO-AGENT
                </span>
              </div>

              <div style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
                Autonomous Commerce Flow
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.5 }}>
                Buyer agents express natural intent, evaluate machine-readable merchant catalogs, negotiate real-time upgrades with merchant agents, and settle through gated Razorpay rails.
              </p>
            </div>

            {/* Sequence Flow */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
            }}>
              {[
                { title: 'User Intent Extraction', note: 'Natural language goal + budget limits' },
                { title: 'AI Buyer Discovery', note: 'Catalog readiness audit & ranking' },
                { title: 'Heuristic Product Selection', note: 'Specs, reviews & active inventory' },
                { title: 'Merchant Growth Negotiation', note: 'Deterministic upsell & recovery bundle' },
                { title: 'Deterministic Policy Gate', note: '7 safety checks, zero hallucination' },
                { title: 'Razorpay Cryptographic Settlement', note: 'HMAC-SHA256 signature verification' },
              ].map((step, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  background: 'rgba(99, 102, 241, 0.06)',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid rgba(99, 102, 241, 0.18)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'var(--accent-primary)', width: '16px', fontWeight: 600 }}>0{idx + 1}</span>
                    <span style={{ color: '#fff', fontWeight: 500 }}>{step.title}</span>
                  </div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{step.note}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. THE RAZORPAY CONNECTION: THE INTELLIGENCE LAYER          */}
      {/* ============================================================ */}
      <section className="bento-card" style={{
        marginBottom: '88px',
        padding: '36px',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '32px',
          alignItems: 'center',
        }}>
          <div>
            <div className="badge badge-emerald" style={{
              fontSize: '11px',
              marginBottom: '12px',
            }}>
              Strategic Ecosystem Positioning
            </div>
            <h2 style={{
              fontSize: '26px',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              color: '#fff',
              lineHeight: 1.25,
              marginBottom: '16px',
            }}>
              THE INTELLIGENCE LAYER BETWEEN AI COMMERCE AND RAZORPAY PAYMENTS.
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
              Razorpay provides the trusted payment infrastructure for the agentic era — bounded tokenization, authenticated checkout, and high-speed settlement.
            </p>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
              <strong>RazorPace AI</strong> is the merchant enablement engine: making catalog schemas machine-readable, evaluating AI readiness, and operating autonomous growth agents that increase transaction value before the Razorpay payment rail is called.
            </p>

            <div style={{
              display: 'flex',
              gap: '16px',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              flexWrap: 'wrap',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fff' }}>
                <CheckCircle2 size={14} color="var(--accent-emerald)" />
                <span>AI-Ready MCP Schemas</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fff' }}>
                <CheckCircle2 size={14} color="var(--accent-emerald)" />
                <span>Zero-Latency Growth Engine</span>
              </div>
            </div>
          </div>

          {/* Architecture Visual Stack */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.5)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-hairline)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}>
            {/* Top Layer */}
            <div className="bento-card-inner" style={{ padding: '12px 16px' }}>
              <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '4px' }}>
                LAYER 01 / CLIENT INTENT
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>
                Autonomous Buyer & Conversational Agents
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                LangGraph.js • Model Context Protocol (MCP) • User Goal Extraction
              </div>
            </div>

            {/* Connecting line */}
            <div style={{ textAlign: 'center', color: 'var(--text-faint)', fontSize: '11px' }}>↓</div>

            {/* Middle Layer (RazorPace) */}
            <div style={{
              padding: '14px 16px',
              background: 'rgba(99, 102, 241, 0.08)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(99, 102, 241, 0.4)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)', fontWeight: 600 }}>
                  LAYER 02 / RAZORPACE INTELLIGENCE
                </div>
                <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', background: 'var(--accent-primary)', color: '#fff', padding: '1px 6px', borderRadius: '3px' }}>
                  CORE ENGINE
                </span>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', marginTop: '4px' }}>
                Merchant Readiness, Growth & Policy Control
              </div>
              <div style={{ fontSize: '11px', color: '#c7d2fe', marginTop: '4px', lineHeight: 1.4 }}>
                Catalog Readability (0–100) • Heuristic Upsell & Recovery Bundling • 7 Hard Policy Bounds
              </div>
            </div>

            {/* Connecting line */}
            <div style={{ textAlign: 'center', color: 'var(--text-faint)', fontSize: '11px' }}>↓</div>

            {/* Bottom Layer (Razorpay) */}
            <div style={{
              padding: '12px 16px',
              background: 'rgba(16, 185, 129, 0.06)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
            }}>
              <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)', marginBottom: '4px' }}>
                LAYER 03 / PAYMENT INFRASTRUCTURE
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>
                Razorpay Agentic Payments & Settlement
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Official Razorpay Node SDK • HMAC-SHA256 Signatures • Standard Checkout
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. THE DUAL-AGENT ENGINE: BENTO GRID ARCHITECTURE           */}
      {/* ============================================================ */}
      <section style={{ marginBottom: '88px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div className="badge badge-indigo" style={{
            fontSize: '11px',
            marginBottom: '12px',
          }}>
            Dual-Agent Orchestration
          </div>
          <h2 style={{
            fontSize: 'clamp(24px, 3.5vw, 36px)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: '#fff',
            margin: 0,
          }}>
            TWO AGENTS. ONE COHESIVE SYSTEM.
          </h2>
          <p style={{
            fontSize: '15px',
            color: 'var(--text-secondary)',
            maxWidth: '600px',
            margin: '12px auto 0 auto',
            lineHeight: 1.6,
          }}>
            An autonomous buyer executing for the consumer, and a growth operator expanding basket value for the merchant.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '20px',
        }}>
          {/* Agent 1: Merchant Growth Agent */}
          <div className="bento-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
              }}>
                <TrendingUp size={20} color="var(--accent-emerald)" strokeWidth={2} />
              </div>

              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 600 }}>
                Merchant Operator Agent
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
                &quot;Turn intent into revenue.&quot;
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
                Analyzes incoming buyer requests against real merchant inventory, customer purchase history, and formulation specifications to inject deterministic upsells and cross-sell bundles.
              </p>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              borderTop: '1px solid var(--border-hairline)',
              paddingTop: '20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>•</span>
                <span style={{ fontSize: '12px', color: '#d4d4d8' }}>
                  <strong>Intelligent Upsell:</strong> Suggests cold-filtered isolate upgrades with concrete specification deltas (+4g protein, enzymes).
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>•</span>
                <span style={{ fontSize: '12px', color: '#d4d4d8' }}>
                  <strong>Recovery Cross-Sell:</strong> Bundles post-workout electrolytes & BCAAs with an instant 15% incentive to accelerate recovery.
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>•</span>
                <span style={{ fontSize: '12px', color: '#d4d4d8' }}>
                  <strong>Zero-LLM Reliability:</strong> Deterministic rule engine guarantees zero extra latency and 100% budget adherence.
                </span>
              </div>
            </div>
          </div>

          {/* Agent 2: AI Buyer */}
          <div className="bento-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
              }}>
                <Cpu size={20} color="var(--accent-primary)" strokeWidth={2} />
              </div>

              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 600 }}>
                Autonomous Buyer Agent
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
                &quot;Turn intent into action.&quot;
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
                Parses complex natural language shopping requirements, audits merchant catalog readiness, filters fraudulent listings, compares parameters, and orchestrates settlement.
              </p>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              borderTop: '1px solid var(--border-hairline)',
              paddingTop: '20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>•</span>
                <span style={{ fontSize: '12px', color: '#d4d4d8' }}>
                  <strong>Catalog Readiness Evaluation:</strong> Rejects unverified, non-AI ready merchants before executing search queries.
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>•</span>
                <span style={{ fontSize: '12px', color: '#d4d4d8' }}>
                  <strong>Transparent Comparison:</strong> Explains selections through price, trust rating, stock availability, and user history.
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>•</span>
                <span style={{ fontSize: '12px', color: '#d4d4d8' }}>
                  <strong>Human Approval Gating:</strong> Freezes financial state until the user approves the order and checkout total.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. TRUST & CONTROL: INFRASTRUCTURE PILLARS                   */}
      {/* ============================================================ */}
      <section style={{ marginBottom: '88px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div className="badge badge-emerald" style={{
            fontSize: '11px',
            marginBottom: '12px',
          }}>
            Institutional Trust Architecture
          </div>
          <h2 style={{
            fontSize: 'clamp(24px, 3.5vw, 36px)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: '#fff',
            margin: 0,
          }}>
            FINANCIAL SAFETY AT AGENT SPEED.
          </h2>
          <p style={{
            fontSize: '15px',
            color: 'var(--text-secondary)',
            maxWidth: '600px',
            margin: '12px auto 0 auto',
            lineHeight: 1.6,
          }}>
            Autonomous agents must never hallucinate financial transactions. RazorPace enforces four immutable engineering boundaries:
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
        }}>
          {/* Pillar 1 */}
          <div className="bento-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--accent-blue)',
                textTransform: 'uppercase',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 600,
              }}>
                <Scale size={13} />
                <span>01 / BOUNDED</span>
              </div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
                Hard Financial Bounds
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                Strict ceiling constraints prevent cart total from ever exceeding customer budget. Price changes above threshold abort execution instantly.
              </p>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="bento-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--accent-amber)',
                textTransform: 'uppercase',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 600,
              }}>
                <Lock size={13} />
                <span>02 / GATED</span>
              </div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
                Human Approval Gate
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                Payment tokens are never generated autonomously. LangGraph state freezes until explicit user authorization triggers the Razorpay order creation.
              </p>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="bento-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--accent-primary)',
                textTransform: 'uppercase',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 600,
              }}>
                <FileCheck size={13} />
                <span>03 / EXPLAINABLE</span>
              </div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
                Deterministic Reasoning
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                Every product selection, upgrade recommendation, and cross-sell bundle includes verifiable reasoning: specs, rating count, and inventory status.
              </p>
            </div>
          </div>

          {/* Pillar 4 */}
          <div className="bento-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--accent-emerald)',
                textTransform: 'uppercase',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 600,
              }}>
                <ShieldCheck size={13} />
                <span>04 / AUDITABLE</span>
              </div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
                Chronological Audit Trail
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                Every subagent decision, catalog probe, and Razorpay signature check is recorded into an immutable session ledger accessible via telemetry API.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. SANDBOX LAUNCHER / JUDGE QUICK-START                      */}
      {/* ============================================================ */}
      <section className="bento-card" style={{
        padding: '36px',
        background: 'linear-gradient(180deg, #121216 0%, #0c0c0e 100%)',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '24px',
          marginBottom: '28px',
        }}>
          <div>
            <div className="badge badge-indigo" style={{
              fontSize: '11px',
              marginBottom: '10px',
            }}>
              Interactive Verification Sandbox
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', margin: 0 }}>
              Test the Autonomous Commerce Flow Live
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '6px 0 0 0' }}>
              Select a test scenario below to experience catalog discovery, heuristic upselling, recovery bundling, and live Razorpay checkout:
            </p>
          </div>

          <Link
            href="/buyer"
            className="btn-primary"
            style={{
              padding: '10px 20px',
              fontSize: '13px',
            }}
          >
            <span>Launch Buyer Console</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Quick-Picks Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '14px',
        }}>
          <Link
            href="/buyer"
            className="bento-card-inner"
            style={{
              padding: '16px',
              transition: 'all 0.2s ease',
              display: 'block',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                PRIMARY BENCHMARK
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>₹5,000 Cap</span>
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '6px' }}>
              &quot;I want to buy protein powder under 5000 for muscle building&quot;
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Triggers HerbaMed discovery, Premium Whey Isolate upgrade (+₹700), and Recovery Supplement bundle (-15%).
            </div>
          </Link>

          <Link
            href="/buyer"
            className="bento-card-inner"
            style={{
              padding: '16px',
              transition: 'all 0.2s ease',
              display: 'block',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent-blue)', fontWeight: 600 }}>
                CROSS-MERCHANT AUDIT
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Quality Gate</span>
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '6px' }}>
              &quot;Find me verified post-workout recovery supplements&quot;
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Demonstrates automatic rejection of unverified merchants (HealthKart 51%, WellnessHub 23%) and policy gating.
            </div>
          </Link>

          <Link
            href="/merchant"
            className="bento-card-inner"
            style={{
              padding: '16px',
              transition: 'all 0.2s ease',
              display: 'block',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent-amber)', fontWeight: 600 }}>
                MERCHANT TELEMETRY
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Real Data</span>
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '6px' }}>
              Open Operator Financial Analytics
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Inspect live AI-influenced revenue, incremental basket lift, catalog readiness audits, and complete session logs.
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
