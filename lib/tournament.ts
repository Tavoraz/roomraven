import type { TournamentState } from "@/lib/types";

export function initializeTournament(optionIds: string[]): TournamentState {
  if (optionIds.length < 2) {
    return {
      round: 1,
      matchupIndex: 0,
      remainingOptionIds: optionIds,
      roundWinners: [],
      currentPair: null,
      winnerOptionId: optionIds[0] ?? null
    };
  }

  return {
    round: 1,
    matchupIndex: 0,
    remainingOptionIds: optionIds,
    roundWinners: [],
    currentPair: [optionIds[0], optionIds[1]],
    winnerOptionId: null
  };
}

export function advanceTournament(
  state: TournamentState,
  winnerOptionId: string
): {
  nextState: TournamentState;
  round: number;
  matchupIndex: number;
  loserOptionId: string;
} {
  if (!state.currentPair) {
    throw new Error("The tournament is already complete.");
  }

  const [leftOptionId, rightOptionId] = state.currentPair;

  if (winnerOptionId !== leftOptionId && winnerOptionId !== rightOptionId) {
    throw new Error("The selected option is not part of the active matchup.");
  }

  const loserOptionId = winnerOptionId === leftOptionId ? rightOptionId : leftOptionId;
  const currentRound = state.round;
  const currentMatchupIndex = state.matchupIndex;
  const roundWinners = [...state.roundWinners, winnerOptionId];
  const nextPairStart = currentMatchupIndex * 2 + 2;
  const nextPair = state.remainingOptionIds.slice(nextPairStart, nextPairStart + 2);

  if (nextPair.length === 2) {
    return {
      round: currentRound,
      matchupIndex: currentMatchupIndex,
      loserOptionId,
      nextState: {
        round: currentRound,
        matchupIndex: currentMatchupIndex + 1,
        remainingOptionIds: state.remainingOptionIds,
        roundWinners,
        currentPair: [nextPair[0], nextPair[1]],
        winnerOptionId: null
      }
    };
  }

  if (nextPair.length === 1) {
    roundWinners.push(nextPair[0]);
  }

  return {
    round: currentRound,
    matchupIndex: currentMatchupIndex,
    loserOptionId,
    nextState: {
      round: roundWinners.length === 1 ? currentRound : currentRound + 1,
      matchupIndex: roundWinners.length === 1 ? currentMatchupIndex : 0,
      remainingOptionIds: roundWinners,
      roundWinners: [],
      currentPair: roundWinners.length === 1 ? null : [roundWinners[0], roundWinners[1]],
      winnerOptionId: roundWinners.length === 1 ? roundWinners[0] : null
    }
  };
}
