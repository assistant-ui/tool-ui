import {
  generateOgImage,
  size as ogSize,
  contentType as ogContentType,
} from "@/lib/og/og-image";

export const runtime = "nodejs";
export const alt = "Tool UI - Question Flow";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
  return generateOgImage("Question Flow", "Multi-step guided questions with branching");
}
