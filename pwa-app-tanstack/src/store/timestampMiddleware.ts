import { Middleware, MiddlewareAPI, Dispatch, UnknownAction } from '@reduxjs/toolkit';
import type { AppDispatch, AppRootState } from './configureStore';

interface ActionWithMeta extends UnknownAction {
  meta?: Record<string, any>;
}
// Because of the way RTK infers it types this causes a circular dependncy if we use AppRootState
export const timestampMiddleware = (store: any) => 
  (next: any) => 
  (action: any) => {
    if (typeof action.type === 'string' && !action.type.startsWith('@@')) {
      action = {
        ...action,
        meta: {
          ...action.meta,
          timestamp: new Date().toISOString(),
        },
      };
    }
    return next(action);
  };