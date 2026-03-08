import { describe, expect, it } from "vitest";

import { chooseWinner, startWinnerStaysTournament } from "@/lib/compare";

describe("winner stays comparison", () => {
  it("keeps the winner on screen until one image remains", () => {
    let state = startWinnerStaysTournament(["a", "b", "c", "d"]);

    expect(state.championId).toBe("a");
    expect(state.challengerId).toBe("b");
    expect(state.winnerId).toBeNull();

    state = chooseWinner(state, "b");
    expect(state.championId).toBe("b");
    expect(state.challengerId).toBe("c");

    state = chooseWinner(state, "b");
    expect(state.championId).toBe("b");
    expect(state.challengerId).toBe("d");

    state = chooseWinner(state, "d");
    expect(state.winnerId).toBe("d");
    expect(state.challengerId).toBeNull();
  });

  it("deduplicates the selection before running the compare flow", () => {
    const state = startWinnerStaysTournament(["a", "a", "b"]);

    expect(state.selectedIds).toEqual(["a", "b"]);
    expect(state.challengerId).toBe("b");
  });

  it("rejects invalid selections", () => {
    expect(() => startWinnerStaysTournament(["a"])).toThrow("Choose at least two images to compare.");
  });

  it("rejects picks outside of the current pair", () => {
    const state = startWinnerStaysTournament(["a", "b", "c"]);

    expect(() => chooseWinner(state, "z")).toThrow("Preferred image must be part of the current comparison.");
  });
});
