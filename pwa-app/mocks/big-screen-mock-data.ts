export interface MockShooter {
  userId: string
  userName: string
  score: number
  hitFactor: number
  hits: number
  misses: number
  time: number
  status: 'completed' | 'shooting' | 'waiting'
  penalties?: number
  procedurals?: number
}

export interface MockTarget {
  id: string
  name: string
  type: 'paper' | 'popper' | 'steel' | 'noshoot'
  status: 'hit' | 'missed' | 'default'
  zone?: 'A' | 'B' | 'C' | 'D' | 'Down' | null
  points: number
  timeHit?: number
}

export interface MockStageData {
  stageName: string
  maxScore: number
  targetCount: number
  minRounds: number
  maxTime: number
  currentShooterId: string
  nextShooterId: string
}

export const mockStageData: MockStageData = {
  stageName: 'Stage 1 - The Classifier',
  maxScore: 150,
  targetCount: 8,
  minRounds: 30,
  maxTime: 45,
  currentShooterId: '1',
  nextShooterId: '2',
}

export const mockShooters: MockShooter[] = [
  {
    userId: '1',
    userName: 'John "Ace" Doe',
    score: 145.2,
    hitFactor: 7.23,
    hits: 28,
    misses: 2,
    time: 20.08,
    status: 'shooting',
    penalties: 0,
    procedurals: 0,
  },
  {
    userId: '2',
    userName: 'Jane "Sharpshooter" Smith',
    score: 138.7,
    hitFactor: 6.94,
    hits: 27,
    misses: 3,
    time: 19.98,
    status: 'waiting',
  },
  {
    userId: '3',
    userName: 'Mike "Thunder" Johnson',
    score: 142.1,
    hitFactor: 7.11,
    hits: 29,
    misses: 1,
    time: 20.45,
    status: 'completed',
  },
  {
    userId: '4',
    userName: 'Sarah "Bullseye" Wilson',
    score: 139.8,
    hitFactor: 6.99,
    hits: 26,
    misses: 4,
    time: 19.12,
    status: 'completed',
  },
  {
    userId: '5',
    userName: 'Chris "Fastdraw" Brown',
    score: 134.5,
    hitFactor: 6.72,
    hits: 25,
    misses: 5,
    time: 20.01,
    status: 'completed',
  },
  {
    userId: '6',
    userName: 'Lisa "Precision" Davis',
    score: 147.8,
    hitFactor: 7.39,
    hits: 30,
    misses: 0,
    time: 19.89,
    status: 'completed',
  },
  {
    userId: '7',
    userName: 'Tom "Steady" Miller',
    score: 0,
    hitFactor: 0,
    hits: 0,
    misses: 0,
    time: 0,
    status: 'waiting',
  },
  {
    userId: '8',
    userName: 'Emma "Quick" Taylor',
    score: 0,
    hitFactor: 0,
    hits: 0,
    misses: 0,
    time: 0,
    status: 'waiting',
  },
]

export const mockTargets: MockTarget[] = [
  { id: '1', name: 'T1', type: 'paper', status: 'hit', zone: 'A', points: 5, timeHit: 2.34 },
  { id: '2', name: 'T2', type: 'paper', status: 'hit', zone: 'A', points: 5, timeHit: 3.12 },
  { id: '3', name: 'T3', type: 'paper', status: 'missed', zone: null, points: 0 },
  { id: '4', name: 'T4', type: 'paper', status: 'hit', zone: 'C', points: 3, timeHit: 8.92 },
  { id: '5', name: 'T5', type: 'paper', status: 'default', zone: null, points: 0 },
  { id: '6', name: 'T6', type: 'paper', status: 'hit', zone: 'A', points: 5, timeHit: 12.45 },
  { id: '7', name: 'P1', type: 'popper', status: 'hit', zone: 'Down', points: 5, timeHit: 15.67 },
  { id: '8', name: 'P2', type: 'popper', status: 'default', zone: null, points: 0 },
  { id: '9', name: 'S1', type: 'steel', status: 'hit', zone: 'Down', points: 5, timeHit: 18.23 },
  { id: '10', name: 'NS1', type: 'noshoot', status: 'default', zone: null, points: 0 },
]

// Function to simulate live updates
export const simulateTargetHit = (targetId: string, zone: 'A' | 'B' | 'C' | 'D' | 'Down', timeHit: number) => {
  const target = mockTargets.find(t => t.id === targetId)
  if (target) {
    target.status = 'hit'
    target.zone = zone
    target.timeHit = timeHit
    target.points = zone === 'A' ? 5 : zone === 'B' ? 4 : zone === 'C' ? 3 : zone === 'D' ? 1 : zone === 'Down' ? 5 : 0
  }
}

export const simulateTargetMiss = (targetId: string) => {
  const target = mockTargets.find(t => t.id === targetId)
  if (target) {
    target.status = 'missed'
    target.zone = null
    target.points = 0
  }
}
