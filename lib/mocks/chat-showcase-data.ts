import type { Column } from "@/components/tool-ui/data-table";
import type { SerializableLinkPreview } from "@/components/tool-ui/link-preview";
import type { SerializableChart } from "@/components/tool-ui/chart";
import type { XPostData } from "@/components/tool-ui/x-post";
import type { OptionListOption } from "@/components/tool-ui/option-list";
import type { SerializableTerminal } from "@/components/tool-ui/terminal";
import type { SerializableCodeBlock } from "@/components/tool-ui/code-block";
import type { SerializableItemCarousel } from "@/components/tool-ui/item-carousel";
import type { SerializableCitation } from "@/components/tool-ui/citation";
import type { SerializableParameterSlider } from "@/components/tool-ui/parameter-slider";

export type Flight = {
  id: string;
  airline: string;
  route: string;
  departure: string;
  duration: string;
  stops: "Nonstop" | "1 stop" | "2 stops";
  price: string;
};

type BadgeColor = "danger" | "warning" | "info" | "success" | "neutral";

export const TABLE_COLUMNS: Column<Flight>[] = [
  { key: "airline", label: "Airline", sortable: true, priority: "primary" },
  { key: "route", label: "Route", sortable: false, priority: "primary" },
  { key: "departure", label: "Departs", sortable: true, priority: "secondary" },
  { key: "duration", label: "Duration", sortable: true, priority: "secondary" },
  {
    key: "stops",
    label: "Stops",
    sortable: true,
    priority: "primary",
    format: {
      kind: "badge",
      colorMap: {
        Nonstop: "success",
        "1 stop": "warning",
        "2 stops": "neutral",
      } as Record<string, BadgeColor>,
    },
  },
  { key: "price", label: "Price", sortable: true, priority: "primary" },
];

export const TABLE_DATA: Flight[] = [
  {
    id: "fl-1",
    airline: "ANA",
    route: "LAX → NRT",
    departure: "Mar 15, 11:30am",
    duration: "11h 45m",
    stops: "Nonstop",
    price: "$892",
  },
  {
    id: "fl-2",
    airline: "JAL",
    route: "LAX → HND",
    departure: "Mar 15, 1:15pm",
    duration: "12h 10m",
    stops: "Nonstop",
    price: "$945",
  },
  {
    id: "fl-3",
    airline: "United",
    route: "LAX → NRT",
    departure: "Mar 15, 10:45am",
    duration: "14h 20m",
    stops: "1 stop",
    price: "$724",
  },
  {
    id: "fl-4",
    airline: "Delta",
    route: "LAX → HND",
    departure: "Mar 15, 9:00am",
    duration: "16h 55m",
    stops: "1 stop",
    price: "$689",
  },
];

export const LINK_PREVIEW: SerializableLinkPreview = {
  id: "chat-showcase-link-preview",
  href: "https://www.quantamagazine.org/the-year-in-physics-20251217/",
  title: "The Year in Physics",
  description:
    "Physicists spotted a new black hole, doubled down on weakening dark energy, and debated the meaning of quantum mechanics.",
  image:
    "https://www.quantamagazine.org/wp-content/uploads/2025/12/Year-in-review-2025-Physics-cr-Carlos-Arrojo-Lede-1-1720x968.webp",
  domain: "quantamagazine.org",
  ratio: "16:9",
  createdAt: "2025-12-17T10:00:00.000Z",
};

export const X_POST: XPostData = {
  id: "chat-showcase-x-post",
  author: {
    name: "Alex Chen",
    handle: "alexchendev",
    avatarUrl:
      "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=1200",
  },
  text: "Just shipped something I've been working on for a while: react-aria-tree\n\nA headless tree view component with full keyboard navigation, multi-select, drag & drop, and virtualization built in.\n\nNo styling opinions. Accessible by default.\n\ngithub.com/alexchen/react-aria-tree",
  createdAt: "2025-11-10T14:30:00.000Z",
};

export const X_POST_ACTIONS = [
  { id: "cancel", label: "Discard", variant: "ghost" as const },
  { id: "edit", label: "Revise", variant: "outline" as const },
  { id: "send", label: "Post Now", variant: "default" as const },
];

const SPENDING_DATA = [
  { category: "Groceries", amount: 284 },
  { category: "Dining", amount: 156 },
  { category: "Transport", amount: 89 },
  { category: "Entertainment", amount: 67 },
  { category: "Shopping", amount: 124 },
];

export const SPENDING_CHART: Omit<SerializableChart, "id"> = {
  type: "bar",
  title: "Weekly Spending",
  data: SPENDING_DATA,
  xKey: "category",
  series: [{ key: "amount", label: "Amount" }],
  showLegend: false,
};

export const PLAN_TODO_LABELS = [
  "Checking Sarah's interests",
  "Searching gift ideas",
  "Comparing top options",
  "Finalizing recommendations",
];

export const TERMINAL_DATA: Omit<SerializableTerminal, "id"> = {
  command: "pnpm test auth",
  stdout: `✓ login flow handles invalid credentials
✓ session tokens refresh correctly
✓ logout clears all cookies

Tests: 3 passed, 3 total
Time: 1.24s`,
  exitCode: 0,
  durationMs: 1243,
};

