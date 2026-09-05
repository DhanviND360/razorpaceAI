'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Bot,
  TrendingUp,
  ShieldCheck,
  CreditCard,
  ArrowDown,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Zap,
  Activity,
  Clock,
  Layers,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface AgentMetric {
  id: string;
  name: string;
  role: string;
  color: string;
  totalActions: number;
  successCount: number;
  blockedCount: number;
  successRate: number;
  lastAction: string | null;
  lastTimestamp: string | null;
  lastOutput: string | null;
  status: 'active' | 'idle';
  recentEvents: Array<{
    id: string;
    timestamp: string;
    action: string;
    outputSummary: string;
    status: string;
  }>;
}

interface TimelineEvent {
  id: string;
  timestamp: string;
  agent: string;
  action: string;
  tool?: string;
  input: string;
  output: string;
  status: string;
  policyResult?: string;
  nextState?: string;
}

interface WorkflowData {
  agents: AgentMetric[];
  connections: Array<{ from: string; action: string; to: string; timestamp: string; status: string }>;
  timeline: TimelineEvent[];
  orderSummary: { total: number; confirmed: number; totalRevenue: number; upsellRevenue: number; crossSellRevenue: number };
  totalEvents: number;
}

// ============================================================================
// AGENT ICON MAP
// ============================================================================

const AGENT_ICONS: Record<string, React.ReactNode> = {
  buyer: <Bot size={20} strokeWidth={1.75} />,
  merchant: <TrendingUp size={20} strokeWidth={1.75} />,
  policy: <ShieldCheck size={20} strokeWidth={1.75} />,
  system: <CreditCard size={20} strokeWidth={1.75} />,
};

