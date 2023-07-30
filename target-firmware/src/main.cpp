#include <Arduino.h>
#include <PubSubClient.h>
#include "include.h"
#include "DeviceId.h"
#include "wifi_utils.h"
#include "date_time.h"
#include "json_messages.h"


WiFiClient espClient;
PubSubClient client(espClient);
String uuid = EMPTY_UUID;
Messages jsonMessages(uuid);

char mqttTopic[64];
char mqttClientId[64];
volatile unsigned long lastInterruptTime = 0;


void onMessageReceive(char *topic, byte *message, unsigned int length)
{
  Serial.print("Message arrived on topic: ");
  Serial.print(topic);
  Serial.print(". Message: ");
  String messageTemp;

  for (int i = 0; i < length; i++)
  {
    Serial.print((char)message[i]);
    messageTemp += (char)message[i];
  }
  Serial.println(messageTemp);
}

void connectToMqttServer()
{
  int initialReconnectDelay = 1000;
  int currentReconnectDelay = initialReconnectDelay;
  int maxReconnectDelay = 16000;

  while (!client.connected())
  {
    Serial.print("Attempting MQTT connection...");

    if (client.connect(mqttClientId))
    {
      Serial.println("connected");

      char topic[50];
      sprintf(topic, "/at/%s/actions", uuid.c_str());
      client.subscribe(topic);
    }
    else
    {
      if (currentReconnectDelay < maxReconnectDelay)
      {
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

  DeviceId deviceId;
  uuid = deviceId.get();
  jsonMessages = Messages(uuid);


  sprintf(mqttClientId, "TARGET{%s}", uuid.c_str());  
  sprintf(mqttTopic, "at/target/%s/actions", uuid.c_str());

  connectToWiFi(ssid, password);

  timeSync();

  client.setServer(mqtt_server, 1883);
  client.setCallback(onMessageReceive);
  connectToMqttServer();

  

  String addTargetMessage = jsonMessages.createAddTargetMessage();
  client.publish(mqttTopic, addTargetMessage.c_str());
  
  delay(500);
  String updateTargetMessage = jsonMessages.createUpdateTargetMessage();
  client.publish(mqttTopic, updateTargetMessage.c_str());
}

void loop() {
  if (!client.connected()) {
    connectToMqttServer();
  }

  int piezoVal = analogRead(BUTTON_PIN);

  unsigned long currentTime = millis();
  if (piezoVal > THRESHOLD && currentTime - lastInterruptTime > DEBOUNCE_TIME)
  {
    Serial.println(piezoVal);
    lastInterruptTime = currentTime;

    Serial.println("Pew Pew");
    // TODO: Add number of millies since last trigger to the message
    String resultMessage = jsonMessages.createAddResultMessage();
    client.publish(mqttTopic, resultMessage.c_str());
  }
}
