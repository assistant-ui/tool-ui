import type { SerializableCitation } from "@/components/tool-ui/citation";
import type { SerializableAction } from "@/components/tool-ui/shared";
import type { PresetWithCodeGen } from "./types";

interface CitationData {
  citation: SerializableCitation;
  responseActions?: SerializableAction[];
}

function escape(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function generateCitationCode(data: CitationData): string {
  const { citation, responseActions } = data;
  const props: string[] = [];

  props.push(`  id="${citation.id}"`);
  props.push(`  href="${citation.href}"`);
  props.push(`  title="${escape(citation.title)}"`);

  if (citation.snippet) {
    props.push(`  snippet="${escape(citation.snippet)}"`);
  }

  if (citation.domain) {
    props.push(`  domain="${citation.domain}"`);
  }

  if (citation.favicon) {
    props.push(`  favicon="${citation.favicon}"`);
  }

  if (citation.author) {
    props.push(`  author="${escape(citation.author)}"`);
  }

  if (citation.publishedAt) {
    props.push(`  publishedAt="${citation.publishedAt}"`);
  }

  if (citation.type) {
    props.push(`  type="${citation.type}"`);
  }

  if (responseActions && responseActions.length > 0) {
    props.push(
      `  responseActions={${JSON.stringify(responseActions, null, 4).replace(/\n/g, "\n  ")}}`,
    );
    props.push(
      `  onResponseAction={(actionId) => console.log("Action:", actionId)}`,
    );
  }

  return `<Citation\n${props.join("\n")}\n/>`;
}

export type CitationPresetName =
  | "documentation"
  | "research"
  | "api-reference"
  | "with-actions";

export const citationPresets: Record<CitationPresetName, PresetWithCodeGen<CitationData>> = {
  documentation: {
    description: "Technical documentation source",
    data: {
      citation: {
        id: "citation-docs",
        href: "https://react.dev/reference/react/useState",
        title: "useState – React",
        snippet:
          "useState is a React Hook that lets you add a state variable to your component. Call useState at the top level of your component to declare a state variable.",
        domain: "react.dev",
        type: "document",
      },
    } satisfies CitationData,
    generateExampleCode: generateCitationCode,
  },
  research: {
    description: "Research article with author and date",
    data: {
      citation: {
        id: "citation-research",
        href: "https://arxiv.org/abs/2303.08774",
        title: "GPT-4 Technical Report",
        snippet:
          "We report the development of GPT-4, a large-scale, multimodal model which can accept image and text inputs and produce text outputs.",
        domain: "arxiv.org",
        author: "OpenAI",
        publishedAt: "2023-03-15T00:00:00Z",
        type: "article",
      },
    } satisfies CitationData,
    generateExampleCode: generateCitationCode,
  },
  "api-reference": {
    description: "API documentation reference",
    data: {
      citation: {
        id: "citation-api",
        href: "https://platform.openai.com/docs/api-reference/chat/create",
        title: "Create chat completion - OpenAI API",
        snippet:
          "Creates a model response for the given chat conversation. Learn more about text generation on the text generation guide.",
        domain: "platform.openai.com",
        favicon: "https://platform.openai.com/favicon.ico",
        type: "api",
      },
    } satisfies CitationData,
    generateExampleCode: generateCitationCode,
  },
  "with-actions": {
    description: "Citation with response actions",
    data: {
      citation: {
        id: "citation-actions",
        href: "https://github.com/vercel/next.js",
        title: "vercel/next.js: The React Framework",
        snippet:
          "Next.js enables you to create full-stack web applications by extending the latest React features, and integrating powerful Rust-based JavaScript tooling.",
        domain: "github.com",
        type: "code",
      },
      responseActions: [
        { id: "view", label: "View source", variant: "default" },
        { id: "copy", label: "Copy link", variant: "secondary" },
      ],
    } satisfies CitationData,
    generateExampleCode: generateCitationCode,
  },
};
