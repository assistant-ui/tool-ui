import type { JSONSchema7, JSONSchema7Type } from "json-schema";
import { describe, expect, it } from "vitest";

import {
  JsonSchemaConversionError,
  jsonSchemaToTypes,
  jsonSchemaToZod,
  validateJsonSchema,
} from "../lib/manifest/json-schema";

describe("jsonSchemaToZod", () => {
  it("converts basic string schema", () => {
    const schema = {
      type: "string",
      minLength: 2,
      maxLength: 5,
    } as const satisfies JSONSchema7;
    const zod = jsonSchemaToZod(schema);

    expect(zod.parse("hello")).toBe("hello");
    expect(() => zod.parse("h")).toThrow();
    expect(() => zod.parse("tooling")).toThrow();
  });

  it("converts object schema with required and optional fields", () => {
    const schema: JSONSchema7 = {
      type: "object",
      required: ["name"],
      properties: {
        name: { type: "string" },
        age: { type: "integer", minimum: 0 },
      },
      additionalProperties: false,
    };

    const zod = jsonSchemaToZod(schema);
    const parsed = zod.parse({ name: "Ada", age: 42 });

    expect(parsed).toEqual({ name: "Ada", age: 42 });
    expect(() => zod.parse({ age: 1 })).toThrow();
    expect(() => zod.parse({ name: "Ada", extra: true })).toThrow();
  });

  it("creates unions from anyOf", () => {
    const schema: JSONSchema7 = {
      anyOf: [
        { type: "string" },
        { type: "integer" },
      ],
    };

    const zod = jsonSchemaToZod(schema);

    expect(zod.parse("ok")).toBe("ok");
    expect(zod.parse(4)).toBe(4);
    expect(() => zod.parse(false)).toThrow();
  });

  it("supports enum with mixed literals", () => {
    const schema: JSONSchema7 = { enum: ["one", "two", 3] as JSONSchema7Type[] };
    const zod = jsonSchemaToZod(schema);

    expect(zod.parse("one")).toBe("one");
    expect(zod.parse(3)).toBe(3);
    expect(() => zod.parse("three")).toThrow();
  });

  it("throws for unsupported references", () => {
    const schema = { $ref: "#/$defs/User" } as const;
    expect(() => jsonSchemaToZod(schema)).toThrow(JsonSchemaConversionError);
  });
});

describe("validateJsonSchema", () => {
  it("throws for invalid schema", () => {
    const badSchema = {
      type: "object",
      properties: {
        name: { type: "string", minLength: -1 },
      },
    } as const;

    expect(() => validateJsonSchema(badSchema)).toThrow();
  });

  it("passes for valid schema", () => {
    const schema = {
      type: "object",
      properties: {
        label: { type: "string" },
      },
    } as const;

    expect(() => validateJsonSchema(schema)).not.toThrow();
  });
});

describe("jsonSchemaToTypes", () => {
  it("generates a TypeScript definition", async () => {
    const schema: JSONSchema7 = {
      type: "object",
      required: ["name"] as string[],
      properties: {
        name: { type: "string" },
        age: { type: "integer" },
      },
    };

    const typeDef = await jsonSchemaToTypes(schema, {
      typeName: "UserInput",
    });

    expect(typeDef).toContain("export interface UserInput");
    expect(typeDef).toContain("name: string");
  });
});


