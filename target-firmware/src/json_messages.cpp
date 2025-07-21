#include "json_messages.h"
#include "common.h"
#include "actions.h"
#include "date_time.h"
#include "json_pool.h"
#include <ArduinoJson.h>

Messages::Messages() {

}

void Messages::begin(String uuid, String deviceName, String deviceRole) {
  this->UUID = uuid;
  this->deviceName = deviceName;
  this->deviceRole = deviceRole;
}

String Messages::createDeviceOnlineMessage() {
  auto docGuard = JSON_POOL_ACQUIRE_GUARDED(MEDIUM);
  if (!docGuard.isValid()) {
    return "{}";  // Return empty JSON on allocation failure
  }

  StaticJsonDocument<768>& doc = *docGuard;
  JsonObject payload = doc.createNestedObject("payload");
  JsonObject meta = doc.createNestedObject("meta");

  meta["timestamp"] = getISODateTime();
  meta["timeMillies"] = getTimeMillies();
  meta["id"] = this->UUID;
  payload["name"] = this->deviceName;
  payload["role"] = this->deviceRole;

  doc["action"] =  ACTIONS_DEVICE_ONLINE;
  doc["payload"] = payload;

  String jsonString;
  serializeJson(doc, jsonString);

  return jsonString;
}

String Messages::createDeviceUpdatedMessage() {
  auto docGuard = JSON_POOL_ACQUIRE_GUARDED(SMALL);
  if (!docGuard.isValid()) {
    return "{}";
  }

  StaticJsonDocument<768>& doc = *docGuard;
  JsonObject payload = doc.createNestedObject("payload");
  JsonObject meta = doc.createNestedObject("meta");

  meta["timestamp"] = getISODateTime();
  meta["timeMillies"] = getTimeMillies();
  meta["id"] = this->UUID;
  doc["payload"] = payload;
  doc["action"] = ACTIONS_DEVICE_UPDATED;

  String jsonString;
  serializeJson(doc, jsonString);

  return jsonString;
}

String Messages::createTargetHitMessage(const char *targetZone) {
  auto docGuard = JSON_POOL_ACQUIRE_GUARDED(MEDIUM);
  if (!docGuard.isValid()) {
    return "{}";
  }

  StaticJsonDocument<768>& doc = *docGuard;
  JsonObject payload = doc.createNestedObject("payload");
  JsonObject meta = doc.createNestedObject("meta");

  payload["targetZone"] = targetZone;
  meta["timestamp"] = getISODateTime();
  meta["timeMillies"] = getTimeMillies();
  meta["id"] = this->UUID;
  doc["payload"] = payload;
  doc["action"] = ACTIONS_DEVICE_TARGET_HIT;

  String jsonString;
  serializeJson(doc, jsonString);

  return jsonString;
}

String Messages::createMessage(String action) {
  auto docGuard = JSON_POOL_ACQUIRE_GUARDED(SMALL);
  if (!docGuard.isValid()) {
    return "{}";
  }

  StaticJsonDocument<768>& doc = *docGuard;
  JsonObject meta = doc.createNestedObject("meta");

  doc["action"] = action;
  meta["timestamp"] = getISODateTime();
  meta["timeMillies"] = getTimeMillies();
  meta["id"] = this->UUID;


  String jsonString;
  serializeJson(doc, jsonString);

  return jsonString;
}

String Messages::createMessage(String action, JsonObject payload) {
  auto docGuard = JSON_POOL_ACQUIRE_GUARDED(MEDIUM);
  if (!docGuard.isValid()) {
    return "{}";
  }

  StaticJsonDocument<768>& doc = *docGuard;
  JsonObject meta = doc.createNestedObject("meta");

  doc["action"] = action;
  doc["payload"] = payload;
  meta["timestamp"] = getISODateTime();
  meta["timeMillies"] = getTimeMillies();
  meta["id"] = this->UUID;

  String jsonString;
  serializeJson(doc, jsonString);

  return jsonString;
}