import { createListenerMiddleware } from '@reduxjs/toolkit';
import { playBeep, isAudioReady, initializeAudioContext } from '@/utils/audioUtils';
import { stageActivated } from '@/features/stages/stagesSlice';

// Create listener middleware for stages
export const beepMiddleware = createListenerMiddleware();

// Listen for stage activation to trigger beep sound
beepMiddleware.startListening({
  actionCreator: stageActivated,
  effect: async (action /*, listenerApi */) => {
    try {
      // Check if audio is ready, if not try to initialize
      if (!isAudioReady()) {
        console.log('Audio not ready, attempting to initialize audio context...');
        initializeAudioContext();

        // Check again after initialization attempt
        if (!isAudioReady()) {
          console.warn('Audio context could not be initialized. Browser may require user interaction first.');
          return;
        }
      }

      // Play the activation beep when a stage is activated
      playBeep();
      console.log(`Stage activated: ${action.payload.id} - Beep played`);
    } catch (error) {
      console.error('Failed to play stage activation beep:', error);
    }
  }
});

// Type-safe listener API
export type BeepListenerApi = ReturnType<typeof beepMiddleware.startListening>;
