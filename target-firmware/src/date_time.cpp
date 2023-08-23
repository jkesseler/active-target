#ifndef ISO_DATE_H
#define ISO_DATE_H

#include <Arduino.h>
#include <time.h>

const time_t TIME_SYNC_THRESHOLD = 1611667200; // 2021-01-27 00:00:00 UTC
const int MAX_SYNC_WAIT_TIME = 10;             // in seconds

bool timeSync() {
  configTime(0, 0, "pool.ntp.org");
  int waitTime = 0;

  while (time(nullptr) < TIME_SYNC_THRESHOLD && waitTime < MAX_SYNC_WAIT_TIME) {
    delay(1000);
    waitTime++;
  }

  return time(nullptr) >= TIME_SYNC_THRESHOLD;
}

String getISODateTime() {
  time_t now;
  time(&now);
  char isoDateTimeStr[40]; // Add some buffer space for safety.
  strftime(isoDateTimeStr, sizeof(isoDateTimeStr), "%Y-%m-%dT%H:%M:%SZ", gmtime(&now));
  return String(isoDateTimeStr);
}

int64_t getTimeMillies() {
  struct timeval tv;
  gettimeofday(&tv, NULL);
  return (tv.tv_sec * 1000LL + (tv.tv_usec / 1000LL));
}

#endif
