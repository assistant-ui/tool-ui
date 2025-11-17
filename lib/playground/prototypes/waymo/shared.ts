import { z } from "zod";

export const MOCK_NOW = "2024-06-01T12:00:00.000Z";

export const DEFAULT_PICKUP = {
  address: "500 Howard St, San Francisco, CA 94105",
  label: "Current location",
  lat: 37.78825,
  lng: -122.39716,
  placeId: "mock-pickup-1",
} as const;

export const DEFAULT_FAVORITES = [
  {
    id: "fav-home",
    label: "Home",
    address: "123 Market St, San Francisco, CA 94103",
  },
  {
    id: "fav-work",
    label: "Work",
    address: "1 Market St, San Francisco, CA 94105",
  },
] as const;

export const DEFAULT_RECENTS = [
  {
    id: "recent-airport",
    label: "SFO",
    address: "San Francisco International Airport, CA 94128",
  },
] as const;

export const RIDE_OPTIONS = [
  {
    provider: "Waymo",
    service: "Standard",
    etaMinutes: 3,
    price: 17.5,
    currency: "USD",
  },
  {
    provider: "Waymo",
    service: "XL",
    etaMinutes: 4,
    price: 24.8,
    currency: "USD",
  },
  {
    provider: "Waymo",
    service: "Premium",
    etaMinutes: 5,
    price: 32.0,
    currency: "USD",
  },
] as const;

export const DESTINATIONS = {
  home: {
    address: "123 Market St, San Francisco, CA 94103",
    lat: 37.78223,
    lng: -122.40904,
    label: "Home",
    placeId: "mock-dest-home-1",
  },
  ferry: {
    address: "1 Ferry Building, San Francisco, CA 94111",
    lat: 37.7955,
    lng: -122.3937,
    label: "Ferry Building",
    placeId: "mock-dest-1",
  },
} as const;

export const PLACE_CHOICES = [
  {
    id: "plc-1",
    label: "Ferry Building",
    address: "1 Ferry Building, San Francisco, CA 94111",
  },
  {
    id: "plc-2",
    label: "Oracle Park",
    address: "24 Willie Mays Plaza, San Francisco, CA 94107",
  },
  {
    id: "plc-3",
    label: "Chase Center",
    address: "1 Warriors Way, San Francisco, CA 94158",
  },
] as const;

export const SUGGESTION_SERVICES = ["Standard", "XL", "Premium"] as const;

export const SUGGESTION_REASONS = ["frequent", "workday", "recent"] as const;

export const PAYMENT_METHODS = [
  "apple_pay",
  "google_pay",
  "card",
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const paymentMethodEnum = z.enum(PAYMENT_METHODS);

export const candidateSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  address: z.string().min(1),
});

export const candidateArraySchema = z.array(candidateSchema).min(1);

export type Candidate = z.infer<typeof candidateSchema>;

export const rideSummarySchema = z.object({
  provider: z.string().min(1),
  service: z.string().min(1),
  etaMinutes: z.number().min(0),
  price: z.number().min(0),
  currency: z.string().optional(),
  pickup: z.string().min(1),
  destination: z.string().min(1),
});

export type RideSummary = z.infer<typeof rideSummarySchema>;
