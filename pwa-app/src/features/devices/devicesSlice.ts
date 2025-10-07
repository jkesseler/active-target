import { createSlice, createSelector, createAction } from '@reduxjs/toolkit'
import type { AppRootState } from '@/store/configureStore'
import mockDevices from './mock-data'
import * as Types from './types'

// Action types matching action_types.h
const DEVICE_ADDED = 'DEVICE/ADDED'
const DEVICE_UPDATED = 'DEVICE/UPDATED'
const DEVICE_REMOVED = 'DEVICE/REMOVED'
const DEVICE_OFFLINE = 'DEVICE/OFFLINE'
const DEVICE_ONLINE = 'DEVICE/ONLINE'
const SENSOR_TRIGGERED = 'SENSOR/TRIGGERED'

// Action creators
export const deviceAdded = createAction<Types.Device>(DEVICE_ADDED)
export const deviceUpdated = createAction<Partial<Types.Device> & { id: string }>(DEVICE_UPDATED)
export const deviceRemoved = createAction<{ id: string }>(DEVICE_REMOVED)
export const deviceOffline = createAction<{ id: string }>(DEVICE_OFFLINE)
export const deviceOnline = createAction<{ id: string }>(DEVICE_ONLINE)
export const deviceResponseAdded = createAction<{ id: string, response: string }>(SENSOR_TRIGGERED)

export const devicesSlice = createSlice({
  name: 'devices',
  // initialState: [] as Types.Device[],
  initialState: mockDevices,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(deviceAdded, (state, { payload }) => {
        const idx = state.findIndex(device => device.id === payload.id)

        if (idx !== -1) {
          return state
        }

        return [
          ...state,
          payload,
        ]
      })
      .addCase(deviceUpdated, (state, { payload }) => {
        return state.map((device: Types.Device) =>
          device.id === payload.id ? { ...device, ...payload } : device,
        )
      })
      .addCase(deviceRemoved, (state, { payload }) => {
        return state.filter((device: Types.Device) => device.id !== payload.id)
      })
      .addCase(deviceOnline, (state, { payload }) => {
        return state.map((device: Types.Device) =>
          device.id === payload.id ? { ...device, status: Types.STATUS.ONLINE } : device,
        )
      })
      .addCase(deviceOffline, (state, { payload }) => {
        return state.map((device: Types.Device) =>
          device.id === payload.id ? { ...device, status: Types.STATUS.OFFLINE } : device,
        )
      })
      .addCase(deviceResponseAdded, (state, { payload }) => {
        const { id, response } = payload
        return state.map((device: Types.Device) =>
          device.id === id ? { ...device, responses: [...device.responses, response] } : device,
        )
      })
  },
})

const selectRawDevices = (state: AppRootState) => state.devices

export const selectDevices = createSelector(selectRawDevices, (devices) => {
  return devices.map((device: Types.Device) => ({
    ...device,
    ...(device?.lastUpdated) ? { lastUpdated: new Date(device.lastUpdated) } : {},
  }))
})

export const selectDeviceById = createSelector(
  [
    state => state.devices,
    (_, deviceId) => deviceId,
  ],
  (devices, deviceId) => {
    return devices ? devices.find((device: Types.Device) => device.id === deviceId) : null
  },
)

/**
 * const device = useAppSelector((state) => selectDeviceById(state, DEVICE_TYPE_TARGET));
 * const device = useAppSelector((state) => selectDeviceById(state, [DEVICE_TYPE_TARGET, DEVICE_TYPE_POPPER, DEVICE_TYPE_NOSHOOT]));
 */
export const selectDevicesByType = createSelector(
  [
    state => state.devices,
    (_, deviceTypes: Types.DeviceType | Types.DeviceType[]) => deviceTypes,
  ],
  (devices, deviceTypes) => {
    return devices
      ? devices.filter((device: Types.Device) =>
          Array.isArray(deviceTypes) ? deviceTypes.includes(device.type) : device.type === deviceTypes,
        )
      : []
  },
)
