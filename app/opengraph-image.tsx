import {
  generateOgImage,
  size as ogSize,
  contentType as ogContentType,
} from "@/lib/og/og-image";

export const alt = "Tool UI - Beautiful UI components for AI tool calls";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
  return generateOgImage("Tool UI", "Beautiful UI components for AI tool calls");
}
