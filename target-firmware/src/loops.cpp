#include "common.h"

static void checkSensor(int pin, const char *targetZone) {
  int piezoVal = analogRead(pin);
  unsigned long currentTime = millis();

  if (piezoVal > SENSOR_THRESHOLD && (currentTime - lastDebounceTime > SENSOR_DEBOUNCE)) {
    lastDebounceTime = currentTime;
    Serial.println("------");
    Serial.println("------");
    Serial.println("------");
    Serial.print("Sensor triggered on target zone ");
    Serial.print(targetZone);
    Serial.print(" with value: ");
    Serial.println(piezoVal);
    Serial.println("------");
    // Generate and publish result message for the triggered sensor
    String resultMessage = jsonMessages.createTargetHitMessage(targetZone);
    Serial.println(mqttResponseTopic);
    Serial.println(resultMessage.c_str());

    bool isPublished = mqttClient.publish(mqttResponseTopic, resultMessage.c_str());

    if (!isPublished) {
      Serial.println("Not Published");
    }
  }
}

static void targetLoop() {
  checkSensor(SENSOR_PIN_A, TARGET_ZONE_A);
  checkSensor(SENSOR_PIN_B, TARGET_ZONE_B);
  checkSensor(SENSOR_PIN_C, TARGET_ZONE_C);
  checkSensor(SENSOR_PIN_D, TARGET_ZONE_D);
}

static void popperLoop() { 
  checkSensor(SENSOR_PIN_A, TARGET_ZONE_POPPER); 
}

static bool noShootLoop() {
  String action = "DEVICES/NO_SHOOT";
  String message = jsonMessages.createMessageWitoutPayload(action);
  bool isPublished = mqttClient.publish(mqttResponseTopic, message.c_str());
  return isPublished;
}

static bool stopPlateLoop() {
  String action = "DEVICES/STOP_PLATE";
  String message = jsonMessages.createMessageWitoutPayload(action);
  bool isPublished = mqttClient.publish(mqttResponseTopic, message.c_str());
  return isPublished;
}

static bool triggerLoop() {
  String action = "DEVICES/TRIGGER"; // TODO: Come up with a better name
  String message = jsonMessages.createMessageWitoutPayload(action);
  bool isPublished = mqttClient.publish(mqttResponseTopic, message.c_str());
  return isPublished;
}

static void actuatorLoop() {
  // TODO: Listen for incomming messages and act upon those
}

static void checkSettingLoop() {
  SENSOR_DEBOUNCE = settings.getInt("sensorDebounceTime", DEFAULT_SENSOR_DEBOUNCE);
  if (lastSensorDebounce != SENSOR_DEBOUNCE) {
    lastSensorDebounce = SENSOR_DEBOUNCE;
    Serial.print("New sensor debounce: ");
    Serial.print(SENSOR_DEBOUNCE);
    Serial.println(" ----- ");
  }

  SENSOR_THRESHOLD = settings.getInt("sensorThreshold", DEFAULT_SENSOR_THRESHOLD);
  if (lastSensorThreshold != SENSOR_THRESHOLD) {
    lastSensorThreshold = SENSOR_THRESHOLD;
    Serial.print("New sensor threshold: ");
    Serial.print(SENSOR_THRESHOLD);
    Serial.println(" ----- ");
  }
}