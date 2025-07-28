#include "memory_monitor.h"
#include "string_builder.h"
#include "json_pool.h"
#include <PubSubClient.h>

MemoryMonitor::MemoryMonitor() :
    initialized_(false),
    detailedTracking_(false),
    reportInterval_(30000),
    lastReportTime_(0),
    warningThreshold_(8192),  // 8KB warning threshold
    criticalThreshold_(4096), // 4KB critical threshold
    trendIndex_(0),
    mqttReportingEnabled_(false),
    mqttClient_(nullptr),
    leakCount_(0) {

    // Initialize statistics
    memset(&currentStats_, 0, sizeof(currentStats_));
    memset(&previousStats_, 0, sizeof(previousStats_));
    memset(trendSamples_, 0, sizeof(trendSamples_));
    memset(leakEntries_, 0, sizeof(leakEntries_));
}

MemoryMonitor& MemoryMonitor::getInstance() {
    static MemoryMonitor instance;
    return instance;
}

void MemoryMonitor::initialize(bool enableDetailedTracking, unsigned long reportInterval) {
    if (initialized_) {
        return;
    }

    detailedTracking_ = enableDetailedTracking;
    reportInterval_ = reportInterval;

    // Initialize baseline statistics
    currentStats_.freeHeap = ESP.getFreeHeap();
    currentStats_.minFreeHeap = ESP.getMinFreeHeap();
    currentStats_.totalHeap = ESP.getHeapSize();
    currentStats_.maxAllocHeap = currentStats_.totalHeap - currentStats_.minFreeHeap;
    currentStats_.fragmentationRatio = getFragmentation();
    currentStats_.uptime = millis();

    // Initialize trend tracking
    for (int i = 0; i < TREND_SAMPLES; i++) {
        trendSamples_[i] = currentStats_.freeHeap;
    }

    initialized_ = true;

    LOG_INFO(ErrorHandler::Category::SYSTEM, 0, "Memory monitor initialized - Free: " +
             formatMemorySize(currentStats_.freeHeap) + "/" + formatMemorySize(currentStats_.totalHeap));
}

void MemoryMonitor::update() {
    if (!initialized_) {
        initialize();
        return;
    }

    // Update current statistics
    previousStats_ = currentStats_;

    currentStats_.freeHeap = ESP.getFreeHeap();
    currentStats_.minFreeHeap = ESP.getMinFreeHeap();
    currentStats_.maxAllocHeap = currentStats_.totalHeap - currentStats_.minFreeHeap;
    currentStats_.fragmentationRatio = getFragmentation();
    currentStats_.uptime = millis();

    // Update trend analysis
    updateTrend();

    // Check thresholds and issue warnings
    checkThresholds();

    // Periodic reporting
    if (reportInterval_ > 0 &&
        (currentStats_.uptime - lastReportTime_) >= reportInterval_) {
        logMemoryUsage();
        lastReportTime_ = currentStats_.uptime;

        if (mqttReportingEnabled_) {
            sendMqttReport();
        }
    }
}

MemoryMonitor::MemoryStats MemoryMonitor::getStats() const {
    return currentStats_;
}

MemoryMonitor::HealthStatus MemoryMonitor::getHealthStatus() const {
    float freePercentage = (float)currentStats_.freeHeap / (float)currentStats_.totalHeap * 100.0f;
    float fragmentation = currentStats_.fragmentationRatio;

    if (freePercentage > 75.0f && fragmentation < 10.0f) {
        return HealthStatus::EXCELLENT;
    } else if (freePercentage > 50.0f && fragmentation < 25.0f) {
        return HealthStatus::GOOD;
    } else if (freePercentage > 25.0f && fragmentation < 50.0f) {
        return HealthStatus::WARNING;
    } else {
        return HealthStatus::CRITICAL;
    }
}

