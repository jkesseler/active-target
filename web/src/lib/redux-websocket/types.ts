import {
  WEBSOCKET_CLOSED,
  WEBSOCKET_CONNECT,
  WEBSOCKET_DISCONNECT,
  WEBSOCKET_MESSAGE,
  WEBSOCKET_OPEN,
  WEBSOCKET_SEND
} from './actionTypes';

type Serializer = (
  payload: any
) => string | ArrayBuffer | ArrayBufferView | Blob;

type Deserializer = (message: any) => any;

type ActionType =
  | typeof WEBSOCKET_CLOSED
  | typeof WEBSOCKET_CONNECT
  | typeof WEBSOCKET_DISCONNECT
  | typeof WEBSOCKET_MESSAGE
  | typeof WEBSOCKET_OPEN
  | typeof WEBSOCKET_SEND;

type Action =
  | { type: typeof WEBSOCKET_CLOSED; payload: any; meta?: any }
  | { type: typeof WEBSOCKET_CONNECT; payload: any; meta?: any }
  | { type: typeof WEBSOCKET_DISCONNECT; payload: any; meta?: any }
  | { type: typeof WEBSOCKET_MESSAGE; payload: any; meta?: any }
  | { type: typeof WEBSOCKET_OPEN; payload: any; meta?: any }
  | { type: typeof WEBSOCKET_SEND; payload: any; meta?: any };


interface ReduxWebSocketOptions {
  dateSerializer?: (date: Date) => string | number;
  deserializer?: Deserializer;
  onOpen?: (s: WebSocket) => void;
  prefix?: string;
  reconnectInterval?: number;
  reconnectOnClose?: boolean;
  reconnectOnError?: boolean;
  serializer?: Serializer;
}

// Huh? https://github.com/babel/babel/issues/6065#issuecomment-453901877
/* eslint-disable no-undef */
export type { Action, ActionType, ReduxWebSocketOptions, Serializer, Deserializer };
/* eslint-enable no-undef */
