import {
  generateOgImage,
  size as ogSize,
  contentType as ogContentType,
} from "@/lib/og/og-image";

export const runtime = "nodejs";
export const alt = "Tool UI - Agent Resources";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
  return generateOgImage(
    "Agent Resources",
    "Integrate and maintain Tool UI with coding agents",
  );
}
