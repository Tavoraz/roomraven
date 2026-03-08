export interface WinnerStaysTournamentState {
  selectedIds: string[];
  championId: string;
  challengerIndex: number;
  challengerId: string | null;
  winnerId: string | null;
}

export function startWinnerStaysTournament(selectedIds: string[]): WinnerStaysTournamentState {
  const uniqueIds = Array.from(new Set(selectedIds));

  if (uniqueIds.length < 2) {
    throw new Error("Choose at least two images to compare.");
  }

  return {
    selectedIds: uniqueIds,
    championId: uniqueIds[0],
    challengerIndex: 1,
    challengerId: uniqueIds[1],
    winnerId: null
  };
}

export function chooseWinner(
  state: WinnerStaysTournamentState,
  preferredId: string
): WinnerStaysTournamentState {
  if (state.winnerId) {
    return state;
  }

  if (!state.challengerId) {
    return {
      ...state,
      winnerId: state.championId
    };
  }

  if (preferredId !== state.championId && preferredId !== state.challengerId) {
    throw new Error("Preferred image must be part of the current comparison.");
  }

  const nextChallengerIndex = state.challengerIndex + 1;

  if (nextChallengerIndex >= state.selectedIds.length) {
    return {
      ...state,
      championId: preferredId,
      challengerIndex: nextChallengerIndex,
      challengerId: null,
      winnerId: preferredId
    };
  }

  return {
    ...state,
    championId: preferredId,
    challengerIndex: nextChallengerIndex,
    challengerId: state.selectedIds[nextChallengerIndex],
    winnerId: null
  };
}
