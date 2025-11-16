import { z } from "zod";

import { searchRestaurants } from "./search-restaurants";
import { getRestaurantDetails } from "./get-restaurant-details";
import { getMenu } from "./get-menu";
import { placeOrder } from "./place-order";
import type { Prototype } from "../../types";

const searchRestaurantsInput = z.object({
  query: z.string().optional(),
  location: z.string().optional(),
});

const getRestaurantDetailsInput = z.object({
  restaurantId: z.string(),
});

const getMenuInput = z.object({
  restaurantId: z.string(),
});

const placeOrderInput = z.object({
  restaurantId: z.string(),
  items: z
    .array(
      z.object({
        itemId: z.string(),
        name: z.string(),
        quantity: z.number().int().min(1),
        price: z.number().min(0),
      }),
    )
    .min(1),
  orderType: z.enum(["delivery", "pickup"]),
  deliveryAddress: z.string().optional(),
  customerName: z.string(),
  customerPhone: z.string(),
});

export const foodOrderingPrototype: Prototype = {
  slug: "food-ordering",
  title: "Food Ordering Assistant",
  summary: "Search restaurants, browse menus, and place orders",
  systemPrompt: `You are a helpful food ordering assistant. Help users find restaurants, browse menus, and place orders.

Key capabilities:
1. Search for restaurants by cuisine type or name
2. Get detailed menu information for restaurants
3. Place orders for delivery or pickup
4. Get restaurant details like hours, ratings, and delivery info

Be conversational, friendly, and helpful. Ask clarifying questions when needed.`,
  tools: [
    {
      name: "search_restaurants",
      description: "Search for restaurants by cuisine, name, or location.",
      uiId: "fallback",
      input: searchRestaurantsInput,
      execute: async (rawArgs: unknown) =>
        searchRestaurants(searchRestaurantsInput.parse(rawArgs ?? {})),
    },
    {
      name: "get_restaurant_details",
      description: "Retrieve detailed information about a specific restaurant.",
      uiId: "fallback",
      input: getRestaurantDetailsInput,
      execute: async (rawArgs: unknown) =>
        getRestaurantDetails(getRestaurantDetailsInput.parse(rawArgs)),
    },
    {
      name: "get_menu",
      description: "Fetch the menu for a specific restaurant.",
      uiId: "fallback",
      input: getMenuInput,
      execute: async (rawArgs: unknown) => getMenu(getMenuInput.parse(rawArgs)),
    },
    {
      name: "place_order",
      description: "Place a delivery or pickup order and receive a summary.",
      uiId: "fallback",
      input: placeOrderInput,
      execute: async (rawArgs: unknown) => placeOrder(placeOrderInput.parse(rawArgs)),
    },
  ],
};
