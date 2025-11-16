import { notFound } from "next/navigation";

import { InstanceView } from "./instance-view";
import { listInstanceSlugs, resolveManifest } from "@/lib/prototypes/instances";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  return listInstanceSlugs().map((slug) => ({ slug }));
}

export default async function PrototypeInstancePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;

  let manifestResult: Awaited<ReturnType<typeof resolveManifest>> | undefined;
  let instanceSummaries:
    | Array<{ slug: string; name: string; version: string }>
    | undefined;

  try {
    const slugs = listInstanceSlugs();
    const manifests = await Promise.all(
      slugs.map(async (instanceSlug) => resolveManifest(instanceSlug)),
    );

    manifestResult = manifests.find(
      (candidate) => candidate.meta.slug === slug,
    );

    if (!manifestResult) {
      notFound();
    }

    instanceSummaries = manifests.map((candidate) => ({
      slug: candidate.meta.slug,
      name: candidate.meta.name,
      version: candidate.meta.version,
    }));
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.toLowerCase().includes("unknown instance")
    ) {
      notFound();
    }
    throw error;
  }

  if (!manifestResult || !instanceSummaries) {
    notFound();
  }

  return (
    <InstanceView
      manifest={manifestResult}
      instances={instanceSummaries}
      searchParams={resolvedSearchParams}
    />
  );
}
