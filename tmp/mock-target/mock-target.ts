import mqttClient from './mqtt';
const DEVICE_ID = '604e4469-db3d-40b9-a750-9521453e8c05';

const dispatch = ({ topic, message }) => {
  mqttClient.publish(topic, message)
}


const createHitAction = () => {
  const topic = `/at/target/${DEVICE_ID}/actions`;
  const message = {
    meta: {
      timestamp: new Date().toISOString(),
    },
    type: 'results/addResult',
    payload: {
      result: 'hit'
    }
  }
  return {topic, message}
}
