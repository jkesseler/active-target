# Topic

at/device/77981e7d-d799-4442-a16d-35dd8e261bfe/actions

# Add Target
{
  "meta": {
    "timestamp": "2023-07-14T08:33:08.728Z"
  },
  "type": "targets/addTarget",
  "payload": {
    "targetId": "77981e7d-d799-4442-a16d-35dd8e261bfe"
  }
}

# Update TargetName
{
  "meta": {
    "timestamp": "2023-07-14T08:33:08.728Z"
  },
  "type": "targets/updateTarget",
  "payload": {
    "targetId": "77981e7d-d799-4442-a16d-35dd8e261bfe",
    "targetName": "Plate 01"
  }
}



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


{
  "meta": {
    "timestamp": "2023-07-14T08:33:08.728Z"
  },
  "type": "settings/set",
  "payload": {
    "sensorDebounceTime": 250
  }
}