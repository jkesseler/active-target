export interface Match {
  id: string
  name: string
  date: string
  status: MatchStatus
  currentStageId?: string
  currentShooterId?: string
  stages: string[] // Array of stage IDs
  shooters: string[] // Array of shooter IDs
  currentRun?: CurrentRun
}

export interface CurrentRun {
  shooterId: string
  stageId: string
  timer: TimerState
  startedAt: string
}

export interface TimerState {
  elapsedTime: number
  isRunning: boolean
  isPaused: boolean
  startTime?: number
}

export enum MatchStatus {
  CREATED = 'CREATED',
  IN_PROGRESS = 'IN_PROGRESS',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}
