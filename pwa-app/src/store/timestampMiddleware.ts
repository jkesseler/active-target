
// Because of the way RTK infers it types we cannot type this
import type { MiddlewareAPI, Dispatch, Action } from '@reduxjs/toolkit';

export const timestampMiddleware =
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (_store: MiddlewareAPI) =>
    (next: Dispatch<Action>) =>
      (action: Action & { meta?: Record<string, unknown> }) => {
        if (typeof action.type === 'string' && !action.type.startsWith('@@')) {
          const addTimestamp = !action?.meta?.timestamp;

          action = {
            ...action,
            meta: {
              ...action.meta,
              ...(addTimestamp && {
                timestamp: new Date().toISOString(),
                timeMillies: Date.now()
              })
            }
          };
        }

        return next(action);
      };
