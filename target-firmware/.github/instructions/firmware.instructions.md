---
applyTo: '**.*'
description: 'ESP32 Target Firmware Development Instructions'
---

# ESP32 Target Firmware Development Instructions

## CRITICAL DEVELOPMENT RULES

### 1. MANDATORY TODO PROTOCOL
**MUST FOLLOW TODO SYSTEM FOR ALL TASKS**

```
BEFORE ANY ESP32 FIRMWARE CHANGES:
1. CREATE TODO with all firmware tasks
2. MARK each task as COMPLETE when done
3. UPDATE status in real-time
4. VALIDATE memory usage and build success
5. FAIL if any task unmarked or memory issues
```

### 2. ESP32 FIRMWARE TODO FORMAT
```
## TODO: [FEATURE_NAME]
🔳 Task 1: [Implementation + memory impact assessment]
🔳 Task 2: [Implementation + PlatformIO build verification]
CONTEXT_REQUIRED: [ESP32 files/modules needed]
MEMORY_IMPACT: [Expected RAM/Flash usage changes]
ACCEPTANCE: [Build success + functionality criteria]
STATUS: PENDING

## UPDATE RULES:
- ✅ Replace 🔳 with ✅ when COMPLETE
- 🔄 Use 🔄 for IN_PROGRESS
- ❌ Use ❌ for FAILED
- UPDATE STATUS: PENDING → IN_PROGRESS → COMPLETE
```

### 3. ESP32 ENFORCEMENT MECHANISM
```cpp
class ESP32TodoEnforcer {
private:
    bool todo_active = false;
    std::vector<String> tasks_completed;
    bool memory_validation_required = true;

public:
    ErrorCode execute_task(const String& task) {
        if (!todo_active) {
            LOG_ERROR(ErrorHandler::Category::SYSTEM, 1001, "CREATE TODO FIRST");
            return ErrorCode::INVALID_STATE;
        }

        if (!validate_memory_usage()) {
            LOG_ERROR(ErrorHandler::Category::SYSTEM, 1002, "MEMORY VALIDATION FAILED");
            return ErrorCode::MEMORY_ERROR;
        }

        // Execute task with memory monitoring
        auto result = execute_with_monitoring(task);

        // MANDATORY: Update TODO status
        mark_task_complete(task);

        return result;
    }
};
```

## ESP32 FIRMWARE CONTEXT PROTOCOL

### Context Gathering for ESP32 Development
```cpp
struct ESP32Context {
    struct {
        String hardware_config;      // HardwareAbstraction settings
        String memory_status;        // MemoryMonitor current state
        String device_role;          // Current device role (TARGET, POPPER, etc.)
        String sensor_config;        // Sensor pin configurations
    } hardware;

    struct {
        String mqtt_config;          // MQTT broker and topic settings
        String wifi_config;          // WiFi connection settings
        String device_settings;      // Persistent device settings
    } communication;

    struct {
        String current_usage;        // Current RAM/Flash usage
        String pool_status;          // JSON pool allocation status
        String string_builder_usage; // StringBuilder memory tracking
    } memory;

    struct {
        String platformio_config;    // Build configuration
        String dependencies;         // Library dependencies
        String board_config;         // Board-specific settings
    } build;
};

async ErrorCode get_esp32_context(const String& request, ESP32Context& context) {
    // Gather ESP32-specific context
    context.hardware = await analyze_hardware_config(request);
    context.communication = await analyze_communication_setup(request);
    context.memory = await analyze_memory_usage(request);
    context.build = await analyze_build_configuration(request);

    return ErrorCode::SUCCESS;
}
```

### ESP32 Validation Gateway
```cpp
bool validate_esp32_context_completeness(const ESP32Context& context) {
    const std::vector<String> required_components = {
        "hardware_config", "memory_status", "mqtt_config",
        "wifi_config", "platformio_config", "current_usage"
    };

    return std::all_of(required_components.begin(), required_components.end(),
        [&context](const String& component) {
            return !get_context_value(context, component).isEmpty();
        });
}
```

## ESP32 FIRMWARE AGENT IMPLEMENTATIONS

