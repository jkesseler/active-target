import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { AppRootState } from '@/configureStore';

export interface ResultLine {
  deviceId: string;
  deviceName: string;
  result: any;
  timestamp: any;
}

export const resultsSlice = createSlice({
  name: 'results',
  initialState: [] as ResultLine[],
  reducers: {
    addResult: (state: ResultLine[], action: PayloadAction <ResultLine>) => {
      const { payload } = action;
      const { deviceId, deviceName, result, timestamp } = payload;

      return [
        ...state,
        {
          deviceId,
          deviceName,
          result,
          timestamp
        }
      ];
    },
    resetResults: () => {
      return [] as ResultLine[];
    }
  }
});

export const { addResult } = resultsSlice.actions;
export const selectResults = (state: AppRootState) => state.results;
