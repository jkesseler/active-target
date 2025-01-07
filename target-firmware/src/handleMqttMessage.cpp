#include "common.h"
#include "actions.h"
#include "handleMqttMessage.h"
#include "settings.h"
#include <Arduino.h>
#include <ArduinoJson.h>

void handleMqttMessage(const String &jsonString) {
  Settings settings;
  DynamicJsonDocument doc(768);
  DeserializationError error = deserializeJson(doc, jsonString);

  if (error) {
    Serial.print(F("deserializeJson() failed: "));
    Serial.println(error.f_str());
    return;
  }
  // TODO: Handle 'DEVICE/ACTUATOR' messages

  // Handle Settings
  const char* action = doc["action"];
  if (strcmp(action, ACTION_SETTINGS_SET) == 0) {
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

    String updateTargetMessage = jsonMessages.createDeviceUpdatedMessage();
    mqttClient.publish(mqttResponseTopic, updateTargetMessage.c_str());
  }

  if (strcmp(action, ACTION_SETTINGS_GET) == 0) {
    const char *settingName = doc["payload"]["setting"];
    if (settingName) {
      settings.getString(settingName);
      Serial.println(deviceName);
      // TODO: Reply with correct mqtt message
    }

    // TODO: If no setting name is given, send every thing as a json blob
  }
  
}