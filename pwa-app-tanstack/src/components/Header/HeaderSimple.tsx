import { Button,  Group, Switch } from '@mantine/core';
import { Howl } from 'howler'
import { useTranslation } from '@/hooks/useTranslation';
import { useAppSelector, useAppDispatch } from '@/store';
import { getClient, connect, disconnect } from '@/features/mqtt/mqttClient';
import { selectIsConnected, selectIsConnecting, startConnecting, startDisconnecting } from '@/features/mqtt/mqttSlice';
import { selectCurrentStage, stageActivated, stageDeactivated } from '@/features/stages/stagesSlice';
import * as StageTypes from '@/features/stages/types';
import { ToggleStageButton } from './ToggleStageButton';
import { Stopwatch } from './Stopwatch'
import styles from './HeaderSimple.module.css';
import { useEffect } from 'react';

export function HeaderSimple() {
  const { t } = useTranslation('header')
  const isConnecting = useAppSelector(state => selectIsConnecting(state));
  const currentStage = useAppSelector(state => selectCurrentStage(state));
  const isStageActive = currentStage?.status === StageTypes.STATUS.STAGE_ACTIVE;
  const dispatch = useAppDispatch();
  const beep = new Howl({ 
    src: ['/sounds/2800-hz-433ms.wav'],
    preload: true

  });

  useEffect(() => { 
    if (isStageActive) {
      beep.play();
    } else {
      beep.stop();
    }
  }, [isStageActive])


  const toggleConnect = () => {
    if (getClient()?.connected) {
      dispatch(startConnecting());
      disconnect();
    } else {
      dispatch(startDisconnecting());
      connect();
    }
  };

  return (
    <header className={styles.header}>
      <Group>
        <h3>{currentStage?.name}</h3>
        <Switch 
          label={getClient()?.connected ? 'turn off' : 'turn on'} 
          size="lg"
          radius="md"
          onChange={toggleConnect}
          disabled={isConnecting}
        />

        {/* Current stage.name */}
        {/* Current state.status */}


        <ToggleStageButton />
        <Stopwatch />
      </Group>
    </header>
  );
}
