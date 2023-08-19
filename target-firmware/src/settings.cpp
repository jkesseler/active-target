#include "settings.h"
#include <Arduino.h>
#include <Preferences.h>
#include <map>

#define SETTINGS_NAMESPACE "settings"

Preferences settingsPrefs;
Settings settings;

Settings::Settings() { 
   std::map<String, String> cache; 
}

String Settings::readStringFromFlash(const String &key) {
  settingsPrefs.begin(SETTINGS_NAMESPACE, true);
  String value = settingsPrefs.getString(key.c_str(), "");
  settingsPrefs.end();
  if (value != "") {
    cache[key] = value;
  }
  return value;
}

int Settings::readIntFromFlash(const String &key) {
  settingsPrefs.begin(SETTINGS_NAMESPACE, true);
  int value = settingsPrefs.getInt(key.c_str(), -1);
  settingsPrefs.end();
  cache[key] = String(value);
  return value;
}

String Settings::getString(const String &key, const String &defaultValue) {
  if (cache.find(key) != cache.end()) {
    return cache[key];
  } else {
    String value = readStringFromFlash(key);
    return (value != "") ? value : defaultValue;
  }
}

int Settings::getInt(const String &key, int defaultValue) {
  if (cache.find(key) != cache.end()) {
    return cache[key].toInt();
  } else {
    int value = readIntFromFlash(key);
    return (value != -1) ? value : defaultValue;
  }
}

void Settings::set(const String &key, const String &value) {
  cache[key] = value;

  settingsPrefs.begin(SETTINGS_NAMESPACE, false);
  settingsPrefs.putString(key.c_str(), value);
  settingsPrefs.end();
}

void Settings::set(const String &key, int value) {
  cache[key] = String(value);

  settingsPrefs.begin(SETTINGS_NAMESPACE, false);
  settingsPrefs.putInt(key.c_str(), value);
  settingsPrefs.end();
}