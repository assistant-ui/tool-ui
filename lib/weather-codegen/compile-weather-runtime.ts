import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { Plugin } from "esbuild";
import ts from "typescript";

export interface WeatherRuntimeArtifact {
  relativePath: string;
  contents: string;
}

export interface WeatherRuntimeWriteResult {
  written: string[];
  unchanged: string[];
}

const PRESET_AUTHORING_RELATIVE =
  "lib/weather-authoring/presets/tuned-presets.json";
const SHADER_AUTHORING_DIR_RELATIVE = "lib/weather-authoring/shaders";
const RUNTIME_AUTHORING_RELATIVE =
  "lib/weather-authoring/runtime/glass-panel-svg.tsx";
const OVERLAY_AUTHORING_RELATIVE =
  "lib/weather-authoring/weather-widget/weather-data-overlay.tsx";
const BUNDLE_ENTRY_AUTHORING_RELATIVE =
  "lib/weather-authoring/weather-widget/weather-runtime-core.ts";
const MOON_TEXTURE_AUTHORING_RELATIVE =
  "lib/weather-authoring/weather-widget/assets/moon-texture.jpg";
interface RuntimeModuleSpec {
  sourceRelativePath: string;
  outputRelativePath: string;
  rewrites?: Record<string, string>;
}

const PRESET_OUTPUT_RELATIVE =
  "lib/weather-authoring/weather-widget/effects/generated/tuned-presets.generated.ts";
const SHADER_OUTPUT_RELATIVE =
  "lib/weather-authoring/weather-widget/effects/generated/weather-effect-shaders.generated.ts";
const RUNTIME_OUTPUT_RELATIVE =
  "lib/weather-authoring/weather-widget/effects/generated/glass-panel-svg.generated.tsx";
const BUNDLED_RUNTIME_OUTPUT_RELATIVE =
  "components/tool-ui/weather-widget/generated/weather-runtime-core.generated.ts";
const BUNDLED_AUTHORING_WATCH_DIRS = [
  "lib/weather-authoring/weather-widget",
  "lib/weather-authoring/weather-widget/effects",
  "lib/weather-authoring/weather-widget/assets",
] as const;
const RUNTIME_MODULE_SPECS: RuntimeModuleSpec[] = [
  {
    sourceRelativePath: OVERLAY_AUTHORING_RELATIVE,
    outputRelativePath:
      "lib/weather-authoring/weather-widget/weather-data-overlay.generated.ts",
    rewrites: {
      "./effects/glass-panel-svg": "./effects/use-glass-styles",
    },
  },
];

interface ShaderSpec {
  exportName: string;
  fileName: string;
}

const WEATHER_SHADER_SPECS: ShaderSpec[] = [
  { exportName: "FULLSCREEN_VERTEX", fileName: "fullscreen.vert.glsl" },
  { exportName: "CELESTIAL_FRAGMENT", fileName: "celestial.frag.glsl" },
  { exportName: "CLOUD_FRAGMENT", fileName: "cloud.frag.glsl" },
  { exportName: "RAIN_FRAGMENT", fileName: "rain.frag.glsl" },
  { exportName: "LIGHTNING_FRAGMENT", fileName: "lightning.frag.glsl" },
  { exportName: "SNOW_FRAGMENT", fileName: "snow.frag.glsl" },
  { exportName: "COMPOSITE_FRAGMENT", fileName: "composite.frag.glsl" },
];

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" && value !== null && !Array.isArray(value)
  );
}

function normalizeNumber(value: number): number {
  if (!Number.isFinite(value)) {
    throw new Error(`Invalid numeric value in presets: ${String(value)}`);
  }

  return Number(value.toFixed(4));
}

