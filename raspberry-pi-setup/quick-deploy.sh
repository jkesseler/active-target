#!/bin/bash

#######################################################################
# Active Target - Quick Deploy Script
#
# This script can be run on a fresh Raspberry Pi to quickly download
# and deploy the entire Active Target system.
#######################################################################

set -e

# Configuration
REPO_URL="https://github.com/your-repo/active-target.git"
INSTALL_DIR="/opt/active-target"
TEMP_DIR="/tmp/active-target-deploy"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[DEPLOY]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
    print_error "This script must be run as root (use sudo)"
    exit 1
fi

print_status "Active Target Quick Deploy Starting..."

# Install git if not present
if ! command -v git &> /dev/null; then
    print_status "Installing git..."
    apt-get update
    apt-get install -y git
fi

# Create temporary directory
print_status "Creating temporary directory..."
rm -rf $TEMP_DIR
mkdir -p $TEMP_DIR
cd $TEMP_DIR

# Clone repository (or copy from current directory if available)
if [ -d "/home/pi/active-target" ]; then
    print_status "Using local repository..."
    cp -r /home/pi/active-target/* $TEMP_DIR/
elif [ -d "$(dirname "$0")/../" ]; then
    print_status "Using local files..."
    cp -r "$(dirname "$0")"/* $TEMP_DIR/
else
    print_status "Cloning repository..."
    git clone $REPO_URL .
    cd raspberry-pi-setup
fi

# Make setup script executable
chmod +x setup.sh

# Run main setup
print_status "Running main setup script..."
./setup.sh

# Cleanup
print_status "Cleaning up..."
cd /
rm -rf $TEMP_DIR

print_success "Quick deploy completed!"
print_status "The system will be ready after reboot."
print_status "Run 'sudo reboot' to complete the installation."
