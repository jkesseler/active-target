# Topic



# Device turns on and comes online
Topic: `at/devices/online`
```json
{
  "type": "devices/add",
  "payload": {
    "timestamp": "2023-07-14T08:33:08.728Z",
    "timeMillies": "0000001",
    "deviceId": "77981e7d-d799-4442-a16d-35dd8e261bfe",
    "deviceName": "Plate 01",
    "deviceType": "target/plate",
  }
}
```


# Update device settings
Topic: `at/device/77981e7d-d799-4442-a16d-35dd8e261bfe/actions`

```json
{
  "type": "settings/set",
  "payload": {
    "deviceName": "My favorite plate",
    "sensorDebounceTime": 250,
    "sensorThreshold": 500
  }
}
``


# Add Hit
{
  "meta": {
    "timestamp": "2023-07-14T08:33:08.728Z"
  },
  "type": "results/addResult",
  "payload": {
    "targetId": "77981e7d-d799-4442-a16d-35dd8e261bfe",
    "result": "hit"
  }
}

# Reset Results
{
  "meta": {
    "timestamp": "2023-07-14T08:33:08.728Z"
  },
  "type": "results/resetResults"
}


# Update device settings
{
  "meta": {
    "timestamp": "2023-07-14T08:33:08.728Z"
  },
  "type": "settings/set",
  "payload": {
    "sensorDebounceTime": 200
  }
}

{
  "meta": {
    "timestamp": "2023-07-14T08:33:08.728Z"
  },
  "type": "settings/set",
  "payload": {
    "deviceName": "My target plate"
  }
}


{
  "meta": {
    "timestamp": "2023-07-14T08:33:08.728Z"
  },
  "type": "settings/set",
  "payload": {
    "sensorThreshold": 100
  }
}
