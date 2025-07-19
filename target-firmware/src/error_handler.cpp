#include "error_handler.h"
#include <PubSubClient.h>

// Global error handler instance
ErrorHandler g_errorHandler;

ErrorHandler::ErrorHandler() :
    m_errorCount(0),
    m_currentIndex(0),
    m_serialEnabled(true),
    m_mqttEnabled(false),
    m_mqttClient(nullptr),
    m_criticalErrorCount(0) {

    // Initialize error array
    for (int i = 0; i < MAX_ERRORS; i++) {
        m_errors[i] = {Severity::INFO, Category::SYSTEM, 0, "", 0};
    }
}

bool ErrorHandler::initialize(bool enableSerial, bool enableMqtt) {
    m_serialEnabled = enableSerial;
    m_mqttEnabled = enableMqtt;

    if (m_serialEnabled) {
        Serial.println("[ERROR_HANDLER] Initialized with serial logging enabled");
    }

    return true;
}

bool ErrorHandler::logError(Severity severity, Category category, int code, const String& message) {
    // Create error structure
    Error error;
    error.severity = severity;
    error.category = category;
    error.code = code;
    error.message = message;
    error.timestamp = millis();

    // Store error in circular buffer
    m_errors[m_currentIndex] = error;
    m_currentIndex = (m_currentIndex + 1) % MAX_ERRORS;

    if (m_errorCount < MAX_ERRORS) {
        m_errorCount++;
    }

    // Update critical error count
    incrementErrorCount(severity);

    // Output to enabled channels
    if (m_serialEnabled) {
        writeToSerial(error);
    }

    if (m_mqttEnabled && m_mqttClient) {
        writeToMqtt(error);
    }

    return true;
}

bool ErrorHandler::logError(Severity severity, Category category, int code, const char* message) {
    return logError(severity, category, code, String(message));
}

const ErrorHandler::Error& ErrorHandler::getLastError() const {
    int lastIndex = (m_currentIndex - 1 + MAX_ERRORS) % MAX_ERRORS;
    return m_errors[lastIndex];
}

bool ErrorHandler::hasCriticalErrors() const {
    return m_criticalErrorCount > 0;
}

int ErrorHandler::getErrorCount(Severity severity) const {
    int count = 0;
    int itemsToCheck = min(m_errorCount, MAX_ERRORS);

    for (int i = 0; i < itemsToCheck; i++) {
        if (m_errors[i].severity == severity) {
            count++;
        }
    }

    return count;
}

void ErrorHandler::clearErrors() {
    m_errorCount = 0;
    m_currentIndex = 0;
    m_criticalErrorCount = 0;

    for (int i = 0; i < MAX_ERRORS; i++) {
        m_errors[i] = {Severity::INFO, Category::SYSTEM, 0, "", 0};
    }

    if (m_serialEnabled) {
        Serial.println("[ERROR_HANDLER] All errors cleared");
    }
}

void ErrorHandler::setMqttReporting(void* mqttClient, const char* topic) {
    m_mqttClient = mqttClient;
    m_mqttTopic = String(topic);
    m_mqttEnabled = (mqttClient != nullptr);
}

void ErrorHandler::setSerialLogging(bool enabled) {
    m_serialEnabled = enabled;
}

const char* ErrorHandler::getSeverityString(Severity severity) const {
    switch (severity) {
        case Severity::TRACE:   return "TRACE";
        case Severity::DEBUG:   return "DEBUG";
        case Severity::INFO:    return "INFO";
        case Severity::WARNING: return "WARNING";
        case Severity::ERROR:   return "ERROR";
        case Severity::CRITICAL: return "CRITICAL";
        default: return "UNKNOWN";
    }
}

const char* ErrorHandler::getCategoryString(Category category) const {
    switch (category) {
        case Category::HARDWARE: return "HARDWARE";
        case Category::NETWORK:  return "NETWORK";
        case Category::MQTT:     return "MQTT";
        case Category::SETTINGS: return "SETTINGS";
        case Category::SENSOR:   return "SENSOR";
        case Category::SYSTEM:   return "SYSTEM";
        default: return "UNKNOWN";
    }
}

void ErrorHandler::writeToSerial(const Error& error) {
    Serial.print("[");
    Serial.print(getSeverityString(error.severity));
    Serial.print("][");
    Serial.print(getCategoryString(error.category));
    Serial.print("] Code:");
    Serial.print(error.code);
    Serial.print(" - ");
    Serial.print(error.message);
    Serial.print(" (");
    Serial.print(error.timestamp);
    Serial.println("ms)");
}

void ErrorHandler::writeToMqtt(const Error& error) {
    if (!m_mqttClient || m_mqttTopic.isEmpty()) {
        return;
    }

    PubSubClient* client = static_cast<PubSubClient*>(m_mqttClient);
    if (!client->connected()) {
        return;
    }

    String errorJson = formatErrorMessage(error);
    client->publish(m_mqttTopic.c_str(), errorJson.c_str());
}

void ErrorHandler::incrementErrorCount(Severity severity) {
    if (severity == Severity::CRITICAL) {
        m_criticalErrorCount++;
    }
}

String ErrorHandler::formatErrorMessage(const Error& error) {
    String json = "{";
    json += "\"severity\":\"" + String(getSeverityString(error.severity)) + "\",";
    json += "\"category\":\"" + String(getCategoryString(error.category)) + "\",";
    json += "\"code\":" + String(error.code) + ",";
    json += "\"message\":\"" + error.message + "\",";
    json += "\"timestamp\":" + String(error.timestamp);
    json += "}";
    return json;
}