export function canonicalizeWeatherPresetData(value: unknown): unknown {
  if (typeof value === "number") {
    return normalizeNumber(value);
  }

  if (Array.isArray(value)) {
    return value.map((entry) => canonicalizeWeatherPresetData(entry));
  }

  if (isPlainObject(value)) {
    const sortedKeys = Object.keys(value).sort((a, b) =>
      a.localeCompare(b, "en"),
    );
    const out: Record<string, unknown> = {};

    for (const key of sortedKeys) {
      out[key] = canonicalizeWeatherPresetData(value[key]);
    }

    return out;
  }

  return value;
}

function serializeJsLiteral(value: unknown): string {
  if (value === null) return "null";

  if (typeof value === "number") {
    return normalizeNumber(value).toFixed(4);
  }

  if (typeof value === "string") {
    return JSON.stringify(value);
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  if (Array.isArray(value)) {
    return `[${value.map((entry) => serializeJsLiteral(entry)).join(",")}]`;
  }

  if (isPlainObject(value)) {
    return `{${Object.entries(value)
      .map(([key, entryValue]) => `${JSON.stringify(key)}:${serializeJsLiteral(entryValue)}`)
      .join(",")}}`;
  }

  throw new Error(`Unsupported preset value type: ${typeof value}`);
}

function stripShaderComments(source: string): string {
  let output = "";
  let i = 0;
  let inBlockComment = false;
  let inLineComment = false;

  while (i < source.length) {
    const char = source[i];
    const next = source[i + 1];

    if (inBlockComment) {
      if (char === "*" && next === "/") {
        inBlockComment = false;
        i += 2;
        continue;
      }

      i += 1;
      continue;
    }

    if (inLineComment) {
      if (char === "\n") {
        inLineComment = false;
        output += "\n";
      }

      i += 1;
      continue;
    }

    if (char === "/" && next === "*") {
      inBlockComment = true;
      i += 2;
      continue;
    }

    if (char === "/" && next === "/") {
      inLineComment = true;
      i += 2;
      continue;
    }

    output += char;
    i += 1;
  }

  return output;
}

export function minifyWeatherShaderSource(source: string): string {
  const normalized = stripShaderComments(source.replace(/\r\n/g, "\n"));

  const minifiedLines = normalized
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      if (line.startsWith("#")) {
        return line;
      }

      return line
        .replace(/\s+/g, " ")
        .replace(/\s*([{}()[\];,+\-*/%=<>!?:|&])\s*/g, "$1");
    });

  return `${minifiedLines.join("\n")}\n`;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function rewriteModuleSpecifiers(
  source: string,
  rewrites?: Record<string, string>,
): string {
  if (!rewrites || Object.keys(rewrites).length === 0) {
    return source;
  }

  let rewritten = source;
  for (const [from, to] of Object.entries(rewrites)) {
    const quotedSpecifier = new RegExp(`(["'])${escapeRegExp(from)}\\1`, "g");
    rewritten = rewritten.replace(quotedSpecifier, (_match, quote: string) => {
      return `${quote}${to}${quote}`;
    });
  }

  return rewritten;
}

function normalizeGeneratedModuleText(source: string): string {
  return source.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trimEnd();
}

function toDataUrl(mimeType: string, binary: Buffer): string {
  return `data:${mimeType};base64,${binary.toString("base64")}`;
}