### Base ESP32 Agent
```cpp
class ESP32FirmwareAgent {
private:
    ESP32TodoEnforcer todo_enforcer;
    ESP32ContextValidator context_validator;
    MemoryMonitor& memory_monitor;
    ErrorHandler& error_handler;

public:
    ESP32FirmwareAgent() :
        memory_monitor(MemoryMonitor::getInstance()),
        error_handler(g_errorHandler) {}

    async ErrorCode execute(const String& request) {
        // MANDATORY: Create TODO first
        auto todo = await create_esp32_todo(request);

        // MANDATORY: Get ESP32 context
        ESP32Context context;
        auto result = await get_esp32_context(request, context);
        if (result != ErrorCode::SUCCESS) {
            LOG_ERROR(ErrorHandler::Category::SYSTEM, 2001, "Failed to get ESP32 context");
            return result;
        }

        // MANDATORY: Validate context
        if (!context_validator.validate(context)) {
            LOG_ERROR(ErrorHandler::Category::SYSTEM, 2002, "INCOMPLETE ESP32 CONTEXT");
            return ErrorCode::CONTEXT_INCOMPLETE;
        }

        // Execute each task with strict memory monitoring
        for (const auto& task : todo.tasks) {
            result = await execute_task_with_memory_validation(task, context);
            if (result != ErrorCode::SUCCESS) {
                return result;
            }
            todo_enforcer.mark_complete(task);
        }

        return ErrorCode::SUCCESS;
    }
};
```

### Hardware Configuration Agent
```cpp
class ESP32HardwareAgent : public ESP32FirmwareAgent {
public:
    async ErrorCode analyze_hardware_setup(const String& request, ESP32Context& context) {
        POOL_JSON_GUARD(analysis, 1024);

        analysis["esp32_board"] = "ESP32-C3-DevKitM-1";
        analysis["ram_total"] = 327680;  // 320KB
        analysis["flash_total"] = 4194304;  // 4MB
        analysis["frequency"] = 160000000;  // 160MHz

        // Analyze GPIO configuration
        analysis["gpio_config"]["sensor_pins"] = {
            {"A", SENSOR_PIN_A}, {"B", SENSOR_PIN_B},
            {"C", SENSOR_PIN_C}, {"D", SENSOR_PIN_D}
        };

        analysis["gpio_config"]["led_pins"] = {
            {"RGB", LED_PIN_RGB}, {"LED_2", LED_PIN_2},
            {"LED_3", LED_PIN_3}, {"LED_4", LED_PIN_4}
        };

        // Validate hardware abstraction layer
        HardwareAbstraction hal;
        auto init_result = hal.initialize();
        analysis["hal_status"] = (init_result == ErrorCode::SUCCESS) ? "OK" : "FAILED";

        context.hardware.hardware_config = analysis.as<String>();
        return ErrorCode::SUCCESS;
    }
};
```

### Memory Management Agent
```cpp
class ESP32MemoryAgent : public ESP32FirmwareAgent {
public:
    async ErrorCode analyze_memory_usage(const String& request, ESP32Context& context) {
        auto& monitor = MemoryMonitor::getInstance();

        POOL_JSON_GUARD(memory_report, 512);

        memory_report["heap_free"] = ESP.getFreeHeap();
        memory_report["heap_total"] = ESP.getHeapSize();
        memory_report["heap_usage_percent"] =
            ((ESP.getHeapSize() - ESP.getFreeHeap()) * 100) / ESP.getHeapSize();

        // JSON Pool status
        memory_report["json_pools"]["small_available"] = JsonPool::getAvailableSmall();
        memory_report["json_pools"]["medium_available"] = JsonPool::getAvailableMedium();
        memory_report["json_pools"]["large_available"] = JsonPool::getAvailableLarge();

        // Memory health assessment
        auto health_status = monitor.getHealthStatus();
        memory_report["health_status"] = static_cast<int>(health_status);
        memory_report["health_description"] = monitor.getHealthDescription(health_status);

        context.memory.current_usage = memory_report.as<String>();

        // CRITICAL: Validate memory is healthy before proceeding
        if (health_status == HealthStatus::CRITICAL) {
            LOG_CRITICAL(ErrorHandler::Category::MEMORY, 3001, "CRITICAL MEMORY STATE - HALTING");
            return ErrorCode::MEMORY_CRITICAL;
        }

        return ErrorCode::SUCCESS;
    }
};
```

