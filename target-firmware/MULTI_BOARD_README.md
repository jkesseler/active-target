# Multi-Board ESP32 Target Firmware

This firmware supports multiple ESP32 development boards with automatic board detection and optimized configurations.

## Supported Boards

### ESP32-S3-DevKitC-1 (Primary)
- **MCU**: ESP32-S3 (Xtensa dual-core, 240MHz)
- **RAM**: 512KB SRAM
- **Flash**: 8MB
- **Features**: WiFi 4, Bluetooth 5 (LE), USB OTG
- **GPIO Pins**: More available pins
- **Use Case**: Feature-rich deployment, future expansion

### ESP32-C3-DevKitM-1
- **MCU**: ESP32-C3 (RISC-V single-core, 160MHz)
- **RAM**: 400KB SRAM
- **Flash**: 4MB
- **Features**: WiFi 4, Bluetooth 5 (LE)
- **GPIO Pins**: Limited (fewer pins than ESP32-S3)
- **Use Case**: Cost-effective deployment, low power applications

## Hardware Abstraction

The firmware automatically detects the board type during compilation and configures:

- **Pin Mappings**: Sensor and LED pins optimized for each board
- **Memory Layout**: Board-specific memory optimization
- **Build Flags**: Compiler optimizations per architecture

### Pin Configuration

#### ESP32-C3-DevKitM-1
```
Sensors: GPIO0, GPIO1, GPIO2, GPIO3 (ADC1_CH0-3)
LEDs:    GPIO8, GPIO9, GPIO10 + RGB_BUILTIN
```

#### ESP32-S3-DevKitC-1
```
Sensors: GPIO1, GPIO2, GPIO3, GPIO4 (ADC1_CH0-3)
LEDs:    GPIO38, GPIO39, GPIO40, GPIO41
```

## Build Instructions

### Using VS Code with PlatformIO Extension

1. Open project in VS Code
2. Use PlatformIO sidebar to select environment:
   - `esp32-s3-devkitc-1` - ESP32-S3 board (Primary)
   - `esp32-c3-devkitm-1` - ESP32-C3 board
3. Click "Build" or "Upload"

### Using PowerShell Build Script

```powershell
# Build for specific board
.\build.ps1 -Environment esp32-s3-devkitc-1
.\build.ps1 -Environment esp32-c3-devkitm-1

# Build for all supported boards
.\build.ps1 -AllBoards

# Upload to specific board
.\build.ps1 -Environment esp32-s3-devkitc-1 -Upload

# List available boards
.\build.ps1 -ListBoards

# Clean build
.\build.ps1 -Environment esp32-s3-devkitc-1 -Clean
```

### Using PlatformIO CLI Directly

```bash
# Build specific environment
pio run -e esp32-s3-devkitc-1
pio run -e esp32-c3-devkitm-1

# Upload to device
pio run -e esp32-s3-devkitc-1 -t upload

# Monitor serial output
pio device monitor -e esp32-s3-devkitc-1
```

## GitHub Actions CI/CD

The project includes automated building for all supported boards:

- **Triggered on**: Manual workflow dispatch (automatic triggers currently disabled)
- **Builds**: All board variants in parallel
- **Artifacts**: Firmware binaries, build logs, memory reports
- **Analysis**: Memory usage comparison between boards

### Manual Workflow Dispatch

You can trigger builds manually from GitHub Actions tab:
1. Go to Actions → "Build ESP32 Target Firmware"
2. Click "Run workflow"
3. Select specific board or "all"

## Memory Usage Comparison

| Board | RAM Usage | Flash Usage | Available Expansion |
|-------|-----------|-------------|-------------------|
| ESP32-S3 | ~9% (47KB) | ~8% (641KB) | Extensive |
| ESP32-C3 | ~11% (42KB) | ~16% (668KB) | Limited |

## Development Notes

### Adding New Boards

1. **Add to platformio.ini**:
   ```ini
   [env:new-board-name]
   platform = espressif32
   board = new-board-name
   framework = arduino
   lib_deps = ${common.lib_deps}
   build_flags = -DBOARD_NEW_BOARD_NAME
   ```

2. **Update hardware abstraction**:
   - Add board type to `BoardType` enum
   - Define pin arrays in `hardware_abstraction.cpp`
   - Add board detection in `detectBoardType()`
   - Configure pins in `configureBoardSpecific()`

3. **Update build configuration**:
   - Add to `SupportedBoards` array in `build.ps1`
   - Update GitHub Actions workflow matrix
   - Add pin definitions to `common.h`

### Board Detection Logic

The firmware uses compile-time board detection via build flags:
- `BOARD_ESP32_C3_DEVKITM1` for ESP32-C3
- `BOARD_ESP32_S3_DEVKITC1` for ESP32-S3

This ensures optimal code generation and eliminates runtime overhead.

## Troubleshooting

### Build Issues
- Ensure PlatformIO is installed: `pip install platformio`
- Update platform: `pio platform update espressif32`
- Clean build cache: `pio run -t clean`

### Upload Issues
- Check USB cable and driver installation
- Verify board is in bootloader mode
- Try different upload speeds in `platformio.ini`

### Board Detection Issues
- Verify build flags are correctly set
- Check that board type matches PlatformIO board definition
- Review hardware abstraction initialization logs

## Next Steps

Consider expanding support to:
- ESP32-S3 variants with PSRAM
- ESP32-C6 (Wi-Fi 6 support)
- ESP32-H2 (Thread/Zigbee support)
- Custom hardware designs