export const CODE_BLOCK_DATA: Omit<SerializableCodeBlock, "id"> = {
  language: "typescript",
  filename: "use-debounce.ts",
  code: `import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    // Normalize delay (covers NaN/Infinity/negative)
    const d = Number.isFinite(delay) ? Math.max(0, delay) : 0;

    // If no delay, update immediately.
    if (d === 0) {
      if (!Object.is(debounced, value)) setDebounced(value);
      return;
    }

    const id = setTimeout(() => {
      if (!Object.is(debounced, value)) setDebounced(value);
    }, d);

    return () => clearTimeout(id);
  }, [value, delay, debounced]);

  return debounced;
}`,
  showLineNumbers: true,
};

export const OPTION_LIST_OPTIONS: OptionListOption[] = [
  { id: "comedy", label: "Something funny", description: "I need a good laugh" },
  { id: "thriller", label: "Edge-of-seat thriller", description: "Keep me guessing" },
  { id: "comfort", label: "Feel-good classic", description: "Cozy and familiar" },
  { id: "scifi", label: "Mind-bending sci-fi", description: "Make me think" },
];

export const OPTION_LIST_CONFIRMED = ["comedy", "comfort"];

export const ITEM_CAROUSEL_DATA: Omit<SerializableItemCarousel, "id"> = {
  items: [
    {
      id: "ambient-1",
      name: "Music for Airports",
      subtitle: "Brian Eno · Ambient",
      image:
        "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/ee/71/42/ee71425d-6bc9-3df8-c90b-8539f59144ab/00724386649553.rgb.jpg/600x600bb.jpg",
      actions: [{ id: "play", label: "Play", variant: "default" }],
    },
    {
      id: "rock-1",
      name: "In Rainbows",
      subtitle: "Radiohead · Alt Rock",
      image:
        "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/dd/50/c7/dd50c790-99ac-d3d0-5ab8-e3891fb8fd52/634904032463.png/600x600bb.jpg",
      actions: [{ id: "play", label: "Play", variant: "default" }],
    },
    {
      id: "electronic-1",
      name: "Async",
      subtitle: "Ryuichi Sakamoto · Electronic",
      image:
        "https://is1-ssl.mzstatic.com/image/thumb/Music123/v4/82/e0/7b/82e07b9a-1d98-bbf4-d1e2-fb94312bbea2/731383683060.jpg/600x600bb.jpg",
      actions: [{ id: "play", label: "Play", variant: "default" }],
    },
    {
      id: "jazz-1",
      name: "Kind of Blue",
      subtitle: "Miles Davis · Jazz",
      image:
        "https://is1-ssl.mzstatic.com/image/thumb/Music/7f/9f/d6/mzi.vtnaewef.jpg/600x600bb.jpg",
      actions: [{ id: "play", label: "Play", variant: "default" }],
    },
    {
      id: "psychedelic-1",
      name: "Currents",
      subtitle: "Tame Impala · Psychedelic",
      image:
        "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/a8/2e/b4/a82eb490-f30a-a321-461a-0383c88fec95/15UMGIM23316.rgb.jpg/600x600bb.jpg",
      actions: [{ id: "play", label: "Play", variant: "default" }],
    },
  ],
};

export const PARAMETER_SLIDER_DATA: Omit<SerializableParameterSlider, "id"> = {
  sliders: [
    { id: "bass", label: "Bass", min: -12, max: 12, step: 1, value: 4, unit: "dB" },
    { id: "mid", label: "Mid", min: -12, max: 12, step: 1, value: -1, unit: "dB" },
    { id: "treble", label: "Treble", min: -12, max: 12, step: 1, value: 3, unit: "dB" },
  ],
  responseActions: [
    { id: "reset", label: "Flat", variant: "ghost" },
    { id: "apply", label: "Apply", variant: "default" },
  ],
};

function favicon(domain: string, size = 32): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`;
}

export const LLM_CITATIONS: SerializableCitation[] = [
  {
    id: "llm-citation-1",
    href: "https://en.wikipedia.org/wiki/Large_language_model",
    title: "Large language model - Wikipedia",
    snippet:
      "A large language model is a type of machine learning model designed for natural language processing tasks such as language generation.",
    domain: "wikipedia.org",
    favicon: favicon("wikipedia.org"),
    type: "document",
  },
  {
    id: "llm-citation-2",
    href: "https://arxiv.org/abs/1706.03762",
    title: "Attention Is All You Need",
    snippet:
      "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks.",
    domain: "arxiv.org",
    favicon: favicon("arxiv.org"),
    type: "article",
  },
  {
    id: "llm-citation-3",
    href: "https://openai.com/research/gpt-2",
    title: "Better Language Models - OpenAI",
    snippet:
      "We've trained a large-scale unsupervised language model which generates coherent paragraphs of text.",
    domain: "openai.com",
    favicon: favicon("openai.com"),
    type: "article",
  },
  {
    id: "llm-citation-4",
    href: "https://ai.google/research/pubs/pub46201",
    title: "BERT: Pre-training of Deep Bidirectional Transformers",
    snippet:
      "We introduce a new language representation model called BERT, which stands for Bidirectional Encoder Representations from Transformers.",
    domain: "ai.google",
    favicon: favicon("ai.google"),
    type: "article",
  },
];
