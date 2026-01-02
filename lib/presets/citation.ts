import type {
  SerializableCitation,
  CitationVariant,
} from "@/components/tool-ui/citation";
import type { SerializableAction } from "@/components/tool-ui/shared";
import type { PresetWithCodeGen } from "./types";

function favicon(domain: string, size = 32): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`;
}

interface CitationData {
  citations: SerializableCitation[];
  variant?: CitationVariant;
  maxVisible?: number;
  responseActions?: SerializableAction[];
}

function escape(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function generateCitationCode(data: CitationData): string {
  const { citations, variant, maxVisible, responseActions } = data;

  // Single citation without list wrapper
  if (citations.length === 1 && !maxVisible) {
    const citation = citations[0];
    const props: string[] = [];

    props.push(`  id="${citation.id}"`);

    if (variant && variant !== "default") {
      props.push(`  variant="${variant}"`);
    }

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

  // Multiple citations with CitationList
  const listProps: string[] = [];
  listProps.push(`  id="citation-list"`);
  listProps.push(`  citations={citations}`);

  if (variant && variant !== "default") {
    listProps.push(`  variant="${variant}"`);
  }

  if (maxVisible) {
    listProps.push(`  maxVisible={${maxVisible}}`);
  }

  return `<CitationList\n${listProps.join("\n")}\n/>`;
}

export type CitationPresetName =
  | "documentation"
  | "research"
  | "api-reference"
  | "inline-list"
  | "truncated-list"
  | "with-actions";

export const citationPresets: Record<
  CitationPresetName,
  PresetWithCodeGen<CitationData>
> = {
  documentation: {
    description: "Technical documentation source",
    data: {
      citations: [
        {
          id: "citation-docs",
          href: "https://react.dev/reference/react/useState",
          title: "useState – React",
          snippet:
            "useState is a React Hook that lets you add a state variable to your component. Call useState at the top level of your component to declare a state variable.",
          domain: "react.dev",
          favicon: favicon("react.dev"),
          type: "document",
        },
      ],
    } satisfies CitationData,
    generateExampleCode: generateCitationCode,
  },
  research: {
    description: "Research article with author and date",
    data: {
      citations: [
        {
          id: "citation-research",
          href: "https://arxiv.org/abs/2303.08774",
          title: "GPT-4 Technical Report",
          snippet:
            "We report the development of GPT-4, a large-scale, multimodal model which can accept image and text inputs and produce text outputs.",
          domain: "arxiv.org",
          favicon: favicon("arxiv.org"),
          author: "OpenAI",
          publishedAt: "2023-03-15T00:00:00Z",
          type: "article",
        },
      ],
    } satisfies CitationData,
    generateExampleCode: generateCitationCode,
  },
  "api-reference": {
    description: "API documentation reference",
    data: {
      citations: [
        {
          id: "citation-api",
          href: "https://platform.openai.com/docs/api-reference/chat/create",
          title: "Create chat completion - OpenAI API",
          snippet:
            "Creates a model response for the given chat conversation. Learn more about text generation on the text generation guide.",
          domain: "platform.openai.com",
          favicon: favicon("platform.openai.com"),
          type: "api",
        },
      ],
    } satisfies CitationData,
    generateExampleCode: generateCitationCode,
  },
  "inline-list": {
    description: "Chip list for high-density sources",
    data: {
      variant: "inline",
      citations: [
        {
          id: "citation-inline-1",
          href: "https://react.dev/reference/react/useState",
          title: "useState – React",
          snippet: "useState is a React Hook that lets you add a state variable.",
          domain: "react.dev",
          favicon: favicon("react.dev"),
          type: "document",
        },
        {
          id: "citation-inline-2",
          href: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
          title: "JavaScript - MDN Web Docs",
          snippet: "JavaScript is a lightweight interpreted programming language.",
          domain: "developer.mozilla.org",
          favicon: favicon("developer.mozilla.org"),
          type: "document",
        },
        {
          id: "citation-inline-3",
          href: "https://www.typescriptlang.org/docs/",
          title: "TypeScript Documentation",
          snippet: "TypeScript is a strongly typed programming language.",
          domain: "typescriptlang.org",
          favicon: favicon("typescriptlang.org"),
          type: "document",
        },
        {
          id: "citation-inline-4",
          href: "https://nodejs.org/docs/latest/api/",
          title: "Node.js Documentation",
          snippet: "Node.js is a JavaScript runtime built on Chrome's V8 engine.",
          domain: "nodejs.org",
          favicon: favicon("nodejs.org"),
          type: "api",
        },
        {
          id: "citation-inline-5",
          href: "https://nextjs.org/docs",
          title: "Next.js Documentation",
          snippet: "Next.js is a React framework for production.",
          domain: "nextjs.org",
          favicon: favicon("nextjs.org"),
          type: "document",
        },
        {
          id: "citation-inline-6",
          href: "https://tailwindcss.com/docs",
          title: "Tailwind CSS Documentation",
          snippet: "A utility-first CSS framework for rapid UI development.",
          domain: "tailwindcss.com",
          favicon: favicon("tailwindcss.com"),
          type: "document",
        },
      ],
    } satisfies CitationData,
    generateExampleCode: generateCitationCode,
  },
  "truncated-list": {
    description: "List with overflow indicator",
    data: {
      variant: "inline",
      maxVisible: 3,
      citations: [
        {
          id: "citation-trunc-1",
          href: "https://react.dev/reference/react/useState",
          title: "useState – React",
          snippet: "useState is a React Hook that lets you add a state variable.",
          domain: "react.dev",
          favicon: favicon("react.dev"),
          type: "document",
        },
        {
          id: "citation-trunc-2",
          href: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
          title: "JavaScript - MDN Web Docs",
          snippet: "JavaScript is a lightweight interpreted programming language.",
          domain: "developer.mozilla.org",
          favicon: favicon("developer.mozilla.org"),
          type: "document",
        },
        {
          id: "citation-trunc-3",
          href: "https://www.typescriptlang.org/docs/",
          title: "TypeScript Documentation",
          snippet: "TypeScript is a strongly typed programming language.",
          domain: "typescriptlang.org",
          favicon: favicon("typescriptlang.org"),
          type: "document",
        },
        {
          id: "citation-trunc-4",
          href: "https://nodejs.org/docs/latest/api/",
          title: "Node.js Documentation",
          snippet: "Node.js is a JavaScript runtime built on Chrome's V8 engine.",
          domain: "nodejs.org",
          favicon: favicon("nodejs.org"),
          type: "api",
        },
        {
          id: "citation-trunc-5",
          href: "https://nextjs.org/docs",
          title: "Next.js Documentation",
          snippet: "Next.js is a React framework for production.",
          domain: "nextjs.org",
          favicon: favicon("nextjs.org"),
          type: "document",
        },
        {
          id: "citation-trunc-6",
          href: "https://tailwindcss.com/docs",
          title: "Tailwind CSS Documentation",
          snippet: "A utility-first CSS framework for rapid UI development.",
          domain: "tailwindcss.com",
          favicon: favicon("tailwindcss.com"),
          type: "document",
        },
        {
          id: "citation-trunc-7",
          href: "https://www.prisma.io/docs",
          title: "Prisma Documentation",
          snippet: "Prisma is an open-source ORM for Node.js and TypeScript.",
          domain: "prisma.io",
          favicon: favicon("prisma.io"),
          type: "document",
        },
        {
          id: "citation-trunc-8",
          href: "https://trpc.io/docs",
          title: "tRPC Documentation",
          snippet: "End-to-end typesafe APIs made easy.",
          domain: "trpc.io",
          favicon: favicon("trpc.io"),
          type: "api",
        },
      ],
    } satisfies CitationData,
    generateExampleCode: generateCitationCode,
  },
  "with-actions": {
    description: "Citation with response actions",
    data: {
      citations: [
        {
          id: "citation-actions",
          href: "https://github.com/vercel/next.js",
          title: "vercel/next.js: The React Framework",
          snippet:
            "Next.js enables you to create full-stack web applications by extending the latest React features, and integrating powerful Rust-based JavaScript tooling.",
          domain: "github.com",
          favicon: favicon("github.com"),
          type: "code",
        },
      ],
      responseActions: [
        { id: "view", label: "View source", variant: "default" },
        { id: "copy", label: "Copy link", variant: "secondary" },
      ],
    } satisfies CitationData,
    generateExampleCode: generateCitationCode,
  },
};
