import { createSlice, createAction } from '@reduxjs/toolkit';
import type { AppRootState } from '@/store/configureStore';
// import { stageActivated, stageDeactivated } from '@/features/stages/stagesSlice';
import * as Types from './types';

// Action creators
export const matchCreated = createAction<Types.Match>('match/created');
export const matchStarted = createAction<{ id: string }>('match/started');
export const matchCompleted = createAction<{ id: string }>('match/completed');
export const stageChanged = createAction<{ matchId: string, stageId: string }>('match/stageChanged');
export const shooterChanged = createAction<{ matchId: string, shooterId: string }>('match/shooterChanged');

// Coordinated action that updates both match and stage state
// Use this instead of direct stageActivated/stageChanged to ensure proper coordination
export const activateStageInMatch = createAction<{ matchId: string, stageId: string }>('match/activateStageInMatch');

// Current run management
export const startShooterRun = createAction<{ matchId: string, shooterId: string, stageId: string }>('match/startShooterRun');
export const endShooterRun = createAction<{ matchId: string }>('match/endShooterRun');

// Timer actions (now operate on current run)
export const timerStarted = createAction<{ startTime: number }>('match/timerStarted');
export const timerPaused = createAction<{ elapsedTime: number }>('match/timerPaused');
export const timerStopped = createAction<{ elapsedTime: number }>('match/timerStopped');
export const timerReset = createAction<unknown>('match/timerReset');

// Simplified state structure
interface MatchState {
  matches: Types.Match[]
  currentMatchId?: string
}

const initialState: MatchState = {
  matches: [
    {
      id: 'aa2bd694-8d08-479a-81df-d8285e9b310c',
      name: 'Club Championship 2025',
      date: '2025-08-12',
      status: Types.MatchStatus.IN_PROGRESS,
      currentStageId: 'stage-1',
      currentShooterId: '550e8400-e29b-41d4-a716-446655440000',
      stages: ['stage-1', 'stage-2', 'stage-3'],
      shooters: ['550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001'],
    },
  ],
  currentMatchId: 'aa2bd694-8d08-479a-81df-d8285e9b310c',
};

export const matchSlice = createSlice({
  name: 'match',
  initialState,
  reducers: {
    setCurrentMatch: (state, { payload }: { payload: { id: string } }) => {
      state.currentMatchId = payload.id;
    },
    addMatch: (state, { payload }: { payload: Types.Match }) => {
      state.matches.push(payload);
      if (!state.currentMatchId) {
        state.currentMatchId = payload.id;
      }
    },
    updateMatch: (state, { payload }: { payload: Partial<Types.Match> & { id: string } }) => {
      const { id, ...updates } = payload;
      const match = state.matches.find(match => match.id === id);
      if (match) {
        Object.assign(match, updates);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(matchCreated, (state, { payload }) => {
        state.matches.push(payload);
        if (!state.currentMatchId) {
          state.currentMatchId = payload.id;
        }
      })
      .addCase(matchStarted, (state, { payload }) => {
        const match = state.matches.find(match => match.id === payload.id);
        if (match) {
          match.status = Types.MatchStatus.IN_PROGRESS;
        }
      })
      .addCase(matchCompleted, (state, { payload }) => {
        const match = state.matches.find(match => match.id === payload.id);
        if (match) {
          match.status = Types.MatchStatus.COMPLETED;
        }
      })
      .addCase(stageChanged, (state, { payload }) => {
        const match = state.matches.find(match => match.id === payload.matchId);
        if (match) {
          // const previousStageId = match.currentStageId;
          match.currentStageId = payload.stageId;

          // Note: Stage status updates are handled by listening to stageActivated/stageDeactivated actions
          // This ensures proper coordination between match and stage state
        }
      })
      .addCase(shooterChanged, (state, { payload }) => {
        const match = state.matches.find(match => match.id === payload.matchId);
        if (match) {
          match.currentShooterId = payload.shooterId;
        }
      })
      .addCase(startShooterRun, (state, { payload }) => {
        const match = state.matches.find(match => match.id === payload.matchId);
        if (match) {
          match.currentRun = {
            shooterId: payload.shooterId,
            stageId: payload.stageId,
            timer: {
              elapsedTime: 0,
              isRunning: false,
              isPaused: false,
            },
            startedAt: new Date().toISOString(),
          };
        }
      })
      .addCase(endShooterRun, (state, { payload }) => {
        const match = state.matches.find(match => match.id === payload.matchId);
        if (match) {
          match.currentRun = undefined;
        }
      })
      .addCase(timerStarted, (state, { payload }) => {
        const match = state.matches.find(match => match.id === state.currentMatchId);
        if (match?.currentRun) {
          match.currentRun.timer = {
            ...match.currentRun.timer,
            isRunning: true,
            isPaused: false,
            startTime: payload.startTime,
          };
        }
      })
      .addCase(timerPaused, (state, { payload }) => {
        const match = state.matches.find(match => match.id === state.currentMatchId);
        if (match?.currentRun) {
          match.currentRun.timer = {
            ...match.currentRun.timer,
            isRunning: false,
            isPaused: true,
            elapsedTime: payload.elapsedTime,
          };
        }
      })
      .addCase(timerStopped, (state, { payload }) => {
        const match = state.matches.find(match => match.id === state.currentMatchId);
        if (match?.currentRun) {
          match.currentRun.timer = {
            ...match.currentRun.timer,
            isRunning: false,
            isPaused: false,
            elapsedTime: payload.elapsedTime,
          };
        }
      })
      .addCase(timerReset, (state) => {
        const match = state.matches.find(match => match.id === state.currentMatchId);
        if (match?.currentRun) {
          match.currentRun.timer = {
            elapsedTime: 0,
            isRunning: false,
            isPaused: false,
          };
        }
      });
  },
});

// Selectors
export const selectMatches = (state: AppRootState) => state.match.matches;
export const selectCurrentMatch = (state: AppRootState) => state.match.matches.find(match => match.id === state.match.currentMatchId);
export const selectCurrentStageId = (state: AppRootState) => selectCurrentMatch(state)?.currentStageId;
export const selectCurrentShooterId = (state: AppRootState) => selectCurrentMatch(state)?.currentShooterId;
export const selectCurrentRun = (state: AppRootState) => selectCurrentMatch(state)?.currentRun;
export const selectCurrentTimer = (state: AppRootState) => selectCurrentRun(state)?.timer;
export const { setCurrentMatch, addMatch, updateMatch } = matchSlice.actions;
