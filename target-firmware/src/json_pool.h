#pragma once

#include <ArduinoJson.h>
#include "error_handler.h"

/**
 * @brief JSON Document Pool Manager for efficient memory management
 *
 * This class provides a pool of pre-allocated StaticJsonDocument objects
 * to reduce memory fragmentation and improve performance. Documents are
 * organized by size and reused when possible.
 */
class JsonDocumentPool {
public:
    /**
     * @brief Document sizes for different use cases
     */
    enum DocumentSize {
        SMALL = 256,   // Small messages, settings responses
        MEDIUM = 512,  // Standard device messages
        LARGE = 768,   // Complex messages with multiple fields
        XLARGE = 1024  // Large data payloads, exports
    };

    /**
     * @brief Pool statistics for monitoring
     */
    struct PoolStats {
        uint8_t totalPools;
        uint8_t poolsInUse[4];  // Usage count for each size
        uint8_t poolsAvailable[4];  // Available count for each size
        uint32_t totalAcquisitions;
        uint32_t acquisitionFailures;
        float fragmentationRatio;
    };

    /**
     * @brief RAII wrapper for automatic document cleanup
     */
    template<size_t Size>
    class DocumentGuard {
    public:
        explicit DocumentGuard(StaticJsonDocument<Size>* doc) : document_(doc) {}

        ~DocumentGuard() {
            if (document_) {
                JsonDocumentPool::getInstance().release(document_);
            }
        }

        // Move constructor
        DocumentGuard(DocumentGuard&& other) noexcept : document_(other.document_) {
            other.document_ = nullptr;
        }

        // Disable copy constructor and assignment
        DocumentGuard(const DocumentGuard&) = delete;
        DocumentGuard& operator=(const DocumentGuard&) = delete;
        DocumentGuard& operator=(DocumentGuard&&) = delete;

        StaticJsonDocument<Size>* get() const { return document_; }
        StaticJsonDocument<Size>* operator->() const { return document_; }
        StaticJsonDocument<Size>& operator*() const { return *document_; }

        bool isValid() const { return document_ != nullptr; }

    private:
        StaticJsonDocument<Size>* document_;
    };

    /**
     * @brief Get singleton instance
     */
    static JsonDocumentPool& getInstance();

    /**
     * @brief Acquire a document from the pool
     * @param size Document size to acquire
     * @return Pointer to document or nullptr if none available
     */
    StaticJsonDocument<768>* acquire(DocumentSize size = MEDIUM);

    /**
     * @brief Release a document back to the pool
     * @param doc Document to release
     */
    void release(StaticJsonDocument<768>* doc);

    /**
     * @brief Get pool statistics
     */
    PoolStats getStats() const;

    /**
     * @brief Get an RAII-managed document
     * @param size Document size to acquire
     * @return RAII guard with document
     */
    template<size_t Size = 768>
    DocumentGuard<Size> acquireGuarded(DocumentSize size = MEDIUM) {
        auto* doc = reinterpret_cast<StaticJsonDocument<Size>*>(acquire(size));
        return DocumentGuard<Size>(doc);
    }

    /**
     * @brief Initialize the pool with default sizes
     */
    void initialize();

    /**
     * @brief Check pool health and log warnings if needed
     */
    void checkPoolHealth();

private:
    // Pool configuration
    static constexpr uint8_t SMALL_POOL_SIZE = 2;
    static constexpr uint8_t MEDIUM_POOL_SIZE = 4;
    static constexpr uint8_t LARGE_POOL_SIZE = 3;
    static constexpr uint8_t XLARGE_POOL_SIZE = 2;

    // Document pools for different sizes
    StaticJsonDocument<256> smallPool_[SMALL_POOL_SIZE];
    StaticJsonDocument<512> mediumPool_[MEDIUM_POOL_SIZE];
    StaticJsonDocument<768> largePool_[LARGE_POOL_SIZE];
    StaticJsonDocument<1024> xlargePool_[XLARGE_POOL_SIZE];

    // Pool availability tracking
    bool smallAvailable_[SMALL_POOL_SIZE];
    bool mediumAvailable_[MEDIUM_POOL_SIZE];
    bool largeAvailable_[LARGE_POOL_SIZE];
    bool xlargeAvailable_[XLARGE_POOL_SIZE];

    // Statistics
    mutable PoolStats stats_;
    bool initialized_;

    // Private constructor for singleton
    JsonDocumentPool();

    /**
     * @brief Find an available document in the specified pool
     */
    template<size_t Size, size_t PoolSize>
    StaticJsonDocument<Size>* findAvailable(StaticJsonDocument<Size> pool[], bool available[]);

    /**
     * @brief Release a document to the specified pool
     */
    template<size_t Size, size_t PoolSize>
    bool releaseToPool(StaticJsonDocument<768>* doc, StaticJsonDocument<Size> pool[], bool available[]);
};

// Convenience macros for common usage patterns
#define JSON_POOL_ACQUIRE(size) JsonDocumentPool::getInstance().acquire(JsonDocumentPool::size)
#define JSON_POOL_ACQUIRE_GUARDED(size) JsonDocumentPool::getInstance().acquireGuarded<768>(JsonDocumentPool::size)
#define JSON_POOL_RELEASE(doc) JsonDocumentPool::getInstance().release(doc)

// Helper function for automatic size selection based on estimated content
JsonDocumentPool::DocumentSize estimateDocumentSize(int fieldsCount, int avgStringLength = 20);
