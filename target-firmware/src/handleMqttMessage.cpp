// file: handleMqttMessage.cpp
#include "handleMqttMessage.h"
#include "settings.h"
#include <Arduino.h>
#include <ArduinoJson.h>

void handleSetSettingsMessage(String jsonString) {
  DynamicJsonDocument tmpJsonDoc(256);
  DeserializationError error = deserializeJson(tmpJsonDoc, jsonString);

  if (error) {
    Serial.print(F("deserializeJson() failed: "));
    Serial.println(error.f_str());
    return;
  }
    
  String deviceName = tmpJsonDoc["payload"]["deviceName"];
  if(deviceName) {
    settings.set("deviceName", deviceName);
  }

  int sensorDebounceTime = tmpJsonDoc["payload"]["sensorDebounceTime"];
  if (sensorDebounceTime) {
    settings.set("sensorDebounceTime", sensorDebounceTime);
  }

  int sensorThreshold = tmpJsonDoc["payload"]["sensorThreshold"];
  if (sensorThreshold) {
    settings.set("sensorThreshold", sensorThreshold);
  }
}
