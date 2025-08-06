import { createListenerMiddleware } from '@reduxjs/toolkit';
import { stageActivated } from './stagesSlice';
import { playStageActivationBeep } from '@/utils/audioUtils';
import type { AppRootState, AppDispatch } from '@/store';

// Create listener middleware for stages
export const stagesMiddleware = createListenerMiddleware();

// Listen for stage activation to trigger beep sound
stagesMiddleware.startListening({
  actionCreator: stageActivated,
  effect: (action, listenerApi) => {
    try {
      // Play the activation beep when a stage is activated
      playStageActivationBeep();
      console.log(`Stage activated: ${action.payload.id} - Beep played`);
    } catch (error) {
      console.error('Failed to play stage activation beep:', error);
    }
  }
});

// Type-safe listener API
export type StagesListenerApi = ReturnType<typeof stagesMiddleware.startListening>;
