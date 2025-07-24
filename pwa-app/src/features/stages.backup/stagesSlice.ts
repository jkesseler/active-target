import { createSlice, createSelector } from '@reduxjs/toolkit';
import type { AppRootState } from '@/store';
import * as Types from './types';
import mockData from './mock-data.json';

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
    scoreAdded: (state, { payload }) => {
      const currentStage = state.list.find(stage => stage.id === payload.stageId);
      const scoresTabe = currentStage?.scoresTable.find(table.shooterId === payload.shooterId);
      
      const nextList = state.list.map((stage: Types.Stage) =>
        stage.id === payload.id ? { 
          ...stage, 
          scoresTable: {
            ...stage.scoresTable,
            scores: nextScores
          }
        } : stage
      );


    }
  }
});

export const {
  stageAdded,
  stageUpdated,
  stageRemoved,
  stageActivated,
  stageDeactivated,
  currentShooterUpdated
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
  return currentStage?.scoresTable.find(scoreTable => scoreTable.shooterId === currentShooterId)?.scores ?? [];
}
