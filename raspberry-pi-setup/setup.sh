#!/bin/bash

#######################################################################
# Active Target Raspberry Pi Master Device Setup Script
#
# This script configures a Raspberry Pi as a master device for the
# Active Target time tracking system with:
# - WiFi hotspot with internet sharing
# - Docker services (Caddy, Chrony NTP, NodeJS, Node-RED, MQTT)
# - Proper hostname and network configuration
#######################################################################

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration variables
HOTSPOT_SSID="active-target"
HOTSPOT_PASSWORD="active-target"
HOSTNAME="active-target"
DEFAULT_USER="pi"
DEFAULT_PASSWORD="active-target"
SETUP_DIR="/opt/active-target"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        print_error "This script must be run as root (use sudo)"
        exit 1
    fi
}

# Function to update system packages
update_system() {
    print_status "Updating system packages..."
    apt-get update
    apt-get upgrade -y
    print_success "System packages updated"
}

# Function to install required packages
install_packages() {
    print_status "Installing required packages..."
    apt-get install -y \
        hostapd \
        dnsmasq \
        iptables-persistent \
        git \
        curl \
        wget \
        vim \
        net-tools \
        bridge-utils \
        avahi-daemon \
        avahi-utils
    print_success "Required packages installed"
}

# Function to set hostname
set_hostname() {
    print_status "Setting hostname to ${HOSTNAME}.local..."

    # Set hostname
    echo "$HOSTNAME" > /etc/hostname

    # Update /etc/hosts
    sed -i "s/127.0.1.1.*/127.0.1.1\t${HOSTNAME}.local ${HOSTNAME}/" /etc/hosts

    # Enable avahi-daemon for .local resolution
    systemctl enable avahi-daemon
    systemctl start avahi-daemon

    print_success "Hostname set to ${HOSTNAME}.local"
}

# Function to change default user password
change_default_password() {
    print_status "Changing default user password..."
    echo "${DEFAULT_USER}:${DEFAULT_PASSWORD}" | chpasswd
    print_success "Default user password changed"
}

# Function to enable SSH
enable_ssh() {
    print_status "Enabling SSH..."
    systemctl enable ssh
    systemctl start ssh

    # Update SSH config for security
    sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config
    sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin no/' /etc/ssh/sshd_config

    systemctl restart ssh
    print_success "SSH enabled and configured"
}

# Function to configure WiFi hotspot
configure_hotspot() {
    print_status "Configuring WiFi hotspot..."

    # Configure hostapd
    cat > /etc/hostapd/hostapd.conf << EOF
interface=wlan1
driver=nl80211
ssid=${HOTSPOT_SSID}
hw_mode=g
channel=7
wmm_enabled=0
macaddr_acl=0
auth_algs=1
ignore_broadcast_ssid=0
wpa=2
wpa_passphrase=${HOTSPOT_PASSWORD}
wpa_key_mgmt=WPA-PSK
wpa_pairwise=TKIP
rsn_pairwise=CCMP
EOF

    # Configure dnsmasq
    cp /etc/dnsmasq.conf /etc/dnsmasq.conf.orig
    cat > /etc/dnsmasq.conf << EOF
interface=wlan1
dhcp-range=192.168.4.2,192.168.4.20,255.255.255.0,24h
address=/active-target.local/192.168.4.1
address=/ntp.active-target.local/192.168.4.1
address=/flow.active-target.local/192.168.4.1
address=/mqtt.active-target.local/192.168.4.1
EOF

    # Configure network interfaces
    cat >> /etc/dhcpcd.conf << EOF

# Static IP for hotspot interface
interface wlan1
static ip_address=192.168.4.1/24
nohook wpa_supplicant
EOF

    # Enable IP forwarding
    echo 'net.ipv4.ip_forward=1' >> /etc/sysctl.conf

    # Configure iptables for internet sharing
    iptables -t nat -A POSTROUTING -o wlan0 -j MASQUERADE
    iptables -A FORWARD -i wlan0 -o wlan1 -m state --state RELATED,ESTABLISHED -j ACCEPT
    iptables -A FORWARD -i wlan1 -o wlan0 -j ACCEPT

    # Save iptables rules
    iptables-save > /etc/iptables/rules.v4

    # Update hostapd daemon
    sed -i 's|#DAEMON_CONF=""|DAEMON_CONF="/etc/hostapd/hostapd.conf"|' /etc/default/hostapd

    # Enable services
    systemctl unmask hostapd
    systemctl enable hostapd
    systemctl enable dnsmasq

    print_success "WiFi hotspot configured"
}

# Function to install Docker
install_docker() {
    print_status "Installing Docker..."

    # Remove old versions
    apt-get remove -y docker docker-engine docker.io containerd runc || true

    # Install Docker
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh

    # Add user to docker group
    usermod -aG docker $DEFAULT_USER

    # Install Docker Compose
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose

    # Enable Docker service
    systemctl enable docker
    systemctl start docker

    rm -f get-docker.sh
    print_success "Docker installed"
}

# Function to setup application directory
setup_app_directory() {
    print_status "Setting up application directory..."

    mkdir -p $SETUP_DIR
    cp -r "$(dirname "$0")"/* $SETUP_DIR/
    chown -R $DEFAULT_USER:$DEFAULT_USER $SETUP_DIR

    print_success "Application directory setup complete"
}

# Function to start Docker services
start_services() {
    print_status "Starting Docker services..."

    cd $SETUP_DIR
    sudo -u $DEFAULT_USER docker-compose up -d

    print_success "Docker services started"
}

# Function to display completion message
display_completion() {
    print_success "==================================================="
    print_success "Active Target Raspberry Pi setup completed!"
    print_success "==================================================="
    echo ""
    print_status "Network Configuration:"
    echo "  - Hostname: ${HOSTNAME}.local"
    echo "  - WiFi Hotspot: ${HOTSPOT_SSID}"
    echo "  - Hotspot IP: 192.168.4.1"
    echo ""
    print_status "Services Available:"
    echo "  - Web Interface: http://active-target.local"
    echo "  - Node-RED: http://flow.active-target.local"
    echo "  - MQTT Server: mqtt.active-target.local:1883"
    echo "  - NTP Server: ntp.active-target.local"
    echo "  - SSH: ssh pi@active-target.local"
    echo ""
    print_warning "Please reboot the system to complete the setup:"
    echo "  sudo reboot"
}

# Main execution
main() {
    print_status "Starting Active Target Raspberry Pi setup..."

    check_root
    update_system
    install_packages
    set_hostname
    change_default_password
    enable_ssh
    configure_hotspot
    install_docker
    setup_app_directory
    start_services
    display_completion
}

# Run main function
main "$@"
