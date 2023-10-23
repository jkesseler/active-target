#include "DeviceId.h"
#include "settings.h"
#include "date_time.h"
#include "include.h"
#include "json_messages.h"
#include "wifi_utils.h"
#include "handleMqttMessage.h"
#include <Arduino.h>
#include <PubSubClient.h>

Settings settings;
WiFiClient espClient;
PubSubClient client(espClient);
String uuid = EMPTY_UUID;
Messages jsonMessages;

char mqttTopic[64];
char mqttClientId[64];
volatile unsigned long lastDebounceTime = 0;
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

    if (client.connect(mqttClientId)) {
      Serial.println("connected");

      char actionsTopic[100];
      sprintf(actionsTopic, "at/device/%s/actions", uuid.c_str());
      Serial.println(actionsTopic);
      client.subscribe(actionsTopic);
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
  
  connectToWiFi(ssid, password);
  timeSync();

  settings.begin();

  DeviceId deviceId;
  uuid = deviceId.get();
  deviceName = settings.getString("deviceName", DEFAULT_DEVICE_NAME);

  Serial.println(uuid);
  Serial.println(deviceName);

  jsonMessages.begin(uuid, DEFAULT_DEVICE_NAME);

  sprintf(mqttClientId, "TARGET{%s}", uuid.c_str());
  sprintf(mqttTopic, "at/device/%s/actions", uuid.c_str());

  client.setServer(MQTT_SERVER, 1883);
  client.setCallback(onMessageReceive);
  client.setBufferSize(1024);
  connectToMqttServer();

  String addTargetMessage = jsonMessages.createDeviceOnlineMessage();
  client.publish("at/devices", addTargetMessage.c_str());
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
    if(lastSensorDebounce != SENSOR_DEBOUNCE) {
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


  if (currentTime - lastDebounceTime > SENSOR_DEBOUNCE) {
    lastDebounceTime = currentTime;

    int piezoVal = analogRead(BUTTON_PIN);

    if (piezoVal > SENSOR_THRESHOLD) {
      Serial.println("Sensor triggered with value: ");
      Serial.println(piezoVal); 
      Serial.println("------");
      Serial.println("");

      String resultMessage = jsonMessages.createAddResultMessage();
      Serial.println(mqttTopic);
      Serial.println(resultMessage.c_str());

      bool isPublished = client.publish(mqttTopic, resultMessage.c_str());

      if (!isPublished) {
        Serial.println("Not Published");
      }
    }
  }
}
