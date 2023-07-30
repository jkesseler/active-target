import { Middleware } from 'redux';
import mqtt from "mqtt/dist/mqtt";
// import * as mqtt from "mqtt"
import { DEVICE_ID } from '@/constants';
import { mqttSlice, selectIsConnected } from './mqttSlice';

const actions = mqttSlice.actions;
const options: mqtt.IClientOptions = {
  // keepalive: 999,
  clientId: `controller_${DEVICE_ID}`
  // will: {
  //   topic: `at/controller/${DEVICE_ID}/dead`,
  //   payload: '',
  //   qos: 0,
  //   retain: false
  // }
};


interface MqttMessageObject {
  type: string;
  payload: JSONObject;
  meta?: any;
}

function parseMqttMessage(message: string): MqttMessageObject {
  const regex = new RegExp(/^\s*(\{|\[)/);
  if (!regex.test(message)) {
    throw new Error('MQTT message does not a valid JSON string');
  }

  try {
    const mqttAction = JSON.parse(message);
    return mqttAction;
  } catch (err) {
    throw new Error('MQTT message does not a valid JSON string', { cause: err });
  }
}
let client: mqtt.MqttClient;
export const mqttMiddleware: Middleware = ({ dispatch, getState }) => {
  const isConnected = selectIsConnected(getState());
  return next => action => {
    console.log(action.type);
    if (actions.startConnecting.match(action) && !isConnected) {
      client = mqtt.connect(import.meta.env.VITE_MQTT_URL, options);

      client.on('connect', () => {
        client.subscribe('at/target/+/actions');
        dispatch(actions.connected());
      });
    }

    
    if(actions.connected.match(action)) {
      
      client.on('message', (topic, message) => {
        console.log('topic: ', topic);
        const mqttMessage = message.toString();
    
        try {
          const { type, payload, meta = null } = parseMqttMessage(mqttMessage);
          console.log('Action: ', {
            type, payload, meta
          });
          
          dispatch({ type, payload, meta });

        } catch (e) {
          console.log(e);
        }
      });
    }

    next(action);
  };
};
