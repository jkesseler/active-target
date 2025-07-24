import { createAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import * as actionTypes from './actionTypes';

export const deviceOnline = createAction(actionTypes.ACTIONS_DEVICE_ONLINE, function prepare() {
  const now = new Date();
  const timestamp = now.toISOString();
  const timeMillis = now.getTime().toString();

  return {
    meta: {
      id: uuidv4(),
      timestamp,
      timeMillis
    },
    payload: {
      deviceType: 'POPPER'
    }
  }
})


export const targetHit = createAction(actionTypes.ACTIONS_DEVICE_TARGET_HIT, function prepare(deviceId: string, targetZone: string) {
  const now = new Date();
  const timestamp = now.toISOString();
  const timeMillis = now.getTime().toString();

  return {
    meta: {
      id: deviceId,
      timestamp,
      timeMillis
    },
    payload: {
      targetZone
    }
  }
});
