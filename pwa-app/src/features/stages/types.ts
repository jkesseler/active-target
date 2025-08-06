export interface Stage {
  id: string;
  name: string;
  currentShooterId?: string;
  status: STATUS; // active on buzzer, not active on stop plate
  devices: string[];
  timer?: {
    elapsedTime: number;
    isRunning: boolean;
    isPaused: boolean;
    startTime?: number;
  };
}

export enum STATUS {
  STAGE_ACTIVE = 'active',
  STAGE_INACTIVE = 'inActive'
}

export interface StageState {
  currentStage: string;
  list: Stage[];
}