import {
  generateOgImage,
  size as ogSize,
  contentType as ogContentType,
} from "@/lib/og/og-image";
import { getComponentById } from "@/lib/docs/component-registry";

export const size = ogSize;
export const contentType = ogContentType;

export function generateImageMetadata({
  params,
}: {
  params: { component: string };
}) {
  const component = getComponentById(params.component);
  return {
    alt: `Tool UI - ${component?.label ?? "Component"}`,
  };
}

export default async function Image({
  params,
}: {
  params: Promise<{ component: string }>;
}) {
  const { component: componentId } = await params;
  const component = getComponentById(componentId);
  const label = component?.label ?? "Component";
  const description = component?.description;

  return generateOgImage(label, description);
}
