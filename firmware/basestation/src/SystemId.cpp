#include "SystemId.h"
#include <Preferences.h>

Preferences prefs;

SystemId::SystemId() {
  this->systemId = readFromFlash();

  if(this->systemId == EMPTY_SYSTEM_ID) {
    this->systemId = generateId();
    writeToFlash();
  }
}

String SystemId::get() {
  if(this->systemId == EMPTY_SYSTEM_ID) {
    this->systemId = generateId();
  }

  return this->systemId;
}

String SystemId::generateId() {
  std::vector<uint8_t> uuid_vector = ESPRandom::uuid4();
  return ESPRandom::uuidToString(uuid_vector);
}

String SystemId::readFromFlash() {
  String systemIdOnFlash;
  prefs.begin(STORAGE_NAMESPACE, true);
  systemIdOnFlash = prefs.getString(STORAGE_KEY, EMPTY_SYSTEM_ID);
  prefs.end();
  return systemIdOnFlash;
}

void SystemId::writeToFlash() {
  prefs.begin(STORAGE_NAMESPACE, false);
  prefs.putString(STORAGE_KEY, this->systemId);
  prefs.end();
}