import type { SerializableItemCarousel } from "@/components/tool-ui/item-carousel";
import type { PresetWithCodeGen } from "./types";

export type ItemCarouselPresetName =
  | "recommendations"
  | "team"
  | "shopping"
  | "courses"
  | "restaurants"
  | "events";

function generateItemCarouselCode(data: SerializableItemCarousel): string {
  const props: string[] = [];

  props.push(`  id="${data.id}"`);

  const itemsFormatted = JSON.stringify(data.items, null, 4).replace(
    /\n/g,
    "\n  ",
  );
  props.push(`  items={${itemsFormatted}}`);

  props.push(`  onItemClick={(itemId) => console.log("Clicked:", itemId)}`);
  props.push(
    `  onItemAction={(itemId, actionId) => console.log("Action:", itemId, actionId)}`,
  );

  return `<ItemCarousel\n${props.join("\n")}\n/>`;
}

export const itemCarouselPresets: Record<
  ItemCarouselPresetName,
  PresetWithCodeGen<SerializableItemCarousel>
> = {
  recommendations: {
    description: "TV shows to watch next",
    data: {
      id: "item-carousel-recommendations",
      items: [
        {
          id: "rec-1",
          name: "Deadwood",
          subtitle: "HBO · 2004",
          color: "#0891b2",
          actions: [
            { id: "info", label: "Details", variant: "secondary" },
            { id: "watch", label: "Watch" },
          ],
        },
        {
          id: "rec-2",
          name: "The Wire",
          subtitle: "HBO · 2002",
          color: "#0284c7",
          actions: [
            { id: "info", label: "Details", variant: "secondary" },
            { id: "watch", label: "Watch" },
          ],
        },
        {
          id: "rec-3",
          name: "Twin Peaks",
          subtitle: "ABC · 1990",
          color: "#2563eb",
          actions: [
            { id: "info", label: "Details", variant: "secondary" },
            { id: "watch", label: "Watch" },
          ],
        },
        {
          id: "rec-4",
          name: "The Simpsons",
          subtitle: "Fox · 1989",
          color: "#4f46e5",
          actions: [{ id: "add", label: "Add to List" }],
        },
        {
          id: "rec-5",
          name: "Mad Men",
          subtitle: "AMC · 2007",
          color: "#7c3aed",
          actions: [
            { id: "info", label: "Details", variant: "secondary" },
            { id: "watch", label: "Watch" },
          ],
        },
        {
          id: "rec-6",
          name: "Peep Show",
          subtitle: "Channel 4 · 2003",
          color: "#9333ea",
          actions: [
            { id: "info", label: "Details", variant: "secondary" },
            { id: "watch", label: "Watch" },
          ],
        },
        {
          id: "rec-7",
          name: "The Sopranos",
          subtitle: "HBO · 1999",
          color: "#a855f7",
          actions: [
            { id: "info", label: "Details", variant: "secondary" },
            { id: "watch", label: "Watch" },
          ],
        },
      ],
    } satisfies SerializableItemCarousel,
    generateExampleCode: generateItemCarouselCode,
  },
  team: {
    description: "Team members and contributors",
    data: {
      id: "item-carousel-team",
      items: [
        {
          id: "team-1",
          name: "Alex Chen",
          subtitle: "Engineering Lead",
          color: "#0d9488",
          actions: [{ id: "profile", label: "View Profile" }],
        },
        {
          id: "team-2",
          name: "Jordan Rivera",
          subtitle: "Product Designer",
          color: "#059669",
          actions: [{ id: "profile", label: "View Profile" }],
        },
        {
          id: "team-3",
          name: "Sam Patel",
          subtitle: "Frontend Engineer",
          color: "#16a34a",
          actions: [{ id: "profile", label: "View Profile" }],
        },
        {
          id: "team-4",
          name: "Morgan Kim",
          subtitle: "Backend Engineer",
          color: "#65a30d",
          actions: [{ id: "profile", label: "View Profile" }],
        },
      ],
    } satisfies SerializableItemCarousel,
    generateExampleCode: generateItemCarouselCode,
  },
  shopping: {
    description: "Products for comparison shopping",
    data: {
      id: "item-carousel-shopping",
      items: [
        {
          id: "prod-1",
          name: "Sony WH-1000XM5",
          subtitle: "$349.99",
          color: "#d97706",
          actions: [
            { id: "compare", label: "Compare", variant: "secondary" },
            { id: "cart", label: "Add to Cart" },
          ],
        },
        {
          id: "prod-2",
          name: "Bose QuietComfort Ultra",
          subtitle: "$429.00",
          color: "#ea580c",
          actions: [
            { id: "compare", label: "Compare", variant: "secondary" },
            { id: "cart", label: "Add to Cart" },
          ],
        },
        {
          id: "prod-3",
          name: "Apple AirPods Max",
          subtitle: "$549.00",
          color: "#dc2626",
          actions: [{ id: "notify", label: "Notify Me" }],
        },
        {
          id: "prod-4",
          name: "Sennheiser Momentum 4",
          subtitle: "$379.95",
          color: "#e11d48",
          actions: [
            { id: "compare", label: "Compare", variant: "secondary" },
            { id: "cart", label: "Add to Cart" },
          ],
        },
        {
          id: "prod-5",
          name: "Audio-Technica ATH-M50x",
          subtitle: "$149.00",
          color: "#db2777",
          actions: [
            { id: "compare", label: "Compare", variant: "secondary" },
            { id: "cart", label: "Add to Cart" },
          ],
        },
      ],
    } satisfies SerializableItemCarousel,
    generateExampleCode: generateItemCarouselCode,
  },
  courses: {
    description: "Learning content and tutorials",
    data: {
      id: "item-carousel-courses",
      items: [
        {
          id: "course-1",
          name: "React Fundamentals",
          subtitle: "4h · Beginner",
          color: "#0ea5e9",
          actions: [
            { id: "preview", label: "Preview", variant: "secondary" },
            { id: "enroll", label: "Enroll" },
          ],
        },
        {
          id: "course-2",
          name: "TypeScript Deep Dive",
          subtitle: "6h · Intermediate",
          color: "#3b82f6",
          actions: [
            { id: "preview", label: "Preview", variant: "secondary" },
            { id: "enroll", label: "Enroll" },
          ],
        },
        {
          id: "course-3",
          name: "System Design",
          subtitle: "8h · Advanced",
          color: "#6366f1",
          actions: [{ id: "waitlist", label: "Join Waitlist" }],
        },
        {
          id: "course-4",
          name: "GraphQL Essentials",
          subtitle: "3h · Beginner",
          color: "#8b5cf6",
          actions: [
            { id: "preview", label: "Preview", variant: "secondary" },
            { id: "enroll", label: "Enroll" },
          ],
        },
        {
          id: "course-5",
          name: "Testing Strategies",
          subtitle: "5h · Intermediate",
          color: "#a855f7",
          actions: [
            { id: "preview", label: "Preview", variant: "secondary" },
            { id: "enroll", label: "Enroll" },
          ],
        },
      ],
    } satisfies SerializableItemCarousel,
    generateExampleCode: generateItemCarouselCode,
  },
  restaurants: {
    description: "Nearby places to eat",
    data: {
      id: "item-carousel-restaurants",
      items: [
        {
          id: "rest-1",
          name: "Sushi Nakazawa",
          subtitle: "Japanese · 0.3 mi",
          color: "#f43f5e",
          actions: [
            { id: "menu", label: "Menu", variant: "secondary" },
            { id: "reserve", label: "Reserve" },
          ],
        },
        {
          id: "rest-2",
          name: "Osteria Francescana",
          subtitle: "Italian · 0.5 mi",
          color: "#ec4899",
          actions: [
            { id: "menu", label: "Menu", variant: "secondary" },
            { id: "reserve", label: "Reserve" },
          ],
        },
        {
          id: "rest-3",
          name: "Eleven Madison Park",
          subtitle: "American · 0.8 mi",
          color: "#d946ef",
          actions: [{ id: "waitlist", label: "Join Waitlist" }],
        },
        {
          id: "rest-4",
          name: "Le Bernardin",
          subtitle: "French · 1.2 mi",
          color: "#a855f7",
          actions: [
            { id: "menu", label: "Menu", variant: "secondary" },
            { id: "reserve", label: "Reserve" },
          ],
        },
      ],
    } satisfies SerializableItemCarousel,
    generateExampleCode: generateItemCarouselCode,
  },
  events: {
    description: "Upcoming activities and gatherings",
    data: {
      id: "item-carousel-events",
      items: [
        {
          id: "event-1",
          name: "React Conf 2025",
          subtitle: "May 15 · San Francisco",
          color: "#14b8a6",
          actions: [
            { id: "details", label: "Details", variant: "secondary" },
            { id: "rsvp", label: "RSVP" },
          ],
        },
        {
          id: "event-2",
          name: "Design Systems Meetup",
          subtitle: "Jan 8 · New York",
          color: "#06b6d4",
          actions: [
            { id: "details", label: "Details", variant: "secondary" },
            { id: "rsvp", label: "RSVP" },
          ],
        },
        {
          id: "event-3",
          name: "AI/ML Summit",
          subtitle: "Mar 22 · Austin",
          color: "#0ea5e9",
          actions: [{ id: "notify", label: "Get Notified" }],
        },
        {
          id: "event-4",
          name: "TypeScript Congress",
          subtitle: "Apr 10 · Online",
          color: "#3b82f6",
          actions: [
            { id: "details", label: "Details", variant: "secondary" },
            { id: "rsvp", label: "RSVP" },
          ],
        },
        {
          id: "event-5",
          name: "Frontend Happy Hour",
          subtitle: "Dec 20 · Local",
          color: "#6366f1",
          actions: [
            { id: "details", label: "Details", variant: "secondary" },
            { id: "rsvp", label: "RSVP" },
          ],
        },
      ],
    } satisfies SerializableItemCarousel,
    generateExampleCode: generateItemCarouselCode,
  },
};
