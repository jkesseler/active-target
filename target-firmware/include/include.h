static const char *EMPTY_UUID = "00000000-0000-0000-0000-000000000000";
static const char *ssid = "dana_2G";
static const char *password = "dana1982";
static const char *MQTT_SERVER = "raspberrypi.local";
static const char *DEFAULT_DEVICE_NAME = "Plate Target";
static const char *DEVICE_TYPE = "target/plate";

#define SENSOR_PIN 34

#define DEFAULT_SENSOR_THRESHOLD 50
#define DEFAULT_SENSOR_DEBOUNCE 50

// Update for 4 zones
#define SENSOR_PIN_A 34
#define SENSOR_PIN_B 35
#define SENSOR_PIN_C 36
#define SENSOR_PIN_D 37

// MQTT Topics for each target zone
#define TARGET_ZONE_A "A"
#define TARGET_ZONE_B "B"
#define TARGET_ZONE_C "C"
#define TARGET_ZONE_D "D"