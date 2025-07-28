#pragma once

#include <Arduino.h>

/**
 * @brief Efficient string building utility to reduce heap fragmentation
 *
 * This class provides an efficient way to build strings without the memory
 * overhead and fragmentation caused by String concatenation operations.
 * Uses a pre-allocated buffer and minimizes dynamic memory allocations.
 */
class StringBuilder {
public:
    /**
     * @brief Default buffer sizes for different use cases
     */
    static constexpr size_t SMALL_BUFFER = 128;   // For short messages
    static constexpr size_t MEDIUM_BUFFER = 256;  // For standard log messages
    static constexpr size_t LARGE_BUFFER = 512;   // For complex messages

    /**
     * @brief Constructor with specified capacity
     * @param capacity Initial buffer capacity (default: MEDIUM_BUFFER)
     */
    explicit StringBuilder(size_t capacity = MEDIUM_BUFFER);

    /**
     * @brief Destructor - frees allocated buffer
     */
    ~StringBuilder();

    /**
     * @brief Copy constructor (disabled to prevent accidental copies)
     */
    StringBuilder(const StringBuilder&) = delete;

    /**
     * @brief Assignment operator (disabled to prevent accidental copies)
     */
    StringBuilder& operator=(const StringBuilder&) = delete;

    /**
     * @brief Move constructor
     */
    StringBuilder(StringBuilder&& other) noexcept;

    /**
     * @brief Append a C-string
     * @param str String to append
     * @return Reference to this StringBuilder for chaining
     */
    StringBuilder& append(const char* str);

    /**
     * @brief Append an Arduino String
     * @param str String to append
     * @return Reference to this StringBuilder for chaining
     */
    StringBuilder& append(const String& str);

    /**
     * @brief Append an integer value
     * @param value Integer to append
     * @return Reference to this StringBuilder for chaining
     */
    StringBuilder& append(int value);

    /**
     * @brief Append a long value
     * @param value Long to append
     * @return Reference to this StringBuilder for chaining
     */
    StringBuilder& append(long value);

    /**
     * @brief Append an unsigned long value
     * @param value Unsigned long to append
     * @return Reference to this StringBuilder for chaining
     */
    StringBuilder& append(unsigned long value);

    /**
     * @brief Append a float value
     * @param value Float to append
     * @param decimals Number of decimal places (default: 2)
     * @return Reference to this StringBuilder for chaining
     */
    StringBuilder& append(float value, int decimals = 2);

    /**
     * @brief Append a double value
     * @param value Double to append
     * @param decimals Number of decimal places (default: 2)
     * @return Reference to this StringBuilder for chaining
     */
    StringBuilder& append(double value, int decimals = 2);

    /**
     * @brief Append a single character
     * @param c Character to append
     * @return Reference to this StringBuilder for chaining
     */
    StringBuilder& append(char c);

    /**
     * @brief Operator overload for convenient chaining
     */
    StringBuilder& operator<<(const char* str) { return append(str); }
    StringBuilder& operator<<(const String& str) { return append(str); }
    StringBuilder& operator<<(int value) { return append(value); }
    StringBuilder& operator<<(long value) { return append(value); }
    StringBuilder& operator<<(unsigned long value) { return append(value); }
    StringBuilder& operator<<(float value) { return append(value); }
    StringBuilder& operator<<(double value) { return append(value); }
    StringBuilder& operator<<(char c) { return append(c); }

    /**
     * @brief Get the built string as C-string
     * @return Null-terminated C-string
     */
    const char* c_str() const;

    /**
     * @brief Get the built string as Arduino String
     * @return Arduino String object
     */
    String toString() const;

    /**
     * @brief Clear the buffer and reset position
     */
    void clear();

    /**
     * @brief Get current length of the built string
     * @return Current string length
     */
    size_t length() const { return pos_; }

    /**
     * @brief Get remaining buffer capacity
     * @return Remaining space in buffer
     */
    size_t remainingCapacity() const { return capacity_ - pos_; }

