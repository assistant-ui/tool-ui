#!/usr/bin/env node
import process from "node:process";

import { loadManifestInfo, writeManifestFile } from "./utils/manifest-io";
import {
  listInstanceSlugs,
  resolveManifest,
} from "@/lib/prototypes/instances/registry";

const usage = `Usage:
  pnpm cloud:list
  pnpm cloud:deploy <slug> <deploymentId>
  pnpm cloud:promote <slug> <deploymentId>

Notes:
  - cloud:deploy sets the manifest cloud.deploymentId (mode left unchanged)
  - cloud:promote is an alias for cloud:deploy, intended for tagging stable deployments
`;

const listDeployments = async () => {
  const slugs = listInstanceSlugs();
  const rows = await Promise.all(
    slugs.map(async (slug) => {
      const manifest = await resolveManifest(slug);
      return {
        slug,
        mode: manifest.cloud?.mode ?? "local",
        deploymentId: manifest.cloud?.deploymentId ?? "—",
      };
    }),
  );

  const header = "Instance\tMode\tDeployment";
  const lines = rows
    .map((row) => `${row.slug}\t${row.mode}\t${row.deploymentId}`)
    .join("\n");

  process.stdout.write(`${header}\n${lines}\n`);
};

const updateDeploymentId = async (slug: string, deploymentId: string) => {
  const { manifest, manifestPath } = await loadManifestInfo(slug);

  const nextManifest = structuredClone(manifest);
  if (nextManifest.cloud) {
    nextManifest.cloud = { ...nextManifest.cloud, deploymentId };
  } else {
    nextManifest.cloud = { mode: "hybrid", deploymentId };
  }

  await writeManifestFile(manifestPath, nextManifest);

  process.stdout.write(
    `Updated deployment for "${slug}" -> ${deploymentId}\n`,
  );
};

const main = async () => {
  const [command, slug, deploymentId] = process.argv.slice(2);

  if (!command) {
    process.stderr.write(usage);
    process.exit(1);
  }

  if (command === "list") {
    await listDeployments();
    return;
  }

  if (command === "deploy" || command === "promote") {
    if (!slug || !deploymentId) {
      process.stderr.write(usage);
      process.exit(1);
    }

    await updateDeploymentId(slug, deploymentId);
    return;
  }

  process.stderr.write(usage);
  process.exit(1);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});


