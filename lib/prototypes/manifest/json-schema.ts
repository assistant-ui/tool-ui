import Ajv, { ErrorObject } from "ajv";
import { compile, Options as TypegenOptions } from "json-schema-to-typescript";
import type { JSONSchema4 } from "json-schema";
import { JSONSchema7 } from "json-schema";
import { z, ZodTypeAny } from "zod";

export type JsonSchema = JSONSchema7;

export interface JsonSchemaToZodOptions {
  /**
   * When false (default), unknown properties are stripped.
   * When true, additional properties are allowed via `.passthrough()`.
   * When set to `"strict"`, additional properties are disallowed.
   */
  additionalProperties?: boolean | "strict";
}

export interface JsonSchemaToTypesOptions {
  /** Optional TypeScript type name used when generating .d.ts content. */
  typeName?: string;
  /** Additional json-schema-to-typescript options. */
  typegenOptions?: TypegenOptions;
}

const ajv = new Ajv({ allErrors: true, strict: false });

export class JsonSchemaValidationError extends Error {
  constructor(
    public readonly errors: ErrorObject[],
    public readonly pointer: string,
  ) {
    super(
      `Invalid JSON Schema at ${pointer}: ${errors
        .map((error) => `${error.instancePath || pointer} ${error.message}`)
        .join(", ")}`,
    );
    this.name = "JsonSchemaValidationError";
  }
}

export class JsonSchemaConversionError extends Error {
  constructor(message: string, public readonly pointer: string) {
    super(`${message} (at ${pointer})`);
    this.name = "JsonSchemaConversionError";
  }
}

export const validateJsonSchema = (schema: JsonSchema, pointer = "#/schema") => {
  const isValid = ajv.validateSchema(schema);
  if (!isValid && ajv.errors) {
    throw new JsonSchemaValidationError(ajv.errors, pointer);
  }
};

const makeUnion = (
  schemas: JsonSchema[],
  options: JsonSchemaToZodOptions,
  pointer: string,
) => {
  const converted = schemas.map((subSchema, index) =>
    jsonSchemaToZod(subSchema, options, `${pointer}/${index}`),
  );
  if (converted.length === 0) {
    throw new JsonSchemaConversionError("Union must contain at least one schema", pointer);
  }
  if (converted.length === 1) {
    return converted[0];
  }
  return z.union(converted as [ZodTypeAny, ZodTypeAny, ...ZodTypeAny[]]);
};

