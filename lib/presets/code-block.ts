import type { SerializableCodeBlock } from "@/components/tool-ui/code-block";
import type { PresetWithCodeGen } from "./types";

export type CodeBlockPresetName =
  | "typescript"
  | "python"
  | "json"
  | "bash"
  | "highlighted"
  | "collapsible"
  | "with-actions";

function escape(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/`/g, "\\`");
}

function generateCodeBlockCode(data: SerializableCodeBlock): string {
  const props: string[] = [];

  props.push(`  code={\`${escape(data.code)}\`}`);
  props.push(`  language="${data.language}"`);

  if (data.filename) {
    props.push(`  filename="${data.filename}"`);
  }

  if (data.showLineNumbers !== undefined) {
    props.push(`  showLineNumbers={${data.showLineNumbers}}`);
  }

  if (data.highlightLines && data.highlightLines.length > 0) {
    props.push(`  highlightLines={[${data.highlightLines.join(", ")}]}`);
  }

  if (data.maxCollapsedLines) {
    props.push(`  maxCollapsedLines={${data.maxCollapsedLines}}`);
  }

  return `<CodeBlock\n${props.join("\n")}\n/>`;
}

export const codeBlockPresets: Record<
  CodeBlockPresetName,
  PresetWithCodeGen<SerializableCodeBlock>
> = {
  typescript: {
    description: "TypeScript with filename header",
    data: {
      id: "code-block-preview-typescript",
      code: `import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  );
}`,
      language: "typescript",
      filename: "Counter.tsx",
      showLineNumbers: true,
    } satisfies SerializableCodeBlock,
    generateExampleCode: generateCodeBlockCode,
  },
  python: {
    description: "Python function with docstring",
    data: {
      id: "code-block-preview-python",
      code: `def fibonacci(n: int) -> list[int]:
    """Generate Fibonacci sequence up to n terms."""
    if n <= 0:
        return []
    elif n == 1:
        return [0]

    sequence = [0, 1]
    while len(sequence) < n:
        sequence.append(sequence[-1] + sequence[-2])

    return sequence

# Example usage
print(fibonacci(10))`,
      language: "python",
      filename: "fibonacci.py",
      showLineNumbers: true,
    } satisfies SerializableCodeBlock,
    generateExampleCode: generateCodeBlockCode,
  },
  json: {
    description: "JSON configuration file",
    data: {
      id: "code-block-preview-json",
      code: `{
  "name": "tool-ui",
  "version": "1.0.0",
  "dependencies": {
    "react": "^19.0.0",
    "zod": "^4.0.0",
    "shiki": "^3.0.0"
  }
}`,
      language: "json",
      filename: "package.json",
      showLineNumbers: true,
    } satisfies SerializableCodeBlock,
    generateExampleCode: generateCodeBlockCode,
  },
  bash: {
    description: "Bash script with comments",
    data: {
      id: "code-block-preview-bash",
      code: `#!/bin/bash
# Deploy script

echo "Building application..."
pnpm run build

echo "Running tests..."
pnpm test

echo "Deploying to production..."
rsync -avz ./dist/ user@server:/var/www/app/

echo "Done!"`,
      language: "bash",
      filename: "deploy.sh",
      showLineNumbers: true,
    } satisfies SerializableCodeBlock,
    generateExampleCode: generateCodeBlockCode,
  },
  highlighted: {
    description: "Code with highlighted lines (bug indicator)",
    data: {
      id: "code-block-preview-highlighted",
      code: `function processData(items: string[]) {
  const results = [];

  for (const item of items) {
    // BUG: This should handle null values
    results.push(item.toUpperCase());
  }

  return results;
}`,
      language: "typescript",
      filename: "processor.ts",
      showLineNumbers: true,
      highlightLines: [5, 6],
    } satisfies SerializableCodeBlock,
    generateExampleCode: generateCodeBlockCode,
  },
  collapsible: {
    description: "Long code with collapse/expand",
    data: {
      id: "code-block-preview-collapsible",
      code: `import { z } from "zod";

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  role: z.enum(["admin", "member", "guest"]),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  profile: z.object({
    avatar: z.string().url().optional(),
    bio: z.string().max(500).optional(),
    location: z.string().optional(),
    website: z.string().url().optional(),
  }).optional(),
  preferences: z.object({
    theme: z.enum(["light", "dark", "system"]).default("system"),
    notifications: z.object({
      email: z.boolean().default(true),
      push: z.boolean().default(false),
      marketing: z.boolean().default(false),
    }),
    locale: z.string().default("en-US"),
    timezone: z.string().default("UTC"),
  }),
});

export type User = z.infer<typeof UserSchema>;

export const CreateUserSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateUser = z.infer<typeof CreateUserSchema>;`,
      language: "typescript",
      filename: "user-schema.ts",
      showLineNumbers: true,
      maxCollapsedLines: 10,
    } satisfies SerializableCodeBlock,
    generateExampleCode: generateCodeBlockCode,
  },
  "with-actions": {
    description: "Code with response action buttons",
    data: {
      id: "code-block-preview-with-actions",
      code: `# Install dependencies
pnpm install

# Run development server
pnpm dev`,
      language: "bash",
      filename: "setup.sh",
      showLineNumbers: true,
      responseActions: [
        { id: "copy", label: "Copy to clipboard", variant: "outline" },
        { id: "run", label: "Run in terminal", variant: "default" },
      ],
    } satisfies SerializableCodeBlock,
    generateExampleCode: generateCodeBlockCode,
  },
};
