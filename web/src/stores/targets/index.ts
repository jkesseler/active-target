import { targetsSlice } from './targets.slice';
import * as selectors from './targets.selectors';
import * as actions from './targets.actions';

const allActions = {
  ...targetsSlice.actions,
  ...actions
};

export {
  targetsSlice,
  selectors,
  allActions as actions
};
