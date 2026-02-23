type AnalyticsProperties = Record<string, string | number | boolean>;

const trackEvent = (event: string, properties?: AnalyticsProperties) => {
  if (typeof window === "undefined") {
    return;
  }

  void loadPostHog().then((posthog) => {
    posthog?.capture?.(event, properties);
  });

  void loadVercelTrack().then((track) => {
    track?.(event, properties);
  });
};

let posthogLoader: Promise<
  (typeof import("posthog-js"))["default"] | null
> | null = null;
let vercelTrackLoader: Promise<
  (typeof import("@vercel/analytics"))["track"] | null
> | null = null;

function loadPostHog() {
  posthogLoader ??= import("posthog-js")
    .then((module) => module.default)
    .catch(() => null);
  return posthogLoader;
}

function loadVercelTrack() {
  vercelTrackLoader ??= import("@vercel/analytics")
    .then((module) => module.track)
    .catch(() => null);
  return vercelTrackLoader;
}

export const analytics = {
  // ============================================================
  // TIER 1: Core Value Metrics (Adoption signals)
  // These measure if people are getting value from tool-ui
  // ============================================================

  component: {
    /** PRIMARY CONVERSION: User copied component code */
    codeCopied: (componentName: string, codeType: "full" | "snippet") =>
      trackEvent("component_code_copied", {
        component: componentName,
        code_type: codeType,
      }),

    /** Which preset configurations resonate */
    presetSelected: (componentName: string, preset: string) =>
      trackEvent("component_preset_selected", {
        component: componentName,
        preset,
      }),

    /** Demand signal: which components get attention */
    viewed: (componentName: string, source: "gallery" | "direct" | "search") =>
      trackEvent("component_viewed", {
        component: componentName,
        source,
      }),

    /** Deep engagement: interacting with live preview */
    previewInteracted: (componentName: string, action: string) =>
      trackEvent("component_preview_interacted", {
        component: componentName,
        action,
      }),

    /** Tab navigation within component docs */
    tabSwitched: (componentName: string, tab: string) =>
      trackEvent("component_tab_switched", {
        component: componentName,
        tab,
      }),
  },

  // ============================================================
  // TIER 2: Content & Discovery (Gap analysis)
  // These help identify what's missing or needs improvement
  // ============================================================

  search: {
    /** How people discover content */
    opened: (source: "header" | "keyboard" | "empty_state") =>
      trackEvent("search_opened", { source }),

    /** What people are looking for */
    querySubmitted: (query: string, resultsCount: number) =>
      trackEvent("search_query_submitted", {
        query,
        results_count: resultsCount,
      }),

    /** CRITICAL: Content gaps - what doesn't exist yet */
    noResults: (query: string) => trackEvent("search_no_results", { query }),

    /** Which search results convert to visits */
    resultClicked: (query: string, url: string, position: number) =>
      trackEvent("search_result_clicked", { query, url, position }),
  },

  gallery: {
    /** Gallery landing page view */
    pageViewed: () => trackEvent("gallery_page_viewed"),

    /** Which preview cards are shown in the gallery */
    componentPreviewed: (componentName: string) =>
      trackEvent("gallery_component_previewed", { component: componentName }),

    /** Which components get clicks from gallery overview */
    componentClicked: (componentName: string) =>
      trackEvent("gallery_component_clicked", { component: componentName }),

    /** Category filtering patterns */
    categoryFiltered: (category: string) =>
      trackEvent("gallery_category_filtered", { category }),
  },

  docs: {
    /** Navigation patterns through docs */
    navigationClicked: (pageName: string, pageUrl: string) =>
      trackEvent("doc_navigation_clicked", {
        page_name: pageName,
        page_url: pageUrl,
      }),

    /** TOC engagement */
    tocLinkClicked: (headingTitle: string, headingDepth: number) =>
      trackEvent("toc_link_clicked", {
        heading_title: headingTitle,
        heading_depth: headingDepth,
      }),

    /** Installation command copy intent (high-conversion docs action) */
    installSnippetCopied: (
      snippetType: "skills" | "registry" | "package_manager",
      location: "docs_code_block" | "docs_header",
    ) =>
      trackEvent("install_snippet_copied", {
        snippet_type: snippetType,
        location,
      }),
  },

  code: {
    /** Generic code block copy (non-component code) */
    blockCopied: (language: string, source: string) =>
      trackEvent("code_block_copied", { language, source }),
  },

  // ============================================================
  // TIER 3: Acquisition & Conversion (Growth signals)
  // These track how visitors become users
  // ============================================================

  cta: {
    /** CTA engagement */
    clicked: (cta: string, location: string) =>
      trackEvent("cta_clicked", { cta, location }),
  },

  /** External link clicks (GitHub, npm, etc.) */
  external: {
    linkClicked: (
      destination: "github" | "npm" | "docs" | "other",
      url: string,
    ) => trackEvent("external_link_clicked", { destination, url }),
  },
};
