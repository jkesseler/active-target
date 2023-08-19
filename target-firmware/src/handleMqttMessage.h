// file: handleMqttMessage.h
#include "settings.h"
#include <Arduino.h>

#ifndef HANDLE_MQTT_H
#define HANDLE_MQTT_H

void handleSetSettingsMessage(String jsonString);

#endif