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
import { Files, File, Folder } from "fumadocs-ui/components/files";
import * as React from "react";
import dynamic from "next/dynamic";
import { AutoLinkChildren, withAutoLink } from "@/lib/docs/auto-link";

const Mermaid = dynamic(() =>
  import("@/app/components/mdx/mermaid").then((m) => m.Mermaid)
);
const ApprovalCardPresetExample = dynamic(() =>
  import("@/app/docs/_components/preset-example").then(
    (m) => m.ApprovalCardPresetExample
  )
);
const ChartPresetExample = dynamic(() =>
  import("@/app/docs/_components/preset-example").then((m) => m.ChartPresetExample)
);
const OptionListPresetExample = dynamic(() =>
  import("@/app/docs/_components/preset-example").then(
    (m) => m.OptionListPresetExample
  )
);
const CodeBlockPresetExample = dynamic(() =>
  import("@/app/docs/_components/preset-example").then(
    (m) => m.CodeBlockPresetExample
  )
);
const TerminalPresetExample = dynamic(() =>
  import("@/app/docs/_components/preset-example").then(
    (m) => m.TerminalPresetExample
  )
);
const PlanPresetExample = dynamic(() =>
  import("@/app/docs/_components/preset-example").then((m) => m.PlanPresetExample)
);
const ItemCarouselPresetExample = dynamic(() =>
  import("@/app/docs/_components/preset-example").then(
    (m) => m.ItemCarouselPresetExample
  )
);
const FeatureGrid = dynamic(() =>
  import("@/app/components/mdx/features").then((m) => m.FeatureGrid)
);
const Feature = dynamic(() =>
  import("@/app/components/mdx/features").then((m) => m.Feature)
);

export function useMDXComponents(components: MDXComponents): MDXComponents {
  // Wrap selected default components to auto-link Tool UI mentions
  const Base = defaultMdxComponents as MDXComponents;
  const P = withAutoLink((Base as Record<string, React.ElementType>).p ?? "p");
  const LI = withAutoLink(
    (Base as Record<string, React.ElementType>).li ?? "li",
  );
  const Blockquote = withAutoLink(
    (Base as Record<string, React.ElementType>).blockquote ?? "blockquote",
  );
  const TD = withAutoLink(
    (Base as Record<string, React.ElementType>).td ?? "td",
  );
  const TH = withAutoLink(
    (Base as Record<string, React.ElementType>).th ?? "th",
  );

  return {
    ...defaultMdxComponents,

    // Auto-link text mentions in common containers
    p: P,
    li: LI,
    blockquote: Blockquote,
    td: TD,
    th: TH,

    // Override `pre` to perform client-side Shiki highlighting using Fumadocs dynamic code block
    pre: (props: React.ComponentPropsWithoutRef<"pre">) => {
      const child = props?.children;
      if (React.isValidElement(child)) {
        type CodeChildProps = {
          className?: string;
          children?: React.ReactNode;
        };
        const element = child as React.ReactElement<CodeChildProps>;
        const raw = element.props.children;
        const content =
          typeof raw === "string" ? raw : React.Children.toArray(raw).join("");
        const code = String(content).replace(/\n+$/, "");
        const className = element.props.className ?? "";
        const match = /language-([\w-]+)/.exec(className);
        const lang = match?.[1] ?? "txt";

        const attrs: Record<string, number | boolean> = {
          "data-line-numbers": true,
          "data-line-numbers-start": 1,
        };

        return <DynamicCodeBlock lang={lang} code={code} codeblock={attrs} />;
      }

      return React.createElement("pre", props);
    },

    Steps,
    Step,
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
    Tab,
    TypeTable,
    Files,
    File,
    Folder,
    AutoLinkChildren,
    Mermaid,
    ApprovalCardPresetExample,
    ChartPresetExample,
    OptionListPresetExample,
    CodeBlockPresetExample,
    TerminalPresetExample,
    PlanPresetExample,
    ItemCarouselPresetExample,
    FeatureGrid,
    Feature,
    ...components,
  };
}
