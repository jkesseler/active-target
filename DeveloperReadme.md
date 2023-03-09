# Developer Guide

ESP32 != NodeJS, So the clientside (NextJS) cannot use NodeJS ssr functionality.
A static export of the app is served from the Basestation. The heavylifting is done on the device running the app.


# Messaging
## General format
Message are based on [Flux Standard Action](https://github.com/redux-utilities/flux-standard-action). With the addition of a "systemId" field. FSA is widely used and makes it easy to have a single message format. The "systemId" field is added because LoRa does not provide a simple addressing scheme. Message without a matching "systemId" are ignored. The value for "systemId" is shared between all nodes in the system. This is set via a the file 'system-id' on the root of an SD card inserted in a node.


```
{
  "systemId": {uuid},
  "meta": {
    "orginator": {originatorMACAddress},
  },
  "type": string;
  "payload: {}
}
```



## Target Add message

When the target first starts up it's intial state is 'connecting to base station'
Basically the target spams the basestation with this message until it revieved and 'acknowlede' message
### From target to basestation
`{
  "systemId": {uuid},
  "type": "target/add-to-basestation",
  "meta": {
    "orginator": {targetMACAddress},
  },
  "payload": {
    "targetId": {targetMACAdress},
    "timestamp": {timestamp}
  }
}`

### Target Add Ack (from basestation to target)
`{
  "systemId": {uuid},
  "type": "basestation/target-added",
  "meta": {
    "orginator": {basestationMACAddress},
  },
  "payload": {
    "targetId": {targetMACAdress},
    "timestamp": {timestamp}
  }
}`

## Target Hit message (from target to basestation)
`{
  "systemId": {uuid},
  "type": "target/record-hit",
  "meta": {
    "orginator": {targetMACAddress},
  },
  "payload": {
    timestamp: {timestamp}
  }
}`

# Target Testing
The basestation can send a message to target to enter 'test mode'. The targets start flashing a light to indicate connectivity; They keep flashing till until the 'test stop' message is recieved.

## Test all targets start
`{
  "systemId": {uuid},
  "type": "basestation/test-all-targets-start",
  "meta": {
    "orginator": {targetMACAddress},
  },
  "payload": {
    "timestamp": {timestamp}
  }
}`

## Test all targets end
`{
  "systemId": {uuid},
  "type": "basestation/test-all-targets-end",
  "meta": {
    "orginator": {basestationMACAddress},
  },
  "payload": {
    "timestamp": {timestamp}
  }
}`

## Test single target start
`{
  "systemId": {uuid},
  "type": "basestation/test-target-start",
  "meta": {
    "orginator": {basestationMACAddress},
  },
  "payload": {
    "targetId": {targetMACAdress},
    "timestamp": {timestamp}
  }
}`

## Test single target start
`{
  "systemId": {uuid},
  "type": "basestation/test-target-end",
  "meta": {
    "orginator": {basestationMACAddress},
  },
  "payload": {
    "targetId": {targetMACAdress},
    "timestamp": {timestamp}
  }
}`