import { createListenerMiddleware } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';

const toastMiddleware = createListenerMiddleware();

toastMiddleware.startListening({
  predicate: (action) => {
    const isWsError = action.type === 'REDUX_WEBSOCKET:: ERROR';
    return isWsError;
  },
  effect: (action /*, { dispatch, getState, getOriginalState } */) => {
    switch(action.type) {
    case 'REDUX_WEBSOCKET::ERROR':
      toast.error('Lost connection with Base station', { toastId: action.type });
      break;
    default:
      toast.error('Something went wrong and we don\'t know what', { toastId: action.type });
      break;
    }
  }
});

export { toastMiddleware };