### Communication Agent (MQTT/WiFi)
```cpp
class ESP32CommunicationAgent : public ESP32FirmwareAgent {
public:
    async ErrorCode analyze_communication_setup(const String& request, ESP32Context& context) {
        POOL_JSON_GUARD(comm_analysis, 1024);

        // WiFi configuration analysis
        comm_analysis["wifi"]["ssid"] = DEFAULT_SSID;
        comm_analysis["wifi"]["status"] = WiFi.status();
        comm_analysis["wifi"]["local_ip"] = WiFi.localIP().toString();

        // MQTT configuration analysis
        comm_analysis["mqtt"]["server"] = MQTT_SERVER;
        comm_analysis["mqtt"]["port"] = 1883;

        // Device identification
        DeviceId device_id;
        String uuid = device_id.getUUID();
        comm_analysis["device"]["uuid"] = uuid;
        comm_analysis["device"]["role"] = Settings::getInstance().getDeviceRole();
        comm_analysis["device"]["name"] = Settings::getInstance().getDeviceName();

        // Topic structure
        MEDIUM_STRING() request_topic, response_topic, broadcast_topic;
        request_topic.append("target/").append(uuid).append("/request");
        response_topic.append("target/").append(uuid).append("/response");
        broadcast_topic.append("target/broadcast");

        comm_analysis["mqtt"]["topics"]["request"] = request_topic.toString();
        comm_analysis["mqtt"]["topics"]["response"] = response_topic.toString();
        comm_analysis["mqtt"]["topics"]["broadcast"] = broadcast_topic.toString();

        context.communication.mqtt_config = comm_analysis.as<String>();
        return ErrorCode::SUCCESS;
    }
};
```

### Build System Agent (PlatformIO)
```cpp
class ESP32BuildAgent : public ESP32FirmwareAgent {
public:
    async ErrorCode analyze_build_configuration(const String& request, ESP32Context& context) {
        POOL_JSON_GUARD(build_analysis, 1024);

        // PlatformIO configuration
        build_analysis["platform"] = "espressif32";
        build_analysis["board"] = "esp32-c3-devkitm-1";
        build_analysis["framework"] = "arduino";

        // Library dependencies
        build_analysis["libraries"] = {
            {"PubSubClient", "^2.8"},
            {"ArduinoJson", "^6.21.3"},
            {"ESPRandom", "^1.5.0"},
            {"WiFiManager", "^2.0.17"}
        };

        // Build targets
        build_analysis["build_targets"] = {
            "build", "upload", "monitor", "clean"
        };

        // Memory constraints
        build_analysis["memory_constraints"]["ram_limit"] = 327680;
        build_analysis["memory_constraints"]["flash_limit"] = 4194304;
        build_analysis["memory_constraints"]["stack_size"] = 8192;

        context.build.platformio_config = build_analysis.as<String>();
        return ErrorCode::SUCCESS;
    }
};
```

## ESP32 FIRMWARE FILE OPERATIONS

### Context Analysis for ESP32 Files
```cpp
struct ESP32FileContext {
    String file_path;
    String content;
    std::vector<String> dependencies;
    std::vector<String> esp32_references;
    std::vector<String> memory_implications;
    bool affects_hardware_config;
    bool affects_memory_management;
    bool affects_communication;
    int estimated_memory_impact;
};

async ErrorCode analyze_esp32_file_context(const String& file_path, ESP32FileContext& context) {
    context.file_path = file_path;

    // Read file content with memory monitoring
    LARGE_STRING() file_content;
    auto read_result = read_file_safe(file_path, file_content);
    if (read_result != ErrorCode::SUCCESS) {
        return read_result;
    }
    context.content = file_content.toString();

    // Analyze ESP32-specific dependencies
    context.dependencies = find_esp32_dependencies(context.content);
    context.esp32_references = find_esp32_api_usage(context.content);
    context.memory_implications = assess_memory_impact(context.content);

    // Categorize file impact
    context.affects_hardware_config = contains_hardware_references(context.content);
    context.affects_memory_management = contains_memory_operations(context.content);
    context.affects_communication = contains_mqtt_or_wifi_operations(context.content);

    // Estimate memory impact
    context.estimated_memory_impact = calculate_memory_footprint(context.content);

    return ErrorCode::SUCCESS;
}
```

