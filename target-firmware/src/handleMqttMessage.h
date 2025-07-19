#include <Arduino.h>
#include <ArduinoJson.h>

#ifndef HANDLE_MQTT_H
#define HANDLE_MQTT_H

/**
 * @brief Handle incoming MQTT messages
 * @param jsonString The JSON message string
 */
void handleMqttMessage(const String &jsonString);

/**
 * @brief Handle settings set messages
 * @param doc The JSON document containing settings
 */
void handleSettingsSet(const JsonDocument& doc);

/**
 * @brief Handle settings get messages
 * @param doc The JSON document containing the request
 */
void handleSettingsGet(const JsonDocument& doc);

#endif
