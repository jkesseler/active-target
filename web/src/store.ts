import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { targetsSlice } from '@/stores/targets';
import { toastMiddleware } from '@/stores/toasts';
import { middleware as websocketsMiddleware } from '@/stores/websockets';

export const rootReducer = combineReducers({
  [targetsSlice.name]: targetsSlice.reducer
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware => getDefaultMiddleware({
    serializableCheck: false,
    thunk: true
  }).concat(websocketsMiddleware, toastMiddleware.middleware),
  devTools: true
});


export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof rootReducer>

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