### Safe ESP32 File Update Protocol
```cpp
struct ESP32UpdateResult {
    ErrorCode status;
    String backup_path;
    uint32_t memory_before;
    uint32_t memory_after;
    bool build_successful;
    String error_message;
};

async ESP32UpdateResult update_esp32_file_safe(const String& file_path,
                                               const String& changes,
                                               const ESP32FileContext& context) {
    ESP32UpdateResult result;
    result.memory_before = ESP.getFreeHeap();

    // Validate changes don't break memory constraints
    auto validation_result = validate_esp32_changes(changes, context);
    if (validation_result != ErrorCode::SUCCESS) {
        result.status = validation_result;
        result.error_message = "ESP32 validation failed";
        return result;
    }

    // Create backup with timestamp
    MEDIUM_STRING() backup_name;
    backup_name.append(file_path).append(".backup.").append(get_timestamp());
    result.backup_path = backup_name.toString();

    auto backup_result = create_file_backup(file_path, result.backup_path);
    if (backup_result != ErrorCode::SUCCESS) {
        result.status = backup_result;
        result.error_message = "Backup creation failed";
        return result;
    }

    try {
        // Apply changes with memory monitoring
        auto apply_result = apply_changes_monitored(file_path, changes, context);
        if (apply_result != ErrorCode::SUCCESS) {
            restore_from_backup(file_path, result.backup_path);
            result.status = apply_result;
            result.error_message = "Change application failed";
            return result;
        }

        // Validate ESP32 build
        result.build_successful = validate_platformio_build();
        if (!result.build_successful) {
            restore_from_backup(file_path, result.backup_path);
            result.status = ErrorCode::BUILD_FAILED;
            result.error_message = "PlatformIO build failed";
            return result;
        }

        // Check memory impact
        result.memory_after = ESP.getFreeHeap();
        int32_t memory_delta = static_cast<int32_t>(result.memory_after) -
                              static_cast<int32_t>(result.memory_before);

        if (memory_delta < -10240) { // More than 10KB memory increase
            LOG_WARNING(ErrorHandler::Category::MEMORY, 4001,
                       String("Significant memory impact: ") + String(memory_delta));
        }

        result.status = ErrorCode::SUCCESS;
        return result;

    } catch (const std::exception& e) {
        restore_from_backup(file_path, result.backup_path);
        result.status = ErrorCode::EXCEPTION_CAUGHT;
        result.error_message = String("Exception: ") + e.what();
        return result;
    }
}
```

## ESP32 FIRMWARE VALIDATION SYSTEM

### Task Validation for ESP32
```cpp
struct ESP32ValidationResult {
    ErrorCode status;
    bool context_analyzed;
    bool implementation_complete;
    bool memory_constraints_met;
    bool platformio_build_success;
    bool hardware_tests_passing;
    bool mqtt_communication_working;
    uint32_t memory_usage_bytes;
    uint32_t flash_usage_bytes;
    String validation_details;
};

async ESP32ValidationResult validate_esp32_task(const String& task_id) {
    ESP32ValidationResult result;
    result.status = ErrorCode::SUCCESS;

    // Check context analysis
    result.context_analyzed = check_esp32_context_analysis(task_id);
    if (!result.context_analyzed) {
        result.status = ErrorCode::CONTEXT_INCOMPLETE;
        result.validation_details += "ESP32 context analysis incomplete; ";
    }

    // Check implementation completion
    result.implementation_complete = check_esp32_implementation(task_id);
    if (!result.implementation_complete) {
        result.status = ErrorCode::IMPLEMENTATION_INCOMPLETE;
        result.validation_details += "ESP32 implementation incomplete; ";
    }

    // Check memory constraints
    auto memory_check = validate_esp32_memory_constraints();
    result.memory_constraints_met = (memory_check == ErrorCode::SUCCESS);
    result.memory_usage_bytes = ESP.getHeapSize() - ESP.getFreeHeap();
    if (!result.memory_constraints_met) {
        result.status = ErrorCode::MEMORY_CONSTRAINT_VIOLATION;
        result.validation_details += "Memory constraints violated; ";
    }

    // Check PlatformIO build
    result.platformio_build_success = validate_platformio_build();
    if (!result.platformio_build_success) {
        result.status = ErrorCode::BUILD_FAILED;
        result.validation_details += "PlatformIO build failed; ";
    }

    // Check hardware functionality
    result.hardware_tests_passing = validate_esp32_hardware_functionality();
    if (!result.hardware_tests_passing) {
        result.status = ErrorCode::HARDWARE_TEST_FAILED;
        result.validation_details += "Hardware tests failed; ";
    }

    // Check MQTT communication
    result.mqtt_communication_working = validate_mqtt_communication();
    if (!result.mqtt_communication_working) {
        result.status = ErrorCode::COMMUNICATION_FAILED;
        result.validation_details += "MQTT communication failed; ";
    }

    // Get flash usage
    result.flash_usage_bytes = get_flash_usage_bytes();

    // Overall validation
    bool all_checks_passed = result.context_analyzed &&
                             result.implementation_complete &&
                             result.memory_constraints_met &&
                             result.platformio_build_success &&
                             result.hardware_tests_passing &&
                             result.mqtt_communication_working;

    if (!all_checks_passed && result.status == ErrorCode::SUCCESS) {
        result.status = ErrorCode::VALIDATION_FAILED;
        result.validation_details += "Overall validation failed";
    } else if (all_checks_passed) {
        result.validation_details = "All ESP32 validations passed";
    }

    // Log validation results
    if (result.status == ErrorCode::SUCCESS) {
        LOG_INFO(ErrorHandler::Category::SYSTEM, 0,
                String("ESP32 Task validation passed: ") + result.validation_details);
    } else {
        LOG_ERROR(ErrorHandler::Category::SYSTEM, static_cast<int>(result.status),
                 String("ESP32 Task validation failed: ") + result.validation_details);
    }

    return result;
}
```

