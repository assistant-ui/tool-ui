import {
  generateOgImage,
  size as ogSize,
  contentType as ogContentType,
} from "@/lib/og/og-image";

export const alt = "Tool UI - Plan";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
  return generateOgImage("Plan", "Display step-by-step task workflows");
}
