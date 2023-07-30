// see: https://github.com/reduxjs/redux-toolkit/blob/c87f80370ab16fabe62bf098e49ab47bd18a358f/examples/action-listener/counter/src/store.ts
import {
  configureStore,
  combineReducers,
  createListenerMiddleware,
  addListener
} from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import { deserializeError } from 'serialize-error';
import { targetsSlice } from './stores/targetsSlice';
import { resultsSlice } from './stores/resultsSlice'
import { mqttSlice } from './stores/mqttSlice';
import { mqttMiddleware } from './stores/mqttMiddleware';

import type { TypedUseSelectorHook } from 'react-redux';
import type {
  ListenerEffectAPI,
  TypedStartListening,
  TypedAddListener
} from '@reduxjs/toolkit';


const listenerMiddlewareInstance = createListenerMiddleware({
  onError: (e) => console.error(deserializeError(e))
});


export const rootReducer = combineReducers({
  [mqttSlice.name]: mqttSlice.reducer,
  [resultsSlice.name]: resultsSlice.reducer,
  [targetsSlice.name]: targetsSlice.reducer
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware => getDefaultMiddleware({
    serializableCheck: false,
    thunk: true
  }).concat(mqttMiddleware),
  devTools: true
});

export const startAppListening = listenerMiddlewareInstance.startListening as AppStartListening;
export const addAppListener = addListener as AppAddListener;


// Infer the `RootState` and `AppDispatch` types from the store itself
export type AppRootStore = ReturnType<typeof configureStore>
export type AppRootState = ReturnType<typeof rootReducer>
export type AppDispatch = typeof store.dispatch
export type AppListenerEffectAPI = ListenerEffectAPI<AppRootState, AppDispatch>
export type AppStartListening = TypedStartListening<AppRootState>
export type AppAddListener = TypedAddListener<AppRootState>

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<AppRootState> = useSelector;
