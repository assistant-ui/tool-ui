import { existsSync, statSync, promises as fs } from "fs";
import path from "path";

type RegistryItemType =
  | "registry:block"
  | "registry:component"
  | "registry:lib"
  | "registry:hook"
  | "registry:ui"
  | "registry:page"
  | "registry:file"
  | "registry:style"
  | "registry:theme"
  | "registry:item";

export interface RegistryFile {
  path: string;
  type: RegistryItemType;
  target?: string;
  content?: string;
}

export interface RegistryItem {
  $schema: string;
  name: string;
  type: RegistryItemType;
  title: string;
  description: string;
  dependencies?: string[];
  registryDependencies?: string[];
  files: RegistryFile[];
}

export interface RegistryIndex {
  $schema: string;
  name: string;
  homepage: string;
  items: Array<Omit<RegistryItem, "$schema"> & { files?: RegistryFile[] }>;
}

interface ToolUiRegistryDefinition {
  name: string;
  title: string;
  description: string;
  sourceDir: string;
}

export interface ToolUiRegistryArtifacts {
  index: RegistryIndex;
  items: RegistryItem[];
}

const REGISTRY_SCHEMA = "https://ui.shadcn.com/schema/registry.json";
const REGISTRY_ITEM_SCHEMA = "https://ui.shadcn.com/schema/registry-item.json";

const IMPORT_SPECIFIER_RE = /(?:import|export)\s[^"']*from\s+["']([^"']+)["']/g;
const DYNAMIC_IMPORT_RE = /import\(["']([^"']+)["']\)/g;
const TOOL_UI_COMPONENTS_DIR = "components/tool-ui";
const IGNORED_REGISTRY_FILE_NAMES = new Set([".DS_Store", "Thumbs.db"]);

const COMPONENT_DESCRIPTION_OVERRIDES: Partial<Record<string, string>> = {
  "approval-card": "Binary confirmation for agent actions.",
  audio: "Audio playback with artwork and metadata.",
  chart: "Visualize data with interactive charts.",
  citation: "Display source references with attribution.",
  "code-block": "Display syntax-highlighted code snippets.",
  "data-table": "Sortable, responsive data tables for tool call results.",
  image: "Display images with metadata and attribution.",
  "image-gallery": "Grid layout for browsing image collections.",
  "instagram-post": "Render Instagram post previews.",
  "item-carousel": "Horizontal carousel for browsing collections.",
  "link-preview": "Rich link previews with OG data.",
  "linkedin-post": "Render LinkedIn post previews.",
  "message-draft": "Review and confirm drafted messages before sending.",
  "option-list": "Single or multi-select choices with confirmation actions.",
  "order-summary": "Itemized purchase confirmation with pricing.",
  "parameter-slider": "Numeric parameter adjustment controls.",
  plan: "Display step-by-step task workflows in AI interfaces.",
  "preferences-panel": "Compact settings panel for user preferences.",
  "progress-tracker":
    "Show real-time status feedback for multi-step operations in AI interfaces.",
  "question-flow": "Multi-step guided questions with branching.",
  "stats-display": "Display key metrics in compact cards.",
  terminal: "Show command-line output and logs.",
  video: "Video playback with controls and poster.",
  "weather-widget": "Display weather conditions and forecasts.",
  "x-post": "Render X (Twitter) post previews.",
};

function inferRegistryFileType(filePath: string): RegistryItemType {
  if (filePath.endsWith(".tsx")) return "registry:component";
  if (filePath.endsWith(".ts")) return "registry:lib";
  if (filePath.endsWith(".css")) return "registry:style";
  return "registry:file";
}

async function listFilesRecursively(dirPath: string): Promise<string[]> {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const filePaths: string[] = [];

  for (const entry of entries) {
    if (IGNORED_REGISTRY_FILE_NAMES.has(entry.name)) {
      continue;
    }

    const entryPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      filePaths.push(...(await listFilesRecursively(entryPath)));
      continue;
    }
    if (entry.isFile()) {
      filePaths.push(entryPath);
    }
  }

  return filePaths.sort((a, b) => a.localeCompare(b));
}

function toPosixPath(filePath: string): string {
  return filePath.split(path.sep).join(path.posix.sep);
}