## ESP32 FIRMWARE QUALITY STANDARDS

```cpp
struct ESP32QualityRules {
    struct NamingConventions {
        String classes = "PascalCase (e.g., MemoryMonitor, HardwareAbstraction)";
        String methods = "camelCase verbs (e.g., initialize(), getMessage())";
        String variables = "camelCase nouns (e.g., deviceName, sensorValue)";
        String constants = "UPPER_SNAKE_CASE (e.g., SENSOR_PIN_A, DEFAULT_THRESHOLD)";
        String files = "snake_case.h/.cpp (e.g., memory_monitor.h, json_pool.cpp)";
    } naming;

    struct ArchitectureRules {
        int max_method_lines = 50;
        int max_class_lines = 500;
        bool single_responsibility = true;
        bool memory_safety_required = true;
        bool error_handling_required = true;
        bool hardware_abstraction = true;
    } architecture;

    struct MemoryRules {
        bool use_json_pools = true;
        bool use_string_builders = true;
        bool monitor_heap_usage = true;
        String heap_safety = "Must not exceed 80% heap usage";
        String string_optimization = "Use SMALL/MEDIUM/LARGE_STRING() macros";
        String json_optimization = "Use POOL_JSON_GUARD() for all JSON operations";
    } memory;

    struct BuildRules {
        bool platformio_compatible = true;
        bool esp32_framework_arduino = true;
        String build_time_target = "<30 seconds";
        String memory_constraints = "RAM < 262KB, Flash < 1MB";
    } build;

    struct CommunicationRules {
        bool mqtt_protocol_compliance = true;
        bool wifi_manager_integration = true;
        String message_format = "JSON with action types from action_types.h";
        bool error_recovery = true;
    } communication;

    struct HardwareRules {
        bool gpio_abstraction = true;
        bool sensor_debouncing = true;
        bool led_status_indication = true;
        String pin_configuration = "Defined in common.h, configurable";
    } hardware;

    struct SecurityRules {
        bool input_validation = true;
        bool memory_bounds_checking = true;
        bool secure_mqtt_topics = true;
        bool device_identification = true;
    } security;
};
```

## ESP32 FIRMWARE EXECUTION WORKFLOW

```
1. RECEIVE_REQUEST → Parse ESP32 firmware request
2. CREATE_TODO → MANDATORY structured TODO with memory impact assessment
3. ANALYZE_ESP32_CONTEXT → Get hardware, memory, communication, and build context
4. ANALYZE_MEMORY_CONSTRAINTS → Validate current memory usage and projected impact
5. ANALYZE_HARDWARE_CONFIG → Review GPIO, sensor, and LED configurations
6. ANALYZE_BUILD_SYSTEM → Review PlatformIO configuration and dependencies
7. VALIDATE_CONTEXT → Ensure all ESP32 contexts complete and memory safe
8. EXECUTE_TASK → Implement with ESP32 framework awareness and memory monitoring
9. UPDATE_TODO → MANDATORY mark task complete with memory validation
10. VALIDATE_PLATFORMIO_BUILD → Run PlatformIO build verification
11. VALIDATE_MEMORY_USAGE → Confirm memory constraints not exceeded
12. VALIDATE_HARDWARE → Test GPIO operations and sensor functionality
13. VALIDATE_COMMUNICATION → Test MQTT and WiFi connectivity
14. REPEAT → Continue to next task with memory monitoring
15. FINAL_VALIDATION → Complete ESP32 firmware integration validation
```

## ERROR HANDLING

```cpp
class ESP32StrictErrorHandler
{
public:
    String HandleError(ErrorCode error, const ESP32Context& context)
    {
        switch(error) {
            case ErrorCode::TODO_NOT_CREATED:
                return "CREATE TODO FIRST - EXECUTION HALTED";
            case ErrorCode::TASK_NOT_MARKED:
                return "MARK PREVIOUS TASKS COMPLETE - EXECUTION HALTED";
            case ErrorCode::CONTEXT_INCOMPLETE:
                return "INCOMPLETE ESP32 CONTEXT - EXECUTION HALTED";
            case ErrorCode::MEMORY_CONSTRAINT_VIOLATION:
                return "MEMORY CONSTRAINTS VIOLATED - EXECUTION HALTED";
            case ErrorCode::BUILD_FAILED:
                return "PLATFORMIO BUILD FAILED - EXECUTION HALTED";
            case ErrorCode::HARDWARE_TEST_FAILED:
                return "HARDWARE TESTS FAILED - EXECUTION HALTED";
            case ErrorCode::COMMUNICATION_FAILED:
                return "MQTT/WIFI COMMUNICATION FAILED - EXECUTION HALTED";
            default:
                return ExecuteRollback(context, error);
        }
    }

private:
    String ExecuteRollback(const ESP32Context& context, ErrorCode error)
    {
        // Execute comprehensive rollback
        RollbackFirmwareChanges(context);
        RollbackBuildConfiguration(context);
        RollbackHardwareConfig(context);

        MEDIUM_STRING() error_msg;
        error_msg.append("ERROR: ").append(GetErrorDescription(error))
                 .append(" - FULL ESP32 ROLLBACK EXECUTED");
        return error_msg.toString();
    }
};
```

