import type { Middleware, UnknownAction } from '@reduxjs/toolkit'

interface TimestampAction extends UnknownAction {
  meta?: Record<string, unknown> & {
    timestamp?: string
    timeMillies?: number
  }
}

export const timestampMiddleware: Middleware
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  = _store => next => (action) => {
    // Type guard to ensure action has the expected shape
    const isTypedAction = (act: unknown): act is TimestampAction => {
      return typeof act === 'object' && act !== null && act !== undefined && 'type' in act
    }

    if (isTypedAction(action) && typeof action.type === 'string' && !action.type.startsWith('@@')) {
      const addTimestamp = !action?.meta?.timestamp

      const enhancedAction: TimestampAction = {
        ...action,
        meta: {
          ...action.meta,
          ...(addTimestamp && {
            timestamp: new Date().toISOString(),
            timeMillies: Date.now(),
          }),
        },
      }

      return next(enhancedAction)
    }

    return next(action)
  }
