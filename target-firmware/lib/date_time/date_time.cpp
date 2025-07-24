#include "date_time.h"
#include <Arduino.h>
#include <time.h>

// Forward declaration for error handler (avoid circular dependencies)
#ifdef ERROR_HANDLER_H
#include "error_handler.h"
#define LOG_TIME_SYNC(severity, code, message) LOG_##severity(ErrorHandler::Category::SYSTEM, code, message)
#else
#define LOG_TIME_SYNC(severity, code, message) Serial.println(String("[TIME_SYNC] ") + message)
#endif

const time_t TIME_SYNC_THRESHOLD = 1611667200; // 2021-01-27 00:00:00 UTC
const int MAX_SYNC_WAIT_TIME = 10;             // in seconds

// Global time sync state
TimeSyncState g_timeSyncState;

void initializeTimeSync(const String &ntpServer) {
  g_timeSyncState.ntpServer = ntpServer;
  g_timeSyncState.isInitialized = true;
  g_timeSyncState.lastSyncAttempt = 0;
  g_timeSyncState.lastSuccessfulSync = 0;
  g_timeSyncState.consecutiveFailures = 0;
  g_timeSyncState.isSynced = false;

  LOG_TIME_SYNC(INFO, 0, String("Time sync initialized with NTP server: ") + ntpServer);
}

bool timeSync(const String &ntpServer) {
  char ntpServerChar[32];
  ntpServer.toCharArray(ntpServerChar, 32);

  configTime(0, 0, ntpServerChar);
  int waitTime = 0;

  while (time(nullptr) < TIME_SYNC_THRESHOLD && waitTime < MAX_SYNC_WAIT_TIME) {
    delay(1000);
    waitTime++;
  }

  return time(nullptr) >= TIME_SYNC_THRESHOLD;
}

bool periodicTimeSync() {
  unsigned long currentTime = millis();

  // Initialize if not done yet
  if (!g_timeSyncState.isInitialized) {
    initializeTimeSync();
  }

  // Check if we need to sync
  bool needsSync = false;
  unsigned long syncInterval = TIME_SYNC_INTERVAL;

  // Use shorter retry interval if we have failures
  if (g_timeSyncState.consecutiveFailures > 0) {
    syncInterval = TIME_SYNC_RETRY_INTERVAL;
  }

  // First sync or periodic sync needed
  if (g_timeSyncState.lastSyncAttempt == 0 ||
      (currentTime - g_timeSyncState.lastSyncAttempt) >= syncInterval) {
    needsSync = true;
  }

  if (!needsSync) {
    return g_timeSyncState.isSynced;
  }

  // Log sync attempt
  if (g_timeSyncState.consecutiveFailures > 0) {
    LOG_TIME_SYNC(WARNING, 4001, String("Retrying time sync attempt #") + String(g_timeSyncState.consecutiveFailures + 1));
  } else {
    LOG_TIME_SYNC(INFO, 0, "Starting periodic time synchronization");
  }

  // Attempt sync
  g_timeSyncState.lastSyncAttempt = currentTime;
  bool syncResult = timeSync(g_timeSyncState.ntpServer);

  if (syncResult) {
    g_timeSyncState.isSynced = true;
    g_timeSyncState.lastSuccessfulSync = currentTime;

    if (g_timeSyncState.consecutiveFailures > 0) {
      LOG_TIME_SYNC(INFO, 0, String("Time sync recovered after ") + String(g_timeSyncState.consecutiveFailures) + " failures");
    } else {
      LOG_TIME_SYNC(INFO, 0, "Time synchronized successfully");
    }

    g_timeSyncState.consecutiveFailures = 0;
  } else {
    g_timeSyncState.consecutiveFailures++;

    String errorMsg = String("Time sync failed (attempt ") + String(g_timeSyncState.consecutiveFailures) + ")";

    if (g_timeSyncState.consecutiveFailures <= 3) {
      LOG_TIME_SYNC(WARNING, 4002, errorMsg + " - will retry");
    } else {
      LOG_TIME_SYNC(ERROR, 4003, errorMsg + " - marking as not synced");
      g_timeSyncState.isSynced = false;
    }
  }

  return syncResult;
}

bool isTimeSynced() {
  return g_timeSyncState.isSynced && (time(nullptr) >= TIME_SYNC_THRESHOLD);
}

unsigned long getTimeSinceLastSync() {
  if (g_timeSyncState.lastSuccessfulSync == 0) {
    return ULONG_MAX; // Never synced
  }
  return millis() - g_timeSyncState.lastSuccessfulSync;
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
