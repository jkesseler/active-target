import { createListenerMiddleware } from '@reduxjs/toolkit';
import { deviceOffline, deviceOnline } from './devicesSlice';

const devicesMiddleware = createListenerMiddleware();

devicesMiddleware.startListening({
  actionCreator: deviceOffline,
  effect: (action, listenerApi) => {
    console.log('action: ', action);
    console.log('listenerApi: ', listenerApi);
    // TODO: publish mqtt message to '/at/devices/{deviceId}/status' with payload 'offline'
  }
});


export { devicesMiddleware };
