import reduxWebsocket from '@/lib/redux-websocket';
import { SYSTEM_ID } from '@/constants';

export const configureWebsocketMiddleware = reduxWebsocket({
  deserializer: message => {
    try {
      console.log('Message: ', message);

      const payload = JSON.parse(message);

      if (payload.systemId !== SYSTEM_ID) {
        return null;
      }

      return payload;

    } catch (error) {
      console.log('WS Error: ', error);
      return message;
    }
  },

  serializer: (payload: JSONObject) => {
    const wsPayload = {
      ...payload,
      systemId: SYSTEM_ID
    };

    return JSON.stringify(wsPayload);
  },

  dateSerializer: (date: Date) => {
    return date.toISOString();
  }
});
