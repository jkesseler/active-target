#include "json_messages.h"
#include "date_time.h"
#include "settings.h"
#include <ArduinoJson.h>

// Settings settings;

Messages::Messages(String uuid) {
  this->UUID = uuid;
}

String Messages::createAddTargetMessage() {
  StaticJsonDocument<256> doc;
  JsonObject payload = doc.createNestedObject("payload");
  JsonObject meta = doc.createNestedObject("meta");
  int64_t isoDateTime = getTimeMillies();

  doc["type"] = "targets/addTarget";
  meta["timestamp"] = isoDateTime;
  payload["deviceId"] = this->UUID;
  payload["deviceName"] = settings.getString("deviceName"); 
  String jsonString;
  serializeJson(doc, jsonString);

  return jsonString;
}


String Messages::createUpdateTargetMessage() {
  StaticJsonDocument<256> doc;
  JsonObject payload = doc.createNestedObject("payload");
  JsonObject meta = doc.createNestedObject("meta");
  int64_t isoDateTime = getTimeMillies();

  doc["type"] = "targets/updateTarget";
  meta["timestamp"] = isoDateTime;
  payload["deviceId"] = this->UUID;
  payload["deviceName"] = settings.getString("deviceName");

  String jsonString;
  serializeJson(doc, jsonString);

  return jsonString;
}


String Messages::createAddResultMessage() {
  StaticJsonDocument<192> doc;
  JsonObject payload = doc.createNestedObject("payload");
  JsonObject meta = doc.createNestedObject("meta");
  int64_t isoDateTime = getTimeMillies();

  doc["type"] = "results/addResult";
  meta["timestamp"] = isoDateTime;
  payload["deviceId"] = this->UUID;
  payload["deviceName"] = settings.getString("deviceName");
  payload["result"] = "hit";

  String jsonString;
  serializeJson(doc, jsonString);

  return jsonString;
}