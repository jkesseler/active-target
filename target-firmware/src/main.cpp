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

String deviceName = DEFAULT_DEVICE_NAME;
int SENSOR_DEBOUNCE = DEFAULT_SENSOR_DEBOUNCE;
int SENSOR_THRESHOLD = DEFAULT_SENSOR_THRESHOLD;

void onMessageReceive(char *topic, byte *message, unsigned int length) {
  Serial.print("Message arrived on topic: ");
  Serial.print(topic);
  Serial.print(". Message: ");
  String messageTemp;

  for (int i = 0; i < length; i++) {
    Serial.print((char)message[i]);
    messageTemp += (char)message[i];
  }
  Serial.println(messageTemp);

  handleMqttMessage(messageTemp);

  SENSOR_DEBOUNCE = settings.getInt("sensorDebounceTime");
  SENSOR_THRESHOLD = settings.getInt("sensorThreshold");
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

  client.setBufferSize(756);
  client.setServer(MQTT_SERVER, 1883);
  client.setCallback(onMessageReceive);
  connectToMqttServer();

  String addTargetMessage = jsonMessages.createDeviceOnlineMessage();
  client.publish("at/devices", addTargetMessage.c_str());
}

void loop() {
  client.loop();

  if (!client.connected()) {
    connectToMqttServer();
  }
  
  // SENSOR_DEBOUNCE = settings.getInt("sensorDebounceTime");
  // SENSOR_THRESHOLD = settings.getInt("sensorThreshold");

  int piezoVal = analogRead(BUTTON_PIN);

  unsigned long currentTime = millis();
  if (piezoVal > SENSOR_THRESHOLD && currentTime - lastDebounceTime > SENSOR_DEBOUNCE) {
    lastDebounceTime = currentTime;

    Serial.println("Sensor triggered");

    String resultMessage = jsonMessages.createAddResultMessage();
    Serial.println(mqttTopic);
    Serial.println(resultMessage.c_str());

   bool isPublished = client.publish(mqttTopic, resultMessage.c_str());

   if(!isPublished) {
    Serial.println("Not Published");
   }
  }
}
