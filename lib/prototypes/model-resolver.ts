import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";

const providers = {
  openai: openai,
  anthropic: anthropic,
} satisfies Record<string, (modelId: string) => LanguageModel>;

export const resolveLanguageModel = (identifier: string) => {
  const [provider, ...rest] = identifier.split("/");

  if (!provider) {
    throw new Error("runtime.model must include a provider prefix, e.g. openai/gpt-4.1-mini");
  }

  const modelId = rest.join("/");
  if (!modelId) {
    throw new Error(`runtime.model "${identifier}" is missing the model id segment`);
  }

  const resolver = providers[provider as keyof typeof providers];
  if (!resolver) {
    throw new Error(`Unsupported model provider "${provider}"`);
  }

  return resolver(modelId);
};


