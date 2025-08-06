import { createSlice, createAction } from '@reduxjs/toolkit';
import type { AppRootState } from '@/store/configureStore';
import type { ScoresTable } from '@/features/scoresTable/types';
import * as Types from './types';
import mockData from './mock-data.json';

interface DeviceHitPayload {
  targetZone: string;
  id: string;
  timeMillies: number;
}

const externalActions = {
  deviceHit: createAction<DeviceHitPayload>('DEVICE/HIT')
};

export const stagesSlice = createSlice({
  name: 'stages',
  initialState: mockData as Types.StageState,
  reducers: {
    currentStageChanged: (state, { payload }) => {
      return { ...state, currentStage: payload.id };
    },
    stageAdded: (state, { payload }) => {
      const idx = state.list.findIndex((stage: Types.Stage) => stage.id === payload.id);

      if (idx !== -1) {
        return state;
      }

      return {
        ...state,
        list: [...state.list, payload]
      };
    },
    stageUpdated: (state, { payload }) => {
      const nextList = state.list.map((stage: Types.Stage) =>
        stage.id === payload.id ? { ...stage, ...payload } : stage
      );

      return {
        ...state,
        list: nextList
      };
    },
    stageRemoved: (state, { payload }) => {
      const nextList = state.list.filter((stage: Types.Stage) => stage.id !== payload.id);
      return {
        ...state,
        list: nextList
      };
    },
    stageActivated: (state, { payload }) => {
      const nextList = state.list.map((stage: Types.Stage) =>
        stage.id === payload.id ? { ...stage, status: Types.STATUS.STAGE_ACTIVE } : stage
      );

      return {
        ...state,
        list: nextList
      };
    },
    stageDeactivated: (state, { payload }) => {
      const nextList = state.list.map((stage: Types.Stage) =>
        stage.id === payload.id ? { ...stage, status: Types.STATUS.STAGE_INACTIVE } : stage
      );

      return {
        ...state,
        list: nextList
      };
    },
    currentShooterUpdated: (state, { payload }) => {
      const nextList = state.list.map((stage: Types.Stage) =>
        stage.id === state.currentStage ? { ...stage, currentShooter: payload } : stage
      );

      return {
        ...state,
        list: nextList
      };
    },
    timerStarted: (state, { payload }) => {
      const stageId = payload?.stageId || state.currentStage;
      const nextList = state.list.map((stage: Types.Stage) =>
        stage.id === stageId ? {
          ...stage,
          timer: {
            ...stage.timer,
            elapsedTime: stage.timer?.elapsedTime || 0,
            isRunning: true,
            isPaused: false,
            startTime: Date.now() - ((stage.timer?.elapsedTime || 0) * 1000)
          }
        } : stage
      );

      return {
        ...state,
        list: nextList
      };
    },
    timerPaused: (state, { payload }) => {
      const stageId = payload?.stageId || state.currentStage;
      const nextList = state.list.map((stage: Types.Stage) =>
        stage.id === stageId ? {
          ...stage,
          timer: {
            ...stage.timer,
            elapsedTime: stage.timer?.elapsedTime || 0,
            isRunning: true,
            isPaused: true,
            startTime: stage.timer?.startTime
          }
        } : stage
      );

      return {
        ...state,
        list: nextList
      };
    },
    timerStopped: (state, { payload }) => {
      const stageId = payload?.stageId || state.currentStage;
      const nextList = state.list.map((stage: Types.Stage) =>
        stage.id === stageId ? {
          ...stage,
          timer: {
            ...stage.timer,
            elapsedTime: stage.timer?.elapsedTime || 0,
            isRunning: false,
            isPaused: false,
            startTime: undefined
          }
        } : stage
      );

      return {
        ...state,
        list: nextList
      };
    },
    timerReset: (state, { payload }) => {
      const stageId = payload?.stageId || state.currentStage;
      const nextList = state.list.map((stage: Types.Stage) =>
        stage.id === stageId ? {
          ...stage,
          timer: {
            elapsedTime: 0,
            isRunning: false,
            isPaused: false,
            startTime: undefined
          }
        } : stage
      );

      return {
        ...state,
        list: nextList
      };
    },
    timerUpdated: (state, { payload }) => {
      const stageId = payload?.stageId || state.currentStage;
      const nextList = state.list.map((stage: Types.Stage) =>
        stage.id === stageId ? {
          ...stage,
          timer: {
            ...stage.timer,
            elapsedTime: payload.elapsedTime,
            isRunning: stage.timer?.isRunning || false,
            isPaused: stage.timer?.isPaused || false,
            startTime: stage.timer?.startTime
          }
        } : stage
      );

      return {
        ...state,
        list: nextList
      };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(externalActions.deviceHit, (state, action) => {
        // Handle device hit action - payload contains id, timeMillies, targetZone
        // TODO: Update state based on action.payload
        console.log('Device hit:', action.payload);
      })
      .addDefaultCase((state, action) => {
        console.log('defaultCase Action: ', action);
      });
  }
});

export const {
  stageAdded,
  stageUpdated,
  stageRemoved,
  stageActivated,
  stageDeactivated,
  currentShooterUpdated,
  timerStarted,
  timerPaused,
  timerStopped,
  timerReset,
  timerUpdated
} = stagesSlice.actions;

export function selectStages(state: AppRootState) {
  return state.stages;
}

export function selectStageById(state: AppRootState, id: string) {
  return state.stages.list.find((stage: Types.Stage) => stage.id === id);
}

export function selectCurrentStage(state: AppRootState) {
  const currentStageId = state.stages.currentStage;
  return state.stages.list.find((stage: Types.Stage) => stage.id === currentStageId);
}

export function selectCurrentScores(state: AppRootState) {
  const currentStage = selectCurrentStage(state);
  const currentShooterId = currentStage?.currentShooterId;
  return currentStage?.scoresTable?.find((scoreTable: ScoresTable) => scoreTable.shooterId === currentShooterId)?.scores ?? [];
}
