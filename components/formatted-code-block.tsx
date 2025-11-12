"use client";

import * as React from "react";
import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
import { format } from "prettier";
import prettierPluginBabel from "prettier/plugins/babel";
import prettierPluginEstree from "prettier/plugins/estree";
import prettierPluginTypescript from "prettier/plugins/typescript";

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

    const formatted = await format(code, {
      parser: parserMap[lang] || "babel",
      plugins: [
        prettierPluginBabel,
        prettierPluginEstree,
        prettierPluginTypescript,
      ],
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
