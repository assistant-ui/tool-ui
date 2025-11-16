import type { ZodTypeAny } from "zod";

export type ToolUiId = "fallback";

export type ToolExecute = (args: unknown) => Promise<unknown>;

export type Tool = {
  name: string;
  description: string;
  uiId?: ToolUiId;
  execute: ToolExecute;
  input?: ZodTypeAny;
  output?: ZodTypeAny;
};

export type Prototype = {
  slug: string;
  title: string;
  summary?: string;
  systemPrompt: string;
  tools: Tool[];
};
