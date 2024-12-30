#include "json_messages.h"
#include "common.h"
#include "date_time.h"
#include <ArduinoJson.h>

Messages::Messages() {

}

void Messages::begin(String uuid, String deviceName, String deviceType) {
  this->UUID = uuid;
  this->deviceName = deviceName;
  this->deviceType = deviceType;
}

String Messages::createDeviceOnlineMessage() {
  StaticJsonDocument<768> doc;
  JsonObject payload = doc.createNestedObject("payload");
  JsonObject meta = doc.createNestedObject("meta");

  meta["timestamp"] = getISODateTime();
  meta["timeMillies"] = getTimeMillies();
  meta["id"] = this->UUID;
  payload["name"] = this->deviceName;
  payload["type"] = this->deviceType;

  doc["action"] = "device/online";
  doc["payload"] = payload;
  
  String jsonString;
  serializeJson(doc, jsonString);

  return jsonString;
}

String Messages::createDeviceUpdatedMessage() {
  StaticJsonDocument<768> doc;
  JsonObject payload = doc.createNestedObject("payload");
  JsonObject meta = doc.createNestedObject("meta");
  
  meta["timestamp"] = getISODateTime();
  meta["timeMillies"] = getTimeMillies();
  meta["id"] = this->UUID;
  doc["payload"] = payload;
  doc["action"] = "devices/updated";

  String jsonString;
  serializeJson(doc, jsonString);

  return jsonString;
}

String Messages::createTargetHitMessage(const char *targetZone) {
  StaticJsonDocument<768> doc;
  JsonObject payload = doc.createNestedObject("payload");
  JsonObject meta = doc.createNestedObject("meta");
    
  payload["targetZone"] = targetZone;
  meta["timestamp"] = getISODateTime();
  meta["timeMillies"] = getTimeMillies();
  meta["id"] = this->UUID;
  doc["payload"] = payload;
  doc["action"] = "DEVICES/TARGET";

  String jsonString;
  serializeJson(doc, jsonString);

  return jsonString;
}

String Messages::createMessageWitoutPayload(String action) {
  StaticJsonDocument<768> doc;
  JsonObject meta = doc.createNestedObject("meta");

  doc["action"] = action;
  meta["timestamp"] = getISODateTime();
  meta["timeMillies"] = getTimeMillies();
  meta["id"] = this->UUID;
  

  String jsonString;
  serializeJson(doc, jsonString);

  return jsonString;
}