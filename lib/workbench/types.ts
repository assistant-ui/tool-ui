/**
 * Workbench Types
 *
 * TypeScript types following the OpenAI Apps SDK specification.
 * These types define the `window.openai` interface that ChatGPT injects
 * into component iframes.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Display & Theme
// ─────────────────────────────────────────────────────────────────────────────

export type DisplayMode = "pip" | "inline" | "fullscreen";
export type Theme = "light" | "dark";
export type DeviceType = "mobile" | "tablet" | "desktop";

// ─────────────────────────────────────────────────────────────────────────────
// Safe Area & User Agent
// ─────────────────────────────────────────────────────────────────────────────

export interface SafeAreaInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface SafeArea {
  insets: SafeAreaInsets;
}

export interface DeviceInfo {
  type: DeviceType;
}

export interface DeviceCapabilities {
  hover: boolean;
  touch: boolean;
}

export interface UserAgent {
  device: DeviceInfo;
  capabilities: DeviceCapabilities;
}

// ─────────────────────────────────────────────────────────────────────────────
// OpenAI Globals (Read-only properties on window.openai)
// ─────────────────────────────────────────────────────────────────────────────

export interface OpenAIGlobals {
  /** Current theme: "light" or "dark" */
  theme: Theme;

  /** BCP 47 locale string (e.g., "en-US", "es-ES") */
  locale: string;

  /** Current display mode of the widget container */
  displayMode: DisplayMode;

  /** Maximum height available for the widget in pixels */
  maxHeight: number;

  /** Input arguments passed to the tool by the model */
  toolInput: Record<string, unknown>;

  /** Output/result from the tool execution (null while pending) */
  toolOutput: Record<string, unknown> | null;

  /** Server metadata from tool response (not shown to model) */
  toolResponseMetadata: Record<string, unknown> | null;

  /** Persistent state scoped to this widget instance */
  widgetState: Record<string, unknown> | null;

  /** Device and capability information */
  userAgent: UserAgent;

  /** Safe area insets for mobile devices */
  safeArea: SafeArea;
}

// ─────────────────────────────────────────────────────────────────────────────
// OpenAI API Methods (Callable functions on window.openai)
// ─────────────────────────────────────────────────────────────────────────────

export interface CallToolResponse {
  structuredContent?: Record<string, unknown>;
  content?: string | Array<{ type: string; text?: string }>;
  _meta?: Record<string, unknown>;
}

export interface OpenAIAPI {
  /** Call a tool on the MCP server */
  callTool: (
    name: string,
    args: Record<string, unknown>
  ) => Promise<CallToolResponse>;

  /** Ask the host to close the widget container */
  requestClose: () => void;

  /** Trigger a follow-up turn in the conversation */
  sendFollowUpMessage: (args: { prompt: string }) => Promise<void>;

  /** Open an external link or app deep link */
  openExternal: (payload: { href: string }) => void;

  /** Request a display mode change (pip, inline, fullscreen) */
  requestDisplayMode: (args: { mode: DisplayMode }) => Promise<{
    mode: DisplayMode;
  }>;

  /** Persist widget state (visible to model, rehydrated on remount) */
  setWidgetState: (state: Record<string, unknown>) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Combined window.openai interface
// ─────────────────────────────────────────────────────────────────────────────

export type WindowOpenAI = OpenAIGlobals & OpenAIAPI;

// ─────────────────────────────────────────────────────────────────────────────
// Event Types
// ─────────────────────────────────────────────────────────────────────────────

export const SET_GLOBALS_EVENT_TYPE = "openai:set_globals" as const;

export interface SetGlobalsEventDetail {
  globals: Partial<OpenAIGlobals>;
}

// ─────────────────────────────────────────────────────────────────────────────
// PostMessage Protocol Types
// ─────────────────────────────────────────────────────────────────────────────

/** Message sent from parent (workbench) to iframe */
export type ParentToIframeMessage =
  | { type: "OPENAI_SET_GLOBALS"; globals: OpenAIGlobals }
  | { type: "OPENAI_METHOD_RESPONSE"; id: string; result?: unknown; error?: string };

/** Message sent from iframe to parent (workbench) */
export interface IframeToParentMessage {
  type: "OPENAI_METHOD_CALL";
  id: string;
  method: keyof OpenAIAPI;
  args: unknown[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Console Entry Types
// ─────────────────────────────────────────────────────────────────────────────

export type ConsoleEntryType =
  | "callTool"
  | "setWidgetState"
  | "requestDisplayMode"
  | "sendFollowUpMessage"
  | "requestClose"
  | "openExternal"
  | "event";

export interface ConsoleEntry {
  id: string;
  timestamp: Date;
  type: ConsoleEntryType;
  method: string;
  args?: unknown;
  result?: unknown;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component Registry Types
// ─────────────────────────────────────────────────────────────────────────────

export type ComponentCategory = "cards" | "lists" | "forms" | "data";

export interface WorkbenchComponent {
  /** Unique identifier for the component */
  id: string;

  /** Display label for the component selector */
  label: string;

  /** Brief description of what the component does */
  description: string;

  /** Category for grouping in UI */
  category: ComponentCategory;

  /** Function that returns the self-contained HTML bundle */
  getBundle: () => string;

  /** Default toolInput to populate when selected */
  defaultToolInput: Record<string, unknown>;

  /** Default toolOutput to populate when selected */
  defaultToolOutput: Record<string, unknown>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Device Presets
// ─────────────────────────────────────────────────────────────────────────────

export interface DevicePreset {
  width: number | "100%";
  height: number | "100%";
  userAgent: UserAgent;
}

export const DEVICE_PRESETS: Record<DeviceType, DevicePreset> = {
  mobile: {
    width: 375,
    height: 667,
    userAgent: {
      device: { type: "mobile" },
      capabilities: { hover: false, touch: true },
    },
  },
  tablet: {
    width: 768,
    height: 1024,
    userAgent: {
      device: { type: "tablet" },
      capabilities: { hover: false, touch: true },
    },
  },
  desktop: {
    width: "100%",
    height: "100%",
    userAgent: {
      device: { type: "desktop" },
      capabilities: { hover: true, touch: false },
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Locale Options
// ─────────────────────────────────────────────────────────────────────────────

export const LOCALE_OPTIONS = [
  { value: "en-US", label: "English (US)" },
  { value: "en-GB", label: "English (UK)" },
  { value: "es-ES", label: "Spanish (Spain)" },
  { value: "fr-FR", label: "French (France)" },
  { value: "de-DE", label: "German (Germany)" },
  { value: "ja-JP", label: "Japanese" },
  { value: "zh-CN", label: "Chinese (Simplified)" },
  { value: "pt-BR", label: "Portuguese (Brazil)" },
] as const;
