import { useState, useEffect, useRef } from 'react';
import {
  Text,
  Group,
  ActionIcon
} from '@mantine/core';
import { IconPlayerPlay, IconPlayerPause, IconPlayerStop, IconRefresh } from '@tabler/icons-react';
import { useAppSelector, useAppDispatch } from '@/store/configureStore';
import { useTranslation } from '@/hooks/useTranslation';
import { selectCurrentStage, stageActivated, stageDeactivated } from '@/features/stages/stagesSlice';
import * as StageTypes from '@/features/stages/types';
import { useStageTimer } from '@/hooks/useStageTimer';

import classes from './Timer.module.css';

export const Timer = () => {
  const dispatch = useAppDispatch();
  const [time, setTime] = useState(0);
  const intervalId = useRef<number>(0);
  const currentStage = useAppSelector(state => selectCurrentStage(state));
  const isStageActive = currentStage?.status === StageTypes.STATUS.STAGE_ACTIVE;


  // Handle timer intervals
  useEffect(() => {
    if (isStageActive) {
      // @ts-expect-error: Types of setInterval and clearInterval are mismatched
      intervalId.current = setInterval(() => setTime((value) => value + 1), 10);
    } else if (intervalId.current) {
      clearInterval(intervalId.current);
    }
    return () => {
      if (intervalId.current) {
        clearInterval(intervalId.current);
      }
    };
  }, [isStageActive]);

  // const hour = Math.floor(time / 360000);
  const minute = Math.floor((time % 360000) / 6000);
  const second = Math.floor((time % 6000) / 100);
  const milisecond = time % 100;

  const handleReset = () => {
    setTime(0);
  };

  const tm = (number: number) => number.toString().padStart(2, '0');
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
};
