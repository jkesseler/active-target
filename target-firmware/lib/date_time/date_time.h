#ifndef ISO_DATE_H
#define ISO_DATE_H

#include <Arduino.h>

// Time sync configuration
const unsigned long TIME_SYNC_INTERVAL = 3600000; // 1 hour in milliseconds
const unsigned long TIME_SYNC_RETRY_INTERVAL = 300000; // 5 minutes on failure

// Time sync state management
struct TimeSyncState {
    bool isInitialized = false;
    bool isSynced = false;
    unsigned long lastSyncAttempt = 0;
    unsigned long lastSuccessfulSync = 0;
    int consecutiveFailures = 0;
    String ntpServer = "pool.ntp.org";
};

// Function declarations
bool timeSync(const String &ntpServer);
bool periodicTimeSync();
void initializeTimeSync(const String &ntpServer = "pool.ntp.org");
bool isTimeSynced();
unsigned long getTimeSinceLastSync();
String getISODateTime();
int_fast64_t getTimeMillies();

#endif