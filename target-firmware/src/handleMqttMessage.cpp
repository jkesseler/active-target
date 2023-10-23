#include "handleMqttMessage.h"
#include "settings.h"
#include <Arduino.h>
#include <ArduinoJson.h>

void handleMqttMessage(const String &jsonString) {
  Settings settings;
  DynamicJsonDocument doc(512);
  DeserializationError error = deserializeJson(doc, jsonString);

  if (error) {
    Serial.print(F("deserializeJson() failed: "));
    Serial.println(error.f_str());
    return;
  }
  const char* type = doc["type"];
  if (strcmp(type, "settings/set") == 0) {
    const char* deviceName = doc["payload"]["deviceName"];
    if (deviceName) {
      settings.set("deviceName", deviceName);
      Serial.println(deviceName);
    }

    const char* sensorDebounceTime = doc["payload"]["sensorDebounceTime"];
    if (sensorDebounceTime) {
      settings.set("sensorDebounceTime", sensorDebounceTime);
      Serial.println(sensorDebounceTime);
    }

    const char *sensorThreshold = doc["payload"]["sensorThreshold"];
    if (sensorThreshold) {
      settings.set("sensorThreshold", sensorThreshold);
      Serial.println(sensorThreshold);
    }

    // TODO: Publish 'settings updated' message
    // String updateTargetMessage = jsonMessages.createDeviceUpdatedMessage();
    // client.publish(mqttTopic, updateTargetMessage.c_str());
  }
}