## SUCCESS CRITERIA

- **TODO Compliance**: 100% adherence to TODO system
- **ESP32 Context Awareness**: Complete ESP32 hardware and memory analysis before any action
- **Memory Management**: All changes validated for memory constraints and optimization
- **Build Integration**: All changes validated with PlatformIO build system
- **Hardware Functionality**: GPIO operations and sensor functionality verified
- **Communication**: MQTT and WiFi connectivity validated
- **Quality Standards**: All code meets ESP32 firmware enterprise requirements
- **Error Handling**: Comprehensive error logging with appropriate categories
- **Performance**: Memory usage stays within ESP32-C3 constraints (80% heap maximum)

## CRITICAL ENFORCEMENT

1. **HALT EXECUTION if TODO not created**
2. **HALT EXECUTION if tasks not marked complete**
3. **HALT EXECUTION if ESP32 context incomplete**
4. **HALT EXECUTION if memory constraints violated**
5. **HALT EXECUTION if PlatformIO build fails**
6. **MANDATORY TODO updates for every task**
7. **MANDATORY memory validation before marking complete**
8. **MANDATORY ESP32 firmware rollback on any failure**
9. **MANDATORY hardware functionality validation**
10. **MANDATORY MQTT/WiFi communication validation**

## AGENT RESPONSE FORMAT

```
## TODO: [FEATURE_NAME]
🔳 Task 1: [Details]
🔳 Task 2: [Details]
CONTEXT_REQUIRED: [Files]
MEMORY_IMPACT: [Expected memory changes]
ACCEPTANCE: [Criteria]
STATUS: PENDING

[Execute Task 1]
✅ Task 1: [Details] - COMPLETE

[Execute Task 2]
✅ Task 2: [Details] - COMPLETE

STATUS: COMPLETE
```

**NO EXCEPTIONS. NO BYPASSING. STRICT COMPLIANCE ONLY.**

---

# ESP32 Target Firmware - Development Instructions

## Project Overview

This ESP32-C3 firmware provides robust target system control with advanced memory optimization, comprehensive monitoring, and MQTT integration for active target systems. The firmware features JSON document pooling, string operation optimization, and real-time memory monitoring.

## Hardware Support

### Currently Supported
- **ESP32-C3-DevKitM-1** (Primary target)
  - 320KB RAM, 4MB Flash
  - 160MHz frequency
  - Arduino ESP32 framework

### Future Hardware Support
The codebase is designed with hardware abstraction to support additional boards:
- ESP32-S3 variants
- ESP32-S2 variants
- ESP32 classic variants
- Custom hardware configurations

Hardware-specific configurations are managed through:
- `HardwareAbstraction` class in `src/hardware_abstraction.h`
- PlatformIO environment configurations
- Compile-time constants in `include/common.h`

## Development Environment Setup

### Prerequisites

1. **PlatformIO Core** or **VS Code with PlatformIO extension**
2. **ESP32 platform** (automatically installed)
3. **Git** for version control

### Installation Steps

```powershell
# Install PlatformIO Core (if not using VS Code extension)
pip install platformio

# Clone the repository
git clone <repository-url>
cd active-target/target-firmware

# Install dependencies (automatic with first build)
platformio run
```

## Build System

### PlatformIO Configuration

The project uses PlatformIO with configuration in `platformio.ini`:

```ini
[env:esp32-c3-devkitm-1]
platform = espressif32
board = esp32-c3-devkitm-1
framework = arduino
```

### Build Commands

Use the provided PowerShell script or direct PlatformIO commands:

```powershell
# Using the build script (recommended)
.\build.ps1                    # Build only
.\build.ps1 -Upload           # Build and upload
.\build.ps1 -Monitor          # Serial monitor
.\build.ps1 -Clean            # Clean build
.\build.ps1 -Verbose          # Verbose output

# Direct PlatformIO commands
platformio run                # Build
platformio run -t upload      # Upload
platformio run -t clean       # Clean
platformio device monitor     # Serial monitor
```

