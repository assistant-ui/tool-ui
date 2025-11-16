import { WAYMO_SYSTEM_MESSAGE_V2 } from "@/app/prototypes/find-ride/system-message-v2";

import type { ManifestModule } from "../registry";

export const manifest: ManifestModule["manifest"] = {
  schemaVersion: "1",
  meta: {
    slug: "find-ride-v1",
    name: "Find Ride",
    version: "1.0.0",
    description: "Waymo ride-booking flow with anticipatory tool UIs.",
  },
  system: {
    prompt: WAYMO_SYSTEM_MESSAGE_V2,
  },
  runtime: {
    model: "openai/gpt-5-mini",
    maxSteps: 100,
  },
  cloud: {
    mode: "hybrid",
  },
  tools: [
    {
      name: "get_user_location",
      description:
        "Collect or confirm the user's pickup location before proposing destinations.",
      schema: {
        type: "object",
        properties: {
          allow_gps: {
            type: "boolean",
            description: "Whether GPS can be toggled on for the user.",
          },
        },
        additionalProperties: false,
      },
      schemaOut: {
        type: "object",
        required: ["pickup"],
        additionalProperties: false,
        properties: {
          pickup: {
            type: "object",
            required: ["address", "lat", "lng", "placeId", "label"],
            additionalProperties: false,
            properties: {
              address: { type: "string" },
              lat: { type: "number" },
              lng: { type: "number" },
              placeId: { type: "string" },
              label: { type: "string" },
            },
          },
        },
      },
      impl: {
        kind: "custom",
        config: {
          modulePath: "@/lib/prototypes/server-tools/find-ride/get-user-location",
          edgeSafe: false,
        },
      },
      defaultUI: "tool-fallback",
    },
    {
      name: "toggle_gps",
      description:
        "Toggle GPS usage for the rider and confirm the latest state to the assistant.",
      schema: {
        type: "object",
        properties: {
          isEnabled: {
            type: "boolean",
            description: "Desired GPS toggle value.",
          },
        },
        additionalProperties: false,
      },
      schemaOut: {
        type: "object",
        required: ["isEnabled"],
        additionalProperties: false,
        properties: {
          isEnabled: { type: "boolean" },
        },
      },
      impl: {
        kind: "custom",
        config: {
          modulePath: "@/lib/prototypes/server-tools/find-ride/toggle-gps",
          edgeSafe: false,
        },
      },
      defaultUI: "tool-fallback",
    },
    {
      name: "get_user_destination",
      description:
        "Collect or confirm the rider's destination before quoting prices.",
      schema: {
        type: "object",
        properties: {
          promptHint: {
            type: "string",
            description:
              "Optional hint from conversation history to bias destination selection.",
          },
        },
        additionalProperties: false,
      },
      schemaOut: {
        type: "object",
        required: ["destination"],
        additionalProperties: false,
        properties: {
          destination: {
            type: "object",
            required: ["address", "lat", "lng", "label", "placeId"],
            additionalProperties: false,
            properties: {
              address: { type: "string" },
              lat: { type: "number" },
              lng: { type: "number" },
              label: { type: "string" },
              placeId: { type: "string" },
            },
          },
        },
      },
      impl: {
        kind: "custom",
        config: {
          modulePath: "@/lib/prototypes/server-tools/find-ride/get-user-destination",
          edgeSafe: false,
        },
      },
      defaultUI: "tool-fallback",
    },
    {
      name: "check_ride_prices",
      description:
        "Return estimated ETAs and fares for available Waymo ride options.",
      schema: {
        type: "object",
        required: ["pickup", "destination"],
        additionalProperties: false,
        properties: {
          pickup: { type: "string", minLength: 1 },
          destination: { type: "string", minLength: 1 },
          departureTime: {
            type: "string",
            format: "date-time",
            description: "Optional ISO timestamp for scheduled pickups.",
          },
          services: {
            type: "array",
            items: { type: "string" },
          },
        },
      },
      schemaOut: {
        type: "object",
        required: ["asOf", "options"],
        additionalProperties: false,
        properties: {
          asOf: { type: "string", format: "date-time" },
          options: {
            type: "array",
            minItems: 1,
            items: {
              type: "object",
              required: [
                "provider",
                "service",
                "etaMinutes",
                "price",
                "currency",
              ],
              additionalProperties: false,
              properties: {
                provider: { type: "string" },
                service: { type: "string" },
                etaMinutes: { type: "number" },
                price: { type: "number" },
                currency: { type: "string" },
              },
            },
          },
        },
      },
      impl: {
        kind: "custom",
        config: {
          modulePath: "@/lib/prototypes/server-tools/find-ride/check-ride-prices",
          edgeSafe: false,
        },
      },
      defaultUI: "tool-fallback",
    },
    {
      name: "request_payment_method",
      description:
        "Confirm the payment instrument the rider would like to use.",
      schema: {
        type: "object",
        properties: {
          preferred: {
            type: "string",
            enum: ["apple_pay", "google_pay", "card"],
          },
        },
        additionalProperties: false,
      },
      schemaOut: {
        type: "object",
        required: ["selected", "instrument"],
        additionalProperties: false,
        properties: {
          selected: {
            type: "string",
            enum: ["apple_pay", "google_pay", "card"],
          },
          instrument: {
            type: "object",
            additionalProperties: false,
            properties: {
              type: { type: "string" },
              brand: { type: "string" },
              last4: { type: "string" },
            },
            required: ["type"],
          },
        },
      },
      impl: {
        kind: "custom",
        config: {
          modulePath: "@/lib/prototypes/server-tools/find-ride/request-payment-method",
          edgeSafe: false,
        },
      },
      defaultUI: "tool-fallback",
    },
    {
      name: "confirm_user_payment",
      description:
        "Authorize the quoted fare before booking the ride with Waymo.",
      schema: {
        type: "object",
        required: ["amount"],
        additionalProperties: false,
        properties: {
          amount: {
            type: "number",
            exclusiveMinimum: 0,
          },
          currency: {
            type: "string",
          },
        },
      },
      schemaOut: {
        type: "object",
        required: ["status", "amount", "currency", "authId", "authorizedAt"],
        additionalProperties: false,
        properties: {
          status: { type: "string", enum: ["authorized"] },
          amount: { type: "number" },
          currency: { type: "string" },
          authId: { type: "string" },
          authorizedAt: { type: "string", format: "date-time" },
        },
      },
      impl: {
        kind: "custom",
        config: {
          modulePath: "@/lib/prototypes/server-tools/find-ride/confirm-user-payment",
          edgeSafe: false,
        },
      },
      defaultUI: "tool-fallback",
    },
    {
      name: "show_ride_details",
      description:
        "Echo back the selected ride details and provide a summary receipt.",
      schema: {
        type: "object",
        required: [
          "provider",
          "service",
          "etaMinutes",
          "price",
          "pickup",
          "destination",
        ],
        additionalProperties: false,
        properties: {
          provider: { type: "string" },
          service: { type: "string" },
          etaMinutes: { type: "number", minimum: 0 },
          price: { type: "number", minimum: 0 },
          currency: { type: "string" },
          pickup: { type: "string" },
          destination: { type: "string" },
        },
      },
      schemaOut: {
        type: "object",
        required: ["confirmation"],
        additionalProperties: false,
        properties: {
          confirmation: {
            type: "object",
            required: [
              "rideId",
              "provider",
              "service",
              "etaMinutes",
              "price",
              "currency",
              "pickup",
              "destination",
              "status",
              "pickupWindow",
            ],
            additionalProperties: false,
            properties: {
              rideId: { type: "string" },
              provider: { type: "string" },
              service: { type: "string" },
              etaMinutes: { type: "number" },
              price: { type: "number" },
              currency: { type: "string" },
              pickup: { type: "string" },
              destination: { type: "string" },
              status: { type: "string" },
              pickupWindow: { type: "string" },
            },
          },
        },
      },
      impl: {
        kind: "custom",
        config: {
          modulePath: "@/lib/prototypes/server-tools/find-ride/show-ride-details",
          edgeSafe: false,
        },
      },
      defaultUI: "tool-fallback",
    },
    {
      name: "get_profile_context",
      description:
        "Retrieve rider favorites, recents, and default pickups to power anticipatory suggestions.",
      schema: {
        type: "object",
        additionalProperties: false,
      },
      schemaOut: {
        type: "object",
        required: [
          "asOf",
          "defaultPickup",
          "favorites",
          "recents",
          "defaultPayment",
          "prefs",
        ],
        additionalProperties: false,
        properties: {
          asOf: { type: "string", format: "date-time" },
          defaultPickup: {
            type: "object",
            required: ["address", "label", "lat", "lng", "placeId"],
            additionalProperties: false,
            properties: {
              address: { type: "string" },
              label: { type: "string" },
              lat: { type: "number" },
              lng: { type: "number" },
              placeId: { type: "string" },
            },
          },
          favorites: {
            type: "array",
            items: {
              type: "object",
              required: ["id", "label", "address"],
              additionalProperties: false,
              properties: {
                id: { type: "string" },
                label: { type: "string" },
                address: { type: "string" },
              },
            },
          },
          recents: {
            type: "array",
            items: {
              type: "object",
              required: ["id", "label", "address"],
              additionalProperties: false,
              properties: {
                id: { type: "string" },
                label: { type: "string" },
                address: { type: "string" },
              },
            },
          },
          defaultPayment: {
            type: "object",
            required: ["type", "brand", "last4"],
            additionalProperties: false,
            properties: {
              type: { type: "string" },
              brand: { type: "string" },
              last4: { type: "string" },
            },
          },
          prefs: {
            type: "object",
            required: ["departMode"],
            additionalProperties: false,
            properties: {
              departMode: { type: "string" },
            },
          },
        },
      },
      impl: {
        kind: "custom",
        config: {
          modulePath: "@/lib/prototypes/server-tools/find-ride/get-profile-context",
          edgeSafe: false,
        },
      },
      defaultUI: "tool-fallback",
    },
    {
      name: "search_places",
      description:
        "Search for places near a context to provide escape hatch destination selection.",
      schema: {
        type: "object",
        required: ["query"],
        additionalProperties: false,
        properties: {
          query: { type: "string", minLength: 1 },
          near: { type: "string" },
        },
      },
      schemaOut: {
        type: "object",
        required: ["near", "choices"],
        additionalProperties: false,
        properties: {
          near: { type: ["string", "null"] },
          choices: {
            type: "array",
            items: {
              type: "object",
              required: ["id", "label", "address"],
              additionalProperties: false,
              properties: {
                id: { type: "string" },
                label: { type: "string" },
                address: { type: "string" },
              },
            },
          },
        },
      },
      impl: {
        kind: "custom",
        config: {
          modulePath: "@/lib/prototypes/server-tools/find-ride/search-places",
          edgeSafe: false,
        },
      },
      defaultUI: "tool-fallback",
    },
    {
      name: "precheck_prices",
      description:
        "Pre-check ETAs and fares for suggested destinations to power anticipatory prompts.",
      schema: {
        type: "object",
        required: ["pickup", "candidates"],
        additionalProperties: false,
        properties: {
          pickup: { type: "string", minLength: 1 },
          candidates: {
            type: "array",
            minItems: 1,
            items: {
              type: "object",
              required: ["id", "label", "address"],
              additionalProperties: false,
              properties: {
                id: { type: "string" },
                label: { type: "string" },
                address: { type: "string" },
              },
            },
          },
        },
      },
      schemaOut: {
        type: "object",
        required: ["asOf", "suggestions"],
        additionalProperties: false,
        properties: {
          asOf: { type: "string", format: "date-time" },
          suggestions: {
            type: "array",
            items: {
              type: "object",
              required: ["id", "label", "address", "topService", "reasonTag"],
              additionalProperties: false,
              properties: {
                id: { type: "string" },
                label: { type: "string" },
                address: { type: "string" },
                topService: {
                  type: "object",
                  required: ["service", "etaMinutes", "price", "currency"],
                  additionalProperties: false,
                  properties: {
                    service: { type: "string" },
                    etaMinutes: { type: "number" },
                    price: { type: "number" },
                    currency: { type: "string" },
                  },
                },
                reasonTag: { type: "string" },
              },
            },
          },
        },
      },
      impl: {
        kind: "custom",
        config: {
          modulePath: "@/lib/prototypes/server-tools/find-ride/precheck-prices",
          edgeSafe: false,
        },
      },
      defaultUI: "tool-fallback",
    },
    {
      name: "schedule_ride",
      description:
        "Schedule the selected ride after payment authorization and return a confirmation receipt.",
      schema: {
        type: "object",
        required: [
          "provider",
          "service",
          "etaMinutes",
          "price",
          "pickup",
          "destination",
        ],
        additionalProperties: false,
        properties: {
          provider: { type: "string" },
          service: { type: "string" },
          etaMinutes: { type: "number", minimum: 0 },
          price: { type: "number", minimum: 0 },
          currency: { type: "string" },
          pickup: { type: "string" },
          destination: { type: "string" },
        },
      },
      schemaOut: {
        type: "object",
        required: ["confirmation"],
        additionalProperties: false,
        properties: {
          confirmation: {
            type: "object",
            required: [
              "rideId",
              "provider",
              "service",
              "etaMinutes",
              "price",
              "currency",
              "pickup",
              "destination",
              "status",
              "pickupWindow",
            ],
            additionalProperties: false,
            properties: {
              rideId: { type: "string" },
              provider: { type: "string" },
              service: { type: "string" },
              etaMinutes: { type: "number" },
              price: { type: "number" },
              currency: { type: "string" },
              pickup: { type: "string" },
              destination: { type: "string" },
              status: { type: "string" },
              pickupWindow: { type: "string" },
            },
          },
        },
      },
      impl: {
        kind: "custom",
        config: {
          modulePath: "@/lib/prototypes/server-tools/find-ride/schedule-ride",
          edgeSafe: false,
        },
      },
      defaultUI: "tool-fallback",
    },
    {
      name: "show_ride_options",
      description:
        "Display anticipatory ride options for quick booking based on profile and search data.",
      schema: {
        type: "object",
        required: ["pickup", "candidates"],
        additionalProperties: false,
        properties: {
          pickup: { type: "string", minLength: 1 },
          candidates: {
            type: "array",
            minItems: 1,
            items: {
              type: "object",
              required: ["id", "label", "address"],
              additionalProperties: false,
              properties: {
                id: { type: "string" },
                label: { type: "string" },
                address: { type: "string" },
              },
            },
          },
        },
      },
      schemaOut: {
        type: "object",
        required: ["asOf", "pickup", "suggestions", "defaultPayment"],
        additionalProperties: false,
        properties: {
          asOf: { type: "string", format: "date-time" },
          pickup: {
            type: "object",
            required: ["address", "label"],
            additionalProperties: false,
            properties: {
              address: { type: "string" },
              label: { type: "string" },
            },
          },
          suggestions: {
            type: "array",
            items: {
              type: "object",
              required: ["id", "label", "address", "topService", "reasonTag"],
              additionalProperties: false,
              properties: {
                id: { type: "string" },
                label: { type: "string" },
                address: { type: "string" },
                topService: {
                  type: "object",
                  required: ["service", "etaMinutes", "price", "currency"],
                  additionalProperties: false,
                  properties: {
                    service: { type: "string" },
                    etaMinutes: { type: "number" },
                    price: { type: "number" },
                    currency: { type: "string" },
                  },
                },
                reasonTag: { type: "string" },
              },
            },
          },
          defaultPayment: {
            type: "object",
            required: ["type", "brand", "last4"],
            additionalProperties: false,
            properties: {
              type: { type: "string" },
              brand: { type: "string" },
              last4: { type: "string" },
            },
          },
        },
      },
      impl: {
        kind: "custom",
        config: {
          modulePath: "@/lib/prototypes/server-tools/find-ride/show-ride-options",
          edgeSafe: false,
        },
      },
      defaultUI: "tool-fallback",
    },
    {
      name: "confirm_ride_booking",
      description:
        "Finalize the ride after scheduling and present a final confirmation receipt.",
      schema: {
        type: "object",
        required: [
          "provider",
          "service",
          "etaMinutes",
          "price",
          "pickup",
          "destination",
        ],
        additionalProperties: false,
        properties: {
          provider: { type: "string" },
          service: { type: "string" },
          etaMinutes: { type: "number", minimum: 0 },
          price: { type: "number", minimum: 0 },
          currency: { type: "string" },
          pickup: { type: "string" },
          destination: { type: "string" },
        },
      },
      schemaOut: {
        type: "object",
        required: ["confirmation"],
        additionalProperties: false,
        properties: {
          confirmation: {
            type: "object",
            required: [
              "rideId",
              "provider",
              "service",
              "etaMinutes",
              "price",
              "currency",
              "pickup",
              "destination",
              "status",
              "pickupWindow",
              "bookedAt",
            ],
            additionalProperties: false,
            properties: {
              rideId: { type: "string" },
              provider: { type: "string" },
              service: { type: "string" },
              etaMinutes: { type: "number" },
              price: { type: "number" },
              currency: { type: "string" },
              pickup: { type: "string" },
              destination: { type: "string" },
              status: { type: "string" },
              pickupWindow: { type: "string" },
              bookedAt: { type: "string", format: "date-time" },
            },
          },
        },
      },
      impl: {
        kind: "custom",
        config: {
          modulePath:
            "@/lib/prototypes/server-tools/find-ride/confirm-ride-booking",
          edgeSafe: false,
        },
      },
      defaultUI: "tool-fallback",
    },
  ],
  uiMap: {
    get_user_location: "tool-fallback",
    toggle_gps: "tool-fallback",
    get_user_destination: "tool-fallback",
    check_ride_prices: "tool-fallback",
    request_payment_method: "tool-fallback",
    confirm_user_payment: "tool-fallback",
    show_ride_details: "tool-fallback",
    get_profile_context: "tool-fallback",
    search_places: "tool-fallback",
    precheck_prices: "tool-fallback",
    schedule_ride: "tool-fallback",
    show_ride_options: "tool-fallback",
    confirm_ride_booking: "tool-fallback",
  },
} as const;


