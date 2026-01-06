import {
  generateOgImage,
  size as ogSize,
  contentType as ogContentType,
} from "@/lib/og/og-image";

export const runtime = "nodejs";
export const alt = "Tool UI - Image Gallery";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
  return generateOgImage("Image Gallery", "Masonry grid with fullscreen carousel viewer");
}
