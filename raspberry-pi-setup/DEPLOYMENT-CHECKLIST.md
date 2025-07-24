# Active Target Deployment Checklist

## Pre-Deployment Checklist

### Hardware Requirements
- [ ] Raspberry Pi 4 (recommended) or Pi 3B+
- [ ] MicroSD card (32GB+ recommended)
- [ ] WiFi capability (dual-band preferred)
- [ ] Ethernet connection (for initial setup)
- [ ] Power supply (official recommended)

### Software Requirements
- [ ] Fresh Raspberry Pi OS installation
- [ ] SSH enabled (optional, for remote setup)
- [ ] Internet connection available
- [ ] Git installed (will be installed automatically)

## Deployment Steps

### Method 1: Quick Deploy (Recommended)
- [ ] Download quick-deploy.sh
- [ ] Run: `curl -fsSL <your-repo-url>/quick-deploy.sh | sudo bash`
- [ ] Reboot system
- [ ] Run validation script

### Method 2: Manual Deploy
- [ ] Clone repository
- [ ] Review and modify config.template if needed
- [ ] Run setup.sh as root
- [ ] Reboot system
- [ ] Run validation script

## Post-Deployment Verification

### Network Tests
- [ ] WiFi hotspot "active-target" is broadcasting
- [ ] Can connect to hotspot with password "active-target"
- [ ] Hostname resolves: `ping active-target.local`
- [ ] Internet sharing works from connected devices

### Service Tests
- [ ] Web interface: http://active-target.local
- [ ] Node-RED: http://flow.active-target.local
- [ ] SSH access: `ssh pi@active-target.local`
- [ ] MQTT broker responding on port 1883
- [ ] NTP server responding: `ntpdate -q ntp.active-target.local`

### Docker Tests
- [ ] All containers running: `docker ps`
- [ ] No container errors: `docker ps -a`
- [ ] Services healthy: check individual container logs

### Security Checklist
- [ ] Default password changed (if required)
- [ ] SSH properly configured
- [ ] Firewall rules applied
- [ ] Only required ports exposed

## ESP32 Integration Test

### Connection Test
- [ ] ESP32 can connect to "active-target" WiFi
- [ ] ESP32 gets IP in range 192.168.4.2-20
- [ ] ESP32 can reach internet through Pi

### Time Sync Test
```cpp
// Test NTP sync on ESP32
configTime(0, 0, "ntp.active-target.local");
```
- [ ] ESP32 successfully syncs time

### MQTT Test
```cpp
// Test MQTT connection on ESP32
const char* mqtt_server = "mqtt.active-target.local";
```
- [ ] ESP32 can connect to MQTT broker
- [ ] ESP32 can publish messages
- [ ] ESP32 can subscribe to topics

## Performance Verification

### System Resources
- [ ] Memory usage < 80%
- [ ] CPU load < 2.0
- [ ] Disk usage < 80%
- [ ] All services responding within 5 seconds

### Network Performance
- [ ] WiFi signal strength adequate
- [ ] Internet speed acceptable
- [ ] Local network latency < 50ms
- [ ] DHCP assignments working

## Troubleshooting Checklist

### If WiFi Hotspot Fails
- [ ] Check hostapd service: `systemctl status hostapd`
- [ ] Check interface config: `ip addr show wlan1`
- [ ] Verify hostapd.conf syntax
- [ ] Check for conflicting WiFi managers

### If Internet Sharing Fails
- [ ] Check IP forwarding: `cat /proc/sys/net/ipv4/ip_forward`
- [ ] Verify iptables rules: `iptables -t nat -L`
- [ ] Check default route: `ip route show`
- [ ] Verify DNS forwarding

### If Docker Services Fail
- [ ] Check Docker daemon: `systemctl status docker`
- [ ] Verify compose file syntax: `docker-compose config`
- [ ] Check container logs: `docker logs <container>`
- [ ] Verify port conflicts: `netstat -tulpn`

### If DNS Resolution Fails
- [ ] Check dnsmasq service: `systemctl status dnsmasq`
- [ ] Verify dnsmasq.conf syntax
- [ ] Test local resolution: `nslookup active-target.local`
- [ ] Check /etc/hosts entries

## Production Deployment Notes

### Security Hardening
- [ ] Change all default passwords
- [ ] Enable MQTT authentication
- [ ] Configure proper firewall rules
- [ ] Enable fail2ban for SSH protection
- [ ] Regular security updates scheduled

### Monitoring Setup
- [ ] Log rotation configured
- [ ] System monitoring enabled
- [ ] Alert mechanisms in place
- [ ] Backup procedures defined

### Documentation
- [ ] Network topology documented
- [ ] Access credentials recorded
- [ ] Recovery procedures documented
- [ ] Maintenance schedule defined

## Deployment Sign-off

- [ ] All tests passed
- [ ] System validated by validate.sh script
- [ ] ESP32 integration confirmed
- [ ] Documentation updated
- [ ] Stakeholders notified

**Deployed by:** ________________
**Date:** ________________
**System Version:** ________________
**Notes:** ________________

---

## Quick Reference

### Default Credentials
- **WiFi SSID:** active-target
- **WiFi Password:** active-target
- **SSH User:** pi
- **SSH Password:** active-target
- **Node-RED Admin:** admin/admin

### Service URLs
- **Main Interface:** http://active-target.local
- **Node-RED:** http://flow.active-target.local
- **MQTT:** mqtt://mqtt.active-target.local:1883
- **NTP:** ntp.active-target.local

### Key Commands
```bash
# System status
sudo ./validate.sh

# Container status
docker ps

# Service restart
sudo systemctl restart <service>

# Full system restart
sudo reboot
```
