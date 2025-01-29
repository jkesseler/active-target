import { mqttClient } from '@/features/mqtt/mqttClient';
import { type AppDispatch } from '@/configureStore';
import { ACTIONS_DEVICE_OFFLINE, ACTIONS_DEVICE_ONLINE } from '../test/actionTypes';
import { deviceOffline, deviceOnline } from './devicesSlice';

export const setDeviceOffline = ({ deviceId }: { deviceId: string }) => (dispatch: AppDispatch) => {
  mqttClient.publish(`devices/${deviceId}/status`, ACTIONS_DEVICE_OFFLINE);
  dispatch(deviceOffline({ id: deviceId }));
};

export const setDeviceOnline = ({ deviceId }: {deviceId: string}) => (dispatch: AppDispatch) => {
  mqttClient.publish(`devices/${deviceId}/status`, ACTIONS_DEVICE_ONLINE);
  dispatch(deviceOnline({ id: deviceId }));
};
