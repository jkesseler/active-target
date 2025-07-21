#ifndef LOOPS_H
#define LOOPS_H

#include <Arduino.h>

// Forward declarations
class HardwareAbstraction;
class Messages;
class Settings;
class PubSubClient;

/**
 * @brief Device loop controller handling different device roles
 *
 * This class manages the main loop functions for different device roles
 * including targets, poppers, no-shoot zones and stop plates
 */
class DeviceLoops {
public:
    /**
     * @brief Constructor
     * @param hal Hardware abstraction layer instance
     * @param messages Message handler instance
     * @param settings Settings manager instance
     * @param mqttClient MQTT client instance
     * @param responseTopic MQTT response topic
     */
    DeviceLoops(HardwareAbstraction* hal, Messages* messages, Settings* settings,
                PubSubClient* mqttClient, const char* responseTopic);

    // Main loop functions for different device roles
    void targetLoop();
    void popperLoop();
    void noShootLoop();
    void stopPlateLoop();
    void checkSettingsLoop();

private:
    // Private member functions
    void checkSensor(int pin, const char* targetZone);
    bool publishMessage(const String& action);
    void handleSensorTrigger(const char* targetZone, int sensorValue);
    void updateSettings();

    // Dependencies
    HardwareAbstraction* m_hal;
    Messages* m_messages;
    Settings* m_settings;
    PubSubClient* m_mqttClient;
    const char* m_responseTopic;

    // Cached settings
    int m_sensorThreshold;
    int m_sensorDebounce;
    int m_lastSensorThreshold;
    int m_lastSensorDebounce;
    unsigned long m_lastDebounceTime;
};

#endif // LOOPS_H
