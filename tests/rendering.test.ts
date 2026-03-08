import { afterEach, describe, expect, it } from "vitest";

import { renderLayoutOption } from "../lib/rendering";
import type { SessionInput, Tenant } from "../lib/types";

const tenant: Tenant = {
  id: "tenant",
  name: "Tenant",
  slug: "tenant",
  defaultLocale: "en",
  supportedLocales: ["en", "nl"],
  enabledRoomTypes: ["bathroom"],
  categoryLinks: {
    toilet: "https://example.com/toilets",
    sink: "https://example.com/sinks",
    shower: "https://example.com/showers",
    bath: "https://example.com/baths"
  },
  brandTheme: {
    logoDataUrl: null,
    primaryColor: "#f97316",
    secondaryColor: "#0f172a",
    accentColor: "#facc15",
    surfaceColor: "#fff7ed",
    fontFamily: "Space Grotesk, sans-serif"
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const input: SessionInput = {
  roomType: "bathroom",
  locale: "en",
  widthCm: 300,
  depthCm: 250,
  door: {
    wall: "south",
    offsetCm: 80,
    widthCm: 90
  },
  window: null,
  fixtures: ["toilet", "sink"]
};

const layout = {
  room: {
    widthCm: 300,
    depthCm: 250
  },
  door: input.door,
  window: input.window,
  fixtures: [
    {
      fixtureType: "toilet" as const,
      wall: "west" as const,
      x: 0,
      y: 30,
      width: 70,
      depth: 42,
      rotation: 90 as const,
      clearance: {
        x: 0,
        y: 30,
        width: 130,
        depth: 42
      }
    },
    {
      fixtureType: "sink" as const,
      wall: "north" as const,
      x: 180,
      y: 0,
      width: 60,
      depth: 48,
      rotation: 0 as const,
      clearance: {
        x: 180,
        y: 0,
        width: 60,
        depth: 103
      }
    }
  ]
};

describe("renderLayoutOption", () => {
  afterEach(() => {
    delete process.env.OPENROUTER_API_KEY;
  });

  it("falls back to a 2D SVG when no OpenRouter key is configured", async () => {
    const result = await renderLayoutOption(tenant, input, layout, 0);

    expect(result.renderMode).toBe("fallback");
    expect(result.imageUrl).toBeNull();
    expect(result.fallbackSvg.startsWith("data:image/svg+xml")).toBe(true);
    expect(result.prompt).toContain("photorealistic interior rendering");
  });
});
