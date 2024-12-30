export interface Device {
  id: string;
  name: string;
  type: string;
  status?: string;
  lastUpdated?: Date;
  responses?: string[];
  sideEffects?: SideEffect[];
}

export interface SideEffect {
  topic: string;
  payload: string;
}