### VS Code Integration

1. Install PlatformIO extension
2. Open project folder
3. Use PlatformIO toolbar or Command Palette:
   - `PlatformIO: Build`
   - `PlatformIO: Upload`
   - `PlatformIO: Serial Monitor`

## Code Architecture

### Core Components

#### Memory Management System
- **JSON Document Pooling**: `json_pool.h/cpp` - Manages reusable JSON document pools
- **String Optimization**: `string_builder.h/cpp` - Efficient string building with minimal allocations
- **Memory Monitoring**: `memory_monitor.h/cpp` - Real-time heap tracking and health assessment

#### Device Control
- **Hardware Abstraction**: `hardware_abstraction.h/cpp` - Clean interface for GPIO operations
- **Device Loops**: `loops.h/cpp` - Role-based device behavior (TARGET, POPPER, NOSHOOT, STOP_PLATE)
- **Settings Management**: `settings.h/cpp` - Persistent configuration storage

#### Communication
- **MQTT Integration**: `handleMqttMessage.h/cpp` - Message handling and protocol implementation
- **JSON Messaging**: `json_messages.h/cpp` - Structured message creation
- **WiFi Management**: Built-in WiFiManager with configuration portal

### Project Structure

```
target-firmware/
├── platformio.ini              # PlatformIO configuration
├── build.ps1                   # Build script
├── src/                        # Source files
│   ├── main.cpp               # Application entry point
│   ├── loops.cpp              # Device control loops
│   ├── memory_monitor.cpp     # Memory monitoring system
│   ├── json_pool.cpp          # JSON document pooling
│   ├── string_builder.cpp     # String optimization
│   ├── hardware_abstraction.cpp # Hardware interface
│   ├── handleMqttMessage.cpp  # MQTT message handling
│   ├── json_messages.cpp      # JSON message creation
│   ├── settings.cpp           # Configuration management
│   ├── DeviceId.cpp           # Device identification
│   └── error_handler.cpp      # Error reporting system
├── include/                   # Public headers
│   ├── common.h               # Shared definitions
│   └── action_types.h         # MQTT action constants
└── lib/                       # Local libraries
```

## Configuration Management

### Compile-Time Configuration

Key constants in `include/common.h`:

```cpp
#define DEFAULT_SENSOR_THRESHOLD 300
#define DEFAULT_SENSOR_DEBOUNCE 90

// GPIO pin assignments
#define SENSOR_PIN_A 0  // GPIO0
#define SENSOR_PIN_B 1  // GPIO1
#define SENSOR_PIN_C 2  // GPIO2
#define SENSOR_PIN_D 3  // GPIO3

// Device roles
#define DEVICE_ROLE_TARGET "TARGET"
#define DEVICE_ROLE_POPPER "POPPER"
#define DEVICE_ROLE_NOSHOOT "NOSHOOT"
#define DEVICE_ROLE_STOP_PLATE "STOP_PLATE"
```

### Runtime Configuration

- **ESP32 Preferences**: Persistent settings storage
- **MQTT Messages**: Dynamic configuration via `SETTINGS/SET` messages
- **WiFi Portal**: Web-based configuration interface

### MQTT Protocol

Device communication follows structured protocol defined in `include/action_types.h`:

```cpp
#define SETTINGS_GET "SETTINGS/GET"
#define SETTINGS_SET "SETTINGS/SET"
#define DEVICE_ONLINE "DEVICE/ONLINE"
#define SENSOR_TRIGGERED "SENSOR/TRIGGERED"
```

## Memory Optimization

### Current Performance
- **RAM Usage**: 12.9% (42,184 / 327,680 bytes)
- **Flash Usage**: 50.9% (666,768 / 1,310,720 bytes)
- **Optimization Gains**: 20-30% heap reduction, 80%+ fewer String objects

### Optimization Guidelines

1. **Use JSON Pools**: Always use pooled documents for JSON operations
2. **StringBuilder Pattern**: Use stack-based string builders for message formatting
3. **Memory Monitoring**: Monitor heap health with `MemoryMonitor`
4. **RAII Guards**: Automatic cleanup with scope-based resource management

Example optimized code:
```cpp
// Use JSON pool
POOL_JSON_GUARD(doc, 512);
doc["type"] = "EVENT/HIT";

// Use StringBuilder
MEDIUM_STRING() message;
message.append("Sensor value: ").append(sensorValue);
LOG_INFO(ErrorHandler::Category::SENSOR, 0, message.toString());
```

