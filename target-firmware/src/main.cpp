#include "DeviceId.h"
#include "date_time.h"
#include "handleMqttMessage.h"
#include "include.h"
#include "json_messages.h"
#include "settings.h"
#include "wifi_utils.h"
#include <Arduino.h>
#include <PubSubClient.h>

Settings settings;
WiFiClient espClient;
PubSubClient client(espClient);
String uuid = EMPTY_UUID;
Messages jsonMessages;

char mqttActionsTopic[100];
char mqttSettingsTopic[64];
char mqttClientId[64];
volatile unsigned long lastDebounceTime = DEFAULT_SENSOR_DEBOUNCE;
volatile unsigned long lastReadTime = 0;

String deviceName = DEFAULT_DEVICE_NAME;
int SENSOR_DEBOUNCE = DEFAULT_SENSOR_DEBOUNCE;
int SENSOR_THRESHOLD = DEFAULT_SENSOR_THRESHOLD;
int lastSensorDebounce = SENSOR_DEBOUNCE;
int lastSensorThreshold = SENSOR_THRESHOLD;

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

  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    sprintf(mqttClientId, "TARGET{%s}", uuid.c_str());
    
    if (client.connect(mqttClientId)) {
      Serial.println("connected");
      sprintf(mqttActionsTopic, "at/device/%s/actions", uuid.c_str());
      Serial.println(mqttActionsTopic);
      client.subscribe(mqttActionsTopic);

      sprintf(mqttSettingsTopic, "at/device/%s/settings", uuid.c_str());
      client.subscribe(mqttSettingsTopic);

    } else {
      if (currentReconnectDelay < maxReconnectDelay) {
        currentReconnectDelay *= 2;
      }

      int sec = ((currentReconnectDelay + 500) / 1000);
      char delayString[20];
      sprintf(delayString, "%s seconds", sec / 1000);

      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.print("Reconn. in ");
      Serial.println(delayString);

      delay(currentReconnectDelay);
    }
  }
}

void setup() {
  Serial.begin(115200);

  String apIP = connectToWiFi(ssid, password);
  timeSync(apIP);

  settings.begin();

  DeviceId deviceId;
  uuid = deviceId.get();
  deviceName = settings.getString("deviceName", DEFAULT_DEVICE_NAME);

  Serial.println(uuid);
  Serial.println(deviceName);

  jsonMessages.begin(uuid, DEFAULT_DEVICE_NAME);

  client.setServer(MQTT_SERVER, 1883);
  client.setCallback(onMessageReceive);
  client.setBufferSize(1024);
  connectToMqttServer();

  String addTargetMessage = jsonMessages.createDeviceOnlineMessage();
  client.publish("at/devices", addTargetMessage.c_str());
}

void checkSensor(int pin, const char *targetZone) {
  int piezoVal = analogRead(pin);
  unsigned long currentTime = millis();

  if (piezoVal > SENSOR_THRESHOLD && (currentTime - lastDebounceTime > SENSOR_DEBOUNCE)) {
    lastDebounceTime = currentTime;
    Serial.println("------");
    Serial.println("------");
    Serial.println("------");
    Serial.print("Sensor triggered on target zone ");
    Serial.print(targetZone);
    Serial.print(" with value: ");
    Serial.println(piezoVal);
    Serial.println("------");
    // Generate and publish result message for the triggered sensor
    String resultMessage = jsonMessages.createAddResultMessage(targetZone);
    Serial.println(mqttActionsTopic);
    Serial.println(resultMessage.c_str());

    bool isPublished = client.publish(mqttActionsTopic, resultMessage.c_str());

    if (!isPublished) {
      Serial.println("Not Published");
    }
  }
}

void loop() {
  unsigned long currentTime = millis();

  if (!client.connected()) {
    connectToMqttServer();
  }

  if (currentTime - lastReadTime > 500) {
    lastReadTime = currentTime;
    client.loop();

    SENSOR_DEBOUNCE = settings.getInt("sensorDebounceTime", DEFAULT_SENSOR_DEBOUNCE);
    if (lastSensorDebounce != SENSOR_DEBOUNCE) {
      lastSensorDebounce = SENSOR_DEBOUNCE;
      Serial.print("New sensor debounce: ");
      Serial.print(SENSOR_DEBOUNCE);
      Serial.println(" ----- ");
    }

    SENSOR_THRESHOLD = settings.getInt("sensorThreshold", DEFAULT_SENSOR_THRESHOLD);
    if (lastSensorThreshold != SENSOR_THRESHOLD) {
      lastSensorThreshold = SENSOR_THRESHOLD;
      Serial.print("New sensor threshold: ");
      Serial.print(SENSOR_THRESHOLD);
      Serial.println(" ----- ");
    }
  }

  checkSensor(SENSOR_PIN_A, TARGET_ZONE_A);
  checkSensor(SENSOR_PIN_B, TARGET_ZONE_B);
  checkSensor(SENSOR_PIN_C, TARGET_ZONE_C);
  checkSensor(SENSOR_PIN_D, TARGET_ZONE_D);
}
