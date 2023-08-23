#include "json_messages.h"
#include "date_time.h"
#include "include.h"
#include <ArduinoJson.h>

Messages::Messages() {

}

void Messages::begin(String uuid, Settings settings) {
  this->UUID = uuid;
  this->settings = settings;
}

String Messages::createDeviceOnlineMessage() {
  StaticJsonDocument<256> doc;
  JsonObject payload = doc.createNestedObject("payload");
  JsonObject meta = doc.createNestedObject("meta");

  doc["type"] = "devices/online";
  payload["timestamp"] = getISODateTime();
  payload["timeMillies"] = getTimeMillies();
  payload["deviceId"] = this->UUID;
  payload["deviceName"] = this->settings.getString("deviceName");

  String jsonString;
  serializeJson(doc, jsonString);

  return jsonString;
}


String Messages::createDeviceUpdatedMessage() {
  StaticJsonDocument<256> doc;
  JsonObject payload = doc.createNestedObject("payload");
  JsonObject meta = doc.createNestedObject("meta");

  doc["type"] = "devices/updated";
  payload["timestamp"] = getISODateTime();
  payload["timeMillies"] = getTimeMillies();
  payload["deviceId"] = this->UUID;
  payload["deviceName"] = this->settings.getString("deviceName");

  String jsonString;
  serializeJson(doc, jsonString);

  return jsonString;
}


String Messages::createAddResultMessage() {
  StaticJsonDocument<256> doc;
  JsonObject payload = doc.createNestedObject("payload");

  doc["type"] = "results/addResult";
  payload["timestamp"] = getISODateTime();
  payload["timeMillies"] = getTimeMillies();
  payload["deviceId"] = this->UUID;
  payload["deviceName"] = this->settings.getString("deviceName");
  payload["deviceType"] = DEVICE_TYPE;
  payload["result"] = "hit";

  String jsonString;
  serializeJson(doc, jsonString);

  return jsonString;
}