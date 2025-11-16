import { z } from "zod";

import { mockTool } from "./mocks";
import type { Prototype } from "./types";

const searchRestaurantsResult = {
  restaurants: [
    {
      id: "rest_001",
      name: "Tony's Pizza Palace",
      cuisine: "Italian, Pizza",
      rating: 4.7,
      distance: "0.3 mi",
      deliveryTime: "20-30 min",
      deliveryFee: 2.99,
      minOrder: 15,
    },
    {
      id: "rest_002",
      name: "Golden Dragon Chinese",
      cuisine: "Chinese, Asian",
      rating: 4.5,
      distance: "0.5 mi",
      deliveryTime: "25-35 min",
      deliveryFee: 1.99,
      minOrder: 12,
    },
    {
      id: "rest_003",
      name: "Sushi Master",
      cuisine: "Japanese, Sushi",
      rating: 4.8,
      distance: "0.4 mi",
      deliveryTime: "30-40 min",
      deliveryFee: 3.99,
      minOrder: 20,
    },
  ],
  count: 3,
};

const restaurantDetailsResult = {
  id: "rest_001",
  name: "Tony's Pizza Palace",
  description:
    "Family-owned pizzeria serving authentic Italian pizza for over 20 years",
  hours: {
    monday: "11:00 AM - 10:00 PM",
    tuesday: "11:00 AM - 10:00 PM",
    wednesday: "11:00 AM - 10:00 PM",
    thursday: "11:00 AM - 11:00 PM",
    friday: "11:00 AM - 12:00 AM",
    saturday: "11:00 AM - 12:00 AM",
    sunday: "12:00 PM - 10:00 PM",
  },
  address: "123 Main St, San Francisco, CA 94102",
  phone: "(415) 555-0123",
  rating: 4.7,
  reviewCount: 1247,
  specialties: ["Margherita Pizza", "Pepperoni Classic", "Garlic Knots"],
  dietaryOptions: ["Vegetarian", "Vegan", "Gluten-free"],
  pickupAvailable: true,
  deliveryAvailable: true,
};

const menuResult = {
  restaurantId: "rest_001",
  categories: [
    {
      name: "Appetizers",
      items: [
        {
          id: "m1",
          name: "Garlic Knots (6 pcs)",
          price: 5.99,
          description: "Fresh baked knots with garlic butter and herbs",
        },
        {
          id: "m2",
          name: "Mozzarella Sticks (8 pcs)",
          price: 8.99,
          description: "Golden fried mozzarella with marinara sauce",
        },
      ],
    },
    {
      name: "Pizza",
      items: [
        {
          id: "m3",
          name: "Margherita Pizza",
          price: 14.99,
          description: "Fresh mozzarella, basil, and tomato sauce",
        },
        {
          id: "m4",
          name: "Pepperoni Classic",
          price: 16.99,
          description: "Classic pepperoni with mozzarella cheese",
        },
        {
          id: "m5",
          name: "BBQ Chicken Pizza",
          price: 18.99,
          description: "Grilled chicken, BBQ sauce, red onions, cilantro",
        },
      ],
    },
    {
      name: "Pasta",
      items: [
        {
          id: "m6",
          name: "Spaghetti Carbonara",
          price: 13.99,
          description: "Creamy pasta with bacon, parmesan, and eggs",
        },
        {
          id: "m7",
          name: "Fettuccine Alfredo",
          price: 12.99,
          description: "Classic creamy parmesan sauce",
        },
      ],
    },
  ],
};

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

const foodOrderingPrototype: Prototype = {
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
      execute: mockTool(searchRestaurantsResult, 800),
    },
    {
      name: "get_restaurant_details",
      description: "Retrieve detailed information about a specific restaurant.",
      uiId: "fallback",
      execute: mockTool(restaurantDetailsResult, 500),
    },
    {
      name: "get_menu",
      description: "Fetch the menu for a specific restaurant.",
      uiId: "fallback",
      execute: mockTool(menuResult, 600),
    },
    {
      name: "place_order",
      description: "Place a delivery or pickup order and receive a summary.",
      uiId: "fallback",
      input: placeOrderInput,
      execute: async (rawArgs: unknown) => {
        const args = placeOrderInput.parse(rawArgs);
        const subtotal = args.items.reduce<number>(
          (sum, item) => sum + item.price * item.quantity,
          0,
        );
        const tax = subtotal * 0.0875;
        const deliveryFee = args.orderType === "delivery" ? 2.99 : 0;
        const total = subtotal + tax + deliveryFee;
        return {
          orderId: `ord_${Date.now()}`,
          status: "confirmed" as const,
          restaurantId: args.restaurantId,
          items: args.items,
          orderType: args.orderType,
          deliveryAddress: args.deliveryAddress,
          customer: {
            name: args.customerName,
            phone: args.customerPhone,
          },
          subtotal,
          tax,
          deliveryFee,
          total,
          estimatedReadyTime:
            args.orderType === "pickup" ? "20-25 min" : "30-35 min",
          estimatedDeliveryTime:
            args.orderType === "delivery" ? "35-45 min" : undefined,
        };
      },
    },
  ],
};

export const PROTOTYPES: Prototype[] = [foodOrderingPrototype];

export const listPrototypes = (): Prototype[] => PROTOTYPES;

export const findPrototype = (slug: string): Prototype | undefined =>
  PROTOTYPES.find((prototype) => prototype.slug === slug);
