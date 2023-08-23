#include <vector>
#include <Preferences.h>
#include <WiFi.h>
#include "DeviceId.h"
#include "ESPRandom.h"
#include "include.h"

Preferences prefs;

DeviceId::DeviceId() {
  this->deviceId = readFromFlash();

  if(this->deviceId == EMPTY_UUID) {
    this->deviceId = generateId();
    writeToFlash();
  }
}

String DeviceId::get() {
  if(this->deviceId == EMPTY_UUID) {
    this->deviceId = generateId();
  }

  return this->deviceId;
}

String DeviceId::generateId() {
  std::vector<uint8_t> uuid_vector = ESPRandom::uuid4();
  return ESPRandom::uuidToString(uuid_vector);
}

String DeviceId::readFromFlash() {
  String deviceIdOnFlash;
  prefs.begin(STORAGE_NAMESPACE, true);
  deviceIdOnFlash = prefs.getString(STORAGE_KEY, EMPTY_UUID);
  prefs.end();
  return deviceIdOnFlash;
}

void DeviceId::writeToFlash() {
  prefs.begin(STORAGE_NAMESPACE, false);
  prefs.putString(STORAGE_KEY, this->deviceId);
  prefs.end();
}

void DeviceId::reset() {
  prefs.begin(STORAGE_NAMESPACE, false);
  prefs.clear();
  prefs.end();
  this->deviceId = EMPTY_UUID;
}