import * as React from 'react';
import { Group, Switch } from '@mantine/core';
import { useAppSelector, useAppDispatch } from '@/configureStore';
import { selectIsConnected, selectIsConnecting, startConnecting, startDisconnecting } from '@/features/mqtt/mqttSlice';
import classes from './HeaderSimple.module.css';

export function HeaderSimple() {
  const isConnected = useAppSelector(state => selectIsConnected(state));
  const isConnecting = useAppSelector(state => selectIsConnecting(state));
  const dispatch = useAppDispatch();

  const toggleConnect = () => {
    if(isConnected) {
      dispatch(startDisconnecting());
    } else {
      dispatch(startConnecting());
    }
  };

  return (
    <header className={classes.header}>
      <Group>
        <h3>Fixed header</h3>
        <Switch 
          label={isConnected ? 'turn off' : 'turn on'} 
          size="lg"
          radius="md"
          onChange={toggleConnect}
          disabled={isConnecting}
        />

      </Group>
    </header>
  );
}
