import { FIXTURE_SPECS, ROOM_TEMPLATE, TARGET_OPTION_COUNT, WALLS, DOOR_DEPTH_CM } from "@/lib/constants";
import type { FixtureType, LayoutPlacement, LayoutSession, Rect, SessionInput, Wall } from "@/lib/types";
import { clamp, createRng, hashSeed } from "@/lib/utils";

function rangesOverlap(startA: number, endA: number, startB: number, endB: number) {
  return startA < endB && startB < endA;
}

function rectsOverlap(a: Rect, b: Rect) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.depth && a.y + a.depth > b.y;
}

function buildDoorExclusion(input: SessionInput): Rect {
  const { widthCm, depthCm, door } = input;

  switch (door.wall) {
    case "north":
      return { x: door.offsetCm, y: 0, width: door.widthCm, depth: DOOR_DEPTH_CM };
    case "south":
      return { x: door.offsetCm, y: depthCm - DOOR_DEPTH_CM, width: door.widthCm, depth: DOOR_DEPTH_CM };
    case "west":
      return { x: 0, y: door.offsetCm, width: DOOR_DEPTH_CM, depth: door.widthCm };
    case "east":
      return { x: widthCm - DOOR_DEPTH_CM, y: door.offsetCm, width: DOOR_DEPTH_CM, depth: door.widthCm };
  }
}

function getAxisSpan(placement: LayoutPlacement) {
  if (placement.wall === "north" || placement.wall === "south") {
    return [placement.x, placement.x + placement.width] as const;
  }

  return [placement.y, placement.y + placement.depth] as const;
}

function buildClearanceRect(placement: Omit<LayoutPlacement, "clearance">, clearanceCm: number): Rect {
  switch (placement.wall) {
    case "north":
      return {
        x: placement.x,
        y: placement.y,
        width: placement.width,
        depth: placement.depth + clearanceCm
      };
    case "south":
      return {
        x: placement.x,
        y: placement.y - clearanceCm,
        width: placement.width,
        depth: placement.depth + clearanceCm
      };
    case "west":
      return {
        x: placement.x,
        y: placement.y,
        width: placement.width + clearanceCm,
        depth: placement.depth
      };
    case "east":
      return {
        x: placement.x - clearanceCm,
        y: placement.y,
        width: placement.width + clearanceCm,
        depth: placement.depth
      };
  }
}

function makePlacement(
  fixtureType: FixtureType,
  wall: Wall,
  offsetCm: number,
  input: SessionInput
): LayoutPlacement | null {
  const spec = FIXTURE_SPECS[fixtureType];
  const horizontal = wall === "north" || wall === "south";
  const width = horizontal ? spec.widthCm : spec.depthCm;
  const depth = horizontal ? spec.depthCm : spec.widthCm;
  const maxOffset = (horizontal ? input.widthCm : input.depthCm) - width;
  const offset = clamp(offsetCm, 0, maxOffset);

  let x = 0;
  let y = 0;
  let rotation: 0 | 90 | 180 | 270 = 0;

  switch (wall) {
    case "north":
      x = offset;
      y = 0;
      rotation = 0;
      break;
    case "south":
      x = offset;
      y = input.depthCm - depth;
      rotation = 180;
      break;
    case "west":
      x = 0;
      y = offset;
      rotation = 90;
      break;
    case "east":
      x = input.widthCm - width;
      y = offset;
      rotation = 270;
      break;
  }

  const basePlacement = { fixtureType, wall, x, y, width, depth, rotation };
  const clearance = buildClearanceRect(basePlacement, spec.clearanceCm);

  if (
    basePlacement.x < 0 ||
    basePlacement.y < 0 ||
    basePlacement.x + basePlacement.width > input.widthCm ||
    basePlacement.y + basePlacement.depth > input.depthCm ||
    clearance.x < 0 ||
    clearance.y < 0 ||
    clearance.x + clearance.width > input.widthCm ||
    clearance.y + clearance.depth > input.depthCm
  ) {
    return null;
  }

  return {
    ...basePlacement,
    clearance
  };
}

function buildOffsets(maxOffset: number) {
  const raw = [
    16,
    maxOffset / 2,
    maxOffset - 16,
    maxOffset / 3,
    (maxOffset / 3) * 2
  ];

  return [...new Set(raw.map((value) => clamp(Math.round(value), 0, Math.max(maxOffset, 0))))];
}

function overlapsDoorOpening(input: SessionInput, placement: LayoutPlacement) {
  if (placement.wall !== input.door.wall) {
    return false;
  }

  const [start, end] = getAxisSpan(placement);
  return rangesOverlap(start, end, input.door.offsetCm, input.door.offsetCm + input.door.widthCm);
}

function overlapsWindow(input: SessionInput, placement: LayoutPlacement) {
  if (!input.window || placement.wall !== input.window.wall) {
    return false;
  }

  const [start, end] = getAxisSpan(placement);
  const isBlockedFixture = placement.fixtureType === "shower";

  return isBlockedFixture && rangesOverlap(start, end, input.window.offsetCm, input.window.offsetCm + input.window.widthCm);
}

