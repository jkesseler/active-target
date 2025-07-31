#include <Arduino.h>
#include <PubSubClient.h>
#include <WiFiManager.h>
#include "ESPRandom.h"

#include "deviceId.h"
#include "common.h"
#include "string_builder.h"
#include "date_time.h"
#include "error_handler.h"
#include "hardware_abstraction.h"
#include "memory_monitor.h"
#include "string_builder.h"
#include "settings.h"
#include "handleMqttMessage.h"
#include "json_messages.h"
#include "loops.h"

// // Core system components
WiFiManager wifiManager;
HardwareAbstraction hal;
Settings settings;
DeviceId deviceId;
WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);
String uuid;
Messages jsonMessages;

DeviceLoops* deviceLoops = nullptr;

// MQTT configuration
char mqttClientId[64];
char mqttRequestTopic[64];
char mqttBroadcastTopic[64];
char mqttResponseTopic[64];

// Device configuration
String deviceName;
String deviceRole;

// Timing variables
volatile unsigned long lastReadTime;

// Function to generate unique SSID for WiFi access point
const char* generateUniqueSSID() {
    static thread_local char ssidBuffer[64]; // Static buffer to persist beyond function scope
    std::vector<uint8_t> random_bytes = ESPRandom::uuid4();

    // Use first 4 bytes of UUID to create a short hex string
    char hexBuffer[16];
    snprintf(hexBuffer, sizeof(hexBuffer), "%02x%02x%02x%02x",
             random_bytes[0], random_bytes[1], random_bytes[2], random_bytes[3]);

    // Build SSID directly in static buffer to avoid memory allocation
    snprintf(ssidBuffer, sizeof(ssidBuffer), "active-target-%s", hexBuffer);

    return ssidBuffer;
}


bool initializeSystem() {
    // Initialize error handler first with LED indicator enabled
    if (!g_errorHandler.initialize(true, false, true)) {
        Serial.println("ERROR: Failed to initialize error handler");
        return false;
    }

    LOG_INFO(ErrorHandler::Category::SYSTEM, 0, "System initialization started");

    // Initialize memory monitoring early
    MemoryMonitor::getInstance().initialize(true, 30000);  // Enable detailed tracking, 30s reporting

    // Initialize hardware abstraction layer
    HardwareAbstraction::ErrorCode halResult = hal.initialize();
    if (halResult != HardwareAbstraction::ErrorCode::SUCCESS) {
        String errorMsg = MessageFormatter::createErrorMessage("HAL initialization failed", 0, hal.getErrorDescription(halResult));
        LOG_CRITICAL(ErrorHandler::Category::HARDWARE, 5001, errorMsg);
        return false;
    }

    // Set hardware abstraction for error handler LED control
    g_errorHandler.setHardwareAbstraction(&hal);

    // Initialize core components
    uuid = EMPTY_UUID;
    sprintf(mqttClientId, "DEVICE/{%s}", uuid.c_str());
    sprintf(mqttRequestTopic, "at/device/%s/commands", uuid.c_str());
    sprintf(mqttResponseTopic, "at/device/%s/response", uuid.c_str());
    sprintf(mqttBroadcastTopic, "at/devices/broadcast");

    lastReadTime = 0;
    deviceName = DEFAULT_DEVICE_NAME;
    deviceRole = DEVICE_ROLE_TARGET;

    // Create device loops instance with dependency injection
    deviceLoops = new DeviceLoops(&hal, &jsonMessages, &settings, &mqttClient, mqttResponseTopic);
    if (!deviceLoops) {
        LOG_CRITICAL(ErrorHandler::Category::SYSTEM, 5002, "Failed to create DeviceLoops instance");
        return false;
    }

    LOG_INFO(ErrorHandler::Category::SYSTEM, 0, "System initialization completed successfully");
    return true;
}

