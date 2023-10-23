#include "json_messages.h"
#include "date_time.h"
#include "include.h"
#include <ArduinoJson.h>

Messages::Messages() {

}

void Messages::begin(String uuid, String deviceName) {
  this->UUID = uuid;
  this->deviceName = deviceName;
}

String Messages::createDeviceOnlineMessage() {
  StaticJsonDocument<768> doc;
  JsonObject payload = doc.createNestedObject("payload");
  JsonObject meta = doc.createNestedObject("meta");

  doc["type"] = "device/online";
  payload["timestamp"] = getISODateTime();
  payload["timeMillies"] = getTimeMillies();
  payload["deviceId"] = this->UUID;
  payload["deviceName"] = this->deviceName;

  String jsonString;
  serializeJson(doc, jsonString);

  return jsonString;
}


String Messages::createDeviceUpdatedMessage() {
  StaticJsonDocument<768> doc;
  JsonObject payload = doc.createNestedObject("payload");
  JsonObject meta = doc.createNestedObject("meta");

  doc["type"] = "device/updated";
  payload["timestamp"] = getISODateTime();
  payload["timeMillies"] = getTimeMillies();
  payload["deviceId"] = this->UUID;
  payload["deviceName"] = this->deviceName;

  String jsonString;
  serializeJson(doc, jsonString);

  return jsonString;
}


String Messages::createAddResultMessage() {
  StaticJsonDocument<768> doc;
  JsonObject payload = doc.createNestedObject("payload");

  doc["type"] = "results/addResult";
  payload["timestamp"] = getISODateTime();
  payload["timeMillies"] = getTimeMillies();
  payload["deviceId"] = this->UUID;
  payload["deviceName"] = this->deviceName;
  payload["deviceType"] = DEVICE_TYPE;
  payload["result"] = "hit";

  String jsonString;
  serializeJson(doc, jsonString);

  return jsonString;
}