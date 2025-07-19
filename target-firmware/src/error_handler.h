#ifndef ERROR_HANDLER_H
#define ERROR_HANDLER_H

#include <Arduino.h>

/**
 * @brief Centralized error handling system
 *
 * This class provides consistent error handling across the entire application
 * with logging, recovery mechanisms, and error reporting.
 */
class ErrorHandler {
public:
    /**
     * @brief Error severity levels
     */
    enum class Severity {
        INFO = 0,
        WARNING = 1,
        ERROR = 2,
        CRITICAL = 3
    };

    /**
     * @brief Error categories
     */
    enum class Category {
        HARDWARE = 0,
        NETWORK = 1,
        MQTT = 2,
        SETTINGS = 3,
        SENSOR = 4,
        SYSTEM = 5
    };

    /**
     * @brief Error structure
     */
    struct Error {
        Severity severity;
        Category category;
        int code;
        String message;
        unsigned long timestamp;
    };

    /**
     * @brief Constructor
     */
    ErrorHandler();

    /**
     * @brief Initialize error handler
     * @param enableSerial Enable serial logging
     * @param enableMqtt Enable MQTT error reporting
     * @return true if initialization successful
     */
    bool initialize(bool enableSerial = true, bool enableMqtt = false);

    /**
     * @brief Log an error
     * @param severity Error severity
     * @param category Error category
     * @param code Error code
     * @param message Error message
     * @return true if error was logged successfully
     */
    bool logError(Severity severity, Category category, int code, const String& message);

    /**
     * @brief Log an error with automatic timestamp
     * @param severity Error severity
     * @param category Error category
     * @param code Error code
     * @param message Error message
     * @return true if error was logged successfully
     */
    bool logError(Severity severity, Category category, int code, const char* message);

    /**
     * @brief Get the last error
     * @return Reference to the last error
     */
    const Error& getLastError() const;

    /**
     * @brief Check if there are any critical errors
     * @return true if critical errors exist
     */
    bool hasCriticalErrors() const;

    /**
     * @brief Get error count by severity
     * @param severity Error severity to count
     * @return Number of errors with specified severity
     */
    int getErrorCount(Severity severity) const;

    /**
     * @brief Clear all errors
     */
    void clearErrors();

    /**
     * @brief Set MQTT client for error reporting
     * @param mqttClient MQTT client instance
     * @param topic Error reporting topic
     */
    void setMqttReporting(void* mqttClient, const char* topic);

    /**
     * @brief Enable/disable serial logging
     * @param enabled true to enable, false to disable
     */
    void setSerialLogging(bool enabled);

    /**
     * @brief Get severity string
     * @param severity Error severity
     * @return String representation of severity
     */
    const char* getSeverityString(Severity severity) const;

    /**
     * @brief Get category string
     * @param category Error category
     * @return String representation of category
     */
    const char* getCategoryString(Category category) const;

private:
    static const int MAX_ERRORS = 10;

    Error m_errors[MAX_ERRORS];
    int m_errorCount;
    int m_currentIndex;
    bool m_serialEnabled;
    bool m_mqttEnabled;
    void* m_mqttClient;
    String m_mqttTopic;
    int m_criticalErrorCount;

    // Private helper functions
    void writeToSerial(const Error& error);
    void writeToMqtt(const Error& error);
    void incrementErrorCount(Severity severity);
    String formatErrorMessage(const Error& error);
};

// Global error handler instance
extern ErrorHandler g_errorHandler;

// Convenience macros for error logging
#define LOG_INFO(category, code, message) \
    g_errorHandler.logError(ErrorHandler::Severity::INFO, category, code, message)

#define LOG_WARNING(category, code, message) \
    g_errorHandler.logError(ErrorHandler::Severity::WARNING, category, code, message)

#define LOG_ERROR(category, code, message) \
    g_errorHandler.logError(ErrorHandler::Severity::ERROR, category, code, message)

#define LOG_CRITICAL(category, code, message) \
    g_errorHandler.logError(ErrorHandler::Severity::CRITICAL, category, code, message)

#endif // ERROR_HANDLER_H
