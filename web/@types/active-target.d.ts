type TargetResult = 'hit' | 'missed' | null;

interface TargetResultPayload {
  roundIndex: number;
  turnIndex: number;
  targetResult: TargetResult;
}


type GameRounds = TargetResultPayload[];




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