function resolveLocalImport(
  projectRoot: string,
  fromAbsolutePath: string,
  specifier: string,
): string | null {
  if (!specifier.startsWith(".") && !specifier.startsWith("@/")) {
    return null;
  }

  const basePath = specifier.startsWith("@/")
    ? path.join(projectRoot, specifier.slice(2))
    : path.resolve(path.dirname(fromAbsolutePath), specifier);
  const candidates = [
    `${basePath}.ts`,
    `${basePath}.tsx`,
    path.join(basePath, "index.ts"),
    path.join(basePath, "index.tsx"),
    basePath,
  ];

  for (const candidate of candidates) {
    if (!existsSync(candidate)) {
      continue;
    }

    if (path.extname(candidate) || statSync(candidate).isFile()) {
      return candidate;
    }

    const indexTs = path.join(candidate, "index.ts");
    const indexTsx = path.join(candidate, "index.tsx");
    if (existsSync(indexTs)) return indexTs;
    if (existsSync(indexTsx)) return indexTsx;
  }

  return null;
}

function extractImportSpecifiers(content: string): string[] {
  const imports = new Set<string>();
  IMPORT_SPECIFIER_RE.lastIndex = 0;
  DYNAMIC_IMPORT_RE.lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = IMPORT_SPECIFIER_RE.exec(content)) !== null) {
    const specifier = match[1];
    imports.add(specifier);
  }

  while ((match = DYNAMIC_IMPORT_RE.exec(content)) !== null) {
    const specifier = match[1];
    imports.add(specifier);
  }

  return Array.from(imports);
}

function extractLocalImportSpecifiers(content: string): string[] {
  return extractImportSpecifiers(content).filter((specifier) =>
    specifier.startsWith(".") || specifier.startsWith("@/"),
  );
}

function toTitleCase(name: string): string {
  return name
    .split("-")
    .filter(Boolean)
    .map((segment) => segment[0].toUpperCase() + segment.slice(1))
    .join(" ");
}

function toPackageName(specifier: string): string | null {
  if (
    specifier.startsWith(".") ||
    specifier.startsWith("/") ||
    specifier.startsWith("@/") ||
    specifier.startsWith("node:")
  ) {
    return null;
  }

  if (specifier.startsWith("@")) {
    const [scope, pkg] = specifier.split("/");
    return scope && pkg ? `${scope}/${pkg}` : null;
  }

  const [pkg] = specifier.split("/");
  return pkg || null;
}

function toRegistryDependency(specifier: string): string | null {
  if (!specifier.startsWith("@/components/ui/")) return null;
  const value = specifier.replace("@/components/ui/", "").split("/")[0];
  return value || null;
}

function toRegistryDependencyFromResolvedPath(
  relativePath: string,
): string | null {
  if (!relativePath.startsWith("components/ui/")) return null;
  const value = relativePath
    .replace("components/ui/", "")
    .split("/")[0]
    .replace(/\.[^.]+$/, "");
  return value || null;
}

async function discoverToolUiRegistryDefinitions(
  projectRoot: string,
): Promise<ToolUiRegistryDefinition[]> {
  const absoluteDir = path.join(projectRoot, TOOL_UI_COMPONENTS_DIR);
  const entries = await fs.readdir(absoluteDir, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => name !== "shared")
    .sort((a, b) => a.localeCompare(b))
    .map((name) => {
      const title = toTitleCase(name);
      const description =
        COMPONENT_DESCRIPTION_OVERRIDES[name] ??
        `${title} component for AI interfaces.`;
      return {
        name,
        title,
        description,
        sourceDir: `${TOOL_UI_COMPONENTS_DIR}/${name}`,
      };
    });
}

function shouldIncludeResolvedPath(
  relativePath: string,
  sourceDir: string,
): boolean {
  if (relativePath.startsWith(`${sourceDir}/`)) return true;
  return relativePath.startsWith("components/tool-ui/shared/");
}

async function collectItemFilePaths(
  projectRoot: string,
  sourceDir: string,
): Promise<string[]> {
  const absoluteSourceDir = path.join(projectRoot, sourceDir);
  const componentFilePaths = await listFilesRecursively(absoluteSourceDir);

  const included = new Set(componentFilePaths);
  const queue = [...componentFilePaths];
  const seen = new Set<string>();

  while (queue.length > 0) {
    const absolutePath = queue.pop() as string;
    if (seen.has(absolutePath)) continue;
    seen.add(absolutePath);

    const content = await fs.readFile(absolutePath, "utf8");
    const importSpecifiers = extractLocalImportSpecifiers(content);

    for (const specifier of importSpecifiers) {
      const resolvedPath = resolveLocalImport(
        projectRoot,
        absolutePath,
        specifier,
      );
      if (!resolvedPath) continue;

      const relativePath = toPosixPath(
        path.relative(projectRoot, resolvedPath),
      );
      if (!shouldIncludeResolvedPath(relativePath, sourceDir)) continue;

      if (!included.has(resolvedPath)) {
        included.add(resolvedPath);
        queue.push(resolvedPath);
      }
    }
  }

  return Array.from(included)
    .map((absolutePath) =>
      toPosixPath(path.relative(projectRoot, absolutePath)),
    )
    .sort((a, b) => a.localeCompare(b));
}

