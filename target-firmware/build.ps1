#!/usr/bin/env pwsh
# ESP32 Target Firmware Build Script
# Use this script for convenient building with the correct PlatformIO path

param(
    [string]$Target = "run",
    [switch]$Verbose,
    [switch]$Clean,
    [switch]$Upload,
    [switch]$Monitor
)

# PlatformIO executable path
$PlatformIOPath = "platformio.exe"

# Check if PlatformIO exists
if (-not (Test-Path $PlatformIOPath)) {
    Write-Error "PlatformIO not found at: $PlatformIOPath"
    Write-Host "Please install PlatformIO or update the path in this script."
    exit 1
}

# Build command based on parameters
$Command = @()

if ($Clean) {
    Write-Host "Cleaning build..." -ForegroundColor Yellow
    $Command += "run", "-t", "clean"
    & $PlatformIOPath @Command
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

if ($Upload) {
    Write-Host "Building and uploading..." -ForegroundColor Green
    $Command = @("run", "-t", "upload")
} elseif ($Monitor) {
    Write-Host "Starting serial monitor..." -ForegroundColor Cyan
    $Command = @("device", "monitor")
} else {
    Write-Host "Building project..." -ForegroundColor Blue
    $Command = @("run")
}

if ($Verbose) {
    $Command += "-v"
}

# Execute the command
& $PlatformIOPath @Command

# Report result
if ($LASTEXITCODE -eq 0) {
    Write-Host "Operation completed successfully!" -ForegroundColor Green
} else {
    Write-Host "Operation failed with exit code: $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
}
