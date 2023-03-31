#ifndef SystemId_h
#define SystemId_h

#include "Arduino.h"
#include "ESPRandom.h"
#include "constants.h"

const String EMPTY_SYSTEM_ID = "00000000-0000-0000-0000-000000000000";

class SystemId {
public:
  SystemId();
  String get();

private:
  String systemId;
  String generateId();
  String readFromFlash();
  void writeToFlash();
};

#endif