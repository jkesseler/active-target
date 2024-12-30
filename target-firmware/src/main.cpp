#include "common.h"
#include "DeviceId.h"
#include "date_time.h"
#include "handleMqttMessage.h"
#include "json_messages.h"
#include "settings.h"
#include "wifi_utils.h"
#include <Arduino.h>
#include <PubSubClient.h>
#include "loops.cpp"

Settings settings;
DeviceId deviceId;
WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);
String uuid;
Messages jsonMessages;

char mqttClientId[64];
char mqttRequestTopic[64];
char mqttResponseTopic[64];
volatile unsigned long lastDebounceTime;
volatile unsigned long lastReadTime;

String deviceName;
String deviceType;
int SENSOR_DEBOUNCE;
int SENSOR_THRESHOLD;
int lastSensorDebounce;
int lastSensorThreshold;


void init() {
  uuid = EMPTY_UUID;
  sprintf(mqttClientId, "DEVICE/{%s}", uuid.c_str());
  sprintf(mqttRequestTopic, "at/device/%s/commands", uuid.c_str());
  sprintf(mqttResponseTopic, "at/device/%s/response", uuid.c_str());

  lastDebounceTime = DEFAULT_SENSOR_DEBOUNCE;
  lastReadTime = 0;

  deviceName = DEFAULT_DEVICE_NAME;
  deviceType = DEVICE_TYPE_TARGET;
  SENSOR_DEBOUNCE = DEFAULT_SENSOR_DEBOUNCE;
  lastSensorDebounce = SENSOR_DEBOUNCE;
  SENSOR_THRESHOLD = DEFAULT_SENSOR_THRESHOLD;
  lastSensorThreshold = SENSOR_THRESHOLD;
}


void onMessageReceive(char *topic, byte *message, unsigned int length) {
  Serial.print("Message arrived on topic: ");
  Serial.print(topic);
  Serial.println(". Message: ");
  String messageTemp;

  for (int i = 0; i < length; i++) {
    Serial.print((char)message[i]);
    messageTemp += (char)message[i];
  }
  Serial.println(messageTemp);

  handleMqttMessage(messageTemp);
}

void connectToMqttServer() {
  int initialReconnectDelay = 1000;
  int currentReconnectDelay = initialReconnectDelay;
  int maxReconnectDelay = 16000;

  while (!mqttClient.connected()) {
    Serial.print("Attempting MQTT connection...");

    if (mqttClient.connect(mqttClientId)) {
      Serial.println("connected");
      Serial.println(mqttRequestTopic);
      mqttClient.subscribe(mqttRequestTopic);
    } else {
      if (currentReconnectDelay < maxReconnectDelay) {
        currentReconnectDelay *= 2;
      }

      int sec = ((currentReconnectDelay + 500) / 1000);
      char delayString[20];
      sprintf(delayString, "%s seconds", sec / 1000);

      Serial.print("failed, rc=");
      Serial.print(mqttClient.state());
      Serial.print("Reconn. in ");
      Serial.println(delayString);

      delay(currentReconnectDelay);
    }
  }
}

void setup() {
  Serial.begin(115200);
  init();

  pinMode(SENSOR_PIN_A, INPUT_PULLUP);
  pinMode(SENSOR_PIN_B, INPUT_PULLUP);
  pinMode(SENSOR_PIN_C, INPUT_PULLUP);
  pinMode(SENSOR_PIN_D, INPUT_PULLUP);

  String apIP = connectToWiFi(ssid, password);
  timeSync(apIP);

  settings.begin();
  uuid = deviceId.get();

  deviceName = settings.getString("deviceName", DEFAULT_DEVICE_NAME);
  deviceType = settings.getString("deviceType", DEFAULT_DEVICE_TYPE);

  Serial.println(uuid);
  Serial.println(deviceName);
  Serial.println(deviceType);

  jsonMessages.begin(uuid, deviceName, deviceType);

  mqttClient.setServer(MQTT_SERVER, 1883);
  mqttClient.setCallback(onMessageReceive);
  mqttClient.setBufferSize(1024);
  connectToMqttServer();

  String onlineMessage = jsonMessages.createDeviceOnlineMessage();
  mqttClient.publish(mqttResponseTopic, onlineMessage.c_str());
}

void loop() {
  unsigned long currentTime = millis();
  
  if (!mqttClient.connected()) {
    connectToMqttServer();
  }
  mqttClient.loop();

  if (currentTime - lastReadTime > 500) {
    lastReadTime = currentTime;
    checkSettingLoop();
  }

  if(deviceType == DEVICE_TYPE_TARGET) {
    targetLoop();
  }

  if (deviceType == DEVICE_TYPE_POPPER) {
    popperLoop();
  }

  if (deviceType == DEVICE_TYPE_NOSHOOT) {
    noShootLoop();
  }

  if (deviceType == DEVICE_TYPE_STOP_PLATE) {
    stopPlateLoop();
  }

  if (deviceType == DEVICE_TYPE_TRIGGER) {
    triggerLoop();
  }

  if (deviceType == DEVICE_TYPE_ACTUATOR) {
    actuatorLoop();
  }
}
