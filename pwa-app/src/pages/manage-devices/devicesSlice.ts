import { createSlice, createSelector } from '@reduxjs/toolkit';
import { AppRootState } from '@/configureStore';
import type * as Types from './types';

export const devicesSlice = createSlice({
  name: 'devices',
  initialState: [] as Types.Device[],
  reducers: {
    deviceAdded: (state, { payload }) => {
      const idx = state.findIndex(device => device.id === payload.id);

      if(idx !== -1) {
        return state;
      }

      return [
        ...state,
        payload
      ];
    },
    deviceUpdated: (state, { payload }) => {
      const { id } = payload;
      return state.map((device: Types.Device) => device.id === id
        ? { ...device, ...payload }
        : device);
    },
    deviceRemoved: (state, { payload }) => {
      const { id } = payload;
      return state.filter((device: Types.Device) => device.id === id);
    },
    deviceOnline: (state, { payload }) => {
      const { id } = payload;
      return state.map((device: Types.Device) => ({
        ...device,
        ...(device.id === id ? { status: 'online' } : {})
      }))
    },
    deviceOffline: (state, { payload }) => {
      const { id } = payload;
      return state.map((device: Types.Device) => ({
        ...device,
        ...(device.id === id ? { status: 'offline' } : {})
      }))
    }
  }
});

export const { deviceAdded, deviceUpdated, deviceRemoved } = devicesSlice.actions;
export const selectDevices = (state: AppRootState) => state.devices;

export const selectDeviceById = createSelector(
  [
    state => state.devices,
    (_, deviceId) => deviceId
  ],
  (devices, deviceId) => {
    return devices ? devices.find((device: Types.Device) => device.id === deviceId) : null;
  }
);
