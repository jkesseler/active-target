import { createSlice, createSelector } from '@reduxjs/toolkit';
import { AppRootState } from '@/configureStore';

export interface Target {
  targetId: string;
  targetName: string;
  targetState: 'TEST' | 'IDLE' | 'ACTIVE-ON' | 'ACTIVE-OFF' | 'ERROR';
}

export const targetsSlice = createSlice({
  name: 'targets',
  initialState: [] as Target[],
  reducers: {
    updateTarget: (state, { payload }) => {
      const { targetId } = payload;
      return state.map((target: Target) => target.targetId === targetId
        ? { ...target, ...payload }
        : target);
    },
    addTarget: (state, { payload }) => {
      const idx = state.findIndex(target => target.targetId === payload.targetId);

      if(idx !== -1) {
        return state;
      }

      return [
        ...state,
        payload
      ];

    }
  }
});

export const { addTarget, updateTarget } = targetsSlice.actions;
export const selectTargets = (state: AppRootState) => state.targets;

export const selectTargetById = createSelector(
  [
    state => state.targets,
    (_, targetId) => targetId
  ],
  (targets, targetId) => {
    return targets ? targets.find((target: Target) => target.targetId === targetId) : null;
  }
);
