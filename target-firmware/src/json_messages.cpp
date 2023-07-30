#include <ArduinoJson.h>
#include "json_messages.h"
#include "date_time.h"
// #include "DeviceId.h"

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
  payload["targetId"] = this->UUID;
  payload["targetName"] = "My First Target"; // TODO: Get from prefereneces
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
  payload["targetId"] = this->UUID;
  payload["targetName"] = "My First Target"; // TODO: Get from prefereneces

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
  payload["targetId"] = this->UUID;
  payload["targetName"] = "My First Target"; // TODO: Get from prefereneces
  payload["result"] = "hit";

  String jsonString;
  serializeJson(doc, jsonString);

  return jsonString;
}