# Example messages

Server publishes on topic `at/device/${deviceId}/actions`
Devices listen on topic: `at/device/${deviceId}/actions`
where `deviceId` is the id of a target.


# Device turns on and comes online
Topic: `at/devices/online`
```json
{
  "meta": {
    "timestamp": "2023-07-14T08:33:08.728Z",
    "timeMillis": "1696735807123",
    "deviceId": "f64c9bee-83db-4435-9325-bd57fa986753"
  },
  "type": "devices/add",
  "payload": {
    "deviceName": "Plate 01",
    "deviceType": "target/plate",
  }
}
```


# Log Hits
```json
{
  "meta": {
    "timestamp": "2023-07-14T08:33:08.728Z",
    "timeMillis": "1696735807123",
    "deviceId": "f64c9bee-83db-4435-9325-bd57fa986753"
  },
  "type": "stage/hit",
  "payload": {
    "deviceType": "target/plate"
  }
}
```

```json
{
  "meta": {
    "timestamp": "2023-07-14T08:33:08.728Z",
    "timeMillis": "1696735807123",
    "deviceId": "f64c9bee-83db-4435-9325-bd57fa986753"
  },
  "type": "stage/hit",
  "payload": {
    "deviceType": "target/standard",
    "targetZone": "A" // "B" | "C"
  }
}
```


## Stage messages
Published on `at/devices/*`

Tells all devices in the stage the start beep has been given.
```json
{
  "meta": {
    "timestamp": "2023-07-14T08:33:08.728Z",
    "timeMillis": "1696735807123",
    "deviceId": "f64c9bee-83db-4435-9325-bd57fa986753"
  },
  "type": "stages/start"
}
```

Tells all devices in the stage is finished. This message is send by shooting the 'end' plate
```json
{
  "meta": {
    "timestamp": "2023-07-14T08:33:08.728Z",
    "timeMillis": "1696735807123",
    "deviceId": "f64c9bee-83db-4435-9325-bd57fa986753"
  },
  "type": "stage/end"
}
```

Tells all devices in the stage to reset to their default state.
Triggered by pushing the reset button on screen.
```json
{
  "meta": {
    "timestamp": "2023-07-14T08:33:08.728Z",
    "timeMillis": "1696735807123",
    "deviceId": "f64c9bee-83db-4435-9325-bd57fa986753"
  },
  "type": "stages/reset"
}
```


# Get or set device settings
Used by the 'Settings' screen for individual devices.
## Get settings from a device
Server publishes the follwing message on topic: `at/device/${deviceId}/action`

```json
{
  "meta": {
    "timestamp": "2023-07-14T08:33:08.728Z",
    "timeMillis": "1696735807123",
    "deviceId": "f64c9bee-83db-4435-9325-bd57fa986753"
  },
  "type": "settings/get",
}
```

Device publishes the following message on topic: `at/devices/settings`
```json
{
  "meta": {
    "timestamp": "2023-07-14T08:33:08.728Z",
    "timeMillis": "1696735807123",
    "deviceId": "f64c9bee-83db-4435-9325-bd57fa986753"
  },
  "type": "settings/get",
  "payload": {
    "sensorDebounceTime": 85,
    "deviceName": "My target plate",
    "deviceType": "target/plate",
    "sensorThreshold": 100
  }
}
```



```json
{
  "meta": {
    "timestamp": "2023-07-14T08:33:08.728Z",
    "timeMillis": "1696735807123",
    "deviceId": "f64c9bee-83db-4435-9325-bd57fa986753"
  },
  "type": "settings/set",
  "payload": {
    "sensorDebounceTime": 85
  }
}


{
  "meta": {
    "timestamp": "2023-07-14T08:33:08.728Z",
    "timeMillis": "1696735807123",
    "deviceId": "f64c9bee-83db-4435-9325-bd57fa986753"
  },
  "type": "settings/set",
  "payload": {
    "deviceName": "My target plate"
  }
}

{
  "meta": {
    "timestamp": "2023-07-14T08:33:08.728Z",
    "timeMillis": "1696735807123",
    "deviceId": "f64c9bee-83db-4435-9325-bd57fa986753"
  },
  "type": "settings/set",
  "payload": {
    "sensorThreshold": 100
  }
}

```