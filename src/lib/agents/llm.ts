import { ChatGroq } from '@langchain/groq';

let llmInstance: ChatGroq | null = null;

function resolveGroqModel(configuredModel?: string): string {
  const DEFAULT_MODEL = 'llama-3.3-70b-versatile';
  if (!configuredModel) return DEFAULT_MODEL;
  // If model is set to an unsupported OpenAI or generic string, fall back to high-performance Groq model
  if (configuredModel.includes('openai') || configuredModel.includes('gpt') || configuredModel.includes('claude')) {
    return DEFAULT_MODEL;
  }
  return configuredModel;
}

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

    const model = resolveGroqModel(process.env.LLM_MODEL);

    llmInstance = new ChatGroq({
      apiKey,
      model,
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

  const model = resolveGroqModel(overrides?.model || process.env.LLM_MODEL);

  return new ChatGroq({
    apiKey,
    model,
    temperature: overrides?.temperature ?? 0.3,
    maxTokens: overrides?.maxTokens ?? 4096,
  });
}
