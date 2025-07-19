#include <Arduino.h>
#include <PubSubClient.h>
#include <WiFiManager.h>

#include "DeviceId.h"
#include "common.h"
#include "date_time.h"
#include "handleMqttMessage.h"
#include "json_messages.h"
#include "loops.h"
#include "hardware_abstraction.h"
#include "error_handler.h"
#include "settings.h"

// Core system components
WiFiManager wifiManager;
Settings settings;
DeviceId deviceId;
WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);
String uuid;
Messages jsonMessages;
HardwareAbstraction hal;
DeviceLoops* deviceLoops = nullptr;

// MQTT configuration
char mqttClientId[64];
char mqttRequestTopic[64];
char mqttBroadcastTopic[64];
char mqttResponseTopic[64];

// Device configuration
String deviceName;
String deviceType;

// Timing variables
volatile unsigned long lastReadTime;


bool initializeSystem() {
    // Initialize error handler first
    if (!g_errorHandler.initialize(true, false)) {
        Serial.println("ERROR: Failed to initialize error handler");
        return false;
    }

    LOG_INFO(ErrorHandler::Category::SYSTEM, 0, "System initialization started");

    // Initialize hardware abstraction layer
    HardwareAbstraction::ErrorCode halResult = hal.initialize();
    if (halResult != HardwareAbstraction::ErrorCode::SUCCESS) {
        LOG_CRITICAL(ErrorHandler::Category::HARDWARE, 5001,
                     String("HAL initialization failed: ") + hal.getErrorDescription(halResult));
        return false;
    }

    // Initialize core components
    uuid = EMPTY_UUID;
    sprintf(mqttClientId, "DEVICE/{%s}", uuid.c_str());
    sprintf(mqttRequestTopic, "at/device/%s/commands", uuid.c_str());
    sprintf(mqttResponseTopic, "at/device/%s/response", uuid.c_str());
    sprintf(mqttBroadcastTopic, "at/devices/broadcast");

    lastReadTime = 0;
    deviceName = DEFAULT_DEVICE_NAME;
    deviceType = DEVICE_TYPE_TARGET;

    // Create device loops instance with dependency injection
    deviceLoops = new DeviceLoops(&hal, &jsonMessages, &settings, &mqttClient, mqttResponseTopic);
    if (!deviceLoops) {
        LOG_CRITICAL(ErrorHandler::Category::SYSTEM, 5002, "Failed to create DeviceLoops instance");
        return false;
    }

    LOG_INFO(ErrorHandler::Category::SYSTEM, 0, "System initialization completed successfully");
    return true;
}

void cleanupSystem() {
    if (deviceLoops) {
        delete deviceLoops;
        deviceLoops = nullptr;
    }
    LOG_INFO(ErrorHandler::Category::SYSTEM, 0, "System cleanup completed");
}


void onMessageReceive(char *topic, byte *message, unsigned int length) {
    if (!topic || !message || length == 0) {
        LOG_ERROR(ErrorHandler::Category::MQTT, 3003, "Invalid MQTT message received");
        return;
    }

    LOG_INFO(ErrorHandler::Category::MQTT, 0, String("Message received on topic: ") + String(topic));

    String messageTemp;
    messageTemp.reserve(length + 1);

    for (unsigned int i = 0; i < length; i++) {
        messageTemp += (char)message[i];
    }

    LOG_INFO(ErrorHandler::Category::MQTT, 0, String("Message content: ") + messageTemp);

    // Handle the message with error checking
    handleMqttMessage(messageTemp);
}

bool connectToMqttServer() {
    const int initialReconnectDelay = 1000;
    int currentReconnectDelay = initialReconnectDelay;
    const int maxReconnectDelay = 16000;
    const int maxRetries = 5;
    int retryCount = 0;

    while (!mqttClient.connected() && retryCount < maxRetries) {
        LOG_INFO(ErrorHandler::Category::MQTT, 0, "Attempting MQTT connection...");

        if (mqttClient.connect(mqttClientId)) {
            LOG_INFO(ErrorHandler::Category::MQTT, 0, "MQTT connected successfully");

            // Subscribe to topics
            if (mqttClient.subscribe(mqttRequestTopic)) {
                LOG_INFO(ErrorHandler::Category::MQTT, 0, String("Subscribed to: ") + String(mqttRequestTopic));
            } else {
                LOG_WARNING(ErrorHandler::Category::MQTT, 3005, "Failed to subscribe to request topic");
            }

            if (mqttClient.subscribe(mqttBroadcastTopic)) {
                LOG_INFO(ErrorHandler::Category::MQTT, 0, String("Subscribed to: ") + String(mqttBroadcastTopic));
            } else {
                LOG_WARNING(ErrorHandler::Category::MQTT, 3006, "Failed to subscribe to broadcast topic");
            }

            return true;
        } else {
            retryCount++;

            if (currentReconnectDelay < maxReconnectDelay) {
                currentReconnectDelay *= 2;
            }

            LOG_WARNING(ErrorHandler::Category::MQTT, 3007,
                        String("MQTT connection failed, rc=") + String(mqttClient.state()) +
                        String(", retry ") + String(retryCount) + String("/") + String(maxRetries));

            delay(currentReconnectDelay);
        }
    }

    LOG_ERROR(ErrorHandler::Category::MQTT, 3008, "Failed to connect to MQTT server after maximum retries");
    return false;
}

