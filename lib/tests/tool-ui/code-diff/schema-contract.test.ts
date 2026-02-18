import { describe, expect, test } from "vitest";
import {
  parseSerializableCodeDiff,
  safeParseSerializableCodeDiff,
  type SerializableCodeDiff,
} from "@/components/tool-ui/code-diff/schema";

function makePayload(): SerializableCodeDiff {
  return {
    id: "code-diff-schema-contract",
    oldCode: "const a = 1;",
    newCode: "const a = 2;",
    language: "typescript",
    lineNumbers: "visible",
    diffStyle: "unified",
  };
}

describe("code-diff schema contract", () => {
  test("rejects payloads without patch or code inputs", () => {
    const payload = { id: "code-diff-empty" };

    expect(() => parseSerializableCodeDiff(payload)).toThrow();
    expect(safeParseSerializableCodeDiff(payload)).toBeNull();
  });

  test("rejects mixed patch and code inputs", () => {
    const payload = {
      ...makePayload(),
      patch: "--- a/a.ts\n+++ b/a.ts\n@@ -1 +1 @@\n-1\n+2",
    };

    expect(() => parseSerializableCodeDiff(payload)).toThrow();
    expect(safeParseSerializableCodeDiff(payload)).toBeNull();
  });

  test("rejects blank language values", () => {
    const payload = {
      ...makePayload(),
      language: "   ",
    };

    expect(() => parseSerializableCodeDiff(payload)).toThrow();
    expect(safeParseSerializableCodeDiff(payload)).toBeNull();
  });

  test("accepts patch-only payloads", () => {
    const payload = {
      id: "code-diff-patch-only",
      patch: "--- a/a.ts\n+++ b/a.ts\n@@ -1 +1 @@\n-1\n+2",
    };

    expect(parseSerializableCodeDiff(payload)).toMatchObject({
      id: "code-diff-patch-only",
      patch: payload.patch,
      language: "text",
      lineNumbers: "visible",
      diffStyle: "unified",
    });
  });
});
