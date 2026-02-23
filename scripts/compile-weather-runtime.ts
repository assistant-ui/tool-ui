import { watch } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  getStaleWeatherRuntimeArtifacts,
  WEATHER_AUTHORING_WATCH_DIRS,
  writeWeatherRuntimeArtifacts,
} from "../lib/weather-codegen/compile-weather-runtime";

interface ScriptOptions {
  check: boolean;
  watchMode: boolean;
}

function parseOptions(args: string[]): ScriptOptions {
  return {
    check: args.includes("--check"),
    watchMode: args.includes("--watch"),
  };
}

function resolveProjectRoot(): string {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(scriptDir, "..");
}

async function runCompile(projectRoot: string): Promise<void> {
  const { written, unchanged } =
    await writeWeatherRuntimeArtifacts(projectRoot);

  if (written.length === 0) {
    console.log("Weather artifacts are already up to date.");
    return;
  }

  console.log("Updated weather runtime artifacts:");
  for (const file of written) {
    console.log(`- ${file}`);
  }

  if (unchanged.length > 0) {
    console.log(`Unchanged artifacts: ${unchanged.length}`);
  }
}

async function runCheck(projectRoot: string): Promise<void> {
  const stale = await getStaleWeatherRuntimeArtifacts(projectRoot);

  if (stale.length === 0) {
    console.log("Weather runtime artifacts are up to date.");
    return;
  }

  console.error("Weather runtime artifacts are stale:");
  for (const file of stale) {
    console.error(`- ${file}`);
  }
  console.error("\nFix with: pnpm weather:compile");
  process.exitCode = 1;
}

function watchAuthoringSources(projectRoot: string): void {
  console.log("Watching weather authoring sources for changes...");

  let queued = false;
  let timer: NodeJS.Timeout | null = null;

  const rebuild = () => {
    if (queued) {
      return;
    }

    queued = true;
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(async () => {
      queued = false;
      try {
        await runCompile(projectRoot);
      } catch (error) {
        console.error("Weather runtime compile failed:");
        console.error(error);
      }
    }, 100);
  };

  for (const dir of WEATHER_AUTHORING_WATCH_DIRS) {
    const absoluteDir = path.join(projectRoot, dir);

    watch(absoluteDir, { persistent: true }, (_eventType, fileName) => {
      const changed =
        typeof fileName === "string" ? fileName : "(unknown file)";
      console.log(`Detected change in ${dir}/${changed}`);
      rebuild();
    });
  }
}

async function main(): Promise<void> {
  const options = parseOptions(process.argv.slice(2));
  const projectRoot = resolveProjectRoot();

  if (options.check && options.watchMode) {
    throw new Error("Use either --check or --watch, not both.");
  }

  if (options.check) {
    await runCheck(projectRoot);
    return;
  }

  await runCompile(projectRoot);

  if (options.watchMode) {
    watchAuthoringSources(projectRoot);
  }
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
