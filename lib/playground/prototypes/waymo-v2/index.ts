/**
 * Waymo v2 Prototype
 *
 * A minimal ride booking flow demonstrating three Tool UI patterns:
 * - Selection (DestinationPicker)
 * - Confirmation (RideQuote)
 * - Progress (TripStatus)
 */

import type { Prototype } from "../../types";
import { WAYMO_V2_SYSTEM_PROMPT } from "./system-prompt";

// Export tools for mounting in chat-pane
export {
  SelectDestinationTool,
  SelectPickupTool,
  GetRideQuoteTool,
  GetTripStatusTool,
} from "./tools";

// Export components
export {
  DestinationPicker,
  PickupPicker,
  RideQuote,
  TripStatus,
} from "./components";

/**
 * The waymo-v2 prototype definition.
 *
 * Note: This prototype uses frontend tools (via makeAssistantTool) rather than
 * backend tools. The tools array is empty because tools are registered by
 * mounting tool components inside AssistantRuntimeProvider.
 */
export const waymoV2Prototype: Prototype = {
  slug: "waymo-v2",
  title: "Waymo v2 (Minimal Flow)",
  summary: "Three-pattern ride booking: Selection, Confirmation, Progress",
  systemPrompt: WAYMO_V2_SYSTEM_PROMPT,
  tools: [], // Tools are registered via makeAssistantTool components
};
