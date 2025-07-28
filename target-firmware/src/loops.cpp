#include "loops.h"
#include "hardware_abstraction.h"
#include "error_handler.h"
#include "common.h"
#include "action_types.h"
#include "json_messages.h"
#include "json_pool.h"
#include "memory_monitor.h"
#include "string_builder.h"
#include "date_time.h"
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
        String errorMsg = MessageFormatter::createErrorMessage("Sensor read failed on pin", pin, m_hal->getErrorDescription(result));
        LOG_ERROR(ErrorHandler::Category::SENSOR, 2002, errorMsg);
        return;
    }

    unsigned long currentTime = m_hal->getCurrentTime();

    if (sensorValue > m_sensorThreshold && (currentTime - m_lastDebounceTime > m_sensorDebounce)) {
        m_lastDebounceTime = currentTime;
        handleSensorTrigger(targetZone, sensorValue);
    }
}

void DeviceLoops::handleSensorTrigger(const char* targetZone, int sensorValue) {
    String triggerMsg = MessageFormatter::createSensorMessage("Sensor triggered", targetZone, sensorValue);
    LOG_INFO(ErrorHandler::Category::SENSOR, 0, triggerMsg);

    // Generate and publish result message for the triggered sensor
    String resultMessage = m_messages->createTargetHitMessage(targetZone);

    if (!m_mqttClient->publish(m_responseTopic, resultMessage.c_str())) {
        MEDIUM_STRING() errorMsg;
        errorMsg.append("Failed to publish sensor trigger message for zone ").append(targetZone);
        LOG_ERROR(ErrorHandler::Category::MQTT, 3001, errorMsg.toString());
    } else {
        MEDIUM_STRING() successMsg;
        successMsg.append("Successfully published sensor trigger for zone ").append(targetZone);
        LOG_INFO(ErrorHandler::Category::MQTT, 0, successMsg.toString());
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

void DeviceLoops::noShootLoop() {
  checkSensor(SENSOR_PIN_A, TARGET_ZONE_NO_SHOOT);
}

void DeviceLoops::stopPlateLoop() {
  checkSensor(SENSOR_PIN_A, TARGET_ZONE_STOP_PLATE);
}

void DeviceLoops::checkSettingsLoop() {
    updateSettings();

    // Check JSON pool health periodically
    JsonDocumentPool::getInstance().checkPoolHealth();

    // Update memory monitoring
    MemoryMonitor::getInstance().update();

    // Monitor time sync status
    static unsigned long lastTimeSyncCheck = 0;
    unsigned long currentTime = millis();

    // Check time sync status every 5 minutes
    if (currentTime - lastTimeSyncCheck > 300000) {
        lastTimeSyncCheck = currentTime;

        if (!isTimeSynced()) {
            unsigned long timeSinceSync = getTimeSinceLastSync();
            if (timeSinceSync == ULONG_MAX) {
                LOG_WARNING(ErrorHandler::Category::SYSTEM, 4004, "Time has never been synchronized");
            } else {
                String warnMsg = String("Time sync lost - ") + String(timeSinceSync / 1000) + " seconds since last sync";
                LOG_WARNING(ErrorHandler::Category::SYSTEM, 4005, warnMsg);
            }
        }
    }
}

bool DeviceLoops::publishMessage(const String &type) {
  if (!m_messages || !m_mqttClient) {
    LOG_ERROR(ErrorHandler::Category::SYSTEM, 1002, "publishMessage: Invalid dependencies");
    return false;
  }

  String message = m_messages->createMessage(type);
  bool isPublished = m_mqttClient->publish(m_responseTopic, message.c_str());

  if (!isPublished) {
    MEDIUM_STRING() errorMsg;
    errorMsg.append("Failed to publish message with type: ").append(type.c_str());
    LOG_ERROR(ErrorHandler::Category::MQTT, 3002, errorMsg.toString());
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
        String updateMsg = MessageFormatter::createStatusMessage("Updated sensor debounce to", "", newSensorDebounce);
        LOG_INFO(ErrorHandler::Category::SETTINGS, 0, updateMsg);
    }

    int newSensorThreshold = m_settings->getInt("sensorThreshold", DEFAULT_SENSOR_THRESHOLD);
    if (m_lastSensorThreshold != newSensorThreshold) {
        m_lastSensorThreshold = newSensorThreshold;
        m_sensorThreshold = newSensorThreshold;
        String updateMsg = MessageFormatter::createStatusMessage("Updated sensor threshold to", "", newSensorThreshold);
        LOG_INFO(ErrorHandler::Category::SETTINGS, 0, updateMsg);
    }
}