import { createSlice, createSelector } from '@reduxjs/toolkit';
import type { AppRootState } from '@/configureStore';
import type * as Types from './types';

export const usersSlice = createSlice({
  name: 'users',
  initialState: [] as Types.User[],
  reducers: {
    userAdded: (state, { payload }) => {
      const idx = state.findIndex(user => user.id === payload.id);

      if(idx !== -1) {
        return state;
      }

      return [
        ...state,
        payload
      ];  
    },
    userRemoved: (state, { payload }) => {
      return state.filter(user => user.id !== payload.id);
    },
    userUpdated: (state, { payload }) => {
      return state.map((user: Types.User) =>
        user.id === payload.id ? { ...user, ...payload } : user
      );
    }
  }
});

export const selectUsers = (state: AppRootState) => state.users;

export const selectUserById = createSelector(
  [
    state => state.devices,
    (_, id) => id
  ],
  (users, id) => {
    return users ? users.find((user: Types.User) => user.id === id) : null;
  }
);
