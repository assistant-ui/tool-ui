import type { MDXComponents } from "mdx/types";
import defaultMdxComponents from "fumadocs-ui/mdx";
import { Steps, Step } from "fumadocs-ui/components/steps";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Tab,
} from "fumadocs-ui/components/tabs";
import { TypeTable } from "fumadocs-ui/components/type-table";
import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
import * as React from "react";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Fumadocs defaults (CodeBlock, CodeBlockTabs, Callout, Cards, headings, table wrapper, etc.)
    ...defaultMdxComponents,

    // Override `pre` to perform client-side Shiki highlighting using Fumadocs dynamic code block
    pre: (props: any) => {
      const child = props?.children as React.ReactElement | undefined;
      if (child && typeof child === "object" && "props" in child) {
        // Trim trailing newlines to avoid rendering an extra empty line
        const code = String((child as any).props.children ?? "").replace(/\n+$/, "");
        const className: string = (child as any).props.className ?? "";
        const match = /language-([\w-]+)/.exec(className);
        const lang = match?.[1] ?? "txt";
        return (
          <DynamicCodeBlock
            lang={lang}
            code={code}
            // Enable line numbers globally; start at 1
            codeblock={{ ["data-line-numbers"]: true, ["data-line-numbers-start"]: 1 }}
          />
        );
      }
      // Fallback
      return React.createElement("pre", props);
    },

    // Extra components
    Steps,
    Step,
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
    Tab,
    TypeTable,

    // Allow page-level overrides last
    ...components,
  };
}
