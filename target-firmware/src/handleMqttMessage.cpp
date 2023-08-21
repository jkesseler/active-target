#include "handleMqttMessage.h"
#include "settings.h"
#include <Arduino.h>
#include <ArduinoJson.h>

void handleMqttMessage(const String &jsonString) {
  DynamicJsonDocument doc(256);
  DeserializationError error = deserializeJson(doc, jsonString);

  if (error) {
    Serial.print(F("deserializeJson() failed: "));
    Serial.println(error.f_str());
    return;
  }

  const char *actionType = doc["type"];
  if (strcmp(actionType, "settings/set") == 0) {
    handleSetSettings(doc);
  }
}

void handleSetSettings(const DynamicJsonDocument &doc) {
  const char *deviceName = doc["payload"]["deviceName"];
  if (deviceName != nullptr) {
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

  // TODO: Publish 'settings updated' message
  // String updateTargetMessage = jsonMessages.createDeviceUpdatedMessage();
  // client.publish(mqttTopic, updateTargetMessage.c_str());
}
