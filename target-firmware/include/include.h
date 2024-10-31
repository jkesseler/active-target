static const char *EMPTY_UUID = "00000000-0000-0000-0000-000000000000";
static const char *ssid = "pewpewpew";
static const char *password = "pewpewpew";
static const char *MQTT_SERVER = "raspberrypi.local";
static const char *DEFAULT_DEVICE_NAME = "IPSC Action Air Micro Target";

#define DEFAULT_SENSOR_THRESHOLD 300
#define DEFAULT_SENSOR_DEBOUNCE 90

// Update for 4 zones
#define SENSOR_PIN_A 0
#define SENSOR_PIN_B 2
#define SENSOR_PIN_C 3
#define SENSOR_PIN_D 10

// MQTT Topics for each target zone
#define TARGET_ZONE_A "A"
#define TARGET_ZONE_B "B"
#define TARGET_ZONE_C "C"
#define TARGET_ZONE_D "D"