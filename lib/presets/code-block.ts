import type { SerializableCodeBlock } from "@/components/tool-ui/code-block";

export interface CodeBlockConfig {
  codeBlock: SerializableCodeBlock;
}

export type CodeBlockPresetName =
  | "typescript"
  | "python"
  | "json"
  | "bash"
  | "highlighted"
  | "collapsible";

const typescriptPreset: CodeBlockConfig = {
  codeBlock: {
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
  },
};

const pythonPreset: CodeBlockConfig = {
  codeBlock: {
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
  },
};

const jsonPreset: CodeBlockConfig = {
  codeBlock: {
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
  },
};

const bashPreset: CodeBlockConfig = {
  codeBlock: {
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
  },
};

const highlightedPreset: CodeBlockConfig = {
  codeBlock: {
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
  },
};

const collapsiblePreset: CodeBlockConfig = {
  codeBlock: {
    id: "code-block-preview-collapsible",
    code: Array.from(
      { length: 30 },
      (_, i) => `console.log("Line ${i + 1}");`,
    ).join("\n"),
    language: "javascript",
    showLineNumbers: true,
    maxCollapsedLines: 10,
  },
};

export const codeBlockPresets: Record<CodeBlockPresetName, CodeBlockConfig> = {
  typescript: typescriptPreset,
  python: pythonPreset,
  json: jsonPreset,
  bash: bashPreset,
  highlighted: highlightedPreset,
  collapsible: collapsiblePreset,
};

export const codeBlockPresetDescriptions: Record<CodeBlockPresetName, string> =
  {
    typescript: "TypeScript with filename header",
    python: "Python function with docstring",
    json: "JSON configuration file",
    bash: "Bash script with comments",
    highlighted: "Code with highlighted lines (bug indicator)",
    collapsible: "Long code with collapse/expand",
  };
