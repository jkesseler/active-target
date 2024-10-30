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
  meta["timestamp"] = getISODateTime();
  meta["timeMillies"] = getTimeMillies();
  meta["deviceId"] = this->UUID;
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
  meta["timestamp"] = getISODateTime();
  meta["timeMillies"] = getTimeMillies();
  meta["deviceId"] = this->UUID;
  payload["deviceName"] = this->deviceName;

  String jsonString;
  serializeJson(doc, jsonString);

  return jsonString;
}

String Messages::createAddResultMessage(const char *targetZone) {
  StaticJsonDocument<768> doc;
  JsonObject payload = doc.createNestedObject("payload");
  JsonObject meta = doc.createNestedObject("meta");

  doc["type"] = "stages/hit";
  meta["timestamp"] = getISODateTime();
  meta["timeMillies"] = getTimeMillies();
  meta["deviceId"] = this->UUID;
  payload["deviceName"] = this->deviceName;
  payload["result"] = "hit";
  payload["targetZone"] = targetZone;

  String jsonString;
  serializeJson(doc, jsonString);

  return jsonString;
}