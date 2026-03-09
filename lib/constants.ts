import type { FixtureType, RoomTemplate, RoomType, Wall } from "@/lib/types";

export const ROOM_TEMPLATE: RoomTemplate = {
  id: "bathroom-standard",
  roomType: "bathroom",
  name: "Bathroom Planner",
  rules: {
    minimumWidthCm: 180,
    minimumDepthCm: 180,
    maximumWidthCm: 520,
    maximumDepthCm: 520,
    targetOptionCount: 8
  }
};

export const SUPPORTED_LOCALES = ["en", "nl"] as const;
export const ROOM_TYPES: RoomType[] = ["bathroom", "kitchen", "living-room", "office", "bedroom"];
export const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  bathroom: "Bathroom",
  kitchen: "Kitchen",
  "living-room": "Living room",
  office: "Office",
  bedroom: "Bedroom"
};
export const DEFAULT_AI_MODEL = "google/gemini-2.5-flash-image";
export const TARGET_OPTION_COUNT = 8;
export const DOOR_DEPTH_CM = 90;
export const WALLS: Wall[] = ["north", "east", "south", "west"];

export const FIXTURE_SPECS: Record<
  FixtureType,
  {
    widthCm: number;
    depthCm: number;
    clearanceCm: number;
    label: string;
    renderLabel: string;
  }
> = {
  toilet: {
    widthCm: 42,
    depthCm: 70,
    clearanceCm: 60,
    label: "Toilet",
    renderLabel: "wall-mounted toilet"
  },
  sink: {
    widthCm: 60,
    depthCm: 48,
    clearanceCm: 55,
    label: "Sink",
    renderLabel: "floating vanity with sink"
  },
  shower: {
    widthCm: 95,
    depthCm: 95,
    clearanceCm: 30,
    label: "Shower",
    renderLabel: "walk-in shower"
  },
  bath: {
    widthCm: 170,
    depthCm: 78,
    clearanceCm: 40,
    label: "Bath",
    renderLabel: "freestanding bath"
  }
};

export const DEFAULT_CATEGORY_LABELS: Record<FixtureType, string> = {
  toilet: "Toilets",
  sink: "Bathroom sinks",
  shower: "Shower systems",
  bath: "Bathtubs"
};

export const FONT_OPTIONS = [
  "Space Grotesk, sans-serif",
  "Avenir Next, sans-serif",
  "IBM Plex Sans, sans-serif",
  "Work Sans, sans-serif"
];
