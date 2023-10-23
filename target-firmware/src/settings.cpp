#include "settings.h"
#include <Arduino.h>
#include <Preferences.h>
#include <map>

#define SETTINGS_NAMESPACE "settings"

Preferences settingsPrefs;

Settings::Settings() {

}

void Settings::begin() {
  std::map<String, String> cache;
  this->cache = cache;
}

String Settings::readStringFromFlash(String key, String defaultValue) {
  settingsPrefs.begin(SETTINGS_NAMESPACE, true);
  String value = settingsPrefs.getString(key.c_str(), "");
  
  settingsPrefs.end();

  if (value != "") {
    this->cache[key] = value;
  }

  settingsPrefs.end();
  return value;
}

int Settings::readIntFromFlash(String key, int defaultValue) {
  settingsPrefs.begin(SETTINGS_NAMESPACE, true);
  int value = settingsPrefs.getInt(key.c_str(), defaultValue);

  if(value != -1) {
    this->cache[key] = String(value);
  }

  settingsPrefs.end();
  return value;
}

String Settings::getString(String key, String defaultValue) {
  if (this->cache.find(key) != this->cache.end()) {
    return this->cache[key];
  } else {
    String value = readStringFromFlash(key);
    return (value != "") ? value : defaultValue;
  }
}

int Settings::getInt(const String key, int defaultValue) {
  if (this->cache.find(key) != this->cache.end()) {
    return this->cache[key].toInt();
  } else {
    int value = readIntFromFlash(key);
    return (value != -1) ? value : defaultValue;
  }
}

void Settings::set(String key, String value) {
  this->cache[key] = value;

  settingsPrefs.begin(SETTINGS_NAMESPACE, false);
  settingsPrefs.putString(key.c_str(), value);
  settingsPrefs.end();

  char settingsString[512];
  sprintf(settingsString , "Settings updated with string: \"%s\": \"%s\"", key.c_str(), value.c_str());
}

void Settings::set(String key, int value) {
  this->cache[key] = String(value);

  settingsPrefs.begin(SETTINGS_NAMESPACE, false);
  settingsPrefs.putInt(key.c_str(), value);
  settingsPrefs.end();

  char settingsString[512];
  sprintf(settingsString, "Settings updated with int: \"%s\": \"%s\"", key.c_str(), value);
  Serial.print(settingsString);
}