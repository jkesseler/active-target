Please not this is outdated

# MQTT Topics

Resources:
- [MQTT Topic Trees](https://raspberry-valley.azurewebsites.net/MQTT-Topic-Trees/)
- [Test Client](https://testclient-cloud.mqtt.cool)
In general topics trees are generic -> specific

Topic: `at/device-category/device-id/payload-context/[payload-differentiator]`
Message:
```
{
  "type": "",
  "payload": {
    "timestamp": {timestamp},
    "timeMillies": {getTimeMillies},
    "deviceId: "",
    "deviceType: "",
    "deviceName: "",
  },
}
```

## Device category
- controller, controls the system
- target
- sensor

The message payload may define an additional device type, for example:
- `target/plate`
- `target/bullseye`
- `target/ipsc-popper`
- `target/ipsc-mini-popper`

- `sensor/button`
- `sensor/pressure-plate`
- `sensor/light-gate`

Device types are used by the controller to execute the correct functions


## Device id
The UUID of the sending device

## Payload Context
- status (online, offline, error)
- state (ready, sleeping, ...)
- get (a value)
- set (a value)

## Payload Differentiator
This field is optional and depends on application / or part of application. It is used for differentiating measurements or messages of the same type. For instance you might want to use 'Front' and 'Back' for adding a level of mesurement for a given context.


## Examples:
### A target comes online and publishes this message:
`at/target/77981e7d-d799-4442-a16d-35dd8e261bfe/status/online`
The controller is subscribed to `target/+/status/online` and thus knows a device has come online;


## Messages
### Target comes online
- On connect it sets the Last Will `at/target/77981e7d-d799-4442-a16d-35dd8e261bfe/status/dead`
- Keep Alive is 10 seconds
- it publishes `at/target/77981e7d-d799-4442-a16d-35dd8e261bfe/status/online`
  The controller add the target to a list on know targets if it does not exist yet

```
topic:
`at/target/77981e7d-d799-4442-a16d-35dd8e261bfe/actions`
message:
{
  "type": "targets/addTarget",
  "payload": {
    "timestamp": "2023-07-14T08:33:08.728Z"
    "timeMillies": "112254",
    "deviceId": "77981e7d-d799-4442-a16d-35dd8e261bfe",
    "deviceType": "plate",
  }
}
```

### A target is hit
topic: `at/target/77981e7d-d799-4442-a16d-35dd8e261bfe/actions`

message: 
```
{
  "type": "results/addResult",
  "payload": {
    "timestamp": "2023-07-14T08:33:08.728Z"
    "timeMillies": "112254",
    "deviceId": "77981e7d-d799-4442-a16d-35dd8e261bfe",
    "deviceType": "plate",
    "result": "hit"
  }
}

```


## Server specific messages
These are handled by Node-Red and can execute commands on server
Control messages are always on `/at/ActiveTargetGateway/cmd`

## Shutdown or reboot
```
topic:
`at/ActiveTargetGateway/cmd`
message:
{
  "payload": {
    "command": "shutdown" // "reboot"
  }
}
```