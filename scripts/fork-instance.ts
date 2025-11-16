#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import prettier from "prettier";

import {
  ensureSlugAvailable,
  instancesDir,
  readRegistrySource,
  writeManifestFile,
  writeRegistrySource,
} from "./utils/manifest-io";
import { resolveManifest } from "../lib/instances/registry";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const usage = `Usage: pnpm fork:instance <source-slug> <target-slug> [target-version]

Creates a new instance manifest by cloning the source manifest.
- Copies schema/tool definitions
- Updates meta.slug, meta.version, and meta.forkOf
- Clears cloud.deploymentId so a new deployment can be registered
- Registers the new instance inside lib/instances/registry.ts
`;

const incrementVersion = (version: string | undefined) => {
  if (!version) return "1.0.0";
  const segments = version.split(".");
  const numeric = segments.map((segment) => Number.parseInt(segment, 10));
  if (numeric.some((value) => Number.isNaN(value))) {
    return `${version}-fork`;
  }
  if (numeric.length === 1) {
    numeric.push(1);
  }
  const patchIndex = numeric.length - 1;
  numeric[patchIndex] += 1;
  return numeric.join(".");
};

const insertRegistryEntry = (
  source: string,
  blockName: "registry" | "manifestModulePaths",
  entry: string,
) => {
  const pattern = new RegExp(
    `const ${blockName} = \\{([\\s\\S]*?)\\}\\s+satisfies`,
    "m",
  );
  const match = source.match(pattern);
  if (!match) {
    throw new Error(
      `Unable to locate ${blockName} definition in registry.ts`,
    );
  }

  const existing = match[1];
  const trimmed = existing.trimEnd();
  const hasEntries = trimmed.length > 0;
  const prefix = hasEntries ? `${existing.trimEnd()}\n` : "\n";

  const replacement = `const ${blockName} = {${prefix}${entry}} satisfies`;
  return source.replace(pattern, replacement);
};

const main = async () => {
  const [sourceSlug, targetSlug, explicitVersion] = process.argv.slice(2);

  if (!sourceSlug || !targetSlug) {
    console.error(usage);
    process.exit(1);
  }

  if (sourceSlug === targetSlug) {
    console.error("Source and target slug must be different.");
    process.exit(1);
  }

  ensureSlugAvailable(targetSlug);

  const sourceManifest = await resolveManifest(sourceSlug);
  const manifestClone = structuredClone(sourceManifest);

  manifestClone.meta.slug = targetSlug;
  manifestClone.meta.version =
    explicitVersion ?? incrementVersion(sourceManifest.meta.version);
  manifestClone.meta.forkOf = sourceSlug;

  if (manifestClone.cloud) {
    manifestClone.cloud = { ...manifestClone.cloud, deploymentId: undefined };
  }

  const targetDir = path.join(instancesDir, targetSlug);
  const targetManifestPath = path.join(targetDir, "manifest.ts");

  await fs.mkdir(targetDir, { recursive: true });

  await writeManifestFile(targetManifestPath, manifestClone);

  const registrySource = await readRegistrySource();

  const manifestEntry = `  "${targetSlug}": () => import("./${targetSlug}/manifest"),\n`;
  const pathEntry = `  "${targetSlug}": "./${targetSlug}/manifest.ts",\n`;

  const updatedRegistry = insertRegistryEntry(
    insertRegistryEntry(registrySource, "registry", manifestEntry),
    "manifestModulePaths",
    pathEntry,
  );

  await writeRegistrySource(updatedRegistry);

  const formattedMessage = await prettier.format(
    `Forked instance "${sourceSlug}" -> "${targetSlug}" (${manifestClone.meta.version})
Manifest created at: ${path.relative(
      path.resolve(__dirname, ".."),
      targetManifestPath,
    )}
`,
    { parser: "markdown" },
  );

  process.stdout.write(formattedMessage);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});


