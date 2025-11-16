import { frontendTools } from "@assistant-ui/react-ai-sdk";
import { convertToModelMessages, streamText, tool } from "ai";
import type { ToolSet, UIMessage } from "ai";

import { jsonSchemaToZod } from "./manifest";
import type { InstanceManifest, ToolManifest } from "./instances";
import { resolveLanguageModel } from "./model-resolver";
import { loadServerToolModule } from "./server-tools/registry";

type ClientTools = Parameters<typeof frontendTools>[0];

const pointerForTool = (tool: ToolManifest) =>
  `#/tools/${tool.name}`;

const buildMockToolExecutor = async (
  toolManifest: ToolManifest,
  args: unknown,
) => {
  if (toolManifest.impl.kind !== "mock") {
    throw new Error(
      `Tool "${toolManifest.name}" mock executor invoked for non-mock implementation`,
    );
  }

  const latencyMs = toolManifest.impl.config?.latencyMs;
  if (latencyMs && latencyMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, latencyMs));
  }

  if (
    toolManifest.impl.config &&
    "result" in toolManifest.impl.config &&
    toolManifest.impl.config.result !== undefined
  ) {
    return toolManifest.impl.config.result;
  }

  return { ok: true, echo: args ?? null };
};

const buildCustomToolExecutor = async (
  toolManifest: ToolManifest,
  args: unknown,
) => {
  if (toolManifest.impl.kind !== "custom") {
    throw new Error(
      `Tool "${toolManifest.name}" custom executor invoked for non-custom implementation`,
    );
  }

  const { modulePath, exportName = "default" } = toolManifest.impl.config;
  if (!modulePath) {
    throw new Error(
      `Tool "${toolManifest.name}" custom implementation is missing modulePath`,
    );
  }

  const mod = (await loadServerToolModule(modulePath)) as Record<
    string,
    unknown
  >;
  const handler = mod[exportName] as unknown;

  if (typeof handler !== "function") {
    throw new Error(
      `Tool "${toolManifest.name}" custom implementation export "${exportName}" is not a function`,
    );
  }

  return handler(args);
};

const runToolImplementation = async (
  toolManifest: ToolManifest,
  args: unknown,
) => {
  switch (toolManifest.impl.kind) {
    case "mock":
      return buildMockToolExecutor(toolManifest, args);
    case "custom":
      return buildCustomToolExecutor(toolManifest, args);
    case "proxy":
      throw new Error(
        `Tool "${toolManifest.name}" proxy implementation is not supported yet`,
      );
    default:
      throw new Error(
        `Tool "${toolManifest.name}" uses unknown implementation kind`,
      );
  }
};

const buildServerTool = (manifest: InstanceManifest, toolManifest: ToolManifest) => {
  const inputSchema = jsonSchemaToZod(
    toolManifest.schema,
    { additionalProperties: "strict" },
    `${pointerForTool(toolManifest)}/schema`,
  );
  const outputSchema = toolManifest.schemaOut
    ? jsonSchemaToZod(
        toolManifest.schemaOut,
        { additionalProperties: true },
        `${pointerForTool(toolManifest)}/schemaOut`,
      )
    : undefined;

  return tool({
    description: toolManifest.description,
    inputSchema,
    async execute(args) {
      const result = await runToolImplementation(toolManifest, args);
      if (outputSchema) {
        return outputSchema.parse(result);
      }
      return result;
    },
  });
};

const buildServerTools = (manifest: InstanceManifest): ToolSet => {
  return Object.fromEntries(
    manifest.tools.map((toolManifest) => [
      toolManifest.name,
      buildServerTool(manifest, toolManifest),
    ]),
  ) as ToolSet;
};

interface StreamOptions {
  manifest: InstanceManifest;
  messages: UIMessage[];
  clientTools?: ClientTools;
}

export const streamInstanceResponse = async ({
  manifest,
  messages,
  clientTools,
}: StreamOptions) => {
  const model = resolveLanguageModel(manifest.runtime.model);
  const serverToolSet = buildServerTools(manifest);
  const clientToolSet =
    clientTools && Object.keys(clientTools).length > 0
      ? (frontendTools(clientTools) as unknown as ToolSet)
      : undefined;
  const tools: ToolSet = clientToolSet
    ? { ...clientToolSet, ...serverToolSet }
    : serverToolSet;

  const result = streamText({
    model,
    system: manifest.system.prompt,
    messages: convertToModelMessages(messages),
    temperature: manifest.runtime.temperature,
    stopSequences: manifest.runtime.stopSequences,
    tools,
  });

  return result;
};


