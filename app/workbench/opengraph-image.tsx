import {
  generateOgImage,
  size as ogSize,
  contentType as ogContentType,
} from "@/lib/og/og-image";

export const alt = "Tool UI - Workbench";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
  return generateOgImage("Workbench", "A testing environment for ChatGPT Apps");
}
