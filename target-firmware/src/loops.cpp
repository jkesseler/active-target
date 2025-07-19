#include "loops.h"
#include "hardware_abstraction.h"
#include "error_handler.h"
#include "common.h"
#include "actions.h"
#include "json_messages.h"
#include <PubSubClient.h>

DeviceLoops::DeviceLoops(HardwareAbstraction* hal, Messages* messages, Settings* settings,
                         PubSubClient* mqttClient, const char* responseTopic)
    : m_hal(hal), m_messages(messages), m_settings(settings),
      m_mqttClient(mqttClient), m_responseTopic(responseTopic),
      m_sensorThreshold(DEFAULT_SENSOR_THRESHOLD), m_sensorDebounce(DEFAULT_SENSOR_DEBOUNCE),
      m_lastSensorThreshold(DEFAULT_SENSOR_THRESHOLD), m_lastSensorDebounce(DEFAULT_SENSOR_DEBOUNCE),
      m_lastDebounceTime(0) {

    if (!m_hal || !m_messages || !m_settings || !m_mqttClient) {
        LOG_CRITICAL(ErrorHandler::Category::SYSTEM, 1001, "DeviceLoops: Invalid dependencies passed to constructor");
    }
}

void DeviceLoops::checkSensor(int pin, const char* targetZone) {
    if (!targetZone) {
        LOG_ERROR(ErrorHandler::Category::SENSOR, 2001, "checkSensor: Invalid target zone");
        return;
    }

    int sensorValue = 0;
    HardwareAbstraction::ErrorCode result = m_hal->readSensor(pin, sensorValue);

    if (result != HardwareAbstraction::ErrorCode::SUCCESS) {
        LOG_ERROR(ErrorHandler::Category::SENSOR, 2002,
                  String("Sensor read failed on pin ") + String(pin) + ": " + m_hal->getErrorDescription(result));
        return;
    }

    unsigned long currentTime = m_hal->getCurrentTime();

    if (sensorValue > m_sensorThreshold && (currentTime - m_lastDebounceTime > m_sensorDebounce)) {
        m_lastDebounceTime = currentTime;
        handleSensorTrigger(targetZone, sensorValue);
    }
}

void DeviceLoops::handleSensorTrigger(const char* targetZone, int sensorValue) {
    LOG_INFO(ErrorHandler::Category::SENSOR, 0,
             String("Sensor triggered on zone ") + String(targetZone) + " with value: " + String(sensorValue));

    // Generate and publish result message for the triggered sensor
    String resultMessage = m_messages->createTargetHitMessage(targetZone);

    if (!m_mqttClient->publish(m_responseTopic, resultMessage.c_str())) {
        LOG_ERROR(ErrorHandler::Category::MQTT, 3001,
                  String("Failed to publish sensor trigger message for zone ") + String(targetZone));
    } else {
        LOG_INFO(ErrorHandler::Category::MQTT, 0,
                 String("Successfully published sensor trigger for zone ") + String(targetZone));
    }
}

void DeviceLoops::targetLoop() {
    checkSensor(SENSOR_PIN_A, TARGET_ZONE_A);
    checkSensor(SENSOR_PIN_B, TARGET_ZONE_B);
    checkSensor(SENSOR_PIN_C, TARGET_ZONE_C);
    checkSensor(SENSOR_PIN_D, TARGET_ZONE_D);
}

void DeviceLoops::popperLoop() {
    checkSensor(SENSOR_PIN_A, TARGET_ZONE_POPPER);
}

bool DeviceLoops::noShootLoop() {
    return publishMessage(ACTION_DEVICE_NOSHOOT_HIT);
}

bool DeviceLoops::stopPlateLoop() {
    bool result = publishMessage(ACTION_DEVICE_NOSHOOT_HIT);

    // Visual indication that the stop plate has been hit
    HardwareAbstraction::ErrorCode ledResult = m_hal->setLedState(0, true);
    if (ledResult != HardwareAbstraction::ErrorCode::SUCCESS) {
        LOG_WARNING(ErrorHandler::Category::HARDWARE, 4001,
                    String("Failed to set LED state: ") + m_hal->getErrorDescription(ledResult));
    }

    return result;
}

bool DeviceLoops::triggerLoop() {
    bool result = publishMessage(ACTION_DEVICE_TRIGGERED);

    // Visual indication that the trigger has been triggered
    HardwareAbstraction::ErrorCode ledResult = m_hal->setLedState(1, true);
    if (ledResult != HardwareAbstraction::ErrorCode::SUCCESS) {
        LOG_WARNING(ErrorHandler::Category::HARDWARE, 4002,
                    String("Failed to set trigger LED state: ") + m_hal->getErrorDescription(ledResult));
    }

    return result;
}

void DeviceLoops::actuatorLoop() {
    // TODO: Implement actuator message handling
    // This will be implemented in a future phase
    LOG_INFO(ErrorHandler::Category::SYSTEM, 0, "Actuator loop running - implementation pending");
}

void DeviceLoops::checkSettingsLoop() {
    updateSettings();
}

bool DeviceLoops::publishMessage(const String& action) {
    if (!m_messages || !m_mqttClient) {
        LOG_ERROR(ErrorHandler::Category::SYSTEM, 1002, "publishMessage: Invalid dependencies");
        return false;
    }

    String message = m_messages->createMessage(action);
    bool isPublished = m_mqttClient->publish(m_responseTopic, message.c_str());

    if (!isPublished) {
        LOG_ERROR(ErrorHandler::Category::MQTT, 3002,
                  String("Failed to publish message with action: ") + action);
    }

    return isPublished;
}

void DeviceLoops::updateSettings() {
    if (!m_settings) {
        LOG_ERROR(ErrorHandler::Category::SYSTEM, 1003, "updateSettings: Invalid settings dependency");
        return;
    }

    int newSensorDebounce = m_settings->getInt("sensorDebounceTime", DEFAULT_SENSOR_DEBOUNCE);
    if (m_lastSensorDebounce != newSensorDebounce) {
        m_lastSensorDebounce = newSensorDebounce;
        m_sensorDebounce = newSensorDebounce;
        LOG_INFO(ErrorHandler::Category::SETTINGS, 0,
                 String("Updated sensor debounce to: ") + String(newSensorDebounce));
    }

    int newSensorThreshold = m_settings->getInt("sensorThreshold", DEFAULT_SENSOR_THRESHOLD);
    if (m_lastSensorThreshold != newSensorThreshold) {
        m_lastSensorThreshold = newSensorThreshold;
        m_sensorThreshold = newSensorThreshold;
        LOG_INFO(ErrorHandler::Category::SETTINGS, 0,
                 String("Updated sensor threshold to: ") + String(newSensorThreshold));
    }
}