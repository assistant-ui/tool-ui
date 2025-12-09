import {
  generateOgImage,
  size as ogSize,
  contentType as ogContentType,
} from "@/lib/og/og-image";

export const alt = "Tool UI - Data Table";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
  return generateOgImage("Data Table", "Present structured data in sortable tables");
}
