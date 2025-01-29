import { Device } from './types';

const mockDevices: Device[] = [
  {
    id: '1e7b7c8e-1c2b-4d3a-8e2b-1c2b4d3a8e2b',
    name: 'Device 1',
    type: 'TARGET',
    status: 'online',
    lastUpdated: '2023-10-10T10:00:00.000Z',
    responses: ['Response 1', 'Response 2'],
    sideEffects: []
  },
  {
    id: '2e7b7c8e-1c2b-4d3a-8e2b-1c2b4d3a8e2b',
    name: 'Device 2',
    type: 'POPPER',
    status: 'offline',
    lastUpdated: '2023-10-10T10:00:10.000Z',
    responses: ['Response 3'],
    sideEffects: []
  },
  {
    id: '3e7b7c8e-1c2b-4d3a-8e2b-1c2b4d3a8e2b',
    name: 'Device 3',
    type: 'NOSHOOT',
    status: 'online',
    lastUpdated: '2023-10-10T10:00:20.000Z',
    responses: ['Response 4', 'Response 5'],
    sideEffects: []
  },
  {
    id: '4e7b7c8e-1c2b-4d3a-8e2b-1c2b4d3a8e2b',
    name: 'Device 4',
    type: 'TARGET',
    status: 'offline',
    lastUpdated: '2023-10-10T10:00:30.000Z',
    responses: ['Response 6'],
    sideEffects: []
  },
  {
    id: '5e7b7c8e-1c2b-4d3a-8e2b-1c2b4d3a8e2b',
    name: 'Device 5',
    type: 'POPPER',
    status: 'online',
    lastUpdated: '2023-10-10T10:00:40.000Z',
    responses: ['Response 7', 'Response 8'],
    sideEffects: []
  },
  {
    id: '6e7b7c8e-1c2b-4d3a-8e2b-1c2b4d3a8e2b',
    name: 'Device 6',
    type: 'ACTUATOR',
    status: 'offline',
    lastUpdated: '2023-10-10T10:00:50.000Z',
    responses: ['Response 9'],
    sideEffects: []
  },
  {
    id: '7e7b7c8e-1c2b-4d3a-8e2b-1c2b4d3a8e2b',
    name: 'Device 7',
    type: 'TARGET',
    status: 'online',
    lastUpdated: '2023-10-10T10:01:00.000Z',
    responses: ['Response 10', 'Response 11'],
    sideEffects: []
  },
  {
    id: '8e7b7c8e-1c2b-4d3a-8e2b-1c2b4d3a8e2b',
    name: 'Device 8',
    type: 'POPPER',
    status: 'offline',
    lastUpdated: '2023-10-10T10:01:10.000Z',
    responses: ['Response 12'],
    sideEffects: []
  }
];

export default mockDevices;
