import { createSlice } from '@reduxjs/toolkit';


const GAMETYPE_RANDOM = 'random'; // [3,5,2,1,4], [2,3,1,5,4], [4,3,1,5,2] ... etc
const GAMETYPE_SEQUENTIAL = 'seqiential'; // [1,2,3,4,4] [1,2,3,4,5]  ... etc

export type GenerateRounds = {
  numberOfRounds: number;
  turnsPerRound: number;
} & OneOfType<{
  gameType?: typeof GAMETYPE_RANDOM | typeof GAMETYPE_SEQUENTIAL
}>;


const generateRounds = ({ numberOfRounds, turnsPerRound, gameType }: GenerateRounds): GameRounds => {
  const rounds = Array.from({ length: numberOfRounds }, (_, i) => i);

  return rounds.map((_, rIdx):Turn[] => {
    const turns = Array.from({ length: turnsPerRound }, (_, tIdx): Turn => {
      const turn = {
        roundIndex: rIdx,
        turnIndex: tIdx,
        targetResult: null
      } as Turn;
      return turn;
    });

    return gameType === GAMETYPE_RANDOM
      ? turns.sort(() => Math.random() - 0.5)
      : turns;
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
      const { targetResult } = payload;
      const { roundIndex, turnIndex } = state;

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
