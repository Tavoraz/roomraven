import { describe, expect, it } from "vitest";

import { buildShoppingList } from "../lib/shopping-list";
import type { CatalogImport, LayoutOption, Tenant } from "../lib/types";

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

const winner: LayoutOption = {
  id: "option",
  sessionId: "session",
  rankIndex: 0,
  score: 98,
  renderMode: "fallback",
  imageUrl: null,
  fallbackSvg: "data:image/svg+xml;base64,test",
  prompt: "",
  layout: {
    room: {
      widthCm: 300,
      depthCm: 250
    },
    door: {
      wall: "south",
      offsetCm: 80,
      widthCm: 90
    },
    window: null,
    fixtures: [
      {
        fixtureType: "toilet",
        wall: "west",
        x: 0,
        y: 30,
        width: 70,
        depth: 42,
        rotation: 90,
        clearance: {
          x: 0,
          y: 30,
          width: 130,
          depth: 42
        }
      },
      {
        fixtureType: "sink",
        wall: "north",
        x: 160,
        y: 0,
        width: 60,
        depth: 48,
        rotation: 0,
        clearance: {
          x: 160,
          y: 0,
          width: 60,
          depth: 103
        }
      }
    ]
  },
  createdAt: new Date().toISOString()
};

const catalogImport: CatalogImport = {
  id: "catalog",
  tenantId: "tenant",
  name: "Catalog",
  importedAt: new Date().toISOString(),
  mappings: {
    toilet: {
      label: "Toilet set",
      categoryUrl: "https://example.com/catalog/toilet-set",
      note: "Mapped from tenant catalog."
    },
    sink: {
      label: "Vanity set",
      categoryUrl: "https://example.com/catalog/vanity-set",
      note: "Mapped from tenant catalog."
    },
    shower: {
      label: "Shower set",
      categoryUrl: "https://example.com/catalog/shower-set",
      note: "Mapped from tenant catalog."
    },
    bath: {
      label: "Bath set",
      categoryUrl: "https://example.com/catalog/bath-set",
      note: "Mapped from tenant catalog."
    }
  }
};

describe("buildShoppingList", () => {
  it("uses tenant catalog mappings when available", () => {
    const shoppingList = buildShoppingList(tenant, winner, catalogImport);

    expect(shoppingList).toHaveLength(2);
    expect(shoppingList[0].label).toBe("Toilet set");
    expect(shoppingList[1].categoryUrl).toBe("https://example.com/catalog/vanity-set");
  });

  it("falls back to tenant category links when there is no catalog import", () => {
    const shoppingList = buildShoppingList(tenant, winner, null);

    expect(shoppingList[0].categoryUrl).toBe(tenant.categoryLinks.toilet);
    expect(shoppingList[1].label).toBe("Bathroom sinks");
  });
});
