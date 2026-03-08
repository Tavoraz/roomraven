import { describe, expect, it } from "vitest";

import { advanceTournament, initializeTournament } from "../lib/tournament";

describe("tournament progression", () => {
  it("advances through an even bracket and returns a final winner", () => {
    let state = initializeTournament(["a", "b", "c", "d"]);
    expect(state.currentPair).toEqual(["a", "b"]);

    state = advanceTournament(state, "a").nextState;
    expect(state.currentPair).toEqual(["c", "d"]);
    expect(state.roundWinners).toEqual(["a"]);

    state = advanceTournament(state, "d").nextState;
    expect(state.round).toBe(2);
    expect(state.currentPair).toEqual(["a", "d"]);

    state = advanceTournament(state, "d").nextState;
    expect(state.winnerOptionId).toBe("d");
    expect(state.currentPair).toBeNull();
  });

  it("carries forward a bye when the option count is odd", () => {
    let state = initializeTournament(["a", "b", "c"]);

    state = advanceTournament(state, "b").nextState;
    expect(state.round).toBe(2);
    expect(state.remainingOptionIds).toEqual(["b", "c"]);
    expect(state.currentPair).toEqual(["b", "c"]);

    state = advanceTournament(state, "c").nextState;
    expect(state.winnerOptionId).toBe("c");
  });
});
