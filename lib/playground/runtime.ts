import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  type LanguageModel,
  type ToolSet,
  type UIMessage,
} from "ai";
import { z } from "zod";

import type { Prototype } from "./types";
import { hasToolUi } from "./tool-uis";

const DEFAULT_MODEL = "openai/gpt-4.1-mini";

const PROVIDERS: Record<string, (modelId: string) => LanguageModel> = {
  openai,
  anthropic,
};

const normalizeToolInputSchema = (
  schema: z.ZodTypeAny | undefined,
  toolName: string,
) => {
  if (!schema) {
    return z.object({});
  }

  if (schema instanceof z.ZodObject) {
    return schema;
  }

  console.warn(
    `Tool "${toolName}" supplied a non-object schema. Falling back to an empty object schema.`,
  );
  return z.object({});
};

const resolveModel = (identifier: string) => {
  const [provider, ...rest] = identifier.split("/");
  if (!provider) {
    throw new Error(
      "DEFAULT_MODEL must include a provider segment, e.g. openai/gpt-4.1-mini",
    );
  }
  const modelId = rest.join("/");
  if (!modelId) {
    throw new Error(`Model identifier "${identifier}" is missing the model name`);
  }
  const resolver = PROVIDERS[provider];
  if (!resolver) {
    throw new Error(`Unsupported model provider "${provider}"`);
  }
  return resolver(modelId);
};

export const buildToolSet = (prototype: Prototype): ToolSet => {
  const seenNames = new Set<string>();
  const entries: Array<[string, ToolSet[string]]> = [];

  for (const definition of prototype.tools) {
    if (seenNames.has(definition.name)) {
      console.warn(
        `Duplicate tool name "${definition.name}" found in prototype "${prototype.slug}". Only the first occurrence will be used.`,
      );
      continue;
    }
    seenNames.add(definition.name);

    if (definition.uiId && !hasToolUi(definition.uiId)) {
      console.warn(
        `Tool "${definition.name}" references unknown UI "${definition.uiId}". Falling back to default UI.`,
      );
    }

    const inputSchema = normalizeToolInputSchema(
      definition.input,
      definition.name,
    );

    const builtTool = tool<unknown, unknown>({
      description: definition.description,
      inputSchema,
      async execute(args: unknown) {
        return definition.execute(args);
      },
    });

    entries.push([definition.name, builtTool]);
  }

  return Object.fromEntries(entries) as ToolSet;
};

export const streamPrototypeResponse = (
  prototype: Prototype,
  messages: UIMessage[],
) => {
  const model = resolveModel(DEFAULT_MODEL);
  const tools = buildToolSet(prototype);
  return streamText({
    model,
    system: prototype.systemPrompt,
    messages: convertToModelMessages(messages),
    tools,
    stopWhen: stepCountIs(100),
  });
};