async function buildRegistryItem(
  projectRoot: string,
  definition: ToolUiRegistryDefinition,
): Promise<RegistryItem> {
  const relativeFilePaths = await collectItemFilePaths(
    projectRoot,
    definition.sourceDir,
  );
  const dependencySet = new Set<string>();
  const registryDependencySet = new Set<string>();

  const files = await Promise.all(
    relativeFilePaths.map(async (relativePath): Promise<RegistryFile> => {
      const absolutePath = path.join(projectRoot, relativePath);
      const content = await fs.readFile(absolutePath, "utf8");

      const importSpecifiers = extractImportSpecifiers(content);
      for (const specifier of importSpecifiers) {
        const pkg = toPackageName(specifier);
        if (pkg && pkg !== "react" && pkg !== "react-dom") {
          dependencySet.add(pkg);
        }

        let registryDependency = toRegistryDependency(specifier);
        if (
          !registryDependency &&
          (specifier.startsWith(".") || specifier.startsWith("@/"))
        ) {
          const resolvedPath = resolveLocalImport(
            projectRoot,
            absolutePath,
            specifier,
          );
          if (resolvedPath) {
            const resolvedRelativePath = toPosixPath(
              path.relative(projectRoot, resolvedPath),
            );
            registryDependency =
              toRegistryDependencyFromResolvedPath(resolvedRelativePath);
          }
        }
        if (registryDependency) {
          registryDependencySet.add(registryDependency);
        }
      }

      return {
        path: relativePath,
        type: inferRegistryFileType(relativePath),
        target: relativePath,
        content,
      };
    }),
  );

  return {
    $schema: REGISTRY_ITEM_SCHEMA,
    name: definition.name,
    type: "registry:block",
    title: definition.title,
    description: definition.description,
    dependencies:
      dependencySet.size > 0
        ? Array.from(dependencySet).sort((a, b) => a.localeCompare(b))
        : undefined,
    registryDependencies:
      registryDependencySet.size > 0
        ? Array.from(registryDependencySet).sort((a, b) => a.localeCompare(b))
        : undefined,
    files,
  };
}

function toIndexItem(item: RegistryItem): RegistryIndex["items"][number] {
  return {
    name: item.name,
    type: item.type,
    title: item.title,
    description: item.description,
    dependencies: item.dependencies,
    registryDependencies: item.registryDependencies,
    files: item.files.map(({ path: filePath, type, target }) => ({
      path: filePath,
      type,
      ...(target ? { target } : {}),
    })),
  };
}

export async function buildToolUiRegistryArtifacts(
  projectRoot: string,
): Promise<ToolUiRegistryArtifacts> {
  const definitions = await discoverToolUiRegistryDefinitions(projectRoot);
  const items = await Promise.all(
    definitions.map((definition) =>
      buildRegistryItem(projectRoot, definition),
    ),
  );

  const index: RegistryIndex = {
    $schema: REGISTRY_SCHEMA,
    name: "tool-ui",
    homepage: "https://tool-ui.com",
    items: items.map(toIndexItem),
  };

  return {
    index,
    items,
  };
}

export async function writeToolUiRegistryArtifacts(
  projectRoot: string,
): Promise<ToolUiRegistryArtifacts> {
  const artifacts = await buildToolUiRegistryArtifacts(projectRoot);
  const outputDir = path.join(projectRoot, "public", "r");
  await fs.mkdir(outputDir, { recursive: true });

  const expectedFiles = new Set([
    "registry.json",
    ...artifacts.items.map((item) => `${item.name}.json`),
  ]);
  const existingFiles = await fs.readdir(outputDir);
  await Promise.all(
    existingFiles
      .filter((fileName) => fileName.endsWith(".json"))
      .filter((fileName) => !expectedFiles.has(fileName))
      .map((fileName) => fs.unlink(path.join(outputDir, fileName))),
  );

  await fs.writeFile(
    path.join(outputDir, "registry.json"),
    `${JSON.stringify(artifacts.index, null, 2)}\n`,
    "utf8",
  );

  await Promise.all(
    artifacts.items.map((item) =>
      fs.writeFile(
        path.join(outputDir, `${item.name}.json`),
        `${JSON.stringify(item, null, 2)}\n`,
        "utf8",
      ),
    ),
  );

  return artifacts;
}