void MemoryMonitor::logMemoryUsage(bool forceLog) {
    if (!initialized_ && !forceLog) {
        return;
    }

    HealthStatus health = getHealthStatus();
    const char* healthStr[] = {"EXCELLENT", "GOOD", "WARNING", "CRITICAL"};

    StringBuilder msg(256);
    msg.append("Memory Status: ").append(healthStr[static_cast<int>(health)])
       .append(" - Free: ").append(formatMemorySize(currentStats_.freeHeap))
       .append("/").append(formatMemorySize(currentStats_.totalHeap))
       .append(" (").append(currentStats_.fragmentationRatio, 1).append("% fragmented)");

    ErrorHandler::Severity severity = ErrorHandler::Severity::INFO;
    int errorCode = 0;

    switch (health) {
        case HealthStatus::WARNING:
            severity = ErrorHandler::Severity::WARNING;
            errorCode = 7001;
            break;
        case HealthStatus::CRITICAL:
            severity = ErrorHandler::Severity::ERROR;
            errorCode = 7002;
            break;
        default:
            break;
    }

    g_errorHandler.logError(severity, ErrorHandler::Category::SYSTEM, errorCode, msg.toString());

    // Log trend information if detailed tracking is enabled
    if (detailedTracking_) {
        int trend = getUsageTrend();
        if (trend != 0) {
            StringBuilder trendMsg(128);
            trendMsg.append("Memory trend: ").append(trend > 0 ? "increasing" : "decreasing")
                   .append(" usage (").append(abs(trend)).append(" bytes/sample)");
            LOG_DEBUG(ErrorHandler::Category::SYSTEM, 0, trendMsg.toString());
        }
    }
}

float MemoryMonitor::getFragmentation() {
    size_t freeHeap = ESP.getFreeHeap();
    size_t maxAlloc = ESP.getMaxAllocHeap();

    if (freeHeap == 0) {
        return 100.0f;
    }

    return (1.0f - (float)maxAlloc / (float)freeHeap) * 100.0f;
}

int MemoryMonitor::detectLeaks() {
    // Simple leak detection based on trend analysis
    int trend = getUsageTrend();

    // If memory usage is consistently increasing, potential leak
    if (trend > 100) {  // More than 100 bytes increase per sample
        LOG_WARNING(ErrorHandler::Category::SYSTEM, 7003,
                   "Potential memory leak detected - consistent usage increase: " + String(trend) + " bytes/sample");
        return 1;
    }

    return 0;
}

String MemoryMonitor::createMemoryReport() const {
    auto docGuard = JsonDocumentPool::getInstance().acquireGuarded<768>(JsonDocumentPool::MEDIUM);
    if (!docGuard.isValid()) {
        return "{}";
    }

    StaticJsonDocument<768>& doc = *docGuard;

    doc["freeHeap"] = currentStats_.freeHeap;
    doc["totalHeap"] = currentStats_.totalHeap;
    doc["minFreeHeap"] = currentStats_.minFreeHeap;
    doc["maxAllocHeap"] = currentStats_.maxAllocHeap;
    doc["fragmentation"] = currentStats_.fragmentationRatio;
    doc["health"] = static_cast<int>(getHealthStatus());
    doc["uptime"] = currentStats_.uptime;
    doc["trend"] = getUsageTrend();

    String result;
    serializeJson(doc, result);
    return result;
}

bool MemoryMonitor::isMemoryHealthy() const {
    HealthStatus health = getHealthStatus();
    return health == HealthStatus::EXCELLENT || health == HealthStatus::GOOD;
}

void MemoryMonitor::forceGarbageCollection() {
    // ESP32 doesn't have explicit GC, but we can try to defragment
    LOG_DEBUG(ErrorHandler::Category::SYSTEM, 0, "Forcing memory cleanup");

    // Log before/after for comparison
    size_t beforeFree = ESP.getFreeHeap();

    // Try to trigger heap compaction by allocating and freeing a small block
    void* temp = malloc(32);
    if (temp) {
        free(temp);
    }

    size_t afterFree = ESP.getFreeHeap();

    if (afterFree > beforeFree) {
        LOG_DEBUG(ErrorHandler::Category::SYSTEM, 0,
                 "Memory cleanup recovered " + String(afterFree - beforeFree) + " bytes");
    }
}

