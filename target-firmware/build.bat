@echo off
REM ESP32 Target Firmware Build Script
REM Use this script for convenient building with the correct PlatformIO path

set PLATFORMIO_PATH=C:\Users\Jorgen\.platformio\penv\Scripts\platformio.exe

if not exist "%PLATFORMIO_PATH%" (
    echo ERROR: PlatformIO not found at: %PLATFORMIO_PATH%
    echo Please install PlatformIO or update the path in this script.
    exit /b 1
)

if "%1"=="clean" (
    echo Cleaning build...
    "%PLATFORMIO_PATH%" run -t clean
    if errorlevel 1 exit /b %errorlevel%
    echo Clean completed successfully!
    goto :eof
)

if "%1"=="upload" (
    echo Building and uploading...
    "%PLATFORMIO_PATH%" run -t upload
    goto :check_result
)

if "%1"=="monitor" (
    echo Starting serial monitor...
    "%PLATFORMIO_PATH%" device monitor
    goto :check_result
)

if "%1"=="verbose" (
    echo Building project with verbose output...
    "%PLATFORMIO_PATH%" run -v
    goto :check_result
)

echo Building project...
"%PLATFORMIO_PATH%" run

:check_result
if errorlevel 1 (
    echo Operation failed with exit code: %errorlevel%
    exit /b %errorlevel%
) else (
    echo Operation completed successfully!
)
