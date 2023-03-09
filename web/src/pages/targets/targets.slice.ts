import { createSlice } from '@reduxjs/toolkit';

const GAMETYPE_RANDOM = 'random'; // [3,5,2,1,4], [2,3,1,5,4], [4,3,1,5,2] ... etc
const GAMETYPE_SEQUENTIAL = 'seqiential'; // [1,2,3,4,4] [1,2,3,4,5]  ... etc

type GenerateRounds = {
  numberOfRounds: number;
  turnsPerRound: number;
} & OneOfType<{
  gameType?: typeof GAMETYPE_RANDOM | typeof GAMETYPE_SEQUENTIAL
}>;


const generateRounds = ({ numberOfRounds, turnsPerRound, gameType }: GenerateRounds): GameRounds => {
  const rounds = Array.from({ length: numberOfRounds }, (_, i) => i);
  return rounds.map((_, rIdx) => {
    const turn = Array.from({ length: turnsPerRound }, (_, tIdx) => ({ roundIndex: rIdx, turnIndex: tIdx, targetResult: null }));

    return gameType === GAMETYPE_RANDOM
      ? turn.sort(() => Math.random() - 0.5)
      : turn;
  });
};


export const targetsSlice = createSlice({
  name: 'targets',
  initialState: {
    gameType: GAMETYPE_SEQUENTIAL,
    numberOfRounds: 8,
    turnsPerRound: 5,
    secondsBetweenRounds: 30,
    automaticPauseBetweenRounds: false,
    rounds: [],
    roundIndex: 0,
    turnIndex: 0
  },
  reducers: {
    generateGameRounds: (state, { payload }) => {
      const { numberOfRounds = 8, turnsPerRound = 5, gameType = GAMETYPE_SEQUENTIAL } = payload;

      const rounds = generateRounds({ numberOfRounds, turnsPerRound, gameType });

      state.rounds = rounds;
      state.numberOfRounds = numberOfRounds;
      state.turnsPerRound = turnsPerRound;
    },
    addResult: (state, { payload }) => {
      const { gameType } = state;
      const { roundIndex, turnIndex, targetResult } = payload;
      // TODO: implement other game types
      if (gameType !== GAMETYPE_SEQUENTIAL) {
        return state;
      }

      const nextRounds = Object.assign([...state.rounds], {
        [roundIndex]: Object.assign([...state.rounds[roundIndex]], {
          [turnIndex]: {roundIndex, turnIndex, targetResult}
        })
      });


      //eslint-disable-next-line no-return-assign
      return {
        ...state,
        rounds: [
          ...nextRounds
        ]
      };
    },
    advanceTurn: (state /*, { payload }*/) => {
      const { roundIndex, turnIndex } = state;
      let nextRound = roundIndex;
      let nextTurn = turnIndex + 1;

      if (nextTurn > (state.turnsPerRound - 1)) {
        nextTurn = 0;
        nextRound = roundIndex + 1;
      }

      if (nextRound > state.numberOfRounds) {
        // End Game
      }

      state.turnIndex = nextTurn;
      state.roundIndex = nextRound;
    }
  }
});


export function makeRounds(dispatch: any) {
  return async function ({ numberOfRounds, turnsPerRound, gameType }: GenerateRounds) {
    dispatch(targetsSlice.actions.generateGameRounds({ numberOfRounds, turnsPerRound, gameType }));
  };
}


export function addResult(dispatch: any) {
  return async function ({ ...payload }: TargetResultPayload) {
    await dispatch(targetsSlice.actions.addResult(payload));
    await dispatch(targetsSlice.actions.advanceTurn());
  };
}


export const selectTarget = state => state.targets;
export const selectNumberOrRounds = state => state.targets.numberOfRounds;
export const selectTurnsPerRound = state => state.targets.turnsPerRound;
