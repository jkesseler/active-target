type TargetResult = 'hit' | 'missed' | null;

interface Turn {
  roundIndex: number;
  turnIndex: number;
  targetResult: TargetResult;
}

type GameRounds = Turns[];

// LoRa related stuff
interface ILoRaMessage {
  systemId: string;
  type: string;
  meta: {
    orginator: string;
  }
}

interface ITargetHitMessage extends ILoRaMessage {
  payload: {
    targetId: string;
    timestamp: string;
  }
}

