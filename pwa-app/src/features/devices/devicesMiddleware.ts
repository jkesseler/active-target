import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
// import { publish } from '@/features/mqtt/mqttClient';
import { deviceOffline, deviceOnline } from './devicesSlice';

const devicesMiddleware = createListenerMiddleware();

devicesMiddleware.startListening({
  matcher: isAnyOf(deviceOffline, deviceOnline),
  effect: (action, listenerApi) => {

    console.log('devicesMiddleware action: ', action);
    console.log('devicesMiddleware listenerApi: ', listenerApi);

    //@ts-expect-error: unknown
    const { id } = action.payload;
    // publish(`at/devices/${id}/status`, action);
  }
});


export { devicesMiddleware };
