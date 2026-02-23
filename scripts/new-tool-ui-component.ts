import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

function toPascalCase(input: string): string {
  return input
    .split("-")
    .filter(Boolean)
    .map((segment) => segment[0].toUpperCase() + segment.slice(1))
    .join("");
}

function assertSlug(value: string): void {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
    throw new Error(
      `Invalid component slug "${value}". Use kebab-case (example: task-receipt).`,
    );
  }
}

async function writeFileSafe(filePath: string, content: string): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, "utf8");
}

async function ensureMissing(paths: string[]): Promise<void> {
  for (const targetPath of paths) {
    try {
      await fs.stat(targetPath);
      throw new Error(`Refusing to overwrite existing path: ${targetPath}`);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error;
      }
    }
  }
}

async function main(): Promise<void> {
  const [, , slugArg] = process.argv;
  if (!slugArg) {
    throw new Error("Usage: pnpm component:new <kebab-case-component-name>");
  }

  assertSlug(slugArg);
  const slug = slugArg.trim();
  const componentName = toPascalCase(slug);
  const fileStem = slug;

  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const projectRoot = path.resolve(scriptDir, "..");

  const componentDir = path.join(projectRoot, "components", "tool-ui", slug);
  const docsDir = path.join(projectRoot, "app", "docs", slug);
  const presetFile = path.join(projectRoot, "lib", "presets", `${slug}.ts`);

  await ensureMissing([componentDir, docsDir, presetFile]);

  const schemaFile = path.join(componentDir, "schema.ts");
  const adapterFile = path.join(componentDir, "_adapter.tsx");
  const componentFile = path.join(componentDir, `${fileStem}.tsx`);
  const indexFile = path.join(componentDir, "index.tsx");
  const readmeFile = path.join(componentDir, "README.md");
  const docsFile = path.join(docsDir, "content.mdx");

  await writeFileSafe(
    schemaFile,
    `import { z } from "zod";
import { ToolUIIdSchema, ToolUIRoleSchema } from "../shared/schema";
import { defineToolUiContract } from "../shared/contract";

export const Serializable${componentName}Schema = z.object({
  id: ToolUIIdSchema,
  role: ToolUIRoleSchema.optional(),
});

export type Serializable${componentName} = z.infer<
  typeof Serializable${componentName}Schema
>;

const Serializable${componentName}SchemaContract = defineToolUiContract(
  "${componentName}",
  Serializable${componentName}Schema,
);

export const parseSerializable${componentName}: (
  input: unknown,
) => Serializable${componentName} = Serializable${componentName}SchemaContract.parse;

export const safeParseSerializable${componentName}: (
  input: unknown,
) => Serializable${componentName} | null =
  Serializable${componentName}SchemaContract.safeParse;

export interface ${componentName}Props extends Serializable${componentName} {
  className?: string;
}
`,
  );

  await writeFileSafe(
    adapterFile,
    `export { cn } from "@/lib/ui/cn";
export { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
`,
  );

  await writeFileSafe(
    componentFile,
    `"use client";

import { cn, Card, CardContent, CardHeader, CardTitle } from "./_adapter";
import type { ${componentName}Props } from "./schema";

export function ${componentName}({ id, className }: ${componentName}Props) {
  return (
    <Card
      className={cn("w-full max-w-md", className)}
      data-slot="${slug}"
      data-tool-ui-id={id}
    >
      <CardHeader>
        <CardTitle>${componentName}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">
          Replace this placeholder with your final UI.
        </p>
      </CardContent>
    </Card>
  );
}
`,
  );

  await writeFileSafe(
    indexFile,
    `export { ${componentName} } from "./${fileStem}";
export {
  Serializable${componentName}Schema,
  parseSerializable${componentName},
  safeParseSerializable${componentName},
} from "./schema";
export type { Serializable${componentName}, ${componentName}Props } from "./schema";
`,
  );

  await writeFileSafe(
    readmeFile,
    `# ${componentName}

Source for the \`${componentName}\` Tool UI component.

## Key files

- \`./schema.ts\` - serializable contract + parse helpers
- \`./${fileStem}.tsx\` - component implementation
- \`./index.tsx\` - public exports

## Companion docs

- Docs page: \`/app/docs/${slug}/content.mdx\`
- Preset seed: \`/lib/presets/${slug}.ts\`
`,
  );

  await writeFileSafe(
    docsFile,
    `import { DocsHeader } from "../_components/docs-header";

<DocsHeader
  title="${componentName}"
  description="Describe what this tool UI surface does."
  mdxPath="app/docs/${slug}/content.mdx"
/>

## Overview

Document this component's intent, schema contract, and usage examples.
`,
  );

  await writeFileSafe(
    presetFile,
    `export const ${componentName}Preset = {
  id: "${slug}-example",
};
`,
  );

  console.log(`Created component scaffold for "${slug}"`);
  console.log(`- components/tool-ui/${slug}`);
  console.log(`- app/docs/${slug}/content.mdx`);
  console.log(`- lib/presets/${slug}.ts`);
  console.log(
    "Next: wire category metadata in lib/docs/component-registry.ts.",
  );
}

main().catch((error: unknown) => {
  console.error("Failed to scaffold Tool UI component.");
  console.error(error);
  process.exitCode = 1;
});
