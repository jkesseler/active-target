import { createSlice /*, PayloadAction */ } from '@reduxjs/toolkit';
import { AppRootState } from '@/store';

interface MqttMessage {
  topic: string;
  message: {
    payload?: JSONValue;
    meta?: JSONValue;
  }
}

export interface MqttState {
  messages: MqttMessage[];
  isConnecting: boolean;
  isConnected: boolean;
  isDisconnecting: boolean;
}

const initialState: MqttState = {
  messages:[],
  isConnecting: false,
  isConnected: false,
  isDisconnecting: false
};

const mqttSlice = createSlice({
  name: 'mqtt',
  initialState,
  reducers: {
    startConnecting(state) {
      state.isConnected = false;
      state.isConnecting = true;
      state.isDisconnecting = false;
    },
    startDisconnecting(state) {
      state.isConnected = true;
      state.isConnecting = false;
      state.isDisconnecting = true;
    },
    connected(state) {
      state.isConnected = true;
      state.isConnecting = false;
      state.isDisconnecting = false;
    },
    disconnected(state) {
      state.isConnected = false;
      state.isConnecting = false;
      state.isDisconnecting = false;
    }
  }
});
export const selectIsConnected = (state: AppRootState) => state.mqtt.isConnected;
export const selectIsConnecting = (state: AppRootState) => state.mqtt.isConnecting;
export const { startConnecting, startDisconnecting, connected } = mqttSlice.actions;
export { mqttSlice };
