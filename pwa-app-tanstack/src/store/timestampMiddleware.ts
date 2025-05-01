
// Because of the way RTK infers it types we cannot type this
export const timestampMiddleware = (store: any) => 
  (next: any) => 
  (action: any) => {
    if (typeof action.type === 'string' && !action.type.startsWith('@@')) {
      const addTimestamp = !action?.meta?.timestamp;
      
      action = {
        ...action,
        meta: {
          ...action.meta,
          ...(!addTimestamp && {
            timestamp: new Date().toISOString(),
            timeMillies: Date.now()
          })
        },
      };
    }
    
    return next(action);
  };
