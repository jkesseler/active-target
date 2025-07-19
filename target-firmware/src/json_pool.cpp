#include "json_pool.h"
#include <Arduino.h>

// Static initialization
JsonDocumentPool::JsonDocumentPool() : initialized_(false) {
    // Initialize statistics
    stats_.totalPools = SMALL_POOL_SIZE + MEDIUM_POOL_SIZE + LARGE_POOL_SIZE + XLARGE_POOL_SIZE;
    stats_.totalAcquisitions = 0;
    stats_.acquisitionFailures = 0;
    stats_.fragmentationRatio = 0.0f;

    // Initialize availability arrays
    for (uint8_t i = 0; i < SMALL_POOL_SIZE; i++) {
        smallAvailable_[i] = true;
    }
    for (uint8_t i = 0; i < MEDIUM_POOL_SIZE; i++) {
        mediumAvailable_[i] = true;
    }
    for (uint8_t i = 0; i < LARGE_POOL_SIZE; i++) {
        largeAvailable_[i] = true;
    }
    for (uint8_t i = 0; i < XLARGE_POOL_SIZE; i++) {
        xlargeAvailable_[i] = true;
    }
}

JsonDocumentPool& JsonDocumentPool::getInstance() {
    static JsonDocumentPool instance;
    if (!instance.initialized_) {
        instance.initialize();
    }
    return instance;
}

void JsonDocumentPool::initialize() {
    if (initialized_) {
        return;
    }

    // Clear all documents
    for (uint8_t i = 0; i < SMALL_POOL_SIZE; i++) {
        smallPool_[i].clear();
    }
    for (uint8_t i = 0; i < MEDIUM_POOL_SIZE; i++) {
        mediumPool_[i].clear();
    }
    for (uint8_t i = 0; i < LARGE_POOL_SIZE; i++) {
        largePool_[i].clear();
    }
    for (uint8_t i = 0; i < XLARGE_POOL_SIZE; i++) {
        xlargePool_[i].clear();
    }

    initialized_ = true;
    LOG_INFO(ErrorHandler::Category::SYSTEM, 0, "JSON Document Pool initialized with " + String(stats_.totalPools) + " total documents");
}

StaticJsonDocument<768>* JsonDocumentPool::acquire(DocumentSize size) {
    if (!initialized_) {
        initialize();
    }

    stats_.totalAcquisitions++;

    StaticJsonDocument<768>* doc = nullptr;

    switch (size) {
        case SMALL:
            doc = reinterpret_cast<StaticJsonDocument<768>*>(
                findAvailable<256, SMALL_POOL_SIZE>(smallPool_, smallAvailable_)
            );
            break;

        case MEDIUM:
            doc = reinterpret_cast<StaticJsonDocument<768>*>(
                findAvailable<512, MEDIUM_POOL_SIZE>(mediumPool_, mediumAvailable_)
            );
            break;

        case LARGE:
            doc = reinterpret_cast<StaticJsonDocument<768>*>(
                findAvailable<768, LARGE_POOL_SIZE>(largePool_, largeAvailable_)
            );
            break;

        case XLARGE:
            doc = reinterpret_cast<StaticJsonDocument<768>*>(
                findAvailable<1024, XLARGE_POOL_SIZE>(xlargePool_, xlargeAvailable_)
            );
            break;
    }

    if (doc) {
        doc->clear();  // Ensure document is clean
        LOG_TRACE(ErrorHandler::Category::SYSTEM, 0, "Acquired JSON document of size " + String(static_cast<int>(size)));
    } else {
        stats_.acquisitionFailures++;
        LOG_WARNING(ErrorHandler::Category::SYSTEM, 1001, "Failed to acquire JSON document of size " + String(static_cast<int>(size)) + " - pool exhausted");

        // Try to get a larger document if available
        if (size < XLARGE) {
            doc = acquire(static_cast<DocumentSize>(size * 2));
            if (doc) {
                LOG_DEBUG(ErrorHandler::Category::SYSTEM, 0, "Acquired larger document as fallback");
            }
        }
    }

    return doc;
}

void JsonDocumentPool::release(StaticJsonDocument<768>* doc) {
    if (!doc) {
        return;
    }

    doc->clear();  // Clear content before returning to pool

    // Try to release to each pool in order of likelihood
    if (releaseToPool<768, LARGE_POOL_SIZE>(doc, largePool_, largeAvailable_) ||
        releaseToPool<512, MEDIUM_POOL_SIZE>(doc, reinterpret_cast<StaticJsonDocument<512>*>(mediumPool_), mediumAvailable_) ||
        releaseToPool<1024, XLARGE_POOL_SIZE>(doc, reinterpret_cast<StaticJsonDocument<1024>*>(xlargePool_), xlargeAvailable_) ||
        releaseToPool<256, SMALL_POOL_SIZE>(doc, reinterpret_cast<StaticJsonDocument<256>*>(smallPool_), smallAvailable_)) {

        LOG_TRACE(ErrorHandler::Category::SYSTEM, 0, "Released JSON document back to pool");
    } else {
        LOG_ERROR(ErrorHandler::Category::SYSTEM, 1002, "Failed to release JSON document - not from pool or pool corruption");
    }
}

