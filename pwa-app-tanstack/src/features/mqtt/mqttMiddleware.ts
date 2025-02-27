import { Middleware } from 'redux';
import { camelCase, kebabCase } from 'change-case';
import { createAction } from '@reduxjs/toolkit';
import { getClient, connect, disconnect } from './mqttClient';
import { mqttSlice } from './mqttSlice';

const mqttClient = getClient();

/**
 * @param topic `DEVICES/ADDED` or 'USERS/UPDATED'
 * @return the action type as a string `devicesAdded` or `usersUpdated`
 */
function formatMqttTopicToActionType(topic: string) {
  const [sliceType, sliceActionFn] = topic.split('/');
  const actionFnName = `${camelCase(sliceType)}${kebabCase(sliceActionFn)}`;
  return actionFnName;
}

const actions = mqttSlice.actions;

interface MqttMessageObject {
  type: string;
  payload: JSONObject;
  meta?: JSONValue;
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

export const mqttMiddleware: Middleware = ({ dispatch }) => {
  const isConnected = mqttClient?.connected;
  console.log('isConnected: ', mqttClient?.connected);

  return next => action => {
    if (actions.startConnecting.match(action) && !isConnected) {
      // connect();
      dispatch(mqttSlice.actions.connected());
    }

    if (actions.startDisconnecting.match(action)) {
      // TODO: the mqtt lib has a memeory leak when a listener is bound to `.end()`
      // ideally we'd dispatch the action in `client.on('end', () => dispatch... );
      // disconnect();
      dispatch(mqttSlice.actions.disconnected());
    }
    // Ensures both the mqttClient and Redux store are setup
    if (isConnected && actions.connected.match(action)) {
      mqttClient.on('message', (topic, message) => {
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
