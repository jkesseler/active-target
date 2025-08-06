import { createSlice, createAction } from '@reduxjs/toolkit';
import * as Types from './types';
import mockData from './mock-data.json';

interface SensorTriggeredPayload {
  targetZone: 'A' | 'C' | 'D';
  timeMillies: string;
  deviceId: string;
}

const SENSOR_TRIGGERED = createAction<SensorTriggeredPayload>('SENSOR/TRIGGERED');

export const scoresTableSlice = createSlice({
  name: 'scoresTable',
  initialState: mockData as Types.ScoresTable,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(SENSOR_TRIGGERED, (state, { payload: { timeMillies, deviceId, targetZone } }) => {
      const scoreIndex = state.scores.findIndex((score: Types.Scores) => score.deviceId === deviceId);
      state.scores[scoreIndex < 0 ? state.scores.length : scoreIndex] = {
        deviceId,
        results: scoreIndex < 0
          ? [{ timeMillies, targetZone }]
          : [...state.scores[scoreIndex].results, { timeMillies, targetZone }]
      };
    });
  }
});


const data = {
  type: 'SENSOR/TRIGGERED',
  meta: {
    timeMillies: '1740575666864',
    deviceId: '1e7b7c8e-1c2b-4d3a-8e2b-1c2b4d3a8e2b'
  },
  payload: {
    targetZone: 'A'
  }
};