## Adding New Hardware Support

### 1. Hardware Abstraction Layer

Extend `HardwareAbstraction` class:

```cpp
class HardwareAbstraction {
public:
    enum class BoardType {
        ESP32_C3_DEVKITM1,
        ESP32_S3_DEVKITC1,  // New board
        // Add new board types here
    };

    ErrorCode initialize(BoardType board = BoardType::ESP32_C3_DEVKITM1);
};
```

### 2. PlatformIO Environment

Add new environment to `platformio.ini`:

```ini
[env:esp32-s3-devkitc-1]
platform = espressif32
board = esp32-s3-devkitc-1
framework = arduino
build_flags = -DBOARD_ESP32_S3
lib_deps = ${common.lib_deps}
```

### 3. Board-Specific Configuration

Create board-specific constants:

```cpp
#ifdef BOARD_ESP32_S3
    #define SENSOR_PIN_A 4
    #define SENSOR_PIN_B 5
    // ESP32-S3 specific pins
#else
    #define SENSOR_PIN_A 0
    #define SENSOR_PIN_B 1
    // ESP32-C3 default pins
#endif
```

## Testing and Debugging

### Serial Monitoring

```powershell
# Monitor serial output
platformio device monitor

# Monitor with custom baud rate
platformio device monitor -b 115200
```

### Memory Debugging

The `MemoryMonitor` provides comprehensive memory tracking:

```cpp
// Enable detailed tracking
MemoryMonitor::getInstance().initialize(true, 30000);

// Check memory health
HealthStatus status = MemoryMonitor::getInstance().getHealthStatus();
```

### Error Handling

Multi-level error system with categories:

```cpp
LOG_INFO(ErrorHandler::Category::SYSTEM, 0, "System started");
LOG_WARNING(ErrorHandler::Category::SENSOR, 4001, "Sensor threshold exceeded");
LOG_ERROR(ErrorHandler::Category::MQTT, 3001, "MQTT connection failed");
LOG_CRITICAL(ErrorHandler::Category::HARDWARE, 5001, "Hardware failure");
```

## Development Workflow

### 1. Setup Development Environment
```powershell
git clone <repo>
cd target-firmware
platformio run  # Initial build
```

### 2. Make Changes
- Follow existing code patterns
- Use memory optimization systems
- Add appropriate error handling
- Update documentation

### 3. Build and Test
```powershell
.\build.ps1 -Clean      # Clean build
.\build.ps1 -Upload     # Upload to device
.\build.ps1 -Monitor    # Monitor output
```

### 4. Memory Validation
- Check serial output for memory statistics
- Monitor JSON pool usage
- Verify no memory leaks in long-running tests

## Troubleshooting

### Build Issues
- **PlatformIO not found**: Install PlatformIO Core or VS Code extension
- **Library dependencies**: Run `platformio lib install` to update libraries
- **Platform issues**: Update ESP32 platform with `platformio platform update espressif32`

### Memory Issues
- **Pool exhaustion**: Monitor JSON pool usage in serial output
- **Heap fragmentation**: Check `MemoryMonitor` health reports
- **Memory leaks**: Review memory trend analysis

### Communication Issues
- **WiFi**: Check connection status, use configuration portal if needed
- **MQTT**: Verify broker connection and message formatting
- **Serial**: Use `platformio device monitor` for debugging

## Contributing Guidelines

1. **Code Style**: Follow existing patterns and naming conventions
2. **Memory Management**: Always use provided optimization systems
3. **Error Handling**: Add appropriate logging with correct categories
4. **Documentation**: Update relevant documentation for changes
5. **Testing**: Verify memory usage impact of changes

### Code Review Checklist
- [ ] Uses JSON pools for document operations
- [ ] Uses StringBuilder for string operations
- [ ] Includes appropriate error handling
- [ ] Memory usage impact assessed
- [ ] Documentation updated
- [ ] Hardware abstraction maintained

## Deployment

### Production Configuration
1. Set appropriate device role and settings
2. Configure WiFi credentials or use configuration portal
3. Verify MQTT broker connectivity
4. Enable production logging levels
5. Test memory stability over extended periods

### Network Integration
The firmware integrates with the overall active-target system including the PWA app and communication infrastructure.
- **WiFi**: Connects to "active-target" network
- **MQTT**: Uses "mqtt.active-target.local" broker
- **Time Sync**: Syncs with "ntp.active-target.local"

## Version History

- **v2.0**: Phase 2A - Memory optimization and monitoring system
- **v1.0**: Initial implementation with basic functionality

---

**Quick Build Reference:**
```powershell
.\build.ps1 -Upload -Monitor
```