import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit'
// import { publish } from '@/features/mqtt/mqttClient';
import { deviceOffline, deviceOnline } from './devicesSlice'

const devicesMiddleware = createListenerMiddleware()

devicesMiddleware.startListening({
  matcher: isAnyOf(deviceOffline, deviceOnline),
  effect: (action, listenerApi) => {
    console.log('devicesMiddleware action: ', action)
    console.log('devicesMiddleware listenerApi: ', listenerApi)

    // @ts-expect-error: unknown
    if (actions.deviceOnline.match(action)) {
      const { payload } = action
      console.log(`Device online: ${payload}`)
      // publish(`at/devices/${payload.id}/status`, action);
    }
  },
})

export { devicesMiddleware }
