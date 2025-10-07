import { Middleware } from 'redux';
import { createAction } from '@reduxjs/toolkit';
import mqtt from 'mqtt';
import { DEVICE_ID, MQTT_SEVRVER_URL, MQTT_MIDDLEWARE_TOPICS } from '@/constants';
import { mqttSlice } from './mqttSlice';

let mqttClient: mqtt.MqttClient;

const actions = mqttSlice.actions;

interface MqttMessageObject {
  type: string
  payload: JSONValue
  meta: JSONValue
}

function parseMqttMessage(message: string): MqttMessageObject {
  try {
    const mqttAction = JSON.parse(message);
    const { type, meta, payload = {} } = mqttAction;
    return ({
      type,
      meta,
      payload,
    });
  }
  catch (err) {
    throw new Error('MQTT message does not a valid JSON string', { cause: err });
  }
}

export const mqttMiddleware: Middleware = ({ dispatch }) => {
  const isConnected = mqttClient?.connected;

  return next => (action) => {
    if (actions.startConnecting.match(action) && !isConnected) {
      mqttClient = mqtt.connect(MQTT_SEVRVER_URL, {
        clientId: `controller_${DEVICE_ID}`,
        log: console.log,
      });

      mqttClient.subscribe(MQTT_MIDDLEWARE_TOPICS);

      setTimeout(() => {
        console.log('isConnected: ', mqttClient?.connected);
        dispatch(mqttSlice.actions.connected());
      }, 150);
    }

    if (actions.startDisconnecting.match(action)) {
      // TODO: the mqtt lib has a memeory leak when a listener is bound to `.end()`
      // ideally we'd dispatch the action in `client.on('end', () => dispatch... );
      mqttClient.end();
      dispatch(mqttSlice.actions.disconnected());
    }

    // Ensures both the mqttClient and Redux store are setup
    if (actions.connected.match(action)) {
      mqttClient.on('message', (topic, message) => {
        try {
          // Create a redux action from the mqtt message and dispatch it
          const mqttMessage = message.toString();
          const { type, meta, payload } = parseMqttMessage(mqttMessage);

          const action = createAction(
            type,
            (payload, meta) => ({
              payload,
              meta,
            }),
          );

          dispatch(action(payload, meta));
        }
        catch (e) {
          console.log(e);
        }
      });
    }
    next(action);
  };
};
