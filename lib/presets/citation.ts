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
  | "stacked"
  | "inline"
  | "card"
  | "with-metadata"
  | "with-actions";

export const citationPresets: Record<
  CitationPresetName,
  PresetWithCodeGen<CitationData>
> = {
  stacked: {
    description: "Compact stacked favicons",
    data: {
      variant: "stacked",
      citations: [
        {
          id: "citation-stacked-1",
          href: "https://react.dev/reference/react/useState",
          title: "useState – React",
          snippet: "useState is a React Hook that lets you add a state variable.",
          domain: "react.dev",
          favicon: favicon("react.dev"),
          type: "document",
        },
        {
          id: "citation-stacked-2",
          href: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
          title: "JavaScript - MDN Web Docs",
          snippet: "JavaScript is a lightweight interpreted programming language.",
          domain: "developer.mozilla.org",
          favicon: favicon("developer.mozilla.org"),
          type: "document",
        },
        {
          id: "citation-stacked-3",
          href: "https://www.typescriptlang.org/docs/",
          title: "TypeScript Documentation",
          snippet: "TypeScript is a strongly typed programming language.",
          domain: "typescriptlang.org",
          favicon: favicon("typescriptlang.org"),
          type: "document",
        },
        {
          id: "citation-stacked-4",
          href: "https://nodejs.org/docs/latest/api/",
          title: "Node.js Documentation",
          snippet: "Node.js is a JavaScript runtime built on Chrome's V8 engine.",
          domain: "nodejs.org",
          favicon: favicon("nodejs.org"),
          type: "api",
        },
        {
          id: "citation-stacked-5",
          href: "https://nextjs.org/docs",
          title: "Next.js Documentation",
          snippet: "Next.js is a React framework for production.",
          domain: "nextjs.org",
          favicon: favicon("nextjs.org"),
          type: "document",
        },
        {
          id: "citation-stacked-6",
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
  inline: {
    description: "Inline chips with overflow",
    data: {
      variant: "inline",
      maxVisible: 4,
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
  card: {
    description: "Full citation card",
    data: {
      citations: [
        {
          id: "citation-card",
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
  "with-metadata": {
    description: "Card with author and date",
    data: {
      citations: [
        {
          id: "citation-metadata",
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
  "with-actions": {
    description: "Card with response actions",
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
