import {
  generateOgImage,
  size as ogSize,
  contentType as ogContentType,
} from "@/lib/og/og-image";

export const runtime = "nodejs";
export const alt = "Tool UI - Product List";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
  return generateOgImage(
    "Product List",
    "Horizontal carousel for product comparison",
  );
}
