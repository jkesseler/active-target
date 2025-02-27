import mqtt from 'mqtt';
import { type Action } from '@reduxjs/toolkit';

import { DEVICE_ID, MQTT_SEVRVER_URL, MQTT_MIDDLEWARE_TOPICS, MQTT_BROADCAST_TOPIC } from '@/constants';

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

let mqttClient: mqtt.MqttClient | null = null;

export const connect = () => {
  mqttClient = mqtt.connect(MQTT_SEVRVER_URL, options);
  mqttClient.subscribe(MQTT_MIDDLEWARE_TOPICS);  
}

export const disconnect = () => {
  if (mqttClient) {
    mqttClient.end(() => {
      console.log('🔒 Connection closed manually');
    });
    mqttClient = null;
  }
};

export const getClient = () => mqttClient;

export const broadcast = (action: Action) => {
  if (mqttClient?.connected) {
    mqttClient.publish(MQTT_BROADCAST_TOPIC, JSON.stringify(action));
  }
}

export const publish = (topic: string, action: Action) => {
  if (mqttClient?.connected) {
    mqttClient.publish(topic, JSON.stringify(action));
  }
} 
