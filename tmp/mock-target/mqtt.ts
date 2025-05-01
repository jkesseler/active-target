import * as mqtt from 'mqtt';
const client = mqtt.connect('ws://192.168.1.20:8080');

export default client;