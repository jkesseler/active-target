#!/usr/bin/env pwsh
# ESP32 Target Firmware Build Script
# Use this script for convenient building with the correct PlatformIO path
# Supports multiple ESP32 board targets

param(
    [string]$Target = "run",
    [string]$Environment = "esp32-s3-devkitc-1",  # Default environment (ESP32-S3 primary)
    [switch]$AllBoards,                           # Build all supported boards
    [switch]$Verbose,
    [switch]$Clean,
    [switch]$Upload,
    [switch]$Monitor,
    [switch]$ListBoards                           # List available board environments
)

# Supported board environments (ESP32-S3 first as primary)
$SupportedBoards = @(
    "esp32-s3-devkitc-1",
    "esp32-c3-devkitm-1"
)

# PlatformIO executable path - try multiple common locations
$PlatformIOPaths = @(
    "pio.exe",                                      # In PATH
    "platformio.exe",                               # In PATH
    "$env:USERPROFILE\.platformio\penv\Scripts\pio.exe", # User installation
    "${env:ProgramFiles}\PlatformIO\pio.exe"       # System installation
)

$PlatformIOPath = $null
foreach ($path in $PlatformIOPaths) {
    if (Get-Command $path -ErrorAction SilentlyContinue) {
        $PlatformIOPath = $path
        break
    }
    if (Test-Path $path) {
        $PlatformIOPath = $path
        break
    }
}

# Function to display available boards
function Show-SupportedBoards {
    Write-Host "`nSupported Board Environments:" -ForegroundColor Cyan
    Write-Host "=============================" -ForegroundColor Cyan
    foreach ($board in $SupportedBoards) {
        Write-Host "  - $board" -ForegroundColor White
    }
    Write-Host "`nUsage examples:" -ForegroundColor Yellow
    Write-Host "  .\build.ps1 -Environment esp32-s3-devkitc-1 -Upload" -ForegroundColor Gray
    Write-Host "  .\build.ps1 -Environment esp32-c3-devkitm-1 -Monitor" -ForegroundColor Gray
    Write-Host "  .\build.ps1 -AllBoards" -ForegroundColor Gray
    Write-Host ""
}

# Show available boards if requested
if ($ListBoards) {
    Show-SupportedBoards
    exit 0
}

# Check if PlatformIO exists
if (-not $PlatformIOPath) {
    Write-Error "PlatformIO not found. Please install PlatformIO or ensure it's in your PATH."
    Write-Host "Install with: pip install platformio" -ForegroundColor Yellow
    exit 1
}

# Validate environment if not building all boards
if (-not $AllBoards -and $Environment -notin $SupportedBoards) {
    Write-Error "Unsupported board environment: $Environment"
    Show-SupportedBoards
    exit 1
}

# Function to execute PlatformIO command for specific environment
function Invoke-PlatformIO {
    param(
        [string]$Env,
        [string[]]$Commands
    )

    $Command = @()
    $Command += $Commands

    # Add environment flag if specified
    if ($Env) {
        $Command += "-e", $Env
    }

    if ($Verbose) {
        $Command += "-v"
    }

    Write-Host "[$Env] Executing: pio $($Command -join ' ')" -ForegroundColor Magenta

    # Execute using call operator with splatting
    try {
        & $PlatformIOPath @Command
        if ($LASTEXITCODE -ne 0) {
            Write-Error "[$Env] Command failed with exit code: $LASTEXITCODE"
            return $false
        }
        return $true
    }
    catch {
        Write-Error "[$Env] Exception during execution: $($_.Exception.Message)"
        return $false
    }
}

# Function to build for specific environment
function Build-Environment {
    param([string]$Env)

    Write-Host "`n" + "="*60 -ForegroundColor Cyan
    Write-Host "Building for: $Env" -ForegroundColor Cyan
    Write-Host "="*60 -ForegroundColor Cyan

    $success = $true

    # Clean if requested
    if ($Clean) {
        Write-Host "[$Env] Cleaning build..." -ForegroundColor Yellow
        if (-not (Invoke-PlatformIO -Env $Env -Commands @("run", "-t", "clean"))) {
            return $false
        }
    }

    # Build/Upload/Monitor based on parameters
    if ($Upload) {
        Write-Host "[$Env] Building and uploading..." -ForegroundColor Green
        $success = Invoke-PlatformIO -Env $Env -Commands @("run", "-t", "upload")
    } elseif ($Monitor) {
        Write-Host "[$Env] Starting serial monitor..." -ForegroundColor Cyan
        $success = Invoke-PlatformIO -Env $Env -Commands @("device", "monitor")
    } else {
        Write-Host "[$Env] Building project..." -ForegroundColor Blue
        $success = Invoke-PlatformIO -Env $Env -Commands @("run")
    }

    if ($success) {
        Write-Host "[$Env] Operation completed successfully!" -ForegroundColor Green
    } else {
        Write-Host "[$Env] Operation failed!" -ForegroundColor Red
    }

    return $success
}

# Main execution
$overallSuccess = $true

if ($AllBoards) {
    Write-Host "Building for all supported boards..." -ForegroundColor Cyan
    foreach ($board in $SupportedBoards) {
        if (-not (Build-Environment -Env $board)) {
            $overallSuccess = $false
            Write-Warning "Build failed for $board, continuing with other boards..."
        }
    }
} else {
    $overallSuccess = Build-Environment -Env $Environment
}

# Final result
Write-Host "`n" + "="*60 -ForegroundColor Cyan
if ($overallSuccess) {
    Write-Host "All operations completed successfully!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "Some operations failed!" -ForegroundColor Red
    exit 1
}