int MemoryMonitor::getUsageTrend() const {
    if (!initialized_) {
        return 0;
    }

    // Calculate average slope of memory usage over trend samples
    long totalChange = 0;
    int validSamples = 0;

    for (int i = 1; i < TREND_SAMPLES; i++) {
        int prevIndex = (trendIndex_ - i + TREND_SAMPLES) % TREND_SAMPLES;
        int currIndex = (trendIndex_ - i + 1 + TREND_SAMPLES) % TREND_SAMPLES;

        if (trendSamples_[prevIndex] > 0 && trendSamples_[currIndex] > 0) {
            totalChange += (long)trendSamples_[prevIndex] - (long)trendSamples_[currIndex];
            validSamples++;
        }
    }

    return validSamples > 0 ? (int)(totalChange / validSamples) : 0;
}

void MemoryMonitor::resetPeakStats() {
    currentStats_.minFreeHeap = ESP.getFreeHeap();
    currentStats_.maxAllocHeap = 0;
    currentStats_.peakAllocations = 0;

    LOG_INFO(ErrorHandler::Category::SYSTEM, 0, "Memory peak statistics reset");
}

void MemoryMonitor::setThresholds(size_t warningThreshold, size_t criticalThreshold) {
    warningThreshold_ = warningThreshold;
    criticalThreshold_ = criticalThreshold;

    LOG_INFO(ErrorHandler::Category::SYSTEM, 0,
             "Memory thresholds updated - Warning: " + formatMemorySize(warningThreshold_) +
             ", Critical: " + formatMemorySize(criticalThreshold_));
}

void MemoryMonitor::enableMqttReporting(bool enable, void* client, const char* topic) {
    mqttReportingEnabled_ = enable;
    mqttClient_ = client;

    if (topic) {
        mqttTopic_ = String(topic);
    }

    if (enable && (!client || mqttTopic_.isEmpty())) {
        LOG_WARNING(ErrorHandler::Category::SYSTEM, 7004, "MQTT reporting enabled but client or topic not set");
        mqttReportingEnabled_ = false;
    }
}

void MemoryMonitor::updateTrend() {
    trendSamples_[trendIndex_] = currentStats_.freeHeap;
    trendIndex_ = (trendIndex_ + 1) % TREND_SAMPLES;
}

float MemoryMonitor::calculateFragmentation() const {
    return getFragmentation();
}

void MemoryMonitor::checkThresholds() {
    if (currentStats_.freeHeap <= criticalThreshold_) {
        LOG_ERROR(ErrorHandler::Category::SYSTEM, 7005,
                 "Critical memory threshold reached - Free: " + formatMemorySize(currentStats_.freeHeap));
    } else if (currentStats_.freeHeap <= warningThreshold_) {
        LOG_WARNING(ErrorHandler::Category::SYSTEM, 7006,
                   "Memory warning threshold reached - Free: " + formatMemorySize(currentStats_.freeHeap));
    }
}

void MemoryMonitor::sendMqttReport() {
    if (!mqttClient_ || mqttTopic_.isEmpty()) {
        return;
    }

    PubSubClient* client = static_cast<PubSubClient*>(mqttClient_);
    if (!client->connected()) {
        return;
    }

    String report = createMemoryReport();
    if (client->publish(mqttTopic_.c_str(), report.c_str())) {
        LOG_DEBUG(ErrorHandler::Category::SYSTEM, 0, "Memory report sent via MQTT");
    } else {
        LOG_WARNING(ErrorHandler::Category::SYSTEM, 7007, "Failed to send memory report via MQTT");
    }
}

String MemoryMonitor::formatMemorySize(size_t bytes) const {
    if (bytes >= 1024 * 1024) {
        return String(bytes / (1024 * 1024)) + "MB";
    } else if (bytes >= 1024) {
        return String(bytes / 1024) + "KB";
    } else {
        return String(bytes) + "B";
    }
}
