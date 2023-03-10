import { targetsSlice } from './targets.slice';
import type { GenerateRounds } from './targets.slice';

export function makeRounds(dispatch: any) {
  return async function ({ numberOfRounds, turnsPerRound, gameType }: GenerateRounds) {
    dispatch(targetsSlice.actions.generateGameRounds({ numberOfRounds, turnsPerRound, gameType }));
  };
}


export function addResult(dispatch: any) {
  return async function ({ ...payload }: Turn) {
    await dispatch(targetsSlice.actions.addResult(payload));
    await dispatch(targetsSlice.actions.advanceTurn());
  };
}
