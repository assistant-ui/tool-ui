import { z } from "zod";

import { WAYMO_SYSTEM_MESSAGE_V2 } from "@/app/prototypes/find-ride/system-message-v2";

import { getUserLocation } from "./get-user-location";
import { toggleGps } from "./toggle-gps";
import { getUserDestination } from "./get-user-destination";
import { checkRidePrices } from "./check-ride-prices";
import { requestPaymentMethod } from "./request-payment-method";
import { confirmUserPayment } from "./confirm-user-payment";
import { showRideDetails } from "./show-ride-details";
import { getProfileContext } from "./get-profile-context";
import { searchPlaces } from "./search-places";
import { precheckPrices } from "./precheck-prices";
import { scheduleRide } from "./schedule-ride";
import { showRideOptions } from "./show-ride-options";
import { confirmRideBooking } from "./confirm-ride-booking";
import type { Prototype } from "../../types";

const getUserLocationInput = z.object({
  allow_gps: z.boolean().optional(),
});

const toggleGpsInput = z.object({
  isEnabled: z.boolean().optional(),
});

const getUserDestinationInput = z.object({
  promptHint: z.string().optional(),
});

const checkRidePricesInput = z.object({
  pickup: z.string().min(1),
  destination: z.string().min(1),
  departureTime: z.string().optional(),
  services: z.array(z.string().min(1)).min(1).optional(),
});

const paymentMethodEnum = z.enum(["apple_pay", "google_pay", "card"]);

const requestPaymentMethodInput = z.object({
  preferred: paymentMethodEnum.optional(),
});

const confirmUserPaymentInput = z.object({
  amount: z.number().positive(),
  currency: z.string().optional(),
});

const rideSummaryInput = z.object({
  provider: z.string().min(1),
  service: z.string().min(1),
  etaMinutes: z.number().min(0),
  price: z.number().min(0),
  currency: z.string().optional(),
  pickup: z.string().min(1),
  destination: z.string().min(1),
});

const searchPlacesInput = z.object({
  query: z.string().min(1),
  near: z.string().optional(),
});

const candidateSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  address: z.string().min(1),
});

const candidateArraySchema = z.array(candidateSchema).min(1);

const precheckPricesInput = z.object({
  pickup: z.string().min(1),
  candidates: candidateArraySchema,
});

const showRideOptionsInput = z.object({
  pickup: z.string().min(1),
  candidates: candidateArraySchema,
});

const getProfileContextInput = z.object({});

export const waymoPrototype: Prototype = {
  slug: "waymo-booking",
  title: "Waymo Booking Assistant",
  summary: "Guide riders through booking Waymo autonomous rides",
  systemPrompt: WAYMO_SYSTEM_MESSAGE_V2,
  tools: [
    {
      name: "get_user_location",
      description:
        "Collect or confirm the user's pickup location before proposing destinations.",
      uiId: "fallback",
      input: getUserLocationInput,
      execute: async (rawArgs: unknown) =>
        getUserLocation(getUserLocationInput.parse(rawArgs ?? {})),
    },
    {
      name: "toggle_gps",
      description:
        "Toggle GPS usage for the rider and confirm the latest state to the assistant.",
      uiId: "fallback",
      input: toggleGpsInput,
      execute: async (rawArgs: unknown) =>
        toggleGps(toggleGpsInput.parse(rawArgs ?? {})),
    },
    {
      name: "get_user_destination",
      description:
        "Collect or confirm the rider's destination before quoting prices.",
      uiId: "fallback",
      input: getUserDestinationInput,
      execute: async (rawArgs: unknown) =>
        getUserDestination(getUserDestinationInput.parse(rawArgs ?? {})),
    },
    {
      name: "check_ride_prices",
      description:
        "Return estimated ETAs and fares for available Waymo ride options.",
      uiId: "fallback",
      input: checkRidePricesInput,
      execute: async (rawArgs: unknown) =>
        checkRidePrices(checkRidePricesInput.parse(rawArgs)),
    },
    {
      name: "request_payment_method",
      description:
        "Confirm the payment instrument the rider would like to use.",
      uiId: "fallback",
      input: requestPaymentMethodInput,
      execute: async (rawArgs: unknown) =>
        requestPaymentMethod(requestPaymentMethodInput.parse(rawArgs ?? {})),
    },
    {
      name: "confirm_user_payment",
      description:
        "Authorize the quoted fare before booking the ride with Waymo.",
      uiId: "fallback",
      input: confirmUserPaymentInput,
      execute: async (rawArgs: unknown) =>
        confirmUserPayment(confirmUserPaymentInput.parse(rawArgs)),
    },
    {
      name: "show_ride_details",
      description:
        "Echo back the selected ride details and provide a summary receipt.",
      uiId: "fallback",
      input: rideSummaryInput,
      execute: async (rawArgs: unknown) =>
        showRideDetails(rideSummaryInput.parse(rawArgs)),
    },
    {
      name: "get_profile_context",
      description:
        "Retrieve rider favorites, recents, and default pickups to power anticipatory suggestions.",
      uiId: "fallback",
      input: getProfileContextInput,
      execute: async (rawArgs: unknown) => {
        getProfileContextInput.parse(rawArgs ?? {});
        return getProfileContext();
      },
    },
    {
      name: "search_places",
      description:
        "Search for places near a context to provide escape hatch destination selection.",
      uiId: "fallback",
      input: searchPlacesInput,
      execute: async (rawArgs: unknown) =>
        searchPlaces(searchPlacesInput.parse(rawArgs)),
    },
    {
      name: "precheck_prices",
      description:
        "Pre-check ETAs and fares for suggested destinations to power anticipatory prompts.",
      uiId: "fallback",
      input: precheckPricesInput,
      execute: async (rawArgs: unknown) =>
        precheckPrices(precheckPricesInput.parse(rawArgs)),
    },
    {
      name: "schedule_ride",
      description:
        "Schedule the selected ride after payment authorization and return a confirmation receipt.",
      uiId: "fallback",
      input: rideSummaryInput,
      execute: async (rawArgs: unknown) =>
        scheduleRide(rideSummaryInput.parse(rawArgs)),
    },
    {
      name: "show_ride_options",
      description:
        "Display anticipatory ride options for quick booking based on profile and search data.",
      uiId: "fallback",
      input: showRideOptionsInput,
      execute: async (rawArgs: unknown) =>
        showRideOptions(showRideOptionsInput.parse(rawArgs)),
    },
    {
      name: "confirm_ride_booking",
      description:
        "Finalize the ride after scheduling and present a final confirmation receipt.",
      uiId: "fallback",
      input: rideSummaryInput,
      execute: async (rawArgs: unknown) =>
        confirmRideBooking(rideSummaryInput.parse(rawArgs)),
    },
  ],
};
