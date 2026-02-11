import {
  generateOgImage,
  size as ogSize,
  contentType as ogContentType,
} from "@/lib/og/og-image";

export const runtime = "nodejs";
export const alt = "Tool UI - X Post";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
  return generateOgImage("X Post", "Render X post previews");
}
