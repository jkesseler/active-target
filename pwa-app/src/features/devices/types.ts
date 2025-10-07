export const DEVICE_TYPE_TARGET = 'TARGET' as const;
export const DEVICE_TYPE_POPPER = 'POPPER' as const;
export const DEVICE_TYPE_NOSHOOT = 'NOSHOOT' as const;
export const DEVICE_TYPE_STOP_PLATE = 'STOP_PLATE' as const;

export type DeviceType =
  | typeof DEVICE_TYPE_TARGET
  | typeof DEVICE_TYPE_POPPER
  | typeof DEVICE_TYPE_NOSHOOT
  | typeof DEVICE_TYPE_STOP_PLATE;

export enum STATUS {
  ONLINE = 'online',
  OFFLINE = 'offline',
}

export interface Device {
  id: string
  name: string
  type: DeviceType // one of DEVICE_TYPE_*
  status?: STATUS
  lastUpdated?: Date | string
  responses: string[]
  sideEffects?: SideEffect[]
}

export interface SideEffect {
  topic: string
  payload: string
}
