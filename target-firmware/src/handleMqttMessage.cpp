#include "common.h"
#include "action_types.h"
#include "handleMqttMessage.h"
#include "settings.h"
#include "error_handler.h"
#include "json_pool.h"
#include "string_builder.h"
#include <Arduino.h>
#include <ArduinoJson.h>

void handleMqttMessage(const String &jsonString) {
    if (jsonString.isEmpty()) {
        LOG_ERROR(ErrorHandler::Category::MQTT, 3101, "Empty JSON string received");
        return;
    }

    // Estimate document size needed based on input size
    JsonDocumentPool::DocumentSize size = (jsonString.length() < 200) ?
        JsonDocumentPool::SMALL :
        (jsonString.length() < 400) ? JsonDocumentPool::MEDIUM : JsonDocumentPool::LARGE;

    auto docGuard = JsonDocumentPool::getInstance().acquireGuarded<768>(size);
    if (!docGuard.isValid()) {
        LOG_ERROR(ErrorHandler::Category::MQTT, 3100, "Failed to acquire JSON document from pool");
        return;
    }

    StaticJsonDocument<768>& doc = *docGuard;
    DeserializationError error = deserializeJson(doc, jsonString);

    if (error) {
        MEDIUM_STRING() errorMsg;
        errorMsg.append("JSON deserialization failed: ");
        errorMsg.append(error.f_str());
        LOG_ERROR(ErrorHandler::Category::MQTT, 3102, errorMsg.c_str());
        return;
    }

    // Validate action field
    if (!doc.containsKey("type")) {
      LOG_ERROR(ErrorHandler::Category::MQTT, 3103, "Missing 'type' field in JSON message");
      return;
    }

    const char *action = doc["type"];
    if (!action) {
      LOG_ERROR(ErrorHandler::Category::MQTT, 3104, "Invalid 'actiotypen' field in JSON message");
      return;
    }

    MEDIUM_STRING() actionMsg;
    actionMsg.append("Processing action: ").append(action);
    LOG_INFO(ErrorHandler::Category::MQTT, 0, actionMsg.toString());

    // Handle different actions
    if (strcmp(action, SETTINGS_SET) == 0) {
        handleSettingsSet(doc);
    } else if (strcmp(action, SETTINGS_GET) == 0) {
        handleSettingsGet(doc);
    } else {
        MEDIUM_STRING() unknownMsg;
        unknownMsg.append("Unknown action: ").append(action);
        LOG_WARNING(ErrorHandler::Category::MQTT, 3105, unknownMsg.toString());
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
            MEDIUM_STRING() updateMsg;
            updateMsg.append("Updated device name to: ").append(deviceName);
            LOG_INFO(ErrorHandler::Category::SETTINGS, 0, updateMsg.toString());
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
                MEDIUM_STRING() updateMsg;
                updateMsg.append("Updated sensor debounce time to: ").append(sensorDebounceTime);
                LOG_INFO(ErrorHandler::Category::SETTINGS, 0, updateMsg.toString());
                settingsUpdated = true;
            } else {
                MEDIUM_STRING() errorMsg;
                errorMsg.append("Invalid sensor debounce time value: ").append(sensorDebounceTime);
                LOG_WARNING(ErrorHandler::Category::SETTINGS, 4102, errorMsg.toString());
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
                MEDIUM_STRING() updateMsg;
                updateMsg.append("Updated sensor threshold to: ").append(sensorThreshold);
                LOG_INFO(ErrorHandler::Category::SETTINGS, 0, updateMsg.toString());
                settingsUpdated = true;
            } else {
                MEDIUM_STRING() errorMsg;
                errorMsg.append("Invalid sensor threshold value: ").append(sensorThreshold);
                LOG_WARNING(ErrorHandler::Category::SETTINGS, 4103, errorMsg.toString());
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
            MEDIUM_STRING() retrieveMsg;
            retrieveMsg.append("Retrieved setting ").append(settingName).append(": ").append(settingValue.c_str());
            LOG_INFO(ErrorHandler::Category::SETTINGS, 0, retrieveMsg.toString());

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