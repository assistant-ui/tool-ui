import {
  generateOgImage,
  size as ogSize,
  contentType as ogContentType,
} from "@/lib/og/og-image";

export const runtime = "nodejs";
export const alt = "Tool UI - Terminal";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
  return generateOgImage("Terminal", "Show command-line output and logs");
}
