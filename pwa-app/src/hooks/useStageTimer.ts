import { useCallback, useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/configureStore';
import {
  timerStarted,
  timerPaused,
  timerStopped,
  timerReset,
  selectCurrentStage
} from '@/features/stages/stagesSlice';

export interface TimerState {
  elapsedTime: number;
  isRunning: boolean;
  isPaused: boolean;
  startTime?: number;
}

export function useStageTimer() {
  const dispatch = useAppDispatch();
  const currentStage = useAppSelector(selectCurrentStage);
  const timer = currentStage?.timer || { elapsedTime: 0, isRunning: false, isPaused: false };

  // Calculate current elapsed time without Redux dispatches
  const getCurrentElapsedTime = useCallback(() => {
    if (!timer.isRunning) {
      return timer.elapsedTime;
    }

    if (timer.isPaused) {
      return timer.elapsedTime;
    }

    if (timer.startTime) {
      return (Date.now() - timer.startTime) / 1000;
    }

    return timer.elapsedTime;
  }, [timer.isRunning, timer.isPaused, timer.elapsedTime, timer.startTime]);

  // Force re-render every 10ms for smooth display (but no Redux dispatch!)
  const [, forceUpdate] = useState({});
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (timer.isRunning && !timer.isPaused) {
      interval = setInterval(() => {
        forceUpdate({}); // Just trigger re-render, no Redux action
      }, 10);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timer.isRunning, timer.isPaused]);

  const start = useCallback(() => {
    const now = Date.now();
    dispatch(timerStarted({ startTime: now }));
  }, [dispatch]);

  const pause = useCallback(() => {
    const currentElapsed = getCurrentElapsedTime();
    dispatch(timerPaused({ elapsedTime: currentElapsed }));
  }, [dispatch, getCurrentElapsedTime]);

  const resume = useCallback(() => {
    const now = Date.now();
    // Calculate offset to maintain elapsed time
    const offset = now - (timer.elapsedTime * 1000);
    dispatch(timerStarted({ startTime: offset }));
  }, [dispatch, timer.elapsedTime]);

  const stop = useCallback(() => {
    const currentElapsed = getCurrentElapsedTime();
    dispatch(timerStopped({ elapsedTime: currentElapsed }));
  }, [dispatch, getCurrentElapsedTime]);

  const reset = useCallback(() => {
    dispatch(timerReset({}));
  }, [dispatch]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const centiseconds = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  }, []);

  const currentElapsedTime = getCurrentElapsedTime();

  return {
    elapsedTime: currentElapsedTime,
    isRunning: timer.isRunning,
    isPaused: timer.isPaused,
    start,
    pause,
    resume,
    stop,
    reset,
    formatTime: () => formatTime(currentElapsedTime)
  };
}
