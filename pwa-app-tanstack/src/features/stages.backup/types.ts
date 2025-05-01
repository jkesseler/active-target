export interface Stage {
  id: string;
  name: string;
  currentShooterId?: string;
  status: STATUS; // active on buzzer, not active on stop plate
  devices: string[];
  scoresTable: {
    shooterId: string;
    scores?: [{
      deviceId: string;
      results: [{
        timeMillies: string;
        targetZone: 'A' | 'C' | 'D';
      }]
    }]
  }[]
}

export enum STATUS {
  STAGE_ACTIVE = 'active',
  STAGE_INACTIVE = 'inActive'
}

export interface StageState {
  currentStage: string;
  list: Stage[];
}