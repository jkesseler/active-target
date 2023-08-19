#include "handleMqttMessage.h"
#include "settings.h"
#include <Arduino.h>
#include <ArduinoJson.h>

void handleMqttMessage(const String &jsonString) {
  DynamicJsonDocument doc(256);
  DeserializationError error = deserializeJson(doc, jsonString);

  // Error handling
  if (error) {
    Serial.print(F("deserializeJson() failed: "));
    Serial.println(error.f_str());
    return;
  }

  const char *actionType = doc["type"]; // This returns a pointer, avoiding String conversion
  if (strcmp(actionType, "settings/set") == 0) {
    handleSetSettings(doc);
  }
}

void handleSetSettings(const DynamicJsonDocument &doc) {
  // TODO:
  
  const char *deviceName = doc["payload"]["deviceName"];
  if (deviceName != nullptr) {
    settings.set("deviceName", deviceName);
  }

  if (doc["payload"].containsKey("sensorDebounceTime")) {
    int sensorDebounceTime = doc["payload"]["sensorDebounceTime"];
    settings.set("sensorDebounceTime", sensorDebounceTime);
  }

  if (doc["payload"].containsKey("sensorThreshold")) {
    int sensorThreshold = doc["payload"]["sensorThreshold"];
    settings.set("sensorThreshold", sensorThreshold);
  }
}
