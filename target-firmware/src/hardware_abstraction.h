#ifndef HARDWARE_ABSTRACTION_H
#define HARDWARE_ABSTRACTION_H

#include <Arduino.h>

/**
 * @brief Hardware abstraction layer for sensors
 *
 * This class provides a clean interface for hardware operations,
 * abstracting away direct GPIO access and enabling easier testing.
 */
class HardwareAbstraction {
public:
    /**
     * @brief Error codes for hardware operations
     */
    enum class ErrorCode {
        SUCCESS = 0,
        INVALID_PIN = 1,
        SENSOR_FAULT = 2,
        TIMEOUT = 4
    };

    /**
     * @brief Constructor
     */
    HardwareAbstraction();

    /**
     * @brief Initialize hardware pins
     * @return ErrorCode indicating success or failure
     */
    ErrorCode initialize();

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
    // Hardware configuration
    static const int SENSOR_PINS[];
    static const int LED_PINS[];
    static const int MAX_SENSORS = 4;
    static const int MAX_LEDS = 1;

    // Private helper functions
    bool validatePin(int pin, const int* validPins, int maxPins) const;
    void initializePins();
};

#endif // HARDWARE_ABSTRACTION_H
