# Drills
<!-- The can be implemented in node-red, by having it send MQTT messages in a timed queue -->

## Single shot drill
1: Hit start button -> Count down start
2: Countdown 0 -> Drill timer start + Beep sound
  3: Shooter hits target -> Drill timer stops -> 4:A
  3: Shooter does not hit target in alotted time -> Drill Timer stops -> 4:B
4:A -> `drill timer start time - Drill timer stop time = result time`
4:B -> Record Miss

1: In the PWA app hit 'start drill'
  publish  `at/controller/start-drill`
  ```json
  {
    "type": "",
    "payload": {
      "drillType": "singleshot",
      "repeat": 1,
      "timeBetweenReps": "4", // cooldown time in seconds
      "delay": "rnd(2,4)", // time to from final beep till start timer,
      "timeoutTime", 3, // Time after wich a rep is deemed missed
      "player": {
        "id": "{uuid}",
        "name": "{uuid}"
      }
    }
  }
  ```
