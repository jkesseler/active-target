#ifndef DeviceId_h
#define DeviceId_h

#include <WiFi.h>

class DeviceId {
public:
  DeviceId();
  String get();

private:
  String deviceId;
  String generateId();
  String readFromFlash();
  void writeToFlash();
  void reset();
};

#endif