import { createListenerMiddleware } from '@reduxjs/toolkit';
import { addResult } from './targets.actions';

export const targetsMiddleware = createListenerMiddleware();

targetsMiddleware.startListening({
  type: 'WEBSOCKET::MESSAGE',
  // @ts-ignore
  effect: ({ payload }, { dispatch }) => {
    const wsType = payload?.message?.type;

    // TODO: use redux-toolkit matchers
    if (wsType === 'target/record-hit') {
      addResult(dispatch)({ targetResult: 'hit'});
    }
  }
});
