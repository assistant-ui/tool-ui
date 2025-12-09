import {
  generateOgImage,
  size as ogSize,
  contentType as ogContentType,
} from "@/lib/og/og-image";

export const alt = "Tool UI - Builder";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
  return generateOgImage("Builder", "Construct components visually");
}
