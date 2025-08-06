import {
  configureStore,
  combineReducers,
  createListenerMiddleware,
  addListener
} from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import { deserializeError } from 'serialize-error';
// import { rememberReducer, rememberEnhancer } from 'redux-remember';
import { timestampMiddleware } from './timestampMiddleware';
import { devicesSlice } from '@/features/devices/devicesSlice';
import { devicesMiddleware } from '@/features/devices/devicesMiddleware';
import { mqttSlice } from '@/features/mqtt/mqttSlice';
import { mqttMiddleware } from '@/features/mqtt/mqttMiddleware';
import { usersSlice } from '@/features/users/usersSlice';
import { stagesSlice } from '@/features/stages/stagesSlice';
import { stagesMiddleware } from '@/features/stages/stagesMiddleware';

import type { TypedUseSelectorHook } from 'react-redux';
import type {
  ListenerEffectAPI,
  TypedStartListening,
  TypedAddListener
} from '@reduxjs/toolkit';

export const rootReducer = combineReducers({
  [devicesSlice.name]: devicesSlice.reducer,
  [mqttSlice.name]: mqttSlice.reducer,
  [usersSlice.name]: usersSlice.reducer,
  [stagesSlice.name]: stagesSlice.reducer
});

// const reducer = rememberReducer(rootReducer);

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: true
    }).concat(
      timestampMiddleware,
      mqttMiddleware,
      devicesMiddleware.middleware,
      stagesMiddleware.middleware,
    ),
  // enhancers: (getDefaultEnhancers) => getDefaultEnhancers().concat(
  //   rememberEnhancer(
  //     window.localStorage,
  //     [devicesSlice.name, usersSlice.name, stagesSlice.name]
  //   )
  // ),
  devTools: true
});


// Infer the `RootState` and `AppDispatch` types from the store itself
export type AppRootStore = ReturnType<typeof configureStore>
export type AppRootState = ReturnType<typeof rootReducer>
export type AppDispatch = typeof store.dispatch
export type AppListenerEffectAPI = ListenerEffectAPI<AppRootState, AppDispatch>
export type AppStartListening = TypedStartListening<AppRootState>
export type AppAddListener = TypedAddListener<AppRootState>

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<AppRootState> = useSelector;

const listenerMiddlewareInstance = createListenerMiddleware({
  onError: (e) => console.error(deserializeError(e))
});

export const startAppListening = listenerMiddlewareInstance.startListening as AppStartListening;
export const addAppListener = addListener as AppAddListener;

