#include "hardware_abstraction.h"
#include "common.h"

// Static pin definitions
const int HardwareAbstraction::SENSOR_PINS[] = {SENSOR_PIN_A, SENSOR_PIN_B, SENSOR_PIN_C, SENSOR_PIN_D};
const int HardwareAbstraction::LED_PINS[] = {2, 8, 9, 10}; // Example LED pins
const int HardwareAbstraction::ACTUATOR_PINS[] = {5, 6, 7, 18}; // Example actuator pins

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

HardwareAbstraction::ErrorCode HardwareAbstraction::activateActuator(int actuatorId, unsigned long duration) {
    if (actuatorId < 0 || actuatorId >= MAX_ACTUATORS) {
        return ErrorCode::INVALID_PIN;
    }

    digitalWrite(ACTUATOR_PINS[actuatorId], HIGH);

    if (duration > 0) {
        delay(duration);
        digitalWrite(ACTUATOR_PINS[actuatorId], LOW);
    }

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
        case ErrorCode::ACTUATOR_FAULT:
            return "Actuator fault or write error";
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

    // Initialize actuator pins
    for (int i = 0; i < MAX_ACTUATORS; i++) {
        pinMode(ACTUATOR_PINS[i], OUTPUT);
        digitalWrite(ACTUATOR_PINS[i], LOW);
    }
}
