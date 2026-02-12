import {
  contentType as ogContentType,
  generateOgImage,
  size as ogSize,
} from "@/lib/og/og-image";

export const runtime = "nodejs";
export const alt = "Tool UI - Changelog";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
  return generateOgImage("Changelog", "Release notes and migration guidance");
}
