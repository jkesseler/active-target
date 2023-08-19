import { createSlice, createSelector } from '@reduxjs/toolkit';
import { AppRootState } from '@/configureStore';

export interface Device {
  deviceId: string;
  deviceName: string;
  deviceState: 'TEST' | 'IDLE' | 'ACTIVE-ON' | 'ACTIVE-OFF' | 'ERROR';
}

export const devicesSlice = createSlice({
  name: 'devices',
  initialState: [] as Device[],
  reducers: {
    updateDevice: (state, { payload }) => {
      const { deviceId } = payload;
      return state.map((device: Device) => device.deviceId === deviceId
        ? { ...device, ...payload }
        : device);
    },
    addDevice: (state, { payload }) => {
      const idx = state.findIndex(device => device.deviceId === payload.deviceId);

      if(idx !== -1) {
        return state;
      }

      return [
        ...state,
        payload
      ];

    }
  }
});

export const { addDevice, updateDevice } = devicesSlice.actions;
export const selectDevices = (state: AppRootState) => state.devices;

export const selectDeviceById = createSelector(
  [
    state => state.devices,
    (_, deviceId) => deviceId
  ],
  (devices, deviceId) => {
    return devices ? devices.find((device: Device) => device.deviceId === deviceId) : null;
  }
);
