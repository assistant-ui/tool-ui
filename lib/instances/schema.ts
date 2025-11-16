import { z } from "zod";

import {
  JsonSchema,
  JsonSchemaValidationError,
  validateJsonSchema,
} from "../manifest";

const slugRegex = /^[a-z0-9-]+$/;

const createJsonSchemaField = (pointer: string) =>
  z
    .custom<JsonSchema>(
      (value) => value !== null && typeof value === "object",
      "Expected a JSON Schema object",
    )
    .superRefine((schema, ctx) => {
      try {
        validateJsonSchema(schema, pointer);
      } catch (error) {
        if (error instanceof JsonSchemaValidationError) {
          ctx.addIssue({
            code: "custom",
            message: error.message,
          });
          return;
        }
        if (error instanceof Error) {
          ctx.addIssue({
            code: "custom",
            message: error.message,
          });
          return;
        }
        ctx.addIssue({
          code: "custom",
          message: "Invalid JSON Schema",
        });
      }
    });

const jsonSchemaField = createJsonSchemaField("#/tools/schema");
const jsonSchemaOutField = createJsonSchemaField("#/tools/schemaOut");

const recordOfStrings = z
  .object({})
  .catchall(z.string())
  .transform((value) => ({ ...value }));

const mockConfigSchema = z
  .object({
    result: z.unknown().optional(),
    latencyMs: z.number().int().positive().max(60_000).optional(),
  })
  .optional();

const proxyConfigSchema = z.object({
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]).default("POST"),
  url: z.string().url(),
  headers: recordOfStrings.optional(),
  query: recordOfStrings.optional(),
  bodyTemplate: z.string().optional(),
  responsePath: z.string().optional(),
  timeoutMs: z.number().int().positive().max(60_000).optional(),
});

const customConfigSchema = z.object({
  modulePath: z.string(),
  exportName: z.string().optional(),
  edgeSafe: z.boolean().default(false),
});

export const toolImplementationSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("mock"),
    config: mockConfigSchema,
  }),
  z.object({
    kind: z.literal("proxy"),
    config: proxyConfigSchema,
  }),
  z.object({
    kind: z.literal("custom"),
    config: customConfigSchema,
  }),
]);

export const toolManifestSchema = z
  .object({
    name: z.string().min(1),
    description: z.string().min(1),
    category: z.string().optional(),
    schema: jsonSchemaField,
    schemaOut: jsonSchemaOutField.optional(),
    impl: toolImplementationSchema,
    uiCandidates: z.array(z.string()).optional(),
    defaultUI: z.string().optional(),
  })
  .strict();

export const cloudConfigSchema = z
  .object({
    mode: z.enum(["local", "hybrid", "cloud"]).default("hybrid"),
    deploymentId: z.string().optional(),
  })
  .default({ mode: "hybrid" });

export const securityConfigSchema = z
  .object({
    allowedClientTools: z.array(z.string()).optional(),
    proxyHostAllowlist: z.array(z.string()).optional(),
  })
  .optional();

export const instanceManifestSchema = z
  .object({
    schemaVersion: z.string().default("1"),
    meta: z
      .object({
        slug: z.string().regex(slugRegex, "Slug must be lowercase kebab-case"),
        name: z.string().min(1),
        version: z.string(),
        description: z.string().optional(),
        forkOf: z.string().regex(slugRegex).optional(),
      })
      .strict(),
    system: z.object({
      prompt: z.string().min(1),
    }),
    runtime: z
      .object({
        model: z.string().min(1),
        temperature: z.number().min(0).max(2).optional(),
        stopSequences: z.array(z.string()).optional(),
        maxToolMs: z.number().int().positive().max(60_000).optional(),
        maxSteps: z.number().int().positive().max(500).optional(),
      })
      .strict(),
    cloud: cloudConfigSchema.optional(),
    security: securityConfigSchema,
    features: z
      .object({})
      .catchall(z.boolean())
      .transform((value) => ({ ...value }))
      .optional(),
    tools: z.array(toolManifestSchema),
    uiMap: recordOfStrings,
  })
  .strict()
  .superRefine((manifest, ctx) => {
    const toolNames = new Set<string>();
    for (const tool of manifest.tools) {
      if (toolNames.has(tool.name)) {
        ctx.addIssue({
          code: "custom",
          message: `Duplicate tool name "${tool.name}"`,
          path: ["tools"],
        });
      }
      toolNames.add(tool.name);
    }

    const uiEntries = Object.entries(manifest.uiMap);
    for (const [toolName] of uiEntries) {
      if (!toolNames.has(toolName)) {
        ctx.addIssue({
          code: "custom",
          message: `uiMap references unknown tool "${toolName}"`,
          path: ["uiMap", toolName],
        });
      }
    }

    if (manifest.cloud?.mode === "cloud" && !manifest.cloud?.deploymentId) {
      ctx.addIssue({
        code: "custom",
        message: "cloud.mode=cloud requires cloud.deploymentId",
        path: ["cloud", "deploymentId"],
      });
    }
  });

export type ToolManifest = z.infer<typeof toolManifestSchema>;
export type InstanceManifest = z.infer<typeof instanceManifestSchema>;

export const parseInstanceManifest = (input: unknown): InstanceManifest => {
  const result = instanceManifestSchema.safeParse(input);
  if (!result.success) {
    throw result.error;
  }
  return result.data;
};


