import { createSlice, createSelector } from '@reduxjs/toolkit';
import type { AppRootState } from '@/configureStore';
import mockDevices from './mock-data';
import type * as Types from './types';

export const devicesSlice = createSlice({
  name: 'devices',
  // initialState: [] as Types.Device[],
  initialState: mockDevices,
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
      return state.map((device: Types.Device) =>
        device.id === payload.id ? { ...device, ...payload } : device
      );
    },
    deviceRemoved: (state, { payload }) => {
      return state.filter((device: Types.Device) => device.id === payload.id);
    },
    deviceOnline: (state, { payload }) => {
      return state.map((device: Types.Device) =>
        device.id === payload.id ? { ...device, status: 'online' } : device
      );
    },
    deviceOffline: (state, { payload }) => {
      return state.map((device: Types.Device) =>
        device.id === payload.id ? { ...device, status: 'offline' } : device
      );
    },
    deviceResponseAdded: (state, { payload }) => {
      const { id, response } = payload;
      return state.map((device: Types.Device) =>
        device.id === id ? { ...device, response: [...device.responses, response] } : device
      );
    }
  }
});

export const { deviceAdded, deviceUpdated, deviceRemoved, deviceOnline, deviceOffline, deviceResponseAdded } = devicesSlice.actions;

const selectRawDevices = (state: AppRootState) => state.devices;

export const selectDevices = createSelector(selectRawDevices, (devices) =>{
  return devices.map((device: Types.Device) => ({
    ...device,
    ...(device?.lastUpdated) ? { lastUpdated: new Date(device.lastUpdated) } : {}
  }));
});


export const selectDeviceById = createSelector(
  [
    state => state.devices,
    (_, deviceId) => deviceId
  ],
  (devices, deviceId) => {
    return devices ? devices.find((device: Types.Device) => device.id === deviceId) : null;
  }
);

/**
 * const device = useAppSelector((state) => selectDeviceById(state, DEVICE_TYPE_TARGET));
 * const device = useAppSelector((state) => selectDeviceById(state, [DEVICE_TYPE_TARGET, DEVICE_TYPE_POPPER, DEVICE_TYPE_NOSHOOT]));
 */
export const selectDevicesByType = createSelector(
  [
    state => state.devices,
    (_, deviceTypes: Types.DeviceType | Types.DeviceType[]) => deviceTypes
  ],
  (devices, deviceTypes) => {
    return devices ? devices.filter((device: Types.Device) => 
      Array.isArray(deviceTypes) ? deviceTypes.includes(device.type) : device.type === deviceTypes
    ) : [];
  }
);

