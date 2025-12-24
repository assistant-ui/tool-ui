import {
  generateOgImage,
  size as ogSize,
  contentType as ogContentType,
} from "@/lib/og/og-image";

export const runtime = "nodejs";
export const alt = "Tool UI - Audio";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
  return generateOgImage("Audio", "Audio playback with artwork and metadata");
}