void setup() {
    Serial.begin(115200);

    // Initialize system components
    if (!initializeSystem()) {
        LOG_CRITICAL(ErrorHandler::Category::SYSTEM, 5003, "System initialization failed - halting");
        while (true) {
            delay(1000);
        }
    }

    // Initialize WiFi connection
    WiFi.mode(WIFI_STA);
    if (wifiManager.autoConnect("AT-Device")) {
        LOG_INFO(ErrorHandler::Category::NETWORK, 0, "WiFi connected successfully");
    } else {
        LOG_ERROR(ErrorHandler::Category::NETWORK, 6001, "Failed to connect to WiFi");
    }

    // Get gateway and sync time
    IPAddress gateway = WiFi.gatewayIP();
    LOG_INFO(ErrorHandler::Category::NETWORK, 0, String("Gateway IP: ") + gateway.toString());

    timeSync(gateway.toString());
    LOG_INFO(ErrorHandler::Category::SYSTEM, 0, "Time synchronization completed");

    // Initialize settings and device ID
    settings.begin();
    uuid = deviceId.get();
    deviceName = settings.getString("deviceName", DEFAULT_DEVICE_NAME);
    deviceType = settings.getString("deviceType", DEFAULT_DEVICE_TYPE);

    LOG_INFO(ErrorHandler::Category::SYSTEM, 0, String("Device UUID: ") + uuid);
    LOG_INFO(ErrorHandler::Category::SYSTEM, 0, String("Device Name: ") + deviceName);
    LOG_INFO(ErrorHandler::Category::SYSTEM, 0, String("Device Type: ") + deviceType);

    // Initialize JSON messages
    jsonMessages.begin(uuid, deviceName, deviceType);

    // Setup MQTT
    mqttClient.setServer(MQTT_SERVER, 1883);
    mqttClient.setCallback(onMessageReceive);
    mqttClient.setBufferSize(1024);

    // Setup error handler MQTT reporting
    g_errorHandler.setMqttReporting(&mqttClient, "at/errors");

    if (!connectToMqttServer()) {
        LOG_CRITICAL(ErrorHandler::Category::MQTT, 3009, "Failed to establish MQTT connection");
    }

    // Send device online message
    String onlineMessage = jsonMessages.createDeviceOnlineMessage();
    if (mqttClient.publish(mqttResponseTopic, onlineMessage.c_str())) {
        LOG_INFO(ErrorHandler::Category::MQTT, 0, "Device online message sent successfully");
    } else {
        LOG_ERROR(ErrorHandler::Category::MQTT, 3010, "Failed to send device online message");
    }

    LOG_INFO(ErrorHandler::Category::SYSTEM, 0, "Setup completed successfully");
}

void loop() {
    // Check for critical errors and handle them
    if (g_errorHandler.hasCriticalErrors()) {
        LOG_CRITICAL(ErrorHandler::Category::SYSTEM, 5005, "Critical errors detected - entering safe mode");
        delay(5000);
        return;
    }

    unsigned long currentTime = millis();

    // Process WiFi manager
    wifiManager.process();

    // Ensure MQTT connection
    if (!mqttClient.connected()) {
        LOG_WARNING(ErrorHandler::Category::MQTT, 3011, "MQTT connection lost, attempting reconnection");
        if (!connectToMqttServer()) {
            LOG_ERROR(ErrorHandler::Category::MQTT, 3012, "Failed to reconnect to MQTT server");
            delay(5000);
            return;
        }
    }

    // Process MQTT messages
    mqttClient.loop();

    // Check settings periodically
    if (currentTime - lastReadTime > 500) {
        lastReadTime = currentTime;
        if (deviceLoops) {
            deviceLoops->checkSettingsLoop();
        }
    }

    // Execute device-specific loops
    if (!deviceLoops) {
        LOG_ERROR(ErrorHandler::Category::SYSTEM, 5006, "DeviceLoops instance is null");
        return;
    }

    if (deviceType == DEVICE_TYPE_TARGET) {
        deviceLoops->targetLoop();
    } else if (deviceType == DEVICE_TYPE_POPPER) {
        deviceLoops->popperLoop();
    } else if (deviceType == DEVICE_TYPE_NOSHOOT) {
        deviceLoops->noShootLoop();
    } else if (deviceType == DEVICE_TYPE_STOP_PLATE) {
        deviceLoops->stopPlateLoop();
    } else if (deviceType == DEVICE_TYPE_TRIGGER) {
        deviceLoops->triggerLoop();
    } else if (deviceType == DEVICE_TYPE_ACTUATOR) {
        deviceLoops->actuatorLoop();
    } else {
        LOG_WARNING(ErrorHandler::Category::SYSTEM, 5007, String("Unknown device type: ") + deviceType);
    }
}