function inlineMoonTextureAssetUrl(
  projectRoot: string,
  bundledRuntime: string,
): string {
  const moonTexturePath = path.join(projectRoot, MOON_TEXTURE_AUTHORING_RELATIVE);
  const moonTextureDataUrl = toDataUrl(
    "image/jpeg",
    readFileSync(moonTexturePath),
  );
  const moonTextureUrlExpression =
    /new URL\(\s*["']\.\.\/assets\/moon-texture\.jpg["']\s*,\s*import\.meta\.url\s*\)\.toString\(\)/g;

  return bundledRuntime.replace(
    moonTextureUrlExpression,
    JSON.stringify(moonTextureDataUrl),
  );
}

export function loadWeatherAuthoringPreset(projectRoot: string): unknown {
  const presetPath = path.join(projectRoot, PRESET_AUTHORING_RELATIVE);
  const raw = readFileSync(presetPath, "utf8");
  return JSON.parse(raw) as unknown;
}

export function loadWeatherAuthoringShaders(
  projectRoot: string,
): Record<string, string> {
  const shaders: Record<string, string> = {};

  for (const spec of WEATHER_SHADER_SPECS) {
    const shaderPath = path.join(
      projectRoot,
      SHADER_AUTHORING_DIR_RELATIVE,
      spec.fileName,
    );

    shaders[spec.exportName] = readFileSync(shaderPath, "utf8");
  }

  return shaders;
}

export function compileWeatherPresetModule(authoringPreset: unknown): string {
  const canonical = canonicalizeWeatherPresetData(authoringPreset);

  return [
    "// AUTO-GENERATED by `pnpm weather:compile`.",
    "// Source: lib/weather-authoring/presets/tuned-presets.json",
    "// DO NOT EDIT MANUALLY.",
    "",
    'import type { WeatherConditionCode } from "../../schema-runtime";',
    'import type { WeatherEffectsCheckpointOverrides } from "../tuning";',
    "",
    "export const TUNED_WEATHER_EFFECTS_CHECKPOINT_OVERRIDES: Partial<",
    "  Record<WeatherConditionCode, WeatherEffectsCheckpointOverrides>",
    `> = ${serializeJsLiteral(canonical)};`,
    "",
  ].join("\n");
}

export function compileWeatherShaderModule(
  authoringShaders: Record<string, string>,
): string {
  const lines = [
    "// AUTO-GENERATED by `pnpm weather:compile`.",
    "// Source: lib/weather-authoring/shaders/*.glsl",
    "// DO NOT EDIT MANUALLY.",
    "",
  ];

  for (const spec of WEATHER_SHADER_SPECS) {
    const source = authoringShaders[spec.exportName];
    if (typeof source !== "string") {
      throw new Error(`Missing shader source for ${spec.exportName}`);
    }

    const minified = minifyWeatherShaderSource(source);
    lines.push(
      `export const ${spec.exportName} = ${JSON.stringify(minified)};`,
      "",
    );
  }

  return lines.join("\n");
}

export function compileWeatherRuntimeModule(authoringSource: string): string {
  const sourceFile = ts.createSourceFile(
    "glass-panel-svg.tsx",
    authoringSource,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const printer = ts.createPrinter({
    removeComments: true,
    newLine: ts.NewLineKind.LineFeed,
  });
  const printed = printer
    .printFile(sourceFile)
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trimEnd();

  return [
    "// AUTO-GENERATED by `pnpm weather:compile`.",
    "// Source: lib/weather-authoring/runtime/glass-panel-svg.tsx",
    "// DO NOT EDIT MANUALLY.",
    "",
    printed,
    "",
  ].join("\n");
}

export function compileWeatherRuntimeJsModule(
  source: string,
  options: {
    sourceRelativePath: string;
    rewrites?: Record<string, string>;
  },
): string {
  const rewritten = rewriteModuleSpecifiers(source, options.rewrites);
  const output = ts.transpileModule(rewritten, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ESNext,
      jsx: ts.JsxEmit.ReactJSX,
      removeComments: true,
      newLine: ts.NewLineKind.LineFeed,
    },
    fileName: options.sourceRelativePath,
    reportDiagnostics: true,
  });

  if (output.diagnostics && output.diagnostics.length > 0) {
    const diagnostics = ts.formatDiagnosticsWithColorAndContext(
      output.diagnostics,
      {
        getCanonicalFileName: (fileName) => fileName,
        getCurrentDirectory: () => process.cwd(),
        getNewLine: () => "\n",
      },
    );
    throw new Error(
      `Failed to compile weather runtime module ${options.sourceRelativePath}:\n${diagnostics}`,
    );
  }

  const transformed = normalizeGeneratedModuleText(output.outputText);
  return [
    "// @ts-nocheck",
    "// AUTO-GENERATED by `pnpm weather:compile`.",
    `// Source: ${options.sourceRelativePath}`,
    "// DO NOT EDIT MANUALLY.",
    "",
    transformed,
    "",
  ].join("\n");
}

function toAbsoluteGeneratedModuleMap(
  projectRoot: string,
  artifacts: WeatherRuntimeArtifact[],
): Map<string, string> {
  const generatedMap = new Map<string, string>();

  for (const artifact of artifacts) {
    generatedMap.set(path.join(projectRoot, artifact.relativePath), artifact.contents);
  }

  return generatedMap;
}

function detectLoader(filePath: string): "ts" | "tsx" | "js" | "jsx" {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".ts") return "ts";
  if (ext === ".tsx") return "tsx";
  if (ext === ".jsx") return "jsx";
  return "js";
}

