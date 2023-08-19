// file: handleMqttMessage.h
#include "settings.h"
#include <Arduino.h>
#include <ArduinoJson.h>

#ifndef HANDLE_MQTT_H
#define HANDLE_MQTT_H

void handleMqttMessage(String jsonString);
void handleSetSettings(DynamicJsonDocument doc);

#endif