template<size_t Size, size_t PoolSize>
StaticJsonDocument<Size>* JsonDocumentPool::findAvailable(StaticJsonDocument<Size> pool[], bool available[]) {
    for (uint8_t i = 0; i < PoolSize; i++) {
        if (available[i]) {
            available[i] = false;  // Mark as in use
            return &pool[i];
        }
    }
    return nullptr;
}

template<size_t Size, size_t PoolSize>
bool JsonDocumentPool::releaseToPool(StaticJsonDocument<768>* doc, StaticJsonDocument<Size> pool[], bool available[]) {
    // Check if document belongs to this pool
    uintptr_t docAddr = reinterpret_cast<uintptr_t>(doc);
    uintptr_t poolStart = reinterpret_cast<uintptr_t>(pool);
    uintptr_t poolEnd = poolStart + (sizeof(StaticJsonDocument<Size>) * PoolSize);

    if (docAddr >= poolStart && docAddr < poolEnd) {
        // Calculate index
        size_t index = (docAddr - poolStart) / sizeof(StaticJsonDocument<Size>);
        if (index < PoolSize) {
            available[index] = true;  // Mark as available
            return true;
        }
    }
    return false;
}

JsonDocumentPool::PoolStats JsonDocumentPool::getStats() const {
    // Update current usage counts
    stats_.poolsInUse[0] = 0;
    stats_.poolsInUse[1] = 0;
    stats_.poolsInUse[2] = 0;
    stats_.poolsInUse[3] = 0;

    stats_.poolsAvailable[0] = 0;
    stats_.poolsAvailable[1] = 0;
    stats_.poolsAvailable[2] = 0;
    stats_.poolsAvailable[3] = 0;

    // Count small pool usage
    for (uint8_t i = 0; i < SMALL_POOL_SIZE; i++) {
        if (smallAvailable_[i]) {
            stats_.poolsAvailable[0]++;
        } else {
            stats_.poolsInUse[0]++;
        }
    }

    // Count medium pool usage
    for (uint8_t i = 0; i < MEDIUM_POOL_SIZE; i++) {
        if (mediumAvailable_[i]) {
            stats_.poolsAvailable[1]++;
        } else {
            stats_.poolsInUse[1]++;
        }
    }

    // Count large pool usage
    for (uint8_t i = 0; i < LARGE_POOL_SIZE; i++) {
        if (largeAvailable_[i]) {
            stats_.poolsAvailable[2]++;
        } else {
            stats_.poolsInUse[2]++;
        }
    }

    // Count xlarge pool usage
    for (uint8_t i = 0; i < XLARGE_POOL_SIZE; i++) {
        if (xlargeAvailable_[i]) {
            stats_.poolsAvailable[3]++;
        } else {
            stats_.poolsInUse[3]++;
        }
    }

    // Calculate fragmentation ratio
    uint8_t totalInUse = stats_.poolsInUse[0] + stats_.poolsInUse[1] +
                        stats_.poolsInUse[2] + stats_.poolsInUse[3];
    stats_.fragmentationRatio = (totalInUse > 0) ?
        static_cast<float>(stats_.acquisitionFailures) / static_cast<float>(stats_.totalAcquisitions) : 0.0f;

    return stats_;
}

void JsonDocumentPool::checkPoolHealth() {
    PoolStats stats = getStats();

    // Check for pool exhaustion
    for (int i = 0; i < 4; i++) {
        if (stats.poolsAvailable[i] == 0 && stats.poolsInUse[i] > 0) {
            LOG_WARNING(ErrorHandler::Category::SYSTEM, 1003, "JSON pool " + String(i) + " completely exhausted");
        }
    }

    // Check for high fragmentation
    if (stats.fragmentationRatio > 0.1f) {  // More than 10% failures
        LOG_WARNING(ErrorHandler::Category::SYSTEM, 1004, "High JSON pool fragmentation: " + String(stats.fragmentationRatio * 100.0f) + "% failures");
    }

    // Log pool usage periodically
    static uint32_t lastLogTime = 0;
    uint32_t currentTime = millis();
    if (currentTime - lastLogTime > 30000) {  // Every 30 seconds
        lastLogTime = currentTime;
        LOG_INFO(ErrorHandler::Category::SYSTEM, 0,
                "JSON Pool Usage - Small: " + String(stats.poolsInUse[0]) + "/" + String(stats.poolsInUse[0] + stats.poolsAvailable[0]) +
                ", Medium: " + String(stats.poolsInUse[1]) + "/" + String(stats.poolsInUse[1] + stats.poolsAvailable[1]) +
                ", Large: " + String(stats.poolsInUse[2]) + "/" + String(stats.poolsInUse[2] + stats.poolsAvailable[2]) +
                ", XLarge: " + String(stats.poolsInUse[3]) + "/" + String(stats.poolsInUse[3] + stats.poolsAvailable[3]));
    }
}

// Helper function for automatic size selection
JsonDocumentPool::DocumentSize estimateDocumentSize(int fieldsCount, int avgStringLength) {
    // Estimate based on field count and average string length
    int estimatedSize = fieldsCount * (avgStringLength + 20); // +20 for JSON overhead per field

    if (estimatedSize <= 200) {
        return JsonDocumentPool::SMALL;
    } else if (estimatedSize <= 450) {
        return JsonDocumentPool::MEDIUM;
    } else if (estimatedSize <= 700) {
        return JsonDocumentPool::LARGE;
    } else {
        return JsonDocumentPool::XLARGE;
    }
}
