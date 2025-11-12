"use client";

import * as React from "react";
import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";

type PrettierPlugin = import("prettier").Plugin;

type PrettierLoaderResult = {
  format: typeof import("prettier/standalone").format;
  plugins: PrettierPlugin[];
};

let prettierLoader: Promise<PrettierLoaderResult> | null = null;

async function loadPrettier(): Promise<PrettierLoaderResult> {
  if (!prettierLoader) {
    prettierLoader = Promise.all([
      import("prettier/standalone"),
      import("prettier/plugins/babel"),
      import("prettier/plugins/estree"),
      import("prettier/plugins/typescript"),
    ]).then(([prettier, babel, estree, typescript]) => ({
      format: prettier.format,
      plugins: [
        ((babel as { default?: PrettierPlugin }).default ?? babel) as PrettierPlugin,
        ((estree as { default?: PrettierPlugin }).default ?? estree) as PrettierPlugin,
        ((typescript as { default?: PrettierPlugin }).default ?? typescript) as PrettierPlugin,
      ],
    }));
  }
  return prettierLoader;
}

async function formatCode(code: string, lang: string): Promise<string> {
  // Only format languages that Prettier supports
  const formatableLanguages = [
    "javascript",
    "js",
    "jsx",
    "typescript",
    "ts",
    "tsx",
  ];

  if (!formatableLanguages.includes(lang)) {
    return code;
  }

  try {
    // Map language to Prettier parser
    const parserMap: Record<string, string> = {
      javascript: "babel",
      js: "babel",
      jsx: "babel",
      typescript: "typescript",
      ts: "typescript",
      tsx: "typescript",
    };

    const { format, plugins } = await loadPrettier();

    const formatted = await format(code, {
      parser: parserMap[lang] || "babel",
      plugins,
      semi: true,
      singleQuote: false,
      trailingComma: "es5",
      printWidth: 80,
    });

    return formatted.trim();
  } catch (error) {
    // If formatting fails, return original code
    console.warn("Failed to format code:", error);
    return code;
  }
}

export function FormattedCodeBlock({
  code,
  lang,
  attrs,
}: {
  code: string;
  lang: string;
  attrs: Record<string, number | boolean>;
}) {
  const [formattedCode, setFormattedCode] = React.useState(code);

  React.useEffect(() => {
    formatCode(code, lang).then(setFormattedCode);
  }, [code, lang]);

  return <DynamicCodeBlock lang={lang} code={formattedCode} codeblock={attrs} />;
}
