#include "string_builder.h"
#include <stdlib.h>
#include <string.h>

StringBuilder::StringBuilder(size_t capacity) : pos_(0), capacity_(capacity) {
    buffer_ = static_cast<char*>(malloc(capacity));
    if (buffer_) {
        buffer_[0] = '\0';
    } else {
        capacity_ = 0;
    }
}

StringBuilder::~StringBuilder() {
    if (buffer_) {
        free(buffer_);
        buffer_ = nullptr;
    }
}

StringBuilder::StringBuilder(StringBuilder&& other) noexcept
    : buffer_(other.buffer_), pos_(other.pos_), capacity_(other.capacity_) {
    other.buffer_ = nullptr;
    other.pos_ = 0;
    other.capacity_ = 0;
}

StringBuilder& StringBuilder::append(const char* str) {
    if (!str || !buffer_) {
        return *this;
    }

    size_t strLen = strlen(str);
    if (ensureCapacity(strLen)) {
        memcpy(buffer_ + pos_, str, strLen);
        pos_ += strLen;
        buffer_[pos_] = '\0';
    }

    return *this;
}

StringBuilder& StringBuilder::append(const String& str) {
    return append(str.c_str());
}

StringBuilder& StringBuilder::append(int value) {
    char temp[12];  // Enough for any 32-bit integer
    itoa(value, temp, 10);
    return append(temp);
}

StringBuilder& StringBuilder::append(long value) {
    char temp[12];
    ltoa(value, temp, 10);
    return append(temp);
}

StringBuilder& StringBuilder::append(unsigned long value) {
    char temp[12];
    ultoa(value, temp, 10);
    return append(temp);
}

StringBuilder& StringBuilder::append(float value, int decimals) {
    char temp[16];
    dtostrf(value, 0, decimals, temp);
    return append(temp);
}

StringBuilder& StringBuilder::append(double value, int decimals) {
    char temp[16];
    dtostrf(value, 0, decimals, temp);
    return append(temp);
}

StringBuilder& StringBuilder::append(char c) {
    if (ensureCapacity(1)) {
        buffer_[pos_] = c;
        pos_++;
        buffer_[pos_] = '\0';
    }
    return *this;
}

const char* StringBuilder::c_str() const {
    return buffer_ ? buffer_ : "";
}

String StringBuilder::toString() const {
    return buffer_ ? String(buffer_) : String();
}

void StringBuilder::clear() {
    if (buffer_) {
        pos_ = 0;
        buffer_[0] = '\0';
    }
}

bool StringBuilder::reserve(size_t additionalCapacity) {
    size_t newCapacity = capacity_ + additionalCapacity;
    return growBuffer(newCapacity);
}

bool StringBuilder::ensureCapacity(size_t needed) {
    if (pos_ + needed >= capacity_) {
        // Try to grow buffer if possible
        size_t newCapacity = (capacity_ == 0) ? 128 : capacity_ * 2;
        while (newCapacity < pos_ + needed + 1) {
            newCapacity *= 2;
        }
        return growBuffer(newCapacity);
    }
    return true;
}

bool StringBuilder::growBuffer(size_t newCapacity) {
    if (newCapacity <= capacity_) {
        return true;  // No need to grow
    }

    char* newBuffer = static_cast<char*>(realloc(buffer_, newCapacity));
    if (newBuffer) {
        buffer_ = newBuffer;
        capacity_ = newCapacity;
        return true;
    }

    return false;  // Allocation failed
}

// MessageFormatter implementations
String MessageFormatter::createSensorMessage(const char* action, const char* zone, int value) {
    StringBuilder sb(128);
    sb.append(action).append(" on zone ").append(zone).append(" with value: ").append(value);
    return sb.toString();
}

String MessageFormatter::createErrorMessage(const char* context, int errorCode, const char* description) {
    StringBuilder sb(256);
    sb.append(context);
    if (errorCode != 0) {
        sb.append(" (error ").append(errorCode).append(")");
    }
    sb.append(": ").append(description);
    return sb.toString();
}

String MessageFormatter::createStatusMessage(const char* component, const char* status, int value) {
    StringBuilder sb(128);
    sb.append(component).append(" ").append(status);
    if (value >= 0) {
        sb.append(": ").append(value);
    }
    return sb.toString();
}

String MessageFormatter::createConnectionMessage(const char* protocol, const char* endpoint, const char* status) {
    StringBuilder sb(128);
    sb.append(protocol).append(" connection to ").append(endpoint).append(": ").append(status);
    return sb.toString();
}
