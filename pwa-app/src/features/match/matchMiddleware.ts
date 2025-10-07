import { match } from 'assert'
import { createListenerMiddleware } from '@reduxjs/toolkit'
import { stageActivated, stageDeactivated } from '@/features/stages/stagesSlice'
import { AppRootState } from '@/store/configureStore'
import { activateStageInMatch, stageChanged, startShooterRun } from './matchSlice'

// Create listener middleware for coordinated match/stage actions
export const matchMiddleware = createListenerMiddleware()

// Listen for coordinated stage activation to update both match and stage state
matchMiddleware.startListening({
  actionCreator: activateStageInMatch,
  effect: async (action, listenerApi) => {
    const { matchId, stageId } = action.payload
    const state = listenerApi.getState() as AppRootState

    // Get the current match to find the previously active stage
    const currentMatch = state.match.matches.find(match => match.id === matchId)
    const previousStageId = currentMatch?.currentStageId

    // Update match state first
    listenerApi.dispatch(stageChanged({ matchId, stageId }))

    // Deactivate previous stage if there was one
    if (previousStageId && previousStageId !== stageId) {
      listenerApi.dispatch(stageDeactivated({ id: previousStageId }))
    }

    // Activate the new stage
    listenerApi.dispatch(stageActivated({ id: stageId }))
  },
})

// Listen for shooter run start to activate stage and set current shooter
matchMiddleware.startListening({
  actionCreator: startShooterRun,
  effect: async (action, listenerApi) => {
    const { matchId, shooterId, stageId } = action.payload

    // Activate the stage for this run
    listenerApi.dispatch(activateStageInMatch({ matchId, stageId }))

    // Set the current shooter
    listenerApi.dispatch(stageChanged({ matchId, stageId }))
  },
})

// Type-safe listener API
export type MatchListenerApi = ReturnType<typeof matchMiddleware.startListening>
