import { parseInstanceManifest } from "./schema";
import type { InstanceManifest } from "./schema";
import { assertValidToolUIAssignments } from "./ui-registry";

export interface ManifestModule {
  manifest: InstanceManifest;
}

type ManifestLoader = () => Promise<ManifestModule>;

const registry = {
  "example-basic": () => import("./example-basic/manifest"),
  "find-ride-v1": () => import("./find-ride-v1/manifest"),
} satisfies Record<string, ManifestLoader>;

const manifestModulePaths = {
  "example-basic": "./example-basic/manifest",
  "find-ride-v1": "./find-ride-v1/manifest",
} as const;

export const listInstanceSlugs = () => Object.keys(manifestModulePaths);

export const getManifestModulePath = (slug: string) =>
  manifestModulePaths[slug as keyof typeof manifestModulePaths];

export const resolveManifest = async (slug: string) => {
  const loader = registry[slug as keyof typeof registry];
  if (!loader) {
    throw new Error(`Unknown instance "${slug}"`);
  }

  const mod = await loader();
  const manifest = "manifest" in mod ? mod.manifest : undefined;

  if (!manifest) {
    throw new Error(`Manifest module "${slug}" must export { manifest }`);
  }

  const manifestPlain = JSON.parse(JSON.stringify(manifest)) as unknown;
  const parsed = parseInstanceManifest(manifestPlain);
  assertValidToolUIAssignments(parsed);
  return parsed;
};

export type { InstanceManifest } from "./schema";