function resolveGeneratedSpecifier(
  projectRoot: string,
  resolveDir: string,
  specifier: string,
  generatedModules: Map<string, string>,
): string | null {
  const absoluteBase = specifier.startsWith("@/")
    ? path.join(projectRoot, specifier.slice(2))
    : path.resolve(resolveDir, specifier);
  const candidates = [
    absoluteBase,
    `${absoluteBase}.ts`,
    `${absoluteBase}.tsx`,
    `${absoluteBase}.js`,
    `${absoluteBase}.jsx`,
    path.join(absoluteBase, "index.ts"),
    path.join(absoluteBase, "index.tsx"),
    path.join(absoluteBase, "index.js"),
    path.join(absoluteBase, "index.jsx"),
  ];

  for (const candidate of candidates) {
    if (generatedModules.has(candidate)) {
      return candidate;
    }
  }

  return null;
}

function createGeneratedModulePlugin(
  projectRoot: string,
  generatedModules: Map<string, string>,
): Plugin {
  return {
    name: "weather-generated-modules",
    setup(build) {
      build.onResolve({ filter: /.*/ }, (args) => {
        if (!args.path.startsWith(".") && !args.path.startsWith("@/")) {
          return null;
        }

        const resolved = resolveGeneratedSpecifier(
          projectRoot,
          args.resolveDir,
          args.path,
          generatedModules,
        );
        if (!resolved) {
          return null;
        }

        return {
          path: resolved,
          namespace: "weather-generated",
        };
      });

      build.onLoad({ filter: /.*/, namespace: "weather-generated" }, (args) => {
        const contents = generatedModules.get(args.path);
        if (contents === undefined) {
          return null;
        }

        return {
          contents,
          loader: detectLoader(args.path),
          resolveDir: path.dirname(args.path),
        };
      });
    },
  };
}

async function compileWeatherBundledRuntimeModule(
  projectRoot: string,
  generatedArtifacts: WeatherRuntimeArtifact[],
): Promise<string> {
  const { build } = await import("esbuild");
  const generatedMap = toAbsoluteGeneratedModuleMap(projectRoot, generatedArtifacts);
  const entryPath = path.join(projectRoot, BUNDLE_ENTRY_AUTHORING_RELATIVE);

  const buildResult = await build({
    entryPoints: [entryPath],
    bundle: true,
    write: false,
    format: "esm",
    platform: "browser",
    target: ["es2020"],
    jsx: "automatic",
    minify: true,
    logLevel: "silent",
    sourcemap: false,
    external: [
      "react",
      "react/jsx-runtime",
      "lucide-react",
      "@/components/ui/*",
      "@/lib/utils",
    ],
    loader: {
      ".jpg": "dataurl",
    },
    plugins: [createGeneratedModulePlugin(projectRoot, generatedMap)],
  });

  const runtimeFile =
    buildResult.outputFiles.find((file) => file.path.endsWith(".js")) ??
    buildResult.outputFiles[0];

  if (!runtimeFile) {
    throw new Error("Weather runtime bundle generation produced no JavaScript output.");
  }

  const bundleText = normalizeGeneratedModuleText(runtimeFile.text);
  const normalizedBundleText = inlineMoonTextureAssetUrl(projectRoot, bundleText);
  return [
    "// @ts-nocheck",
    "// AUTO-GENERATED by `pnpm weather:compile`.",
    `// Source: ${BUNDLE_ENTRY_AUTHORING_RELATIVE}`,
    "// DO NOT EDIT MANUALLY.",
    "",
    normalizedBundleText,
    "",
  ].join("\n");
}

