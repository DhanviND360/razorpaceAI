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
  Scale,
  Zap,
  Bot,
  BarChart3,
} from 'lucide-react';

export default function Home() {
  return (
    <div className="dash-container" style={{ padding: '32px 24px 80px 24px' }}>
      {/* ============================================================ */}
      {/* 1. HERO SECTION: THE NEXT CUSTOMER MAY NOT BE HUMAN          */}
      {/* ============================================================ */}
      <section style={{ textAlign: 'center', marginBottom: '64px', paddingTop: '16px' }}>
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

        {/* Primary CTA Buttons */}
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
              padding: '14px 32px',
              fontSize: '14px',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 600,
            }}
          >
            <Cpu size={16} strokeWidth={2} />
            <span>Try the AI Buyer Agent</span>
            <ArrowRight size={14} strokeWidth={2} />
          </Link>

          <Link
            href="/merchant"
            className="btn-secondary"
            style={{
              padding: '14px 28px',
              fontSize: '14px',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 600,
            }}
          >
            <Activity size={14} strokeWidth={1.75} color="var(--accent-emerald)" />
            <span>Merchant Operator Dashboard</span>
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
      {/* 2. RAZORPACE AI — THE CENTERPIECE SOLUTION SECTION            */}
      {/* ============================================================ */}
      <section style={{
        marginBottom: '88px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.08) 0%, rgba(9, 9, 11, 1) 60%)',
        padding: '56px 36px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Ambient Glow Behind Logo */}
        <div style={{
          position: 'absolute',
          top: '-60px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '500px',
          height: '200px',
          background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.2), transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {/* Logo Icon */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '72px',
            height: '72px',
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0.05) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            marginBottom: '24px',
            boxShadow: '0 0 60px rgba(99, 102, 241, 0.15)',
          }}>
            <span style={{
              fontSize: '32px',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              background: 'linear-gradient(135deg, #818cf8, #6366f1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>₹</span>
          </div>

          {/* Brand Name */}
          <div style={{ marginBottom: '8px' }}>
            <span style={{
              fontSize: 'clamp(32px, 5vw, 52px)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              background: 'linear-gradient(135deg, #ffffff 0%, #818cf8 50%, #6366f1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              RAZORPACE
            </span>
            <span style={{
              fontSize: 'clamp(32px, 5vw, 52px)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              color: 'var(--accent-primary)',
              marginLeft: '12px',
            }}>
              AI
            </span>
          </div>

          {/* Subtitle */}
          <div style={{
            fontSize: '13px',
            fontFamily: 'var(--font-mono)',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            color: 'var(--text-muted)',
            marginBottom: '24px',
          }}>
            Merchant Enablement Engine for Agentic Commerce
          </div>

          {/* Description */}
          <p style={{
            fontSize: '16px',
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
            maxWidth: '720px',
            margin: '0 auto 36px auto',
          }}>
            The intelligence layer between AI commerce and Razorpay payments. 
            RazorPace makes merchant catalogs machine-readable, evaluates AI readiness, 
            and operates autonomous growth agents that increase transaction value — before 
            the Razorpay payment rail is called.
          </p>

          {/* Core Capabilities Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            maxWidth: '800px',
            margin: '0 auto 40px auto',
          }}>
            {[
              { icon: <Bot size={18} color="var(--accent-primary)" />, title: 'Dual-Agent System', desc: 'Buyer agent + merchant growth operator' },
              { icon: <Zap size={18} color="var(--accent-amber)" />, title: 'Zero-LLM Engine', desc: 'Deterministic heuristic upsell & bundling' },
              { icon: <ShieldCheck size={18} color="var(--accent-emerald)" />, title: '7 Policy Gates', desc: 'Hard financial bounds, zero hallucination' },
              { icon: <BarChart3 size={18} color="var(--accent-blue)" />, title: 'Real-time Analytics', desc: 'Live telemetry & session audit trail' },
            ].map((item, i) => (
              <div key={i} style={{
                padding: '20px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-hairline)',
                textAlign: 'center',
              }}>
                <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'center' }}>{item.icon}</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>{item.title}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4 }}>{item.desc}</div>
              </div>
            ))}
          </div>

          {/* Architecture Visual Stack */}
          <div style={{
            maxWidth: '640px',
            margin: '0 auto',
            background: 'rgba(0, 0, 0, 0.4)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-hairline)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}>
            {/* Top Layer */}
            <div style={{
              padding: '12px 16px',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-hairline)',
            }}>
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

            {/* Middle Layer (RazorPace) — Highlighted */}
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
      {/* 3. THE PARADIGM SHIFT: CLICKS TO CONVERSATIONS               */}
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

            {/* CTA to Merchant Dashboard */}
            <Link
              href="/merchant"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '20px',
                padding: '10px 16px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--accent-emerald)',
                transition: 'all 0.2s ease',
                justifyContent: 'center',
              }}
            >
              <Activity size={14} />
              <span>Open Operator Dashboard</span>
              <ArrowRight size={12} />
            </Link>
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

            {/* CTA to Buyer Console */}
            <Link
              href="/buyer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '20px',
                padding: '10px 16px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--accent-primary)',
                transition: 'all 0.2s ease',
                justifyContent: 'center',
              }}
            >
              <Cpu size={14} />
              <span>Launch Buyer Console</span>
              <ArrowRight size={12} />
            </Link>
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
