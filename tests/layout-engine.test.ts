import { describe, expect, it } from "vitest";

import { generateLayoutOptions } from "../lib/layout-engine";
import type { LayoutPlacement, SessionInput } from "../lib/types";

function rectsOverlap(a: LayoutPlacement, b: LayoutPlacement) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.depth && a.y + a.depth > b.y;
}

describe("generateLayoutOptions", () => {
  it("returns eight valid bathroom concepts for a common fixture set", () => {
    const input: SessionInput = {
      roomType: "bathroom",
      locale: "en",
      widthCm: 320,
      depthCm: 280,
      door: {
        wall: "south",
        offsetCm: 90,
        widthCm: 90
      },
      window: {
        wall: "north",
        offsetCm: 70,
        widthCm: 100
      },
      fixtures: ["toilet", "sink", "shower"]
    };

    const options = generateLayoutOptions(input);

    expect(options).toHaveLength(8);

    for (const option of options) {
      expect(option.layout.fixtures).toHaveLength(3);

      for (const fixture of option.layout.fixtures) {
        expect(fixture.x).toBeGreaterThanOrEqual(0);
        expect(fixture.y).toBeGreaterThanOrEqual(0);
        expect(fixture.x + fixture.width).toBeLessThanOrEqual(input.widthCm);
        expect(fixture.y + fixture.depth).toBeLessThanOrEqual(input.depthCm);
      }

      for (let index = 0; index < option.layout.fixtures.length; index += 1) {
        for (let compareIndex = index + 1; compareIndex < option.layout.fixtures.length; compareIndex += 1) {
          expect(rectsOverlap(option.layout.fixtures[index], option.layout.fixtures[compareIndex])).toBe(false);
        }
      }
    }
  });
});
