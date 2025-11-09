import { notFound } from "next/navigation";
import { getComponentById } from "@/lib/components-config";
import { ClientPreview } from "./client-preview";

export default async function ComponentPage({
  params,
}: {
  params: Promise<{ component: string }>;
}) {
  const { component } = await params;
  const resolved = getComponentById(component);
  if (!resolved) {
    notFound();
  }

  return <ClientPreview key={component} componentId={component} />;
}
