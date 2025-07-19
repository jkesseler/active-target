#include "common.h"
#include "actions.h"
#include "handleMqttMessage.h"
#include "settings.h"
#include "error_handler.h"
#include <Arduino.h>
#include <ArduinoJson.h>

void handleMqttMessage(const String &jsonString) {
    if (jsonString.isEmpty()) {
        LOG_ERROR(ErrorHandler::Category::MQTT, 3101, "Empty JSON string received");
        return;
    }

    DynamicJsonDocument doc(768);
    DeserializationError error = deserializeJson(doc, jsonString);

    if (error) {
        LOG_ERROR(ErrorHandler::Category::MQTT, 3102,
                  String("JSON deserialization failed: ") + String(error.f_str()));
        return;
    }

    // Validate action field
    if (!doc.containsKey("action")) {
        LOG_ERROR(ErrorHandler::Category::MQTT, 3103, "Missing 'action' field in JSON message");
        return;
    }

    const char* action = doc["action"];
    if (!action) {
        LOG_ERROR(ErrorHandler::Category::MQTT, 3104, "Invalid 'action' field in JSON message");
        return;
    }

    LOG_INFO(ErrorHandler::Category::MQTT, 0, String("Processing action: ") + String(action));

    // Handle different actions
    if (strcmp(action, ACTION_SETTINGS_SET) == 0) {
        handleSettingsSet(doc);
    } else if (strcmp(action, ACTION_SETTINGS_GET) == 0) {
        handleSettingsGet(doc);
    } else {
        LOG_WARNING(ErrorHandler::Category::MQTT, 3105, String("Unknown action: ") + String(action));
    }
}

void handleSettingsSet(const JsonDocument& doc) {
    if (!doc.containsKey("payload")) {
        LOG_ERROR(ErrorHandler::Category::MQTT, 3106, "Missing 'payload' field in settings set message");
        return;
    }

    JsonVariantConst payloadVariant = doc["payload"];
    if (!payloadVariant.is<JsonObject>()) {
        LOG_ERROR(ErrorHandler::Category::MQTT, 3109, "Invalid payload format - expected object");
        return;
    }

    JsonObjectConst payload = payloadVariant.as<JsonObjectConst>();
    bool settingsUpdated = false;

    // Handle device name setting
    if (payload.containsKey("deviceName")) {
        const char* deviceName = payload["deviceName"];
        if (deviceName && strlen(deviceName) > 0) {
            settings.set("deviceName", deviceName);
            LOG_INFO(ErrorHandler::Category::SETTINGS, 0, String("Updated device name to: ") + String(deviceName));
            settingsUpdated = true;
        } else {
            LOG_WARNING(ErrorHandler::Category::SETTINGS, 4101, "Invalid device name value");
        }
    }

    // Handle sensor debounce time setting
    if (payload.containsKey("sensorDebounceTime")) {
        const char* sensorDebounceTime = payload["sensorDebounceTime"];
        if (sensorDebounceTime) {
            int debounceValue = atoi(sensorDebounceTime);
            if (debounceValue >= 10 && debounceValue <= 1000) {
                settings.set("sensorDebounceTime", sensorDebounceTime);
                LOG_INFO(ErrorHandler::Category::SETTINGS, 0,
                         String("Updated sensor debounce time to: ") + String(sensorDebounceTime));
                settingsUpdated = true;
            } else {
                LOG_WARNING(ErrorHandler::Category::SETTINGS, 4102,
                           String("Invalid sensor debounce time value: ") + String(sensorDebounceTime));
            }
        }
    }

    // Handle sensor threshold setting
    if (payload.containsKey("sensorThreshold")) {
        const char* sensorThreshold = payload["sensorThreshold"];
        if (sensorThreshold) {
            int thresholdValue = atoi(sensorThreshold);
            if (thresholdValue >= 100 && thresholdValue <= 2000) {
                settings.set("sensorThreshold", sensorThreshold);
                LOG_INFO(ErrorHandler::Category::SETTINGS, 0,
                         String("Updated sensor threshold to: ") + String(sensorThreshold));
                settingsUpdated = true;
            } else {
                LOG_WARNING(ErrorHandler::Category::SETTINGS, 4103,
                           String("Invalid sensor threshold value: ") + String(sensorThreshold));
            }
        }
    }

    // Send update confirmation if any settings were changed
    if (settingsUpdated) {
        String updateMessage = jsonMessages.createDeviceUpdatedMessage();
        if (mqttClient.publish(mqttResponseTopic, updateMessage.c_str())) {
            LOG_INFO(ErrorHandler::Category::MQTT, 0, "Settings update confirmation sent");
        } else {
            LOG_ERROR(ErrorHandler::Category::MQTT, 3107, "Failed to send settings update confirmation");
        }
    }
}

void handleSettingsGet(const JsonDocument& doc) {
    if (!doc.containsKey("payload")) {
        LOG_ERROR(ErrorHandler::Category::MQTT, 3108, "Missing 'payload' field in settings get message");
        return;
    }

    JsonVariantConst payloadVariant = doc["payload"];
    if (!payloadVariant.is<JsonObject>()) {
        LOG_ERROR(ErrorHandler::Category::MQTT, 3110, "Invalid payload format in get request - expected object");
        return;
    }

    JsonObjectConst payload = payloadVariant.as<JsonObjectConst>();

    if (payload.containsKey("setting")) {
        const char* settingName = payload["setting"];
        if (settingName) {
            String settingValue = settings.getString(settingName);
            LOG_INFO(ErrorHandler::Category::SETTINGS, 0,
                     String("Retrieved setting ") + String(settingName) + ": " + settingValue);

            // TODO: Send setting value back via MQTT
            LOG_INFO(ErrorHandler::Category::SYSTEM, 0, "Settings response implementation pending");
        } else {
            LOG_WARNING(ErrorHandler::Category::SETTINGS, 4104, "Invalid setting name in get request");
        }
    } else {
        // TODO: Send all settings as JSON blob
        LOG_INFO(ErrorHandler::Category::SYSTEM, 0, "Get all settings implementation pending");
    }
}