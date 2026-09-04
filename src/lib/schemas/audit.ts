import { z } from 'zod';

export const AuditEventSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  sessionId: z.string(),
  agent: z.enum(['buyer', 'merchant', 'policy', 'system']),
  action: z.string(),
  tool: z.string().optional(),
  inputSummary: z.string(),
  outputSummary: z.string(),
  reason: z.string().optional(),
  status: z.enum(['success', 'failed', 'pending', 'blocked', 'skipped']),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type AuditEvent = z.infer<typeof AuditEventSchema>;

export function createAuditEvent(
  params: Omit<AuditEvent, 'id' | 'timestamp'>
): AuditEvent {
  return {
    id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    ...params,
  };
}
