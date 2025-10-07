import { createSlice, createAction } from '@reduxjs/toolkit'
import type { AppRootState } from '@/store/configureStore'
import * as Types from './types'
import mockData from './mock-data.json'

export const stageAdded = createAction<Types.Stage>('STAGE/ADDED')
export const stageUpdated = createAction<Partial<Types.Stage> & { id: string }>('STAGE/UPDATED')
export const stageRemoved = createAction<{ id: string }>('STAGE/REMOVED')
export const stageActivated = createAction<{ id: string }>('STAGE/ACTIVATED')
export const stageDeactivated = createAction<{ id: string }>('STAGE/DEACTIVATED')

export const stagesSlice = createSlice({
  name: 'stages',
  initialState: mockData as Types.Stage[],
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(stageAdded, (state, { payload }) => {
        const idx = state.findIndex(stage => stage.id === payload.id)

        if (idx !== -1) {
          return state
        }

        return [
          ...state,
          payload,
        ]
      })
      .addCase(stageUpdated, (state, { payload }) => {
        return state.map((stage: Types.Stage) =>
          stage.id === payload.id ? { ...stage, ...payload } : stage,
        )
      }).addCase(stageRemoved, (state, { payload }) => {
        return state.filter((stage: Types.Stage) => stage.id !== payload.id)
      })
      .addCase(stageActivated, (state, { payload }) => {
        const stage = state.find((stage: Types.Stage) => stage.id === payload.id)
        if (stage) {
          stage.status = Types.STATUS.STAGE_ACTIVE
        }
      })
      .addCase(stageDeactivated, (state, { payload }) => {
        const stage = state.find((stage: Types.Stage) => stage.id === payload.id)
        if (stage) {
          stage.status = Types.STATUS.STAGE_INACTIVE
        }
      })
  },
})

export function selectStages(state: AppRootState) {
  return state.stages
}

export function selectStageById(state: AppRootState, id?: string) {
  if (!id) {
    return ''
  }
  return state.stages.find((stage: Types.Stage) => stage.id === id)
}

export function selectCurrentStage(state: AppRootState) {
  // Get current stage from match context
  const currentMatch = state.match.matches.find(m => m.id === state.match.currentMatchId)
  if (!currentMatch?.currentStageId) {
    return null
  }
  return state.stages.find((stage: Types.Stage) => stage.id === currentMatch.currentStageId) || null
}
