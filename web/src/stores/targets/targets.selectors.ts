import type { RootState } from '@/store';

export const selectTargets = (state: RootState) => state.targets;
export const selectNumberOrRounds = (state: RootState) => state.targets.numberOfRounds;
export const selectTurnsPerRound = (state: RootState) => state.targets.turnsPerRound;
export const selectTurnIndex = (state: RootState) => state.targets.turnIndex;
export const selectRoundIndex = (state: RootState) => state.targets.roundIndex;
export const selectRounds = (state: RootState) => state.targets.rounds;
