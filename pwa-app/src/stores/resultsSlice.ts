import { createSlice /*, PayloadAction */ } from '@reduxjs/toolkit';
import { AppRootState } from '@/configureStore';

export interface ResultLine {
  targetId: string;
  targetName: string;
  result: any;
  timestamp: any;
}

export const resultsSlice = createSlice({
  name: 'results',
  initialState: [] as ResultLine[],
  reducers: {
    addResult: (state: ResultLine[], action) => {
      const { payload, meta } = action;
      const { targetId, targetName, result } = payload;

      return [
        ...state,
        {
          targetId,
          targetName,
          result,
          timestamp: meta.timestamp
        } 
      ]
    },
    resetResults: () => {
      return [] as ResultLine[]
    }
  }
});

export const { addResult } = resultsSlice.actions;
export const selectResults = (state: AppRootState) => state.results;
