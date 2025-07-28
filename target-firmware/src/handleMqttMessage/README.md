# Example messages

## Stage messages

### HIT

A target is hit on zone B
```json
{
  "meta": {
    "id": "1e65b2bb-45ab-4dae-b59d-46e3bcb6034c",
    "timeMillies": "1753085651848",
    "timestamp": "2025-07-21T08:14:11.848Z",
    "deviceRole": "TARGET"
  },
  "type": "EVENT/HIT",
  "payload": {
    "targetZone": "B"
  }
}

```

A stop plate is hit, signaling the end of a stage.
```json
{
  "meta": {
    "id": "1e65b2bb-45ab-4dae-b59d-46e3bcb6034c",
    "timeMillies": "1753085651848",
    "timestamp": "2025-07-21T08:14:11.848Z",
    "deviceRole": "STOP_PLATE"
  },
  "type": "EVENT/HIT",
  "payload": {
    "targetZone": "STOP_PLATE"
  }
}

```