export async function buildWeatherRuntimeArtifacts(
  projectRoot: string,
): Promise<WeatherRuntimeArtifact[]> {
  const authoringPreset = loadWeatherAuthoringPreset(projectRoot);
  const authoringShaders = loadWeatherAuthoringShaders(projectRoot);
  const authoringRuntime = readFileSync(
    path.join(projectRoot, RUNTIME_AUTHORING_RELATIVE),
    "utf8",
  );
  const runtimeModules = RUNTIME_MODULE_SPECS.map((spec) => {
    const sourcePath = path.join(projectRoot, spec.sourceRelativePath);
    const source = readFileSync(sourcePath, "utf8");
    return {
      relativePath: spec.outputRelativePath,
      contents: compileWeatherRuntimeJsModule(source, {
        sourceRelativePath: spec.sourceRelativePath,
        rewrites: spec.rewrites,
      }),
    } as WeatherRuntimeArtifact;
  });

  const nonBundledArtifacts: WeatherRuntimeArtifact[] = [
    {
      relativePath: PRESET_OUTPUT_RELATIVE,
      contents: compileWeatherPresetModule(authoringPreset),
    },
    {
      relativePath: SHADER_OUTPUT_RELATIVE,
      contents: compileWeatherShaderModule(authoringShaders),
    },
    {
      relativePath: RUNTIME_OUTPUT_RELATIVE,
      contents: compileWeatherRuntimeModule(authoringRuntime),
    },
    ...runtimeModules,
  ];

  return [
    ...nonBundledArtifacts,
    {
      relativePath: BUNDLED_RUNTIME_OUTPUT_RELATIVE,
      contents: await compileWeatherBundledRuntimeModule(
        projectRoot,
        nonBundledArtifacts,
      ),
    },
  ];
}

export async function writeWeatherRuntimeArtifacts(
  projectRoot: string,
): Promise<WeatherRuntimeWriteResult> {
  const artifacts = await buildWeatherRuntimeArtifacts(projectRoot);
  const written: string[] = [];
  const unchanged: string[] = [];

  for (const artifact of artifacts) {
    const outputPath = path.join(projectRoot, artifact.relativePath);
    const outputDir = path.dirname(outputPath);

    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    const current = existsSync(outputPath)
      ? readFileSync(outputPath, "utf8")
      : null;

    if (current === artifact.contents) {
      unchanged.push(artifact.relativePath);
      continue;
    }

    writeFileSync(outputPath, artifact.contents, "utf8");
    written.push(artifact.relativePath);
  }

  return { written, unchanged };
}

export async function getStaleWeatherRuntimeArtifacts(
  projectRoot: string,
): Promise<string[]> {
  const artifacts = await buildWeatherRuntimeArtifacts(projectRoot);
  const stale: string[] = [];

  for (const artifact of artifacts) {
    const outputPath = path.join(projectRoot, artifact.relativePath);
    const current = existsSync(outputPath)
      ? readFileSync(outputPath, "utf8")
      : null;

    if (current !== artifact.contents) {
      stale.push(artifact.relativePath);
    }
  }

  return stale;
}

export const WEATHER_AUTHORING_WATCH_DIRS = [
  PRESET_AUTHORING_RELATIVE.replace(/\/[^/]+$/, ""),
  SHADER_AUTHORING_DIR_RELATIVE,
  RUNTIME_AUTHORING_RELATIVE.replace(/\/[^/]+$/, ""),
  ...BUNDLED_AUTHORING_WATCH_DIRS,
  ...Array.from(
    new Set(
      RUNTIME_MODULE_SPECS.map((spec) =>
        spec.sourceRelativePath.replace(/\/[^/]+$/, ""),
      ),
    ),
  ),
] as const;