void onMessageReceive(char *topic, byte *message, unsigned int length) {
    if (!topic || !message || length == 0) {
        LOG_ERROR(ErrorHandler::Category::MQTT, 3003, "Invalid MQTT message received");
        return;
    }

    MEDIUM_STRING() topicMsg;
    topicMsg.append("Message received on topic: ").append(topic);
    LOG_INFO(ErrorHandler::Category::MQTT, 0, topicMsg.toString());

    String messageTemp;
    messageTemp.reserve(length + 1);

    for (unsigned int i = 0; i < length; i++) {
        messageTemp += (char)message[i];
    }

    MEDIUM_STRING() contentMsg;
    contentMsg.append("Message content: ").append(messageTemp.c_str());
    LOG_INFO(ErrorHandler::Category::MQTT, 0, contentMsg.toString());

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
                MEDIUM_STRING() subMsg;
                subMsg.append("Subscribed to: ").append(mqttRequestTopic);
                LOG_INFO(ErrorHandler::Category::MQTT, 0, subMsg.toString());
            } else {
                LOG_WARNING(ErrorHandler::Category::MQTT, 3005, "Failed to subscribe to request topic");
            }

            if (mqttClient.subscribe(mqttBroadcastTopic)) {
                MEDIUM_STRING() subMsg;
                subMsg.append("Subscribed to: ").append(mqttBroadcastTopic);
                LOG_INFO(ErrorHandler::Category::MQTT, 0, subMsg.toString());
            } else {
                LOG_WARNING(ErrorHandler::Category::MQTT, 3006, "Failed to subscribe to broadcast topic");
            }

            return true;
        } else {
            retryCount++;

            if (currentReconnectDelay < maxReconnectDelay) {
                currentReconnectDelay *= 2;
            }

            MEDIUM_STRING() retryMsg;
            retryMsg.append("MQTT connection failed, rc=").append(mqttClient.state())
                   .append(", retry ").append(retryCount).append("/").append(maxRetries);
            LOG_WARNING(ErrorHandler::Category::MQTT, 3007, retryMsg.toString());

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
    const char* uniqueSSID = generateUniqueSSID();

    MEDIUM_STRING() ssidMsg;
    ssidMsg.append("Using WiFi AP SSID: ").append(uniqueSSID);
    LOG_INFO(ErrorHandler::Category::NETWORK, 0, ssidMsg.toString());

    if (wifiManager.autoConnect(uniqueSSID)) {
      LOG_INFO(ErrorHandler::Category::NETWORK, 0, "WiFi connected successfully");
    } else {
      LOG_ERROR(ErrorHandler::Category::NETWORK, 6001, "Failed to connect to WiFi");
    }

    // Get gateway for initial time sync
    IPAddress gateway = WiFi.gatewayIP();
    MEDIUM_STRING() gatewayMsg;
    gatewayMsg.append("Gateway IP: ").append(gateway.toString().c_str());
    LOG_INFO(ErrorHandler::Category::NETWORK, 0, gatewayMsg.toString());

    // Perform initial time synchronization (blocking)
    bool initialSyncResult = timeSync(gateway.toString());
    if (initialSyncResult) {
        LOG_INFO(ErrorHandler::Category::SYSTEM, 0, "Initial time synchronization completed successfully");
    } else {
        LOG_ERROR(ErrorHandler::Category::SYSTEM, 4008, "Initial time synchronization failed");
    }

    // Initialize settings and device ID
    settings.initialize();
    deviceId.initialize();
    uuid = deviceId.get();
    deviceName = settings.getString("deviceName", DEFAULT_DEVICE_NAME);
    deviceRole = settings.getString("deviceRole", DEFAULT_DEVICE_ROLE);

    MEDIUM_STRING() deviceMsg;
    deviceMsg.append("Device UUID: ").append(uuid.c_str());
    LOG_INFO(ErrorHandler::Category::SYSTEM, 0, deviceMsg.toString());

    deviceMsg.clear();
    deviceMsg.append("Device Name: ").append(deviceName.c_str());
    LOG_INFO(ErrorHandler::Category::SYSTEM, 0, deviceMsg.toString());

    deviceMsg.clear();
    deviceMsg.append("Device Role: ").append(deviceRole.c_str());
    LOG_INFO(ErrorHandler::Category::SYSTEM, 0, deviceMsg.toString());

    // Initialize JSON messages
    jsonMessages.begin(uuid, deviceName, deviceRole);

    // Initialize time synchronization with gateway IP
    if (gateway != IPAddress(0, 0, 0, 0)) {
        initializeTimeSync(gateway.toString());
        LOG_INFO(ErrorHandler::Category::SYSTEM, 0, String("Time sync initialized with gateway: ") + gateway.toString());
    } else {
        LOG_ERROR(ErrorHandler::Category::SYSTEM, 4006, "Cannot initialize time sync - invalid gateway IP");
        // Fallback to public NTP server
        initializeTimeSync("pool.ntp.org");
        LOG_WARNING(ErrorHandler::Category::SYSTEM, 4007, "Time sync fallback to pool.ntp.org");
    }

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

    // Test LED error signaling (remove these lines after testing)
    // LOG_WARNING(ErrorHandler::Category::SYSTEM, 9001, "Test WARNING - LED should flash 2 times");
    // delay(2000);
    // LOG_ERROR(ErrorHandler::Category::SYSTEM, 9002, "Test ERROR - LED should flash 3 times");
    // delay(2000);
    // LOG_CRITICAL(ErrorHandler::Category::SYSTEM, 9003, "Test CRITICAL - LED should flash 4 times");
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

    // Periodic time synchronization (non-blocking)
    periodicTimeSync();

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

    if (deviceRole == DEVICE_ROLE_TARGET) {
        deviceLoops->targetLoop();
    } else if (deviceRole == DEVICE_ROLE_POPPER) {
        deviceLoops->popperLoop();
    } else if (deviceRole == DEVICE_ROLE_NOSHOOT) {
        deviceLoops->noShootLoop();
    } else if (deviceRole == DEVICE_ROLE_STOP_PLATE) {
        deviceLoops->stopPlateLoop();
    } else {
        SMALL_STRING() typeMsg;
        typeMsg.append("Unknown device role: ").append(deviceRole.c_str());
        LOG_WARNING(ErrorHandler::Category::SYSTEM, 5007, typeMsg.toString());
    }
}
