// file: handleMqttMessage.cpp
#include "handleMqttMessage.h"
#include "settings.h"
#include <Arduino.h>
#include <ArduinoJson.h>

void handleMqttMessage(String jsonString) {
  DynamicJsonDocument doc(256);
  DeserializationError error = deserializeJson(doc, jsonString);
  
  // TODO: error handling
  if (error) {
    Serial.print(F("deserializeJson() failed: "));
    Serial.println(error.f_str());
    return;
  }

  String actionType = doc["type"];
  if (actionType == "settings/set") {
    handleSetSettings(doc);
  }
}

void handleSetSettings(DynamicJsonDocument doc) {    
  String deviceName = doc["payload"]["deviceName"];
  if(deviceName) {
    settings.set("deviceName", deviceName);
  }

  int sensorDebounceTime = doc["payload"]["sensorDebounceTime"];
  if (sensorDebounceTime) {
    settings.set("sensorDebounceTime", sensorDebounceTime);
  }

  int sensorThreshold = doc["payload"]["sensorThreshold"];
  if (sensorThreshold) {
    settings.set("sensorThreshold", sensorThreshold);
  }
}
