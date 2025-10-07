import { Group, Switch } from '@mantine/core';
import { useAppSelector, useAppDispatch } from '@/store/configureStore';
import { selectIsConnected, selectIsConnecting, startConnecting, startDisconnecting } from '@/features/mqtt/mqttSlice';
import { selectCurrentStage } from '@/features/stages/stagesSlice';
import styles from './HeaderSimple.module.css';

export function HeaderSimple() {
  const isConnecting = useAppSelector(state => selectIsConnecting(state));
  const isConnected = useAppSelector(state => selectIsConnected(state));
  const currentStage = useAppSelector(state => selectCurrentStage(state));
  const dispatch = useAppDispatch();

  const toggleConnect = () => {
    if (isConnected) {
      dispatch(startDisconnecting());
    }
    else {
      dispatch(startConnecting());
    }
  };

  return (
    <header className={styles.header}>
      <Group>
        <h3>{currentStage?.name}</h3>
        <Switch
          label={isConnected ? 'turn off' : 'turn on'}
          size="lg"
          radius="md"
          onChange={toggleConnect}
          disabled={isConnecting}
        />

        {/* Current stage.name */}
        {/* Current state.status */}
        {/* <ToggleStageButton /> */}
        {/* <Stopwatch /> */}
      </Group>
    </header>
  );
}
