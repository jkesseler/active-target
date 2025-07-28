#pragma once

#include <Arduino.h>
#include "error_handler.h"

/**
 * @brief Memory monitoring and diagnostics system
 *
 * This class provides comprehensive memory monitoring capabilities including
 * heap usage tracking, fragmentation analysis, leak detection, and performance
 * monitoring. Designed for ESP32 platforms with minimal performance impact.
 */
class MemoryMonitor {
public:
    /**
     * @brief Memory statistics structure
     */
    struct MemoryStats {
        size_t freeHeap;           // Current free heap size
        size_t minFreeHeap;        // Minimum free heap since boot
        size_t maxAllocHeap;       // Maximum allocated heap since boot
        size_t totalHeap;          // Total heap size
        float fragmentationRatio;  // Fragmentation as percentage
        uint32_t allocationsCount; // Total allocation count
        uint32_t deallocationsCount; // Total deallocation count
        uint32_t peakAllocations;  // Peak simultaneous allocations
        unsigned long uptime;      // System uptime in milliseconds
    };

    /**
     * @brief Memory health status
     */
    enum class HealthStatus {
        EXCELLENT = 0,  // > 75% free memory, low fragmentation
        GOOD = 1,       // 50-75% free memory, moderate fragmentation
        WARNING = 2,    // 25-50% free memory, high fragmentation
        CRITICAL = 3    // < 25% free memory, very high fragmentation
    };

    /**
     * @brief Memory leak detection entry
     */
    struct LeakInfo {
        size_t size;
        unsigned long timestamp;
        const char* file;
        int line;
    };

    /**
     * @brief Get singleton instance
     */
    static MemoryMonitor& getInstance();

    /**
     * @brief Initialize memory monitoring
     * @param enableDetailedTracking Enable detailed allocation tracking
     * @param reportInterval Reporting interval in milliseconds (0 = disabled)
     */
    void initialize(bool enableDetailedTracking = false, unsigned long reportInterval = 30000);

    /**
     * @brief Update memory statistics (call regularly from main loop)
     */
    void update();

    /**
     * @brief Get current memory statistics
     * @return Current memory statistics
     */
    MemoryStats getStats() const;

    /**
     * @brief Get current memory health status
     * @return Health status based on current conditions
     */
    HealthStatus getHealthStatus() const;

    /**
     * @brief Log current memory usage
     * @param forceLog Force logging even if interval hasn't elapsed
     */
    void logMemoryUsage(bool forceLog = false);

    /**
     * @brief Get free heap size
     * @return Current free heap in bytes
     */
    static size_t getFreeHeap() { return ESP.getFreeHeap(); }

    /**
     * @brief Get minimum free heap since boot
     * @return Minimum free heap in bytes
     */
    static size_t getMinFreeHeap() { return ESP.getMinFreeHeap(); }

    /**
     * @brief Get heap fragmentation percentage
     * @return Fragmentation as percentage (0-100)
     */
    static float getFragmentation();

    /**
     * @brief Detect and report memory leaks
     * @return Number of potential leaks detected
     */
    int detectLeaks();

    /**
     * @brief Create JSON memory report for MQTT
     * @return JSON string with memory statistics
     */
    String createMemoryReport() const;

    /**
     * @brief Check if memory usage is healthy
     * @return True if memory usage is within acceptable limits
     */
    bool isMemoryHealthy() const;

    /**
     * @brief Force garbage collection if supported
     */
    void forceGarbageCollection();

    /**
     * @brief Get memory usage trend
     * @return Positive if increasing, negative if decreasing, 0 if stable
     */
    int getUsageTrend() const;

    /**
     * @brief Reset peak statistics
     */
    void resetPeakStats();

    /**
     * @brief Set memory warning thresholds
     * @param warningThreshold Warning threshold in bytes
     * @param criticalThreshold Critical threshold in bytes
     */
    void setThresholds(size_t warningThreshold, size_t criticalThreshold);

    /**
     * @brief Enable/disable automatic memory reporting via MQTT
     * @param enable Enable MQTT reporting
     * @param client MQTT client instance
     * @param topic MQTT topic for reports
     */
    void enableMqttReporting(bool enable, void* client = nullptr, const char* topic = nullptr);

private:
    // Configuration
    bool initialized_;
    bool detailedTracking_;
    unsigned long reportInterval_;
    unsigned long lastReportTime_;

    // Thresholds
    size_t warningThreshold_;
    size_t criticalThreshold_;

    // Statistics tracking
    MemoryStats currentStats_;
    MemoryStats previousStats_;

    // Trend analysis
    static constexpr int TREND_SAMPLES = 10;
    size_t trendSamples_[TREND_SAMPLES];
    int trendIndex_;

    // MQTT reporting
    bool mqttReportingEnabled_;
    void* mqttClient_;
    String mqttTopic_;

    // Leak detection
    static constexpr int MAX_LEAK_ENTRIES = 20;
    LeakInfo leakEntries_[MAX_LEAK_ENTRIES];
    int leakCount_;

    // Private constructor for singleton
    MemoryMonitor();

    /**
     * @brief Update trend analysis
     */
    void updateTrend();

    /**
     * @brief Calculate fragmentation ratio
     */
    float calculateFragmentation() const;

    /**
     * @brief Check memory thresholds and issue warnings
     */
    void checkThresholds();

    /**
     * @brief Send MQTT memory report
     */
    void sendMqttReport();

    /**
     * @brief Format memory size for display
     */
    String formatMemorySize(size_t bytes) const;
};

// Convenience macros for memory monitoring
#define MEMORY_LOG() MemoryMonitor::getInstance().logMemoryUsage()
#define MEMORY_FORCE_LOG() MemoryMonitor::getInstance().logMemoryUsage(true)
#define MEMORY_CHECK() MemoryMonitor::getInstance().update()
#define MEMORY_HEALTH() MemoryMonitor::getInstance().getHealthStatus()
#define MEMORY_FREE() MemoryMonitor::getFreeHeap()
#define MEMORY_MIN_FREE() MemoryMonitor::getMinFreeHeap()
#define MEMORY_FRAGMENTATION() MemoryMonitor::getFragmentation()

// Memory debugging macros (enabled only in debug builds)
#ifdef DEBUG_MEMORY
#define MEMORY_TRACE(msg) LOG_TRACE(ErrorHandler::Category::SYSTEM, 0, String("MEMORY: ") + String(msg) + " - Free: " + String(MEMORY_FREE()))
#else
#define MEMORY_TRACE(msg) // No-op in release builds
#endif
