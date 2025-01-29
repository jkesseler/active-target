export type DEVICE_TYPE_TARGET = 'TARGET'
export type DEVICE_TYPE_POPPER = 'POPPER'
export type DEVICE_TYPE_NOSHOOT = 'NOSHOOT'
export type DEVICE_TYPE_STOP_PLATE = 'STOP_PLATE'
export type DEVICE_TYPE_TRIGGER = 'TRIGGER'
export type DEVICE_TYPE_ACTUATOR = 'ACTUATOR'

export type DeviceType =
  | DEVICE_TYPE_TARGET
  | DEVICE_TYPE_POPPER
  | DEVICE_TYPE_NOSHOOT
  | DEVICE_TYPE_STOP_PLATE
  | DEVICE_TYPE_TRIGGER
  | DEVICE_TYPE_ACTUATOR;

export interface Device {
  id: string;
  name: string;
  type: DeviceType; // one of DEVICE_TYPE_*
  status?: 'online' | 'offline';
  lastUpdated: Date | string;
  responses: string[];
  sideEffects?: SideEffect[];
}

export interface SideEffect {
  topic: string;
  payload: string;
}
