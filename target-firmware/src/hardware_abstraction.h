#ifndef HARDWARE_ABSTRACTION_H
#define HARDWARE_ABSTRACTION_H

#include <Arduino.h>

/**
 * @brief Hardware abstraction layer for sensors
 *
 * This class provides a clean interface for hardware operations,
 * abstracting away direct GPIO access and enabling easier testing.
 * Supports multiple ESP32 board variants with automatic detection.
 */
class HardwareAbstraction {
public:
    /**
     * @brief Supported board types
     */
    enum class BoardType {
        ESP32_C3_DEVKITM1,
        ESP32_S3_DEVKITC1,
        UNKNOWN
    };

    /**
     * @brief Error codes for hardware operations
     */
    enum class ErrorCode {
        SUCCESS = 0,
        INVALID_PIN = 1,
        SENSOR_FAULT = 2,
        TIMEOUT = 4,
        UNSUPPORTED_BOARD = 8
    };

    /**
     * @brief Constructor
     */
    HardwareAbstraction();

    /**
     * @brief Initialize hardware pins with board auto-detection
     * @return ErrorCode indicating success or failure
     */
    ErrorCode initialize();

    /**
     * @brief Initialize hardware pins for specific board type
     * @param board Board type to initialize for
     * @return ErrorCode indicating success or failure
     */
    ErrorCode initialize(BoardType board);

    /**
     * @brief Get detected board type
     * @return Current board type
     */
    BoardType getBoardType() const { return currentBoard; }

    /**
     * @brief Get board type name as string
     * @return String representation of board type
     */
    const char* getBoardName() const;

    /**
     * @brief Read sensor value from specified pin
     * @param pin GPIO pin number
     * @param value Reference to store the read value
     * @return ErrorCode indicating success or failure
     */
    ErrorCode readSensor(int pin, int& value);

    /**
     * @brief Set LED indicator state
     * @param ledId LED identifier
     * @param state true for on, false for off
     * @return ErrorCode indicating success or failure
     */
    ErrorCode setLedState(int ledId, bool state);

    /**
     * @brief Get current system time in milliseconds
     * @return Current time in milliseconds
     */
    unsigned long getCurrentTime() const;

    /**
     * @brief Check if pin is valid for sensor operations
     * @param pin GPIO pin number
     * @return true if pin is valid, false otherwise
     */
    bool isValidSensorPin(int pin) const;

    /**
     * @brief Get error description for error code
     * @param error Error code
     * @return String description of the error
     */
    const char* getErrorDescription(ErrorCode error) const;

private:
    // Board configuration structure
    struct BoardConfig {
        const int* sensorPins;
        const int* ledPins;
        int sensorCount;
        int ledCount;
        const char* name;
    };

    // Current board configuration
    BoardType currentBoard;
    BoardConfig config;

    // Universal pin arrays - automatically use correct pins based on compile-time board detection
    static const int SENSOR_PINS[];
    static const int LED_PINS[];
    static const BoardConfig BOARD_CONFIG;

    // Private helper functions
    BoardType detectBoardType() const;
    bool validatePin(int pin, const int* validPins, int maxPins) const;
    void initializePins();
};

#endif // HARDWARE_ABSTRACTION_H
