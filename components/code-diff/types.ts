import type { z } from "zod";
import {
  serializableCodeDiffSchema,
  serializableCodeDiffActionSchema,
  serializableCodeDiffFileSchema,
  serializableCodeDiffHunkSchema,
  serializableCodeDiffLineSchema,
} from "./schema";

export type SerializableCodeDiff = z.infer<typeof serializableCodeDiffSchema>;
export type SerializableCodeDiffAction = z.infer<
  typeof serializableCodeDiffActionSchema
>;
export type SerializableCodeDiffFile = z.infer<
  typeof serializableCodeDiffFileSchema
>;
export type SerializableCodeDiffHunk = z.infer<
  typeof serializableCodeDiffHunkSchema
>;
export type SerializableCodeDiffLine = z.infer<
  typeof serializableCodeDiffLineSchema
>;

export type CodeDiffViewMode = "unified" | "split";

export type CodeDiffActionEvent =
  | {
      scope: "diff";
      actionId: string;
      diff: SerializableCodeDiff;
    }
  | {
      scope: "file";
      actionId: string;
      diff: SerializableCodeDiff;
      file: SerializableCodeDiffFile;
    }
  | {
      scope: "hunk";
      actionId: string;
      diff: SerializableCodeDiff;
      file: SerializableCodeDiffFile;
      hunk: SerializableCodeDiffHunk;
    }
  | {
      scope: "line";
      actionId: string;
      diff: SerializableCodeDiff;
      file: SerializableCodeDiffFile;
      hunk: SerializableCodeDiffHunk;
      line: SerializableCodeDiffLine;
    };

export interface CodeDiffProps extends SerializableCodeDiff {
  variant?: "inline" | "full";
  viewMode?: CodeDiffViewMode;
  defaultViewMode?: CodeDiffViewMode;
  isStreaming?: boolean;
  showLineNumbers?: boolean;
  wrapLines?: boolean;
  maxHeight?: number | string;
  onBeforeAction?: (event: CodeDiffActionEvent) => boolean | Promise<boolean>;
  onAction?: (event: CodeDiffActionEvent) => void | Promise<void>;
}
