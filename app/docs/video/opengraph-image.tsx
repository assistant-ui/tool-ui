import {
  generateOgImage,
  size as ogSize,
  contentType as ogContentType,
} from "@/lib/og/og-image";

export const alt = "Tool UI - Video";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
  return generateOgImage("Video", "Video playback with controls and poster");
}
