#include "json_messages.h"
#include "date_time.h"
#include "include.h"
#include "settings.h"
#include <ArduinoJson.h>

// Settings settings;

Messages::Messages(String uuid) {
  this->UUID = uuid;
}

String Messages::createDeviceOnlineMessage() {
  StaticJsonDocument<256> doc;
  JsonObject payload = doc.createNestedObject("payload");
  JsonObject meta = doc.createNestedObject("meta");

  doc["type"] = "devices/online";
  payload["timestamp"] = getISODateTime();
  payload["timeMillies"] = getTimeMillies();
  payload["deviceId"] = this->UUID;
  payload["deviceName"] = settings.getString("deviceName"); 

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
  payload["deviceName"] = settings.getString("deviceName");

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
  payload["deviceName"] = settings.getString("deviceName");
  payload["deviceType"] = DEVICE_TYPE;
  payload["result"] = "hit";

  String jsonString;
  serializeJson(doc, jsonString);

  return jsonString;
}