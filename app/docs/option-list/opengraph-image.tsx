import {
  generateOgImage,
  size as ogSize,
  contentType as ogContentType,
} from "@/lib/og/og-image";

export const alt = "Tool UI - Option List";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
  return generateOgImage("Option List", "Let users select from multiple choices");
}
