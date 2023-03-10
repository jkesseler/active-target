import { connect, disconnect } from '@/lib/redux-websocket';
import { WEBSOCKET_SERVER_URL } from '@/constants';
import type { AppDispatch } from '@/store';

export const wsConnect = (dispatch: AppDispatch) => {
  return () => dispatch(connect(WEBSOCKET_SERVER_URL));
};

export const wsDisconnect = (dispatch: AppDispatch) => {
  return () => dispatch(disconnect());
};
