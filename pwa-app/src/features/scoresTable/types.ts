export interface Result {
  timeMillies: string;
  targetZone: 'A' | 'C' | 'D';
}

export interface Scores {
  deviceId: string;
  results: Result[];
}

export interface ScoresTable {
  shooterId: string;
  scores: Scores[];
}