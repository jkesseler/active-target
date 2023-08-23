#ifndef DeviceId_h
#define DeviceId_h

#define STORAGE_NAMESPACE "settings" // Max. 15 chars
#define STORAGE_KEY "deviceId"

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