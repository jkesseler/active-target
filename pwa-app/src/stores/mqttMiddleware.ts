import { Middleware } from 'redux';
import mqtt from 'mqtt/dist/mqtt';
import { camelCase, kebabCase } from 'change-case';
// import * as mqtt from "mqtt"
import { DEVICE_ID, MQTT_SEVRVER_URL, MQTT_MIDDLEWARE_TOPICS } from '@/constants';
import { mqttSlice, selectIsConnected } from './mqttSlice';
import { createAction } from '@reduxjs/toolkit';

/**
 * @param topic `DEVICES/ADDED` or 'USERS/UPDATED'
 * @return the action type as a string `devicesAdded` or `usersUpdated`
 */
function formatMqttTopicToActionType(topic: string) {
  const [sliceType, sliceActionFn] = topic.split('/')
  const actionFnName = `${camelCase(sliceType)}${kebabCase(sliceActionFn)}`;
  return actionFnName;
}

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

    if (actions.startConnecting.match(action) && !isConnected) {
      client = mqtt.connect(MQTT_SEVRVER_URL, options);

      client.on('connect', () => {
        MQTT_MIDDLEWARE_TOPICS.forEach(topic => client.subscribe(topic));
        dispatch(actions.connected());
      });
    }


    if(actions.connected.match(action)) {
      client.on('message', (topic, message) => {
        console.log('topic: ', topic);
        const mqttMessage = message.toString();

        try {
          // Create a redux action from the mqtt message and dispatch it
          const { type, payload = undefined, meta = undefined } = parseMqttMessage(mqttMessage);
          const action = createAction(
            formatMqttTopicToActionType(type), 
            ({ payload, meta }) => ({
              ...(payload ? payload : {}),
              ...(meta ? meta : {})
          }));
          
          dispatch(action({ payload, meta }));

        } catch (e) {
          console.log(e);
        }
      });
    }

    next(action);
  };
};
