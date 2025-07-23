#!/bin/bash

#######################################################################
# Active Target System Validation Script
#
# This script validates that all components of the Active Target
# system are properly installed and functioning.
#######################################################################

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test results
TESTS_PASSED=0
TESTS_FAILED=0

print_test() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

print_pass() {
    echo -e "${GREEN}[PASS]${NC} $1"
    ((TESTS_PASSED++))
}

print_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
    ((TESTS_FAILED++))
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Test network configuration
test_network() {
    print_test "Testing network configuration..."

    # Test hostname
    if hostname | grep -q "active-target"; then
        print_pass "Hostname correctly set to active-target"
    else
        print_fail "Hostname not set correctly"
    fi

    # Test WiFi hotspot interface
    if ip addr show wlan1 | grep -q "192.168.4.1"; then
        print_pass "WiFi hotspot interface configured"
    else
        print_fail "WiFi hotspot interface not configured"
    fi

    # Test DHCP server
    if systemctl is-active --quiet dnsmasq; then
        print_pass "DHCP server (dnsmasq) is running"
    else
        print_fail "DHCP server (dnsmasq) is not running"
    fi

    # Test hostapd
    if systemctl is-active --quiet hostapd; then
        print_pass "WiFi hotspot (hostapd) is running"
    else
        print_fail "WiFi hotspot (hostapd) is not running"
    fi
}

# Test Docker services
test_docker() {
    print_test "Testing Docker services..."

    # Test Docker daemon
    if systemctl is-active --quiet docker; then
        print_pass "Docker daemon is running"
    else
        print_fail "Docker daemon is not running"
        return
    fi

    # Test containers
    local containers=("active-target-caddy" "active-target-web" "active-target-node-red" "active-target-mqtt" "active-target-chrony")

    for container in "${containers[@]}"; do
        if docker ps | grep -q "$container"; then
            print_pass "Container $container is running"
        else
            print_fail "Container $container is not running"
        fi
    done
}

# Test web services
test_web_services() {
    print_test "Testing web services..."

    # Test main web interface
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
        print_pass "Main web interface responding"
    else
        print_fail "Main web interface not responding"
    fi

    # Test Node-RED
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:1880 | grep -q "200"; then
        print_pass "Node-RED interface responding"
    else
        print_fail "Node-RED interface not responding"
    fi

    # Test Caddy reverse proxy
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:80 | grep -q "200"; then
        print_pass "Caddy reverse proxy responding"
    else
        print_fail "Caddy reverse proxy not responding"
    fi
}

# Test MQTT service
test_mqtt() {
    print_test "Testing MQTT service..."

    # Check if mosquitto_pub is available
    if ! command -v mosquitto_pub &> /dev/null; then
        print_warn "mosquitto_pub not available, installing..."
        apt-get install -y mosquitto-clients
    fi

    # Test MQTT broker
    if timeout 5 mosquitto_pub -h localhost -p 1883 -t "test/validation" -m "test" >/dev/null 2>&1; then
        print_pass "MQTT broker accepting connections"
    else
        print_fail "MQTT broker not accepting connections"
    fi

    # Test WebSocket
    local ws_test=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:9001)
    if [[ "$ws_test" == "400" ]] || [[ "$ws_test" == "426" ]]; then
        print_pass "MQTT WebSocket port responding"
    else
        print_fail "MQTT WebSocket port not responding properly"
    fi
}

# Test NTP service
test_ntp() {
    print_test "Testing NTP service..."

    # Check if ntpdate is available
    if ! command -v ntpdate &> /dev/null; then
        print_warn "ntpdate not available, installing..."
        apt-get install -y ntpdate
    fi

    # Test NTP server
    if timeout 5 ntpdate -q localhost >/dev/null 2>&1; then
        print_pass "NTP server responding"
    else
        print_fail "NTP server not responding"
    fi
}

# Test DNS resolution
test_dns() {
    print_test "Testing DNS resolution..."

    local domains=("active-target.local" "flow.active-target.local" "mqtt.active-target.local" "ntp.active-target.local")

    for domain in "${domains[@]}"; do
        if nslookup "$domain" localhost >/dev/null 2>&1; then
            print_pass "DNS resolution for $domain working"
        else
            print_fail "DNS resolution for $domain not working"
        fi
    done
}

# Test SSH service
test_ssh() {
    print_test "Testing SSH service..."

    if systemctl is-active --quiet ssh; then
        print_pass "SSH service is running"
    else
        print_fail "SSH service is not running"
    fi

    if ss -tlnp | grep -q ":22"; then
        print_pass "SSH port 22 is listening"
    else
        print_fail "SSH port 22 is not listening"
    fi
}

# Test system resources
test_resources() {
    print_test "Testing system resources..."

    # Test memory usage
    local mem_usage=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
    if [[ $mem_usage -lt 80 ]]; then
        print_pass "Memory usage is acceptable ($mem_usage%)"
    else
        print_warn "Memory usage is high ($mem_usage%)"
    fi

    # Test disk usage
    local disk_usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    if [[ $disk_usage -lt 80 ]]; then
        print_pass "Disk usage is acceptable ($disk_usage%)"
    else
        print_warn "Disk usage is high ($disk_usage%)"
    fi

    # Test CPU load
    local cpu_load=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
    if (( $(echo "$cpu_load < 2.0" | bc -l) )); then
        print_pass "CPU load is acceptable ($cpu_load)"
    else
        print_warn "CPU load is high ($cpu_load)"
    fi
}

# Main validation function
main() {
    echo "======================================================"
    echo "Active Target System Validation"
    echo "======================================================"
    echo ""

    test_network
    echo ""
    test_docker
    echo ""
    test_web_services
    echo ""
    test_mqtt
    echo ""
    test_ntp
    echo ""
    test_dns
    echo ""
    test_ssh
    echo ""
    test_resources
    echo ""

    echo "======================================================"
    echo "Validation Summary"
    echo "======================================================"
    echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
    echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
    echo ""

    if [[ $TESTS_FAILED -eq 0 ]]; then
        echo -e "${GREEN}🎉 All tests passed! Active Target system is ready.${NC}"
        echo ""
        echo "Access your system at:"
        echo "  • Main Interface: http://active-target.local"
        echo "  • Node-RED: http://flow.active-target.local"
        echo "  • MQTT: mqtt://mqtt.active-target.local:1883"
        echo "  • SSH: ssh pi@active-target.local"
        exit 0
    else
        echo -e "${RED}❌ Some tests failed. Please check the configuration.${NC}"
        echo ""
        echo "Troubleshooting:"
        echo "  • Check Docker containers: docker ps"
        echo "  • Check service status: systemctl status <service>"
        echo "  • Check logs: docker logs <container>"
        exit 1
    fi
}

# Check if running as root for system tests
if [[ $EUID -ne 0 ]]; then
    echo -e "${YELLOW}[WARNING]${NC} Some tests require root privileges. Run with sudo for complete validation."
    echo ""
fi

# Install bc for CPU load calculation if not present
if ! command -v bc &> /dev/null; then
    if [[ $EUID -eq 0 ]]; then
        apt-get install -y bc >/dev/null 2>&1
    fi
fi

main
