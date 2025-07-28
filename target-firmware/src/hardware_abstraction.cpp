#include "hardware_abstraction.h"
#include "common.h"

// Static pin definitions
const int HardwareAbstraction::SENSOR_PINS[] = {SENSOR_PIN_A, SENSOR_PIN_B, SENSOR_PIN_C, SENSOR_PIN_D};
const int HardwareAbstraction::LED_PINS[] = {2, 8, 9, 10}; // Example LED pins

HardwareAbstraction::HardwareAbstraction() {
    // Constructor implementation
}

HardwareAbstraction::ErrorCode HardwareAbstraction::initialize() {
    initializePins();
    return ErrorCode::SUCCESS;
}

HardwareAbstraction::ErrorCode HardwareAbstraction::readSensor(int pin, int& value) {
    if (!isValidSensorPin(pin)) {
        return ErrorCode::INVALID_PIN;
    }

    value = analogRead(pin);

    // Basic sensor validation
    if (value < 0 || value > 4095) {
        return ErrorCode::SENSOR_FAULT;
    }

    return ErrorCode::SUCCESS;
}

HardwareAbstraction::ErrorCode HardwareAbstraction::setLedState(int ledId, bool state) {
    if (ledId < 0 || ledId >= MAX_LEDS) {
        return ErrorCode::INVALID_PIN;
    }

    digitalWrite(LED_PINS[ledId], state ? HIGH : LOW);
    return ErrorCode::SUCCESS;
}

unsigned long HardwareAbstraction::getCurrentTime() const {
    return millis();
}

bool HardwareAbstraction::isValidSensorPin(int pin) const {
    return validatePin(pin, SENSOR_PINS, MAX_SENSORS);
}

const char* HardwareAbstraction::getErrorDescription(ErrorCode error) const {
    switch (error) {
        case ErrorCode::SUCCESS:
            return "Success";
        case ErrorCode::INVALID_PIN:
            return "Invalid pin number";
        case ErrorCode::SENSOR_FAULT:
            return "Sensor fault or read error";
        case ErrorCode::TIMEOUT:
            return "Operation timeout";
        default:
            return "Unknown error";
    }
}

bool HardwareAbstraction::validatePin(int pin, const int* validPins, int maxPins) const {
    for (int i = 0; i < maxPins; i++) {
        if (validPins[i] == pin) {
            return true;
        }
    }
    return false;
}

void HardwareAbstraction::initializePins() {
    // Initialize sensor pins
    for (int i = 0; i < MAX_SENSORS; i++) {
        pinMode(SENSOR_PINS[i], INPUT_PULLUP);
    }

    // Initialize LED pins
    for (int i = 0; i < MAX_LEDS; i++) {
        pinMode(LED_PINS[i], OUTPUT);
        digitalWrite(LED_PINS[i], LOW);
    }
}
