# States
## `boot` state
LED is flashing orange

Target boots up, check network etc.
publishes message with topic:
```
topic: `/at/target/<target-id>/status`
message: 
{
  "meta": {
    "timestamp": {timestamp},
    "deviceType": "target/plate",
    "deviceId": <device-id>,
  },
  "payload": {
    "status": "online"
  },
}
```

## `idle` state
LED is orange, ready to recieve `set/*` commands, will not do anything if shot.

## `active` state
Target is in active use during a game round.
Triggered by:
```
topic: 
 `/at/target/<target-id>/set`

message:
{
  "meta": {
    "timestamp": {timestamp},
  },
  "payload": {
    "state": "active"
  },
}

```




### `active/hit-me` state
LED is green. Publishes a 'I got hit' message.
This indicates a score in the target.


### `active/cant-hit-me` state 
Target is in active use during a game round.
LED is red. When shot will publish 'You shot the wrong person' message.
This is usefull in simulated hostage scenario's for instance.

## `test`
Target enters `test-mode` and starts flashing a light to indicate connectivity.
Cannot be activated if target is in `active` state.

Possible state transitions:
```
boot->idle
boot->error
idle->active
active->idle
idle->test
test->idle
```