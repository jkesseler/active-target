import { useState, useEffect, useRef } from 'react';
import { useAppSelector } from '@/store/configureStore';
import { useTranslation } from '@/hooks/useTranslation';
import { selectCurrentStage } from '@/features/stages/stagesSlice';
import * as StageTypes from '@/features/stages/types';

export const Stopwatch = () => {
  const { t } = useTranslation('header');
  const [time, setTime] = useState(0);
  const intervalId = useRef<number>(0);
  const currentStage = useAppSelector(state => selectCurrentStage(state));
  const isStageActive = currentStage?.status === StageTypes.STATUS.STAGE_ACTIVE;

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

  return (
    <div>
      <span>
        {`${tm(minute)}:${tm(second)}:${tm(milisecond)}`}
      </span>

      <button onClick={handleReset} disabled={isStageActive}>{t('button:reset')}</button>
    </div>
  );
};
