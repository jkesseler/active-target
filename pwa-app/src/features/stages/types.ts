import type { ScoresTable } from '@/features/scoresTable/types';

export interface Stage {
  id: string
  name: string
  status: STATUS // active on buzzer, not active on stop plate
  devices: string[]
  scoresTable?: ScoresTable[]
}

export enum STATUS {
  STAGE_ACTIVE = 'active',
  STAGE_INACTIVE = 'inActive',
}

export interface StageState {
  currentStage: string
  list: Stage[]
}
