#include "settings.h"
#include <Arduino.h>
#include <ArduinoJson.h>

#ifndef HANDLE_MQTT_H
#define HANDLE_MQTT_H

void handleMqttMessage(const String &jsonString);
void handleSetSettings(const DynamicJsonDocument &doc);

#endif
