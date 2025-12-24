import {
  generateOgImage,
  size as ogSize,
  contentType as ogContentType,
} from "@/lib/og/og-image";

export const runtime = "nodejs";
export const alt = "Tool UI - Link Preview";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
  return generateOgImage("Link Preview", "Rich link previews with OG data");
}
