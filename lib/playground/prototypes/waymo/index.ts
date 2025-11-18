import { WAYMO_SYSTEM_MESSAGE_V2 } from "./system-message-v2";
import type { Prototype } from "../../types";

export const waymoPrototype: Prototype = {
  slug: "waymo-booking",
  title: "Waymo Booking Assistant",
  summary: "Guide riders through booking Waymo autonomous rides",
  systemPrompt: WAYMO_SYSTEM_MESSAGE_V2,
  tools: [],
};
