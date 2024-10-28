#ifndef ISO_DATE_H
#define ISO_DATE_H

#include <Arduino.h>

bool timeSync(const String &ntpServer);
String getISODateTime();
int_fast64_t getTimeMillies();

#endif