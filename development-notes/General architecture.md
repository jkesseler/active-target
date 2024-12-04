## 1.MQTT Topics Structure

<!-- Based on https://chatgpt.com/share/6745c142-6fc4-8001-9359-edf263266b10 -->

Define a hierarchical MQTT topic structure to enable scoped and flexible communication.
`devices/{UUID}/status`: For status updates from a device.
`devices/{UUID}/command`: For issuing commands to a device.
`devices/{UUID}/response`: For responses to commands.
`broadcast`: For messages intended for all devices.


## 2. Actions (messages)
Example message:
```json
{
  "type": "DEVICE_ONLINE",
  "meta": {
    "uuid": "123e4567-e89b-12d3-a456-426614174000",
    "timestamp": "2024-11-26T15:30:00Z",
    "timeMillis": "1696735807123",
  },
  "payload": {
  }
}
```
Other action types might include `COMMAND_RECEIVED`, `UPDATE_STATE`, `BROADCAST_MESSAGE`, etc.


## 3. Centralized Dispatcher
The server acts as the dispatcher:
- Listens to all MQTT topics (#).
- Parses incoming messages and determines the appropriate action (e.g., update the store, relay commands, etc.).
- Publishes updates to the appropriate MQTT topics.


## 4. Store (App State)

'shooters' slice 
```json
{
  "shooters": {
    "<shooter-A-UUID>": {
      "firstName": "John",
      "lastName": "Doe"
    },
    {
      "<shooter-B-UUID>": {
      "firstName": "Jane",
      "lastName": "Fonda"
    }
  }
}

```

'targets' slice
```json
{
  "targets": {
    "<target-01-UUID>": {
      "status": "online",
      "lastUpdated": "2024-11-26T15:30:00Z",
      "currentCommand": "",
      "responses": []
    },
    "<target-02-UUID>": {
      "status": "offline",
      "lastUpdated": "2024-11-26T15:00:00Z"
    }
  }
}
```


'matches' slice
```json
{
  "matchId": "001",
  "shooters": {
    "<shooter-A-UUID>": {
      "hits": {
        "<target-01-UUID>": [
          { "zone": "A", "timestamp": "2024-11-26T15:30:00Z" },
          { "zone": "D", "timestamp": "2024-11-26T15:30:50Z" },
          { "zone": "C", "timestamp": "2024-11-26T15:31:10Z" },
          { "zone": "A", "timestamp": "2024-11-26T15:31:20Z" }
        ],
        "<target-02-UUID>": [
          { 
           {"zone": "D", "timestamp": "2024-11-26T15:31:00Z"},
           {"zone": "C", "timestamp": "2024-11-26T15:31:00Z"},
           {"zone": "C", "timestamp": "2024-11-26T15:31:00Z"},
           {"zone": "C", "timestamp": "2024-11-26T15:31:00Z"}
        ]
      }
    },
    "<shooter-B-UUID>": {
      "hits": {
        "<target-01-UUID>": [
          { "zone": "A", "timestamp": "2024-11-26T15:30:00Z" },
          { "zone": "D", "timestamp": "2024-11-26T15:30:50Z" },
          { "zone": "C", "timestamp": "2024-11-26T15:31:10Z" },
          { "zone": "A", "timestamp": "2024-11-26T15:31:20Z" }
        ],
        "<target-02-UUID>": [
           {"zone": "D", "timestamp": "2024-11-26T15:31:00Z"},
           {"zone": "C", "timestamp": "2024-11-26T15:31:00Z"},
           {"zone": "C", "timestamp": "2024-11-26T15:31:00Z"},
           {"zone": "C", "timestamp": "2024-11-26T15:31:00Z"}
        ]
      },
    }
  }
}

```





# Diagram
```sql
+-------------------+         +--------------------+         +---------------------+
|                   |         |                    |         |                     |
| Target Device A   |         | Central Server     |         | Display App         |
| (ESP32)           |         | (Store & Dispatcher)|        | (Scoreboard)        |
|                   |         |                    |         |                     |
+-------------------+         +--------------------+         +---------------------+
         |                              |                              |
         | HIT Action                   |                              |
         |----------------------------->|                              |
         | `targets/targetA`            |                              |
         |                              | Associates HIT with Shooter  |
         |                              |                              |
         |                              | Publishes Score Update       |
         |                              |----------------------------->|
         |                              |  `match/001/scorecard`       | // TODO: Fix
         |                              |                              |
         |                              |                              |
         |                              |                              |
         | <---------------------------------------------------------- |
         |    Subscribed to Updates                                    |
         |                                                             |
+-------------------+         +--------------------+         +---------------------+

```