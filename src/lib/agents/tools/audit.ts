import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { addAuditEvent } from '../../data/store';
import { createAuditEvent, AuditEvent } from '../../schemas/audit';

export const recordAuditEvent = tool(
  async (input) => {
    const event: AuditEvent = createAuditEvent({
      sessionId: input.sessionId,
      agent: input.agent as 'buyer' | 'merchant' | 'policy' | 'system',
      action: input.action,
      tool: input.tool,
      inputSummary: input.inputSummary,
      outputSummary: input.outputSummary,
      reason: input.reason,
      status: input.status as 'success' | 'failed' | 'pending' | 'blocked' | 'skipped',
      metadata: input.metadata ? JSON.parse(input.metadata) : undefined,
    });

    addAuditEvent(input.sessionId, event);

    return JSON.stringify({
      recorded: true,
      eventId: event.id,
      timestamp: event.timestamp,
      action: event.action,
    });
  },
  {
    name: 'record_audit_event',
    description: 'Record an audit event for explainability and compliance. Every important agent decision/action should be audited.',
    schema: z.object({
      sessionId: z.string().describe('Session ID'),
      agent: z.string().describe('Agent name: buyer, merchant, policy, or system'),
      action: z.string().describe('Action name (e.g., USER_INTENT, CATALOG_SEARCH, PRODUCT_SELECTION, UPSELL, POLICY_CHECK)'),
      tool: z.string().optional().describe('Tool name if a tool was called'),
      inputSummary: z.string().describe('Brief summary of what was input/requested'),
      outputSummary: z.string().describe('Brief summary of the result'),
      reason: z.string().optional().describe('Why this action was taken or this decision was made'),
      status: z.string().describe('success, failed, pending, blocked, or skipped'),
      metadata: z.string().optional().describe('JSON string of additional metadata'),
    }),
  }
);
