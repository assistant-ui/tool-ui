import type { ManifestModule } from "../registry";

export const manifest: ManifestModule["manifest"] = {
  schemaVersion: "1",
  meta: {
    slug: "example-basic",
    name: "Example Assistant",
    version: "0.1.0",
    description: "Minimal manifest used to validate the registry pipeline.",
  },
  system: {
    prompt: "You are an example assistant used for validating manifests.",
  },
  runtime: {
    model: "openai/gpt-4.1-mini",
  },
  cloud: {
    mode: "local",
  },
  tools: [
    {
      name: "echo_tool",
      description: "Returns the provided message back to the caller.",
      schema: {
        type: "object",
        required: ["message"],
        properties: {
          message: { type: "string", minLength: 1 },
        },
      },
      schemaOut: {
        type: "object",
        properties: {
          message: { type: "string" },
        },
      },
      impl: {
        kind: "mock",
        config: {
          result: { message: "example" },
        },
      },
      uiCandidates: ["tool-fallback"],
      defaultUI: "tool-fallback",
    },
  ],
  uiMap: {
    echo_tool: "tool-fallback",
  },
};


