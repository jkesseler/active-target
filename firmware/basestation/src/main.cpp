#include <Arduino.h>
#include "SystemId.h"

String uuid = "00000000-0000-0000-0000-000000000000";

void setup() {
  Serial.begin(115200);
  while (!Serial);

  SystemId systemId;
  uuid = systemId.get();
}


void loop() {
  Serial.print("System ID: ");
  Serial.print(uuid);
  delay(2500);
}