function placementFits(
  input: SessionInput,
  candidate: LayoutPlacement,
  existing: LayoutPlacement[],
  doorExclusion: Rect
) {
  if (overlapsDoorOpening(input, candidate) || overlapsWindow(input, candidate) || rectsOverlap(candidate, doorExclusion)) {
    return false;
  }

  if (rectsOverlap(candidate.clearance, doorExclusion)) {
    return false;
  }

  for (const placed of existing) {
    if (rectsOverlap(candidate, placed) || rectsOverlap(candidate, placed.clearance) || rectsOverlap(candidate.clearance, placed)) {
      return false;
    }
  }

  return true;
}

function shuffle<T>(values: T[], seed: number) {
  const copy = [...values];
  const rng = createRng(seed);

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

function enumeratePlacements(input: SessionInput, fixtureType: FixtureType, seed: number) {
  const spec = FIXTURE_SPECS[fixtureType];
  const candidates: LayoutPlacement[] = [];

  for (const wall of WALLS) {
    const span = wall === "north" || wall === "south" ? input.widthCm : input.depthCm;
    const widthOnWall = wall === "north" || wall === "south" ? spec.widthCm : spec.depthCm;
    const offsets = buildOffsets(span - widthOnWall);

    for (const offset of offsets) {
      const placement = makePlacement(fixtureType, wall, offset, input);
      if (placement) {
        candidates.push(placement);
      }
    }
  }

  return shuffle(candidates, seed).slice(0, 16);
}

function layoutSignature(fixtures: LayoutPlacement[]) {
  return fixtures
    .slice()
    .sort((left, right) => left.fixtureType.localeCompare(right.fixtureType))
    .map((fixture) => `${fixture.fixtureType}:${fixture.wall}:${fixture.x}:${fixture.y}`)
    .join("|");
}

function candidateScore(fixtures: LayoutPlacement[], input: SessionInput) {
  const openness = fixtures.reduce((sum, fixture) => sum + fixture.clearance.width * fixture.clearance.depth, 0);
  return Math.round((openness / (input.widthCm * input.depthCm)) * 1000) / 10;
}

function buildFixtureOrders(fixtures: FixtureType[], seedKey: string) {
  const rng = createRng(hashSeed(seedKey));
  const orders = new Set<string>();

  for (let iteration = 0; iteration < 18; iteration += 1) {
    const order = [...fixtures];
    for (let index = order.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(rng() * (index + 1));
      [order[index], order[swapIndex]] = [order[swapIndex], order[index]];
    }
    orders.add(order.join(","));
  }

  return [...orders].map((value) => value.split(",") as FixtureType[]);
}

export function generateLayoutOptions(input: SessionInput) {
  if (input.widthCm < ROOM_TEMPLATE.rules.minimumWidthCm || input.depthCm < ROOM_TEMPLATE.rules.minimumDepthCm) {
    throw new Error("The room is too small for the bathroom planner.");
  }

  const doorExclusion = buildDoorExclusion(input);
  const results: Array<{
    rankIndex: number;
    score: number;
    layout: {
      room: { widthCm: number; depthCm: number };
      door: SessionInput["door"];
      window: SessionInput["window"];
      fixtures: LayoutPlacement[];
    };
  }> = [];
  const signatures = new Set<string>();
  const orders = buildFixtureOrders(input.fixtures, JSON.stringify(input));

  for (const [orderIndex, order] of orders.entries()) {
    const placementMap = new Map<FixtureType, LayoutPlacement[]>();

    for (const fixtureType of order) {
      placementMap.set(
        fixtureType,
        enumeratePlacements(input, fixtureType, hashSeed(`${JSON.stringify(input)}:${fixtureType}:${orderIndex}`))
      );
    }

    const walk = (fixtureIndex: number, placed: LayoutPlacement[]) => {
      if (results.length >= TARGET_OPTION_COUNT) {
        return;
      }

      if (fixtureIndex >= order.length) {
        const fixtures = placed.slice().sort((left, right) => left.fixtureType.localeCompare(right.fixtureType));
        const signature = layoutSignature(fixtures);

        if (!signatures.has(signature)) {
          signatures.add(signature);
          results.push({
            rankIndex: results.length,
            score: candidateScore(fixtures, input),
            layout: {
              room: {
                widthCm: input.widthCm,
                depthCm: input.depthCm
              },
              door: input.door,
              window: input.window,
              fixtures
            }
          });
        }
        return;
      }

      const fixtureType = order[fixtureIndex];
      const candidates = placementMap.get(fixtureType) ?? [];

      for (const candidate of candidates) {
        if (placementFits(input, candidate, placed, doorExclusion)) {
          placed.push(candidate);
          walk(fixtureIndex + 1, placed);
          placed.pop();
        }
      }
    };

    walk(0, []);
  }

  if (results.length === 0) {
    throw new Error("No valid bathroom layouts could be generated for the selected inputs.");
  }

  return results.slice(0, TARGET_OPTION_COUNT);
}
