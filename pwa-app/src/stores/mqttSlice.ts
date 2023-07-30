// https://wanago.io/2021/12/20/redux-middleware-websockets/
import { createSlice /*, PayloadAction */ } from '@reduxjs/toolkit';
import { AppRootState } from '@/configureStore';

interface MqttMessage {
  topic: string;
  message: {
    payload?: any;
    meta?: any;
  }
}

export interface MqttState {
  messages: MqttMessage[];
  isConnecting: boolean;
  isConnected: boolean;
}

const initialState: MqttState = {
  messages:[],
  isConnecting: false,
  isConnected: false
};

const mqttSlice = createSlice({
  name: 'mqtt',
  initialState,
  reducers: {
    startConnecting: (state => {
      return {
        ...state,
        isConnecting: true
      };
    }),
    connected: (state => {
      return {
        ...state,
        isConnected: true,
        isConnecting: false
      };
    }),
    addMessage: (state, { payload }) => {
      return {
        ...state,
        messages: [
          ...state.messages,
          payload
        ]
      };
    }
  }
});
export const selectIsConnected = (state: AppRootState) => state.mqtt.isConnected;
export const selectIsConnecting = (state: AppRootState) => state.mqtt.isConnecting;
export const { startConnecting } = mqttSlice.actions;
export { mqttSlice };
