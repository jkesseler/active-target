export interface Device {
  id: string;
  name: string;
  type: string;
  status?: 'online' | 'offline';
  lastUpdated?: Date;
  responses?: string[];
  sideEffects?: SideEffect[];
}

export interface SideEffect {
  topic: string;
  payload: string;
}
