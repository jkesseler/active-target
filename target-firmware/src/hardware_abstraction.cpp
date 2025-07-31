#include "hardware_abstraction.h"
#include "common.h"

// Universal pin definitions - these automatically resolve to the correct pins
// based on the board type defined at compile time in common.h
const int HardwareAbstraction::SENSOR_PINS[] = {SENSOR_PIN_A, SENSOR_PIN_B, SENSOR_PIN_C, SENSOR_PIN_D};
const int HardwareAbstraction::LED_PINS[] = {LED_PIN_RGB, LED_PIN_2, LED_PIN_3, LED_PIN_4};

// Universal board configuration - automatically adapts to the compiled board
const HardwareAbstraction::BoardConfig HardwareAbstraction::BOARD_CONFIG = {
    SENSOR_PINS,
    LED_PINS,
    4,  // sensorCount
    4,  // ledCount
    BOARD_NAME
};

HardwareAbstraction::HardwareAbstraction() : currentBoard(BoardType::UNKNOWN) {
    // Constructor implementation
}

HardwareAbstraction::ErrorCode HardwareAbstraction::initialize() {
    currentBoard = detectBoardType();
    return initialize(currentBoard);
}

HardwareAbstraction::ErrorCode HardwareAbstraction::initialize(BoardType board) {
    if (board == BoardType::UNKNOWN) {
        return ErrorCode::UNSUPPORTED_BOARD;
    }

    currentBoard = board;
    // Use the universal configuration that automatically adapts to the compiled board
    config = BOARD_CONFIG;
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
    if (ledId < 0 || ledId >= config.ledCount) {
        return ErrorCode::INVALID_PIN;
    }

    digitalWrite(config.ledPins[ledId], state ? HIGH : LOW);
    return ErrorCode::SUCCESS;
}

unsigned long HardwareAbstraction::getCurrentTime() const {
    return millis();
}

bool HardwareAbstraction::isValidSensorPin(int pin) const {
    return validatePin(pin, config.sensorPins, config.sensorCount);
}

const char* HardwareAbstraction::getBoardName() const {
    return config.name;
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
        case ErrorCode::UNSUPPORTED_BOARD:
            return "Unsupported board type";
        default:
            return "Unknown error";
    }
}

HardwareAbstraction::BoardType HardwareAbstraction::detectBoardType() const {
#ifdef BOARD_ESP32_C3_DEVKITM1
    return BoardType::ESP32_C3_DEVKITM1;
#elif defined(BOARD_ESP32_S3_DEVKITC1)
    return BoardType::ESP32_S3_DEVKITC1;
#else
    return BoardType::UNKNOWN;
#endif
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
    for (int i = 0; i < config.sensorCount; i++) {
        pinMode(config.sensorPins[i], INPUT_PULLUP);
    }

    // Initialize LED pins
    for (int i = 0; i < config.ledCount; i++) {
        pinMode(config.ledPins[i], OUTPUT);
        digitalWrite(config.ledPins[i], LOW);
    }
}
