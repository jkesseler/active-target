# Real-Time Score Update Workflow


# Architecture
Components:

    1. Target Devices (ESP32)
        Only detect hits and publish HIT events with the hit zone and timestamp.
        Topics:
        `targets/{target-UUID}/hit`

    2. Central Server (Raspberry Pi MQTT Broker)
        Acts as the MQTT broker and facilitates communication.
        Does not perform any processing but routes messages between devices.

    3. Display Device
        Subscribed to all HIT topics.
        Maintains shooter IDs, assigns hits to the current shooter, calculates scores, and publishes aggregated results.
        Generates messages for the display app.

    4. Display App
        Subscribed to score updates and shooter status topics.
        Displays the aggregated results in real-time.




# Data Flow 
In a active match a shooter hits 'Target 01' on Zone 'B'

## 1. The target devices publises hits:
```json
{
  "type": "targets/HIT",
  "meta": { 
    "uuid": "<target-UUID>",
    "timestamp": "2024-11-26T15:30:00Z",
    "timeMillis": "1696735807123",
  },
  "payload": {
    "zone": "A"
  }
}

```


## 2. Central Server (Score Aggregation and Shooter Management): 
    - Maintains the state of the match, including:
    - Current shooter.
    - Hit records for all shooters.
    - Aggregated scores.

  - Processes HIT from the MQTT message in (#1)
    - Persists hit data in database for record keeping
    - Updates the shooter's scorecard and publishes it to the Display App (send the entire state object via websockets or have the Display listen to MQTT topics?)

## 3. The Display app updates the onscreen score card

```js
const nextMatchState = {
  ...matchState,
  [shooterUUID]: {
    ...matchState[shooterUUD],
    hits: [......matchState[shooterUUD].hits, { zone: payload.zone, timestamp: payload.timestamp }]
  }
}
```