import * as ActionTypes from './actionTypes'

type ActionType = typeof ActionTypes[keyof typeof ActionTypes]

type Message = {
  meta: {
    timestamp: string
    timeMillies: string
    id: string
  }
  action: ActionType
  payload?: JSONValue
}
type CreateTargetHitMessage = {
  deviceId: string
  targetZone: string

}
export const createTargetHitMessage = ({ deviceId, targetZone = 'A' }: CreateTargetHitMessage): Message => {
  const message = {
    meta: {
      timestamp: '',
      timeMillies: '',
      id: deviceId,
    },
    action: ActionTypes.ACTIONS_DEVICE_TARGET_HIT as ActionType,
    payload: {
      targetZone,
    },
  }

  return message
}
