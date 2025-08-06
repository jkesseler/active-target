import { useState, useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '@/store';
import { useTranslation } from '@/hooks/useTranslation';
import { selectCurrentStage, stageActivated, stageDeactivated } from '@/features/stages/stagesSlice';
import * as StageTypes from '@/features/stages/types';
import {
  Text,
  Group,
  ActionIcon,
} from '@mantine/core';
import { IconPlayerPlay, IconPlayerPause, IconPlayerStop, IconRefresh, IconHelp } from '@tabler/icons-react';
import { useStageTimer } from '@/hooks/useStageTimer';
import { useStageAudio } from '@/hooks/useStageAudio';

import classes from './timer.module.css';

export const Timer = () => {
  const { t } = useTranslation('header')
  const dispatch = useAppDispatch();
  const [time, setTime] = useState(0);
  const intervalId = useRef<number>(0);
  const currentStage = useAppSelector(state => selectCurrentStage(state));
  const isStageActive = currentStage?.status === StageTypes.STATUS.STAGE_ACTIVE;

  // Initialize stage audio with preloading
  const stageAudio = useStageAudio('/sounds/2800-hz-433ms.wav', { preload: true });

  // Handle timer intervals
  useEffect(() => {
    if (isStageActive) {
      // @ts-expect-error: Types of setInterval and clearInterfal are mismatched
      intervalId.current = setInterval(() => setTime((value) => value + 1), 10);
    } else {
      intervalId.current && clearInterval(intervalId.current);
    }
    () => intervalId.current && clearInterval(intervalId.current);
  }, [isStageActive]);

  // Handle audio playback separately from timer logic
  useEffect(() => {
    if (isStageActive) {
      // Play stage activation sound
      stageAudio.playSound();
    } else {
      // Stop stage audio when stage becomes inactive
      stageAudio.stopSound();
    }
  }, [isStageActive]); // Remove stageAudio from dependencies to prevent loop

  // Cleanup audio on component unmount
  useEffect(() => {
    return () => {
      stageAudio.stopSound();
    };
  }, []); // Run only on mount/unmount

  // const hour = Math.floor(time / 360000);
  const minute = Math.floor((time % 360000) / 6000);
  const second = Math.floor((time % 6000) / 100);
  const milisecond = time % 100;

  const handleReset = () => {
    setTime(0);
  };

  const tm = (number: number) => number.toString().padStart(2, '0');


  // Timer management
  const timer = useStageTimer();

  const handleStageStart = () => currentStage && dispatch(stageActivated({ id: currentStage.id }));
  const handleStageStop = () => currentStage && dispatch(stageDeactivated({ id: currentStage.id }));


  return (
    <div className={classes.timer}>
      <Text size="xl" fw={700}>
        {`${tm(minute)}:${tm(second)}:${tm(milisecond)}`}
      </Text>
      <Group gap="xs" justify="center" mt="xs">
        <ActionIcon
          onClick={handleStageStart}
          color={timer.isRunning ? 'yellow' : 'green'}
          size="sm"
        >
          {timer.isRunning && !timer.isPaused ? <IconPlayerPause size={14} /> : <IconPlayerPlay size={14} />}
        </ActionIcon>
        <ActionIcon onClick={handleStageStop} color="red" size="sm">
          <IconPlayerStop size={14} />
        </ActionIcon>
        <ActionIcon onClick={handleReset} color="gray" size="sm">
          <IconRefresh size={14} />
        </ActionIcon>
      </Group>
    </div>
  );
}