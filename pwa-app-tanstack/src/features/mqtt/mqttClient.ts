import mqtt from 'mqtt';
import { type PayloadAction } from '@reduxjs/toolkit';

import { DEVICE_ID, MQTT_SEVRVER_URL, MQTT_MIDDLEWARE_TOPICS, MQTT_BROADCAST_TOPIC } from '@/constants';

const options: mqtt.IClientOptions = {
  manualConnect: true,
  // keepalive: 999,
  clientId: `controller_${DEVICE_ID}`
  // will: {
  //   topic: `at/controller/${DEVICE_ID}/dead`,
  //   payload: '',
  //   qos: 0,
  //   retain: false
  // }
};

const mqttClient = mqtt.connect(MQTT_SEVRVER_URL, options);
mqttClient.subscribe(MQTT_MIDDLEWARE_TOPICS);

function broadcast(action: PayloadAction) {
  mqttClient.publish(MQTT_BROADCAST_TOPIC, JSON.stringify(action));
}

function publish(topic: string, action: PayloadAction) {
  mqttClient.publish(topic, JSON.stringify(action));
} 


export { 
  mqttClient, 
  broadcast,
  publish
};
