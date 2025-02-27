import { publish } from '@/features/mqtt/mqttClient';
import { type AppDispatch } from '@/store';
import { ACTIONS_DEVICE_OFFLINE, ACTIONS_DEVICE_ONLINE } from '../test/actionTypes';
import { deviceOffline, deviceOnline } from './devicesSlice';

export const setDeviceOffline = ({ deviceId }: { deviceId: string }) => (dispatch: AppDispatch) => {
  const action = {
    type: ACTIONS_DEVICE_OFFLINE
  };

  publish(`devices/${deviceId}/status`, action);
  dispatch(deviceOffline({ id: deviceId }));
};

export const setDeviceOnline = ({ deviceId }: {deviceId: string}) => (dispatch: AppDispatch) => {
  const action = {
    type: ACTIONS_DEVICE_ONLINE
  }

  publish(`devices/${deviceId}/status`, action);
  dispatch(deviceOnline({ id: deviceId }));
};
