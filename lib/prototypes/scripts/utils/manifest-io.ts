import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import prettier from "prettier";

import {
  getManifestModulePath,
  listInstanceSlugs,
  resolveManifest,
} from "@/lib/prototypes/instances/registry";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const repoRoot = path.resolve(__dirname, "..", "..", "..", "..");
export const instancesDir = path.join(repoRoot, "lib/prototypes/instances");
export const registryPath = path.join(instancesDir, "registry.ts");

export const loadManifestInfo = async (slug: string) => {
  const modulePath = getManifestModulePath(slug);
  if (!modulePath) {
    throw new Error(`Unknown instance "${slug}"`);
  }

  const manifest = await resolveManifest(slug);
  const manifestPath = path.join(
    instancesDir,
    modulePath.replace("./", ""),
  );

  return { manifest, manifestPath };
};

const toSerializable = <T>(value: T): T =>
  JSON.parse(JSON.stringify(value, (_, v) => (v === undefined ? undefined : v))) as T;

export const writeManifestFile = async <T>(
  manifestPath: string,
  manifest: T,
) => {
  const manifestDir = path.dirname(manifestPath);
  await fs.mkdir(manifestDir, { recursive: true });

  const literal = toSerializable(manifest);
  const code = `import type { ManifestModule } from "../registry";

export const manifest: ManifestModule["manifest"] = ${JSON.stringify(
    literal,
    null,
    2,
  )} as const;
`;

  const formatted = await prettier.format(code, { parser: "typescript" });
  await fs.writeFile(manifestPath, formatted, "utf8");
};

export const ensureSlugAvailable = (slug: string) => {
  if (listInstanceSlugs().includes(slug)) {
    throw new Error(`Instance "${slug}" already exists in the registry.`);
  }
};

export const readRegistrySource = async () =>
  fs.readFile(registryPath, "utf8");

export const writeRegistrySource = async (source: string) =>
  fs.writeFile(
    registryPath,
    await prettier.format(source, { parser: "typescript" }),
    "utf8",
  );


