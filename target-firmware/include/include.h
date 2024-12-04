static const char *EMPTY_UUID = "00000000-0000-0000-0000-000000000000";
static const char *ssid = "pewpewpew";
static const char *password = "pewpewpew";
static const char *MQTT_SERVER = "raspberrypi.local";
static const char *DEFAULT_DEVICE_NAME = "IPSC Action Air Micro Target";
// ["TARET", "POPPER", "TRIGGER", "ACTUATOR", "STOP_PLATE"]
#define DEVICE_TYPE = "TARGET";

#define DEFAULT_SENSOR_THRESHOLD 300
#define DEFAULT_SENSOR_DEBOUNCE 90

// https://www.studiopieters.nl/esp32-c3-pinout/
// https://docs.espressif.com/projects/esp-idf/en/v5.2/esp32c3/hw-reference/esp32c3/user-guide-devkitm-1.html
// GPIO<n>  | // Physical pin number
#define SENSOR_PIN_A 4   // 11
#define SENSOR_PIN_B 3   // 5
#define SENSOR_PIN_C 0   // 9
#define SENSOR_PIN_D 1   // 10

// MQTT Topics for each target zone
#define TARGET_ZONE_A "A"
#define TARGET_ZONE_B "B"
#define TARGET_ZONE_C "C"
#define TARGET_ZONE_D "D"