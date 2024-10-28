# Issues
[x] Setting won't update from mqtt. It seems the string comaprison "settings/set" always returns false.

# Hardware to do
[] Packaging / housing with battery and on/off switch
[] LED's for status indication
[] Add buzzer to RPI to indicate round start

# Firmware To do
[] Time Sync via local NTP server [(Pi syncs GPS, ESP32's sync from Pi)](https://blog.networkprofile.org/gps-backed-local-ntp-server/)
   [x] Update firmware to use RPI as NTP server
   [] Install NTP server on RPI
[] Automatic shutdown on low voltage and letting the the controller know by sending a MQTT message
[x] Multiple hitzones
[] Easy WiFi provisioning with [WiFi Manager](https://dronebotworkshop.com/wifimanager/)

# RPI Server To do
[] [stratum-1 NTP Server](https://blog.networkprofile.org/gps-backed-local-ntp-server/)
  [] Add a [GT-U7 GPS module]

# App To Do
[] Multiple Stages
[] Move away from NextJS as SSR is irrelevant for this usecase. 
   React-Native might be a solution
[] Multiple users
[] IPSC score sheet per user
[] Button trigger to start the stage (button press makes beep and starts timer)
[] Set one target as 'end' stage plate

# Next version
[] target zones for IPSC competition
[] Major / minor scoring per zone
[] Hit factor
[] Research ESP-NOW
   The controller would be split in to a 'Time keeper' and 'User screen'(an app);
   Time Keeper essentially replaces the MQTT server on the RPI.
   Targets just send their hitzone when hit, Time Keeper keeps a record of hits.
   Comms between targets and Time Keeper via ESP-NOW. 
   Comms between Time Keeper and 'User Screen' via MQTT
   [Example](https://randomnerdtutorials.com/esp32-esp-now-wi-fi-web-server/)