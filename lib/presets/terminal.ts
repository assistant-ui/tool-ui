import type { SerializableTerminal } from "@/components/tool-ui/terminal";
import type { PresetWithCodeGen } from "./types";

export type TerminalPresetName = "success" | "error" | "build" | "ansiColors" | "collapsible" | "noOutput" | "with-actions";

function escape(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/`/g, "\\`");
}

function generateTerminalCode(data: SerializableTerminal): string {
  const props: string[] = [];

  props.push(`  command="${escape(data.command)}"`);

  if (data.stdout) {
    props.push(`  stdout={\`${escape(data.stdout)}\`}`);
  }

  if (data.stderr) {
    props.push(`  stderr={\`${escape(data.stderr)}\`}`);
  }

  props.push(`  exitCode={${data.exitCode}}`);

  if (data.durationMs !== undefined) {
    props.push(`  durationMs={${data.durationMs}}`);
  }

  if (data.cwd) {
    props.push(`  cwd="${data.cwd}"`);
  }

  if (data.truncated) {
    props.push(`  truncated={${data.truncated}}`);
  }

  if (data.maxCollapsedLines) {
    props.push(`  maxCollapsedLines={${data.maxCollapsedLines}}`);
  }

  return `<Terminal\n${props.join("\n")}\n/>`;
}

export const terminalPresets: Record<TerminalPresetName, PresetWithCodeGen<SerializableTerminal>> = {
  success: {
    description: "Successful test run with duration",
    data: {
      id: "terminal-preview-success",
      command: "pnpm test",
      stdout: `\x1b[32m✓\x1b[0m src/utils.test.ts \x1b[90m(5 tests)\x1b[0m \x1b[33m23ms\x1b[0m
\x1b[32m✓\x1b[0m src/api.test.ts \x1b[90m(12 tests)\x1b[0m \x1b[33m156ms\x1b[0m
\x1b[32m✓\x1b[0m src/components.test.ts \x1b[90m(8 tests)\x1b[0m \x1b[33m89ms\x1b[0m

\x1b[1mTest Files\x1b[0m  \x1b[32m3 passed\x1b[0m (3)
\x1b[1m     Tests\x1b[0m  \x1b[32m25 passed\x1b[0m (25)
\x1b[1m  Start at\x1b[0m  10:23:45
\x1b[1m  Duration\x1b[0m  312ms`,
      exitCode: 0,
      durationMs: 312,
      cwd: "~/project",
    } satisfies SerializableTerminal,
    generateExampleCode: generateTerminalCode,
  },
  error: {
    description: "Failed build with TypeScript error",
    data: {
      id: "terminal-preview-error",
      command: "pnpm build",
      stdout: `Building application...
Compiling TypeScript...`,
      stderr: `error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.

  src/utils.ts:23:15
    23   calculate(input);
                  ~~~~~

Found 1 error in src/utils.ts:23`,
      exitCode: 1,
      durationMs: 1523,
      cwd: "~/project",
    } satisfies SerializableTerminal,
    generateExampleCode: generateTerminalCode,
  },
  build: {
    description: "Docker build output",
    data: {
      id: "terminal-preview-build",
      command: "docker build -t myapp:latest .",
      stdout: `[+] Building 45.2s (12/12) FINISHED
 => [internal] load build definition from Dockerfile
 => [internal] load .dockerignore
 => [internal] load metadata for node:20-alpine
 => [1/7] FROM node:20-alpine@sha256:abc123...
 => [2/7] WORKDIR /app
 => [3/7] COPY package*.json ./
 => [4/7] RUN npm ci --only=production
 => [5/7] COPY . .
 => [6/7] RUN npm run build
 => [7/7] EXPOSE 3000
 => exporting to image
 => => naming to docker.io/library/myapp:latest

Successfully built image myapp:latest`,
      exitCode: 0,
      durationMs: 45200,
    } satisfies SerializableTerminal,
    generateExampleCode: generateTerminalCode,
  },
  ansiColors: {
    description: "ANSI colored lint output",
    data: {
      id: "terminal-preview-ansi",
      command: "npm run lint",
      stdout: `\x1b[32m✔\x1b[0m No ESLint warnings or errors
\x1b[36minfo\x1b[0m Checking formatting...
\x1b[33m⚠\x1b[0m 2 files need formatting
  \x1b[90msrc/utils.ts\x1b[0m
  \x1b[90msrc/api.ts\x1b[0m
\x1b[32m✔\x1b[0m TypeScript compilation successful
\x1b[1m\x1b[32mAll checks passed!\x1b[0m`,
      exitCode: 0,
      durationMs: 2341,
    } satisfies SerializableTerminal,
    generateExampleCode: generateTerminalCode,
  },
  collapsible: {
    description: "Long output with collapse",
    data: {
      id: "terminal-preview-collapsible",
      command: "pnpm install",
      stdout: `Packages: +847
++++++++++++++++++++++++++++++++++++++++++++++++++

Progress: resolved 892, reused 891, downloaded 1, added 847, done

dependencies:
+ @radix-ui/react-dialog 1.1.4
+ @radix-ui/react-dropdown-menu 2.1.4
+ @radix-ui/react-popover 1.1.4
+ @radix-ui/react-select 2.1.4
+ @radix-ui/react-tabs 1.1.2
+ @radix-ui/react-tooltip 1.1.6
+ class-variance-authority 0.7.1
+ clsx 2.1.1
+ lucide-react 0.468.0
+ next 15.1.3
+ react 19.0.0
+ react-dom 19.0.0
+ tailwind-merge 2.6.0
+ tailwindcss-animate 1.0.7
+ zod 3.24.1

devDependencies:
+ @types/node 22.10.5
+ @types/react 19.0.2
+ eslint 9.17.0
+ prettier 3.4.2
+ typescript 5.7.2

Done in 4.8s`,
      exitCode: 0,
      durationMs: 4800,
      maxCollapsedLines: 8,
    } satisfies SerializableTerminal,
    generateExampleCode: generateTerminalCode,
  },
  noOutput: {
    description: "Command with no output",
    data: {
      id: "terminal-preview-no-output",
      command: "touch newfile.txt",
      exitCode: 0,
      durationMs: 12,
      cwd: "~/project",
    } satisfies SerializableTerminal,
    generateExampleCode: generateTerminalCode,
  },
  "with-actions": {
    description: "Failed command with retry actions",
    data: {
      id: "terminal-preview-with-actions",
      command: "npm run deploy",
      stdout: "Deploying to production...",
      stderr: `Error: Connection timeout
Unable to reach deployment server after 30s`,
      exitCode: 1,
      durationMs: 30125,
      cwd: "~/project",
      responseActions: [
        { id: "retry", label: "Retry", variant: "default" },
        { id: "debug", label: "View logs", variant: "outline" },
      ],
    } satisfies SerializableTerminal,
    generateExampleCode: generateTerminalCode,
  },
};
