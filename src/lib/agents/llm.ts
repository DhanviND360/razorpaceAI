import { ChatGroq } from '@langchain/groq';

let llmInstance: ChatGroq | null = null;

/**
 * LLM Factory — creates a Groq-backed LLM instance.
 * Configured via environment variables.
 */
export function getLLM(): ChatGroq {
  if (!llmInstance) {
    const apiKey = process.env.LLM_API_KEY || process.env.GROQ_API_KEY;

    if (!apiKey) {
      throw new Error('LLM_API_KEY (or GROQ_API_KEY) must be set in environment variables');
    }

    llmInstance = new ChatGroq({
      apiKey,
      model: process.env.LLM_MODEL || 'llama-3.3-70b-versatile',
      temperature: 0.3,
      maxTokens: 4096,
    });
  }
  return llmInstance;
}

/**
 * Get a fresh LLM instance (not cached) for specific use cases.
 */
export function createLLM(overrides?: {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}): ChatGroq {
  const apiKey = process.env.LLM_API_KEY || process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error('LLM_API_KEY (or GROQ_API_KEY) must be set in environment variables');
  }

  return new ChatGroq({
    apiKey,
    model: overrides?.model || process.env.LLM_MODEL || 'llama-3.3-70b-versatile',
    temperature: overrides?.temperature ?? 0.3,
    maxTokens: overrides?.maxTokens ?? 4096,
  });
}
