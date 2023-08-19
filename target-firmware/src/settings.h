#ifndef SETTINGS_H
#define SETTINGS_H

#include <Arduino.h>
#include <map>

class Settings {
public:
  
  Settings();
  // Methods for String type
  String getString(const String &key, const String &defaultValue = "");
  void set(const String &key, const String &value);

  // Methods for int type
  int getInt(const String &key, int defaultValue = -1);
  void set(const String &key, int value);

private:
  std::map<String, String> cache;
  String readStringFromFlash(const String &key);
  int readIntFromFlash(const String &key);
};

extern Settings settings;
#endif