export const jsonSchemaToZod = (
  schema: JsonSchema,
  options: JsonSchemaToZodOptions = {},
  pointer: string = "#",
): ZodTypeAny => {
  if (schema.$ref) {
    throw new JsonSchemaConversionError(
      "Schema references ($ref) are not supported",
      pointer,
    );
  }

  if (schema.const !== undefined) {
    return z.literal(schema.const as never);
  }

  if (schema.enum) {
    const enumValues = schema.enum;
    if (
      enumValues.every((value) => typeof value === "string")
    ) {
      return z.enum(enumValues as [string, ...string[]]);
    }

    const literals = Array.from(enumValues, (value) =>
      z.literal(value as never),
    );
    if (literals.length === 1) {
      return literals[0];
    }
    const [first, second, ...rest] = literals;
    return z.union(
      [first, second, ...rest] as [ZodTypeAny, ZodTypeAny, ...ZodTypeAny[]],
    );
  }

  if (schema.anyOf) {
    return makeUnion(
      schema.anyOf as JsonSchema[],
      options,
      `${pointer}/anyOf`,
    );
  }

  if (schema.oneOf) {
    return makeUnion(
      schema.oneOf as JsonSchema[],
      options,
      `${pointer}/oneOf`,
    );
  }

  if (schema.allOf) {
    return schema.allOf.reduce<ZodTypeAny | null>(
      (prev, current, index) => {
        const currentZod = jsonSchemaToZod(
          current as JsonSchema,
          options,
          `${pointer}/allOf/${index}`,
        );
        return prev ? prev.and(currentZod) : currentZod;
      },
      null,
    ) ?? z.any();
  }

  const { type } = schema;

  if (Array.isArray(type)) {
    return makeUnion(
      type.map((innerType) => ({ ...schema, type: innerType })),
      options,
      `${pointer}/type`,
    );
  }

  switch (type) {
    case "string": {
      let result = z.string();
      if (schema.minLength !== undefined) {
        result = result.min(schema.minLength);
      }
      if (schema.maxLength !== undefined) {
        result = result.max(schema.maxLength);
      }
      if (schema.pattern) {
        result = result.regex(new RegExp(schema.pattern));
      }
      if (schema.format === "date-time") {
        result = result.datetime();
      }
      return result;
    }
    case "number": {
      let result = z.number();
      if (schema.minimum !== undefined) {
        result = result.min(schema.minimum);
      }
      if (schema.exclusiveMinimum !== undefined) {
        result = result.gt(schema.exclusiveMinimum);
      }
      if (schema.maximum !== undefined) {
        result = result.max(schema.maximum);
      }
      if (schema.exclusiveMaximum !== undefined) {
        result = result.lt(schema.exclusiveMaximum);
      }
      return result;
    }
    case "integer": {
      let result = z.number().int();
      if (schema.minimum !== undefined) {
        result = result.min(schema.minimum);
      }
      if (schema.exclusiveMinimum !== undefined) {
        result = result.gt(schema.exclusiveMinimum);
      }
      if (schema.maximum !== undefined) {
        result = result.max(schema.maximum);
      }
      if (schema.exclusiveMaximum !== undefined) {
        result = result.lt(schema.exclusiveMaximum);
      }
      return result;
    }
    case "boolean":
      return z.boolean();
    case "null":
      return z.null();
    case "array": {
      if (!schema.items) {
        throw new JsonSchemaConversionError(
          "Array schema requires an `items` definition",
          pointer,
        );
      }
      const arraySchema = jsonSchemaToZod(
        schema.items as JsonSchema,
        options,
        `${pointer}/items`,
      );
      let result = z.array(arraySchema);
      if (schema.minItems !== undefined) {
        result = result.min(schema.minItems);
      }
      if (schema.maxItems !== undefined) {
        result = result.max(schema.maxItems);
      }
      if (schema.uniqueItems) {
        result = result.superRefine((items, ctx) => {
          const seen = new Set();
          items.forEach((item, index) => {
            const key = JSON.stringify(item);
            if (seen.has(key)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Items must be unique",
                path: [index],
              });
            }
            seen.add(key);
          });
        });
      }
      return result;
    }
    case "object": {
      const properties = schema.properties ?? {};
      const required = new Set(schema.required ?? []);
      const entries = Object.entries(properties).map(([key, subSchema]) => {
        const zodSchema = jsonSchemaToZod(
          subSchema as JsonSchema,
          options,
          `${pointer}/properties/${key}`,
        );
        return [key, required.has(key) ? zodSchema : zodSchema.optional()] as const;
      });

      const baseObject = z.object(Object.fromEntries(entries));

      if (schema.additionalProperties === false) {
        return baseObject.strict();
      }

      if (options.additionalProperties === "strict") {
        return baseObject.strict();
      }

      if (
        schema.additionalProperties === true ||
        options.additionalProperties === true
      ) {
        return baseObject.passthrough();
      }

      return baseObject.strip();
    }
    case undefined: {
      return z.any();
    }
    default:
      throw new JsonSchemaConversionError(
        `Unsupported schema type: ${type as string}`,
        pointer,
      );
  }
};

export const jsonSchemaToTypes = async (
  schema: JsonSchema,
  { typeName = "Schema", typegenOptions }: JsonSchemaToTypesOptions = {},
) => {
  const schemaForTypegen = prepareSchemaForTypegen(schema);

  return compile(schemaForTypegen, typeName, {
    bannerComment: "",
    style: {
      semi: true,
      singleQuote: true,
    },
    ...typegenOptions,
  });
};

const prepareSchemaForTypegen = (schema: JsonSchema): JSONSchema4 => {
  const convert = (node: unknown): unknown => {
    if (Array.isArray(node)) {
      return node.map((item) => convert(item));
    }

    if (!node || typeof node !== "object") {
      return node;
    }

    const result: Record<string, unknown> = {
      ...(node as Record<string, unknown>),
    };

    if (typeof result.exclusiveMaximum === "number") {
      result.maximum = result.exclusiveMaximum;
      result.exclusiveMaximum = true;
    }

    if (typeof result.exclusiveMinimum === "number") {
      result.minimum = result.exclusiveMinimum;
      result.exclusiveMinimum = true;
    }

    const nestedKeys: (keyof typeof result)[] = [
      "properties",
      "patternProperties",
      "definitions",
      "$defs",
      "dependencies",
    ];

    for (const key of nestedKeys) {
      const value = result[key];
      if (value && typeof value === "object") {
        result[key] = Object.fromEntries(
          Object.entries(value).map(([k, v]) => [k, convert(v)]),
        );
      }
    }

    const arrayKeys: (keyof typeof result)[] = [
      "allOf",
      "anyOf",
      "oneOf",
      "items",
      "prefixItems",
      "contains",
      "not",
      "if",
      "then",
      "else",
    ];

    for (const key of arrayKeys) {
      const value = result[key];
      if (Array.isArray(value) || (value && typeof value === "object")) {
        result[key] = convert(value);
      }
    }

    const simpleKeys: (keyof typeof result)[] = [
      "additionalItems",
      "additionalProperties",
      "propertyNames",
      "contains",
      "not",
      "if",
      "then",
      "else",
    ];

    for (const key of simpleKeys) {
      const value = result[key];
      if (value && typeof value === "object") {
        result[key] = convert(value);
      }
    }

    return result;
  };

  const converted = convert(schema) as JSONSchema4;
  return converted;
};