const AGENT_COLORS: Record<string, string> = {
  buyer: '#6366f1',
  merchant: '#10b981',
  policy: '#f59e0b',
  system: '#3b82f6',
};

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; label: string; dotColor: string }> = {
  success: { icon: <CheckCircle2 size={12} />, label: 'PASS', dotColor: '#10b981' },
  blocked: { icon: <XCircle size={12} />, label: 'BLOCKED', dotColor: '#ef4444' },
  failed: { icon: <XCircle size={12} />, label: 'FAILED', dotColor: '#ef4444' },
  warn: { icon: <AlertTriangle size={12} />, label: 'WARN', dotColor: '#f59e0b' },
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function AgentWorkflow() {
  const [data, setData] = useState<WorkflowData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchWorkflow = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await fetch('/api/workflow');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Failed to fetch workflow:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkflow();
  }, [fetchWorkflow]);

  // Auto-refresh every 8 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => fetchWorkflow(true), 8000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchWorkflow]);

  if (loading || !data) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '60vh', flexDirection: 'column', gap: '16px',
      }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '12px',
          background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        }}>
          <Layers size={22} color="#6366f1" />
        </div>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          Loading agent orchestration data...
        </span>
      </div>
    );
  }

  const selectedAgentData = selectedAgent ? data.agents.find(a => a.id === selectedAgent) : null;

  return (
    <div style={{ maxWidth: '1320px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* ================================================================ */}
      {/* HEADER BAR                                                       */}
      {/* ================================================================ */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 0', borderBottom: '1px solid var(--border-hairline)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <Activity size={13} color="var(--accent-primary)" />
            <span>{data.totalEvents} EVENTS TRACKED</span>
          </div>
          <div style={{ width: '1px', height: '16px', background: 'var(--border-hairline)' }} />
          <div style={{
            fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <Zap size={13} color="var(--accent-emerald)" />
            <span>{data.orderSummary.confirmed} SETTLEMENTS</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            style={{
              background: 'none', border: '1px solid var(--border-hairline)',
              borderRadius: 'var(--radius-sm)', padding: '5px 10px',
              fontSize: '11px', fontFamily: 'var(--font-mono)', cursor: 'pointer',
              color: autoRefresh ? 'var(--accent-emerald)' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', gap: '6px',
              transition: 'all 0.2s ease',
            }}
          >
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: autoRefresh ? '#10b981' : 'var(--text-faint)',
              boxShadow: autoRefresh ? '0 0 8px rgba(16, 185, 129, 0.5)' : 'none',
              transition: 'all 0.3s ease',
            }} />
            <span>{autoRefresh ? 'LIVE' : 'PAUSED'}</span>
          </button>
          <button
            onClick={() => fetchWorkflow(true)}
            disabled={refreshing}
            style={{
              background: 'none', border: '1px solid var(--border-hairline)',
              borderRadius: 'var(--radius-sm)', padding: '5px 10px',
              fontSize: '11px', cursor: 'pointer', color: 'var(--text-muted)',
              display: 'flex', alignItems: 'center', gap: '6px',
              transition: 'all 0.2s ease',
            }}
          >
            <RefreshCw size={12} style={{
              animation: refreshing ? 'spin 1s linear infinite' : 'none',
              transition: 'all 0.2s ease',
            }} />
            <span>REFRESH</span>
          </button>
        </div>
      </div>

      {/* ================================================================ */}
      {/* ORCHESTRATION ARCHITECTURE — THE CORE VISUAL                     */}
      {/* ================================================================ */}
      <div style={{
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-hairline)',
        background: 'var(--bg-surface)',
        padding: '40px 32px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Ambient Background Grid */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.03, pointerEvents: 'none',
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }} />

        {/* Section Label */}
        <div style={{
          textAlign: 'center', marginBottom: '36px', position: 'relative', zIndex: 1,
        }}>
          <div style={{
            fontSize: '10px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase',
            letterSpacing: '0.15em', color: 'var(--text-faint)', marginBottom: '6px',
          }}>
            System Architecture
          </div>
          <div style={{
            fontSize: '18px', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em',
          }}>
            Agent Orchestration Pipeline
          </div>
        </div>

        {/* 4-Node Horizontal Pipeline */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '0', position: 'relative', zIndex: 1,
        }}>
          {data.agents.map((agent, idx) => (
            <div key={agent.id} style={{ display: 'flex', alignItems: 'center' }}>
              {/* Agent Node */}
              <button
                onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}
                style={{
                  background: selectedAgent === agent.id
                    ? `rgba(${agent.color === '#6366f1' ? '99,102,241' : agent.color === '#10b981' ? '16,185,129' : agent.color === '#f59e0b' ? '245,158,11' : '59,130,246'}, 0.12)`
                    : 'var(--bg-elevated)',
                  border: `1px solid ${selectedAgent === agent.id
                    ? `${agent.color}50`
                    : 'var(--border-hairline)'}`,
                  borderRadius: 'var(--radius-lg)',
                  padding: '24px 20px',
                  width: '200px',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: selectedAgent === agent.id ? 'scale(1.03)' : 'scale(1)',
                  boxShadow: selectedAgent === agent.id
                    ? `0 8px 32px -8px ${agent.color}30`
                    : 'none',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                  position: 'relative',
                  textAlign: 'center',
                }}
              >
                {/* Status Dot */}
                <div style={{
                  position: 'absolute', top: '12px', right: '12px',
                  width: '7px', height: '7px', borderRadius: '50%',
                  background: agent.status === 'active' ? '#10b981' : 'var(--text-faint)',
                  boxShadow: agent.status === 'active' ? '0 0 10px rgba(16,185,129,0.6)' : 'none',
                  transition: 'all 0.5s ease',
                }} />

                {/* Icon */}
                <div style={{
                  width: '44px', height: '44px', borderRadius: 'var(--radius-md)',
                  background: `${agent.color}15`,
                  border: `1px solid ${agent.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: agent.color,
                  transition: 'all 0.3s ease',
                }}>
                  {AGENT_ICONS[agent.id]}
                </div>

                {/* Name */}
                <div>
                  <div style={{
                    fontSize: '12px', fontWeight: 600, color: '#fff', marginBottom: '2px',
                    letterSpacing: '-0.01em',
                  }}>
                    {agent.name}
                  </div>
                  <div style={{
                    fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1.3,
                    maxWidth: '160px',
                  }}>
                    {agent.role}
                  </div>
                </div>

                {/* Metric Bar */}
                <div style={{
                  width: '100%', display: 'flex', justifyContent: 'center', gap: '16px',
                  paddingTop: '8px', borderTop: '1px solid var(--border-hairline)',
                  fontSize: '10px', fontFamily: 'var(--font-mono)',
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: 'var(--text-faint)' }}>ACTIONS</div>
                    <div style={{ color: '#fff', fontWeight: 600, fontSize: '14px' }}>{agent.totalActions}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: 'var(--text-faint)' }}>RATE</div>
                    <div style={{ color: agent.successRate >= 80 ? '#10b981' : '#f59e0b', fontWeight: 600, fontSize: '14px' }}>
                      {agent.successRate}%
                    </div>
                  </div>
                </div>
              </button>

              {/* Connector Arrow (between nodes) */}
              {idx < data.agents.length - 1 && (
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: '0 8px', gap: '4px',
                }}>
                  <div style={{
                    width: '48px', height: '1px',
                    background: `linear-gradient(90deg, ${agent.color}40, ${data.agents[idx + 1].color}40)`,
                  }} />
                  <ArrowRight size={12} color="var(--text-faint)" style={{ opacity: 0.5 }} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Selected Agent Detail Panel — slides open below */}
        {selectedAgentData && (
          <div style={{
            marginTop: '28px', padding: '24px',
            borderRadius: 'var(--radius-md)',
            border: `1px solid ${selectedAgentData.color}25`,
            background: `${selectedAgentData.color}06`,
            animation: 'fadeSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative', zIndex: 1,
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              marginBottom: '16px',
            }}>
              <div>
                <div style={{
                  fontSize: '10px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase',
                  letterSpacing: '0.1em', color: selectedAgentData.color, marginBottom: '4px',
                }}>
                  {selectedAgentData.name} — Detail View
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {selectedAgentData.role}
                </div>
              </div>
              {selectedAgentData.lastTimestamp && (
                <div style={{
                  fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-faint)',
                  display: 'flex', alignItems: 'center', gap: '4px',
                }}>
                  <Clock size={11} />
                  <span>Last active: {new Date(selectedAgentData.lastTimestamp).toLocaleTimeString()}</span>
                </div>
              )}
            </div>

            {/* Recent events for this agent */}
            {selectedAgentData.recentEvents.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {selectedAgentData.recentEvents.map(ev => (
                  <div key={ev.id} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '8px 12px', borderRadius: 'var(--radius-sm)',
                    background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-hairline)',
                    fontSize: '11px',
                  }}>
                    <div style={{
                      color: STATUS_CONFIG[ev.status]?.dotColor || 'var(--text-muted)',
                      display: 'flex', alignItems: 'center', flexShrink: 0,
                    }}>
                      {STATUS_CONFIG[ev.status]?.icon || <Activity size={12} />}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-mono)', color: '#fff', fontWeight: 500,
                      minWidth: '180px', flexShrink: 0,
                    }}>
                      {ev.action}
                    </div>
                    <div style={{
                      color: 'var(--text-secondary)', flex: 1, overflow: 'hidden',
                      textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {ev.outputSummary}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-mono)', color: 'var(--text-faint)', flexShrink: 0,
                    }}>
                      {new Date(ev.timestamp).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center', padding: '20px', color: 'var(--text-faint)',
                fontSize: '12px', fontFamily: 'var(--font-mono)',
              }}>
                No recorded events yet. Run a buyer query to generate agent activity.
              </div>
            )}
          </div>
        )}
      </div>

      {/* ================================================================ */}
      {/* DATA FLOW VISUALIZATION                                          */}
      {/* ================================================================ */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px',
      }}>
        {/* Left: Data Flow Stages */}
        <div style={{
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-hairline)',
          background: 'var(--bg-surface)',
          padding: '24px',
        }}>
          <div style={{
            fontSize: '10px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase',
            letterSpacing: '0.12em', color: 'var(--text-faint)', marginBottom: '20px',
          }}>
            Data Transformation Pipeline
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {[
              { stage: 'Intent Extraction', agent: 'buyer', desc: 'Natural language → structured goal, budget, keywords', color: '#6366f1' },
              { stage: 'Catalog Discovery', agent: 'buyer', desc: 'Goal → merchant readiness scores, filtered candidates', color: '#6366f1' },
              { stage: 'Product Selection', agent: 'buyer', desc: 'Candidates → optimal SKU with specs, price, stock', color: '#6366f1' },
              { stage: 'Revenue Optimization', agent: 'merchant', desc: 'SKU + budget → upsell delta, cross-sell bundles', color: '#10b981' },
              { stage: 'Policy Enforcement', agent: 'policy', desc: 'Cart state → 7 deterministic safety gates', color: '#f59e0b' },
              { stage: 'Cryptographic Settlement', agent: 'system', desc: 'Approved cart → Razorpay order, HMAC verification', color: '#3b82f6' },
            ].map((step, idx) => (
              <div key={idx}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '12px 0',
                }}>
                  {/* Step Number */}
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: `${step.color}12`, border: `1px solid ${step.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', fontWeight: 600, fontFamily: 'var(--font-mono)',
                    color: step.color, flexShrink: 0,
                  }}>
                    {String(idx + 1).padStart(2, '0')}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '12px', fontWeight: 600, color: '#fff', marginBottom: '2px',
                    }}>
                      {step.stage}
                    </div>
                    <div style={{
                      fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)',
                    }}>
                      {step.desc}
                    </div>
                  </div>

                  {/* Agent Badge */}
                  <div style={{
                    fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 600,
                    padding: '2px 8px', borderRadius: 'var(--radius-full)',
                    background: `${step.color}15`, color: step.color,
                    border: `1px solid ${step.color}25`, flexShrink: 0,
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>
                    {step.agent}
                  </div>
                </div>

                {/* Connector */}
                {idx < 5 && (
                  <div style={{
                    display: 'flex', alignItems: 'center', paddingLeft: '13px',
                  }}>
                    <div style={{
                      width: '1px', height: '12px',
                      background: `linear-gradient(180deg, ${step.color}30, ${step.color === '#6366f1' && idx < 2 ? step.color : '#10b981'}20)`,
                    }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: System Throughput Summary */}
        <div style={{
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-hairline)',
          background: 'var(--bg-surface)',
          padding: '24px',
          display: 'flex', flexDirection: 'column', gap: '20px',
        }}>
          <div style={{
            fontSize: '10px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase',
            letterSpacing: '0.12em', color: 'var(--text-faint)',
          }}>
            System Throughput
          </div>

          {/* Revenue Card */}
          <div style={{
            padding: '20px', borderRadius: 'var(--radius-md)',
            background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.15)',
          }}>
            <div style={{
              fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)',
              marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              Total Captured Revenue
            </div>
            <div style={{
              fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-mono)',
              color: '#fff', letterSpacing: '-0.02em',
            }}>
              ₹{data.orderSummary.totalRevenue.toLocaleString('en-IN')}
            </div>
            <div style={{
              marginTop: '12px', display: 'flex', gap: '16px',
              fontSize: '11px', fontFamily: 'var(--font-mono)',
            }}>
              <div>
                <div style={{ color: 'var(--text-faint)' }}>UPSELL</div>
                <div style={{ color: '#10b981', fontWeight: 600 }}>
                  +₹{data.orderSummary.upsellRevenue.toLocaleString('en-IN')}
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--text-faint)' }}>CROSS-SELL</div>
                <div style={{ color: '#6366f1', fontWeight: 600 }}>
                  +₹{data.orderSummary.crossSellRevenue.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>

          {/* Agent Performance Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {data.agents.map(agent => (
              <div key={agent.id} style={{
                padding: '14px', borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-elevated)', border: '1px solid var(--border-hairline)',
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px',
                }}>
                  <div style={{ color: agent.color, display: 'flex' }}>
                    {AGENT_ICONS[agent.id]}
                  </div>
                  <span style={{
                    fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 600,
                    color: 'var(--text-secondary)', textTransform: 'uppercase',
                  }}>
                    {agent.id}
                  </span>
                </div>
                {/* Mini progress bar */}
                <div style={{
                  width: '100%', height: '3px', borderRadius: '2px',
                  background: 'var(--border-hairline)', overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%', borderRadius: '2px',
                    background: agent.color,
                    width: `${agent.successRate}%`,
                    transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                  }} />
                </div>
                <div style={{
                  marginTop: '6px', display: 'flex', justifyContent: 'space-between',
                  fontSize: '10px', fontFamily: 'var(--font-mono)',
                }}>
                  <span style={{ color: 'var(--text-faint)' }}>{agent.totalActions} actions</span>
                  <span style={{ color: agent.color, fontWeight: 600 }}>{agent.successRate}%</span>
                </div>
              </div>
            ))}
          </div>

          {/* Settlement Count */}
          <div style={{
            padding: '14px', borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-elevated)', border: '1px solid var(--border-hairline)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div style={{
              fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)',
            }}>
              COMPLETED SETTLEMENTS
            </div>
            <div style={{
              fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#fff',
            }}>
              {data.orderSummary.confirmed}
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* EVENT TIMELINE                                                    */}
      {/* ================================================================ */}
      <div style={{
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-hairline)',
        background: 'var(--bg-surface)',
        padding: '24px',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '20px',
        }}>
          <div style={{
            fontSize: '10px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase',
            letterSpacing: '0.12em', color: 'var(--text-faint)',
          }}>
            Inter-Agent Communication Log
          </div>
          <div style={{
            fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-faint)',
          }}>
            {data.timeline.length} RECENT EVENTS
          </div>
        </div>

        {data.timeline.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {data.timeline.map((ev, idx) => {
              const agentColor = AGENT_COLORS[ev.agent] || 'var(--text-muted)';
              const statusConf = STATUS_CONFIG[ev.status];

              return (
                <div key={ev.id} style={{
                  display: 'grid',
                  gridTemplateColumns: '70px 100px 1fr 200px 60px',
                  gap: '12px',
                  alignItems: 'center',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-xs)',
                  background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                  fontSize: '11px',
                  transition: 'background 0.15s ease',
                }}>
                  {/* Timestamp */}
                  <div style={{
                    fontFamily: 'var(--font-mono)', color: 'var(--text-faint)', fontSize: '10px',
                  }}>
                    {new Date(ev.timestamp).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </div>

                  {/* Agent Badge */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                  }}>
                    <div style={{
                      width: '5px', height: '5px', borderRadius: '50%', background: agentColor,
                      flexShrink: 0,
                    }} />
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontWeight: 600,
                      color: agentColor, textTransform: 'uppercase', fontSize: '10px',
                    }}>
                      {ev.agent}
                    </span>
                  </div>

                  {/* Action + Output */}
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{
                      fontWeight: 500, color: '#fff', marginBottom: '1px',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {ev.action}
                    </div>
                    <div style={{
                      color: 'var(--text-muted)', fontSize: '10px',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {ev.output}
                    </div>
                  </div>

                  {/* Next State */}
                  {ev.nextState ? (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-faint)',
                    }}>
                      <ArrowDown size={9} />
                      <span>{ev.nextState}</span>
                    </div>
                  ) : (
                    <div />
                  )}

                  {/* Status */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    color: statusConf?.dotColor || 'var(--text-muted)',
                    fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 600,
                  }}>
                    {statusConf?.icon || <Activity size={12} />}
                    <span>{statusConf?.label || ev.status.toUpperCase()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{
            textAlign: 'center', padding: '48px 20px',
            color: 'var(--text-faint)', fontSize: '12px',
          }}>
            <Layers size={28} color="var(--text-faint)" style={{ marginBottom: '12px', opacity: 0.5 }} />
            <div style={{ fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
              NO AGENT EVENTS RECORDED
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
              Navigate to the AI Buyer console and run a query to generate live agent workflow data.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
