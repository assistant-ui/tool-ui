export const RESTAURANT_SEARCH_RESULTS = {
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
} as const;

export const RESTAURANT_DETAILS = {
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
} as const;

export const MENU = {
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
} as const;
