import reduxWebsocket from '@giantmachines/redux-websocket';

export const configureWebsocketMiddleware = reduxWebsocket({
  deserializer: message => {
    try {
      const payload = JSON.parse(message);
      if (payload.systemId !== process.env.NEXT_PUBLIC_SYSTEM_ID) {
        return null;
      }

      return payload;

    } catch (error) {
      console.log('WS Error: ', error);
      console.log('WS Message: ', message);
      return undefined;
    }
  },
  serializer: (payload: JSONObject) => {
    const wsPayload = {
      ...payload,
      systemId: process.env.NEXT_PUBLIC_SYSTEM_ID
    };

    return JSON.stringify(wsPayload);
  }
});