    /**
     * @brief Check if buffer is full
     * @return True if buffer is full
     */
    bool isFull() const { return pos_ >= capacity_ - 1; }

    /**
     * @brief Reserve additional capacity (grows buffer if needed)
     * @param additionalCapacity Additional space needed
     * @return True if successful, false on allocation failure
     */
    bool reserve(size_t additionalCapacity);

private:
    char* buffer_;
    size_t pos_;
    size_t capacity_;

    /**
     * @brief Ensure buffer has enough space for additional characters
     * @param needed Number of additional characters needed
     * @return True if space is available, false if buffer would overflow
     */
    bool ensureCapacity(size_t needed);

    /**
     * @brief Grow buffer to accommodate more data
     * @param newCapacity New buffer capacity
     * @return True if successful, false on allocation failure
     */
    bool growBuffer(size_t newCapacity);
};

/**
 * @brief Formatted message builder for common log patterns
 */
class MessageFormatter {
public:
  /**
   * @brief Create a sensor message
   * @param type Action type description
   * @param zone Target zone
   * @param value Sensor value
   * @return Formatted message string
   */
  static String createSensorMessage(const char *type, const char *zone, int value);

  /**
   * @brief Create an error message
   * @param context Error context
   * @param errorCode Error code
   * @param description Error description
   * @return Formatted error message
   */
  static String createErrorMessage(const char *context, int errorCode, const char *description);

  /**
   * @brief Create a status message
   * @param component Component name
   * @param status Status description
   * @param value Optional value
   * @return Formatted status message
   */
  static String createStatusMessage(const char *component, const char *status, int value = -1);
};

/**
 * @brief Stack-allocated string builder for small messages
 * Template parameter specifies buffer size at compile time
 */
template<size_t BufferSize = 128>
class StackStringBuilder {
public:
    StackStringBuilder() : pos_(0) {
        buffer_[0] = '\0';
    }    StackStringBuilder& append(const char* str) {
        if (!str) return *this;

        size_t strLen = strlen(str);
        size_t available = BufferSize - pos_ - 1;
        size_t toCopy = (strLen > available) ? available : strLen;

        if (toCopy > 0) {
            memcpy(buffer_ + pos_, str, toCopy);
            pos_ += toCopy;
            buffer_[pos_] = '\0';
        }
        return *this;
    }

    StackStringBuilder& append(const __FlashStringHelper* str) {
        if (!str) return *this;

        // Convert FlashStringHelper to regular string for copying
        const char* p = reinterpret_cast<const char*>(str);
        size_t strLen = strlen_P(p);
        size_t available = BufferSize - pos_ - 1;
        size_t toCopy = (strLen > available) ? available : strLen;

        if (toCopy > 0) {
            memcpy_P(buffer_ + pos_, p, toCopy);
            pos_ += toCopy;
            buffer_[pos_] = '\0';
        }
        return *this;
    }

    StackStringBuilder& append(int value) {
        char temp[12];  // Enough for any 32-bit integer
        itoa(value, temp, 10);
        return append(temp);
    }

    StackStringBuilder& append(unsigned long value) {
        char temp[12];
        ultoa(value, temp, 10);
        return append(temp);
    }

    StackStringBuilder& append(float value, int decimals = 2) {
        char temp[16];
        dtostrf(value, 0, decimals, temp);
        return append(temp);
    }

    const char* c_str() const { return buffer_; }
    String toString() const { return String(buffer_); }

    void clear() {
        pos_ = 0;
        buffer_[0] = '\0';
    }

    size_t length() const { return pos_; }

private:
    char buffer_[BufferSize];
    size_t pos_;
};

// Convenience macro for stack-allocated string building
#define STACK_STRING(size) StackStringBuilder<size>
#define SMALL_STRING() StackStringBuilder<64>
#define MEDIUM_STRING() StackStringBuilder<128>
#define LARGE_STRING() StackStringBuilder<256>
