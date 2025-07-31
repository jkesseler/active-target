#ifndef AT_COMMON
#define AT_COMMON
#include "DeviceId.h"
#include "date_time.h"
#include "memory_monitor.h"
#include "string_builder.h"
#include "handleMqttMessage.h"
#include "json_messages.h"
#include "settings.h"
#include <Arduino.h>
#include <Preferences.h>
#include <PubSubClient.h>
#include <WiFiManager.h>
#include <vector>

#define DEFAULT_SENSOR_THRESHOLD 300
#define DEFAULT_SENSOR_DEBOUNCE 90

// Board-specific GPIO pin configurations
#ifdef BOARD_ESP32_C3_DEVKITM1
    // ESP32-C3-DevKitM-1 pin configuration
    // https://www.studiopieters.nl/esp32-c3-pinout/
    // https://docs.espressif.com/projects/esp-idf/en/v5.2/esp32c3/hw-reference/esp32c3/user-guide-devkitm-1.html
    #define SENSOR_PIN_A 0 // GPIO0 (ADC1_CH0)
    #define SENSOR_PIN_B 1 // GPIO1 (ADC1_CH1)
    #define SENSOR_PIN_C 2 // GPIO2 (ADC1_CH2)
    #define SENSOR_PIN_D 3 // GPIO3 (ADC1_CH3)

    #define LED_PIN_RGB LED_BUILTIN // GPIO8 (RGB LED)
    #define LED_PIN_2 8  // GPIO8
    #define LED_PIN_3 9  // GPIO9
    #define LED_PIN_4 10 // GPIO10

    #define BOARD_NAME "ESP32-C3-DevKitM-1"
    #define BOARD_RAM_SIZE 409600     // 400KB SRAM
    #define BOARD_FLASH_SIZE 4194304 // 4MB
    #define BOARD_CPU_FREQ 160000000 // 160MHz

#elif defined(BOARD_ESP32_S3_DEVKITC1)
    // ESP32-S3-DevKitC-1 pin configuration
    // https://docs.espressif.com/projects/esp-idf/en/latest/esp32s3/hw-reference/esp32s3/user-guide-devkitc-1.html
    #define SENSOR_PIN_A 1  // GPIO1 (ADC1_CH0)
    #define SENSOR_PIN_B 2  // GPIO2 (ADC1_CH1)
    #define SENSOR_PIN_C 3  // GPIO3 (ADC1_CH2)
    #define SENSOR_PIN_D 4  // GPIO4 (ADC1_CH3)

    #define LED_PIN_RGB 38  // GPIO38 (RGB LED or status LED)
    #define LED_PIN_2 39    // GPIO39
    #define LED_PIN_3 40    // GPIO40
    #define LED_PIN_4 41    // GPIO41

    #define BOARD_NAME "ESP32-S3-DevKitC-1"
    #define BOARD_RAM_SIZE 524288     // 512KB SRAM
    #define BOARD_FLASH_SIZE 8388608  // 8MB
    #define BOARD_CPU_FREQ 240000000  // 240MHz

#else
    // Default configuration (fallback to ESP32-S3 as primary)
    #warning "No board type defined, using ESP32-S3 defaults"
    #define SENSOR_PIN_A 1
    #define SENSOR_PIN_B 2
    #define SENSOR_PIN_C 3
    #define SENSOR_PIN_D 4

    #define LED_PIN_RGB 38
    #define LED_PIN_2 39
    #define LED_PIN_3 40
    #define LED_PIN_4 41

    #define BOARD_NAME "Unknown Board (ESP32-S3 defaults)"
    #define BOARD_RAM_SIZE 524288     // 512KB SRAM
    #define BOARD_FLASH_SIZE 8388608  // 8MB
    #define BOARD_CPU_FREQ 240000000  // 240MHz
#endif

// MQTT Topics for each target zone
#define TARGET_ZONE_A "A"
#define TARGET_ZONE_B "B"
#define TARGET_ZONE_C "C"
#define TARGET_ZONE_D "D"
#define TARGET_ZONE_POPPER "POPPER"
#define TARGET_ZONE_STOP_PLATE "STOP_PLATE"
#define TARGET_ZONE_NO_SHOOT "NO_SHOOT"

// These values are shared with PWA app
#define DEVICE_ROLE_TARGET "TARGET"
#define DEVICE_ROLE_POPPER "POPPER"
#define DEVICE_ROLE_NOSHOOT "NOSHOOT"
#define DEVICE_ROLE_STOP_PLATE "STOP_PLATE"

// TODO: Get and Set from Settings
static const char *EMPTY_UUID = "00000000-0000-0000-0000-000000000000";
static const char *DEFAULT_SSID = "active-target";
static const char *MQTT_SERVER = "raspberrypi.local";
static String DEFAULT_DEVICE_NAME = "IPSC Action Air Micro Target";
static String DEFAULT_DEVICE_ROLE = DEVICE_ROLE_TARGET;

// Forward declarations for core components
class WiFiManager;
class Settings;
class WiFiClient;
class PubSubClient;
class Messages;
class DeviceId;

// Core system references (managed by main.cpp)
extern WiFiManager wifiManager;
extern Settings settings;
extern WiFiClient wifiClient;
extern PubSubClient mqttClient;
extern String uuid;
extern Messages jsonMessages;
extern DeviceId deviceId;

// MQTT topic buffers
extern char mqttClientId[64];
extern char mqttRequestTopic[64];
extern char mqttBroadcastTopic[64];
extern char mqttResponseTopic[64];

// Device configuration
extern String deviceName;
extern String deviceRole;

#endif