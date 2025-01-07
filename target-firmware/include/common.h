#ifndef AT_COMMON
#define AT_COMMON
#include "DeviceId.h"
#include "date_time.h"
#include "handleMqttMessage.h"
#include "json_messages.h"
#include "settings.h"
#include "wifi_utils.h"
#include <Arduino.h>
#include <PubSubClient.h>
#include <WiFiManager.h>
#include <vector>

#define DEFAULT_SENSOR_THRESHOLD 300
#define DEFAULT_SENSOR_DEBOUNCE 90

// https://www.studiopieters.nl/esp32-c3-pinout/
// https://docs.espressif.com/projects/esp-idf/en/v5.2/esp32c3/hw-reference/esp32c3/user-guide-devkitm-1.html
// GPIO<n>  | // Physical pin number
#define SENSOR_PIN_A 4 // 11
#define SENSOR_PIN_B 3 // 5
#define SENSOR_PIN_C 0 // 9
#define SENSOR_PIN_D 1 // 10

// MQTT Topics for each target zone
#define TARGET_ZONE_A "A"
#define TARGET_ZONE_B "B"
#define TARGET_ZONE_C "C"
#define TARGET_ZONE_D "D"
#define TARGET_ZONE_POPPER "POPPER"

// These values are shared with PWA app
#define DEVICE_TYPE_TARGET "TARGET"
#define DEVICE_TYPE_POPPER "POPPER"
#define DEVICE_TYPE_NOSHOOT "NOSHOOT"
#define DEVICE_TYPE_STOP_PLATE "STOP_PLATE"
#define DEVICE_TYPE_TRIGGER "TRIGGER"
#define DEVICE_TYPE_ACTUATOR "ACTUATOR"

// TODO: Get and Set from Settings
static const char *EMPTY_UUID = "00000000-0000-0000-0000-000000000000";
static const char *ssid = "pewpewpew";
static const char *password = "pewpewpew";
static const char *MQTT_SERVER = "raspberrypi.local";
static String DEFAULT_DEVICE_NAME = "IPSC Action Air Micro Target";
static String DEFAULT_DEVICE_TYPE = DEVICE_TYPE_TARGET;

extern WiFiManager wifiManager;
extern Settings settings;
extern WiFiClient wifiClient;
extern PubSubClient mqttClient;
extern String uuid;
extern Messages jsonMessages;
extern DeviceId deviceId;

extern char mqttClientId[64];
extern char mqttRequestTopic[64];
extern char mqttResponseTopic[64];
extern volatile unsigned long lastDebounceTime;
extern volatile unsigned long lastReadTime;

extern String deviceName;
extern String deviceType;
extern int SENSOR_DEBOUNCE;
extern int SENSOR_THRESHOLD;
extern int lastSensorDebounce;
extern int lastSensorThreshold;

#endif