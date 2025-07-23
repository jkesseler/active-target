# Active Target Raspberry Pi Setup

This repository contains everything needed to quickly deploy and configure multiple Raspberry Pi devices as master nodes for the Active Target time tracking system.

## 🚀 Quick Deployment

### Prerequisites

- Fresh Raspberry Pi OS installation
- Internet connection (WiFi or Ethernet)
- SSH access or direct terminal access

### One-Command Setup

```bash
# Download and run the setup script
curl -fsSL https://raw.githubusercontent.com/your-repo/active-target/main/raspberry-pi-setup/setup.sh | sudo bash
```

Or manually:

```bash
# Clone the repository
git clone https://github.com/your-repo/active-target.git
cd active-target/raspberry-pi-setup

# Make the script executable and run
chmod +x setup.sh
sudo ./setup.sh
```

## 📋 What Gets Installed

The setup script automatically configures:

### Network Configuration
- **WiFi Hotspot**: `active-target` (password: `active-target`)
- **Hostname**: `active-target.local`
- **DHCP Range**: `192.168.4.2` - `192.168.4.20`
- **Gateway IP**: `192.168.4.1`

### Security
- **SSH**: Enabled with password authentication
- **Default Password**: Changed to `active-target`
- **Firewall**: Configured for internet sharing

### Services (Docker Containers)

| Service | URL/Address | Purpose |
|---------|-------------|---------|
| **Web Interface** | `http://active-target.local` | Main dashboard |
| **Node-RED** | `http://flow.active-target.local` | Flow editor |
| **MQTT Server** | `mqtt://mqtt.active-target.local:1883` | Message broker |
| **MQTT WebSocket** | `ws://mqtt.active-target.local:9001` | Web MQTT client |
| **NTP Server** | `ntp.active-target.local` | Time synchronization |
| **Reverse Proxy** | - | Caddy (internal) |

## 🔧 Manual Configuration

If you prefer to run individual steps:

### 1. System Update
```bash
sudo apt-get update && sudo apt-get upgrade -y
```

### 2. Install Dependencies
```bash
sudo apt-get install -y hostapd dnsmasq iptables-persistent git curl wget vim net-tools bridge-utils avahi-daemon
```

### 3. Configure WiFi Hotspot
```bash
# Configure hostapd
sudo nano /etc/hostapd/hostapd.conf

# Configure dnsmasq
sudo nano /etc/dnsmasq.conf

# Configure network interfaces
sudo nano /etc/dhcpcd.conf
```

### 4. Install Docker
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker pi
```

### 5. Start Services
```bash
cd /opt/active-target
sudo docker-compose up -d
```

## 🔍 Verification

After setup completion, verify the installation:

### Network Tests
```bash
# Check WiFi hotspot
iwconfig wlan1

# Check DHCP server
sudo systemctl status dnsmasq

# Check internet sharing
ping -c 3 8.8.8.8
```

### Service Tests
```bash
# Check all containers
docker ps

# Check web interface
curl http://active-target.local

# Check MQTT
mosquitto_pub -h mqtt.active-target.local -t test -m "hello"
```

### Browser Tests
- Main Interface: http://active-target.local
- Node-RED: http://flow.active-target.local

## 📱 ESP32 Integration

Your ESP32 devices should connect to:

### WiFi Connection
```cpp
const char* ssid = "active-target";
const char* password = "active-target";
```

### Time Synchronization
```cpp
const char* ntpServer = "ntp.active-target.local";
// or use IP: "192.168.4.1"
```

### MQTT Connection
```cpp
const char* mqtt_server = "mqtt.active-target.local";
const int mqtt_port = 1883;
// WebSocket: ws://mqtt.active-target.local:9001
```

## 🛠️ Troubleshooting

### WiFi Hotspot Not Working
```bash
# Check hostapd status
sudo systemctl status hostapd

# Check interface configuration
ip addr show wlan1

# Restart services
sudo systemctl restart hostapd dnsmasq
```

### Docker Services Not Starting
```bash
# Check Docker status
sudo systemctl status docker

# Check container logs
docker logs active-target-web
docker logs active-target-mqtt
```

### Internet Sharing Issues
```bash
# Check IP forwarding
cat /proc/sys/net/ipv4/ip_forward

# Check iptables rules
sudo iptables -t nat -L
```

### DNS Resolution Issues
```bash
# Check dnsmasq
sudo systemctl status dnsmasq

# Test local resolution
nslookup active-target.local
```

## 📂 File Structure

```
raspberry-pi-setup/
├── setup.sh                 # Main setup script
├── docker-compose.yml       # Docker services configuration
├── caddy/
│   ├── Dockerfile           # Caddy reverse proxy
│   └── Caddyfile           # Caddy configuration
├── chrony/
│   ├── Dockerfile           # NTP server
│   └── chrony.conf         # Chrony configuration
├── nodejs-web/
│   ├── Dockerfile           # NodeJS web server
│   ├── package.json        # Dependencies
│   ├── server.js           # Main application
│   └── healthcheck.js      # Health check
├── mqtt/
│   ├── mosquitto.conf      # MQTT broker config
│   └── passwd              # MQTT passwords (optional)
├── node-red/
│   └── settings.js         # Node-RED configuration
└── README.md               # This file
```

## 🔄 Updates and Maintenance

### Update Docker Images
```bash
cd /opt/active-target
sudo docker-compose pull
sudo docker-compose up -d
```

### Backup Configuration
```bash
# Backup Node-RED flows
docker cp active-target-node-red:/data/flows.json ./backup/

# Backup entire setup
tar -czf active-target-backup.tar.gz /opt/active-target
```

### Monitor System
```bash
# Check system resources
htop

# Check Docker resources
docker stats

# Check logs
docker-compose logs -f
```

## 🆘 Factory Reset

To completely reset the system:

```bash
# Stop all services
cd /opt/active-target
sudo docker-compose down -v

# Remove Docker containers and images
sudo docker system prune -a

# Reset network configuration
sudo cp /etc/dhcpcd.conf.orig /etc/dhcpcd.conf
sudo cp /etc/dnsmasq.conf.orig /etc/dnsmasq.conf

# Reboot
sudo reboot
```

## 📞 Support

For issues and support:

1. Check the troubleshooting section above
2. Review Docker container logs: `docker logs <container-name>`
3. Check system logs: `sudo journalctl -f`
4. Verify network configuration: `ip route show`

## 🔐 Security Notes

- Change default passwords in production
- Enable firewall rules as needed
- Consider enabling MQTT authentication
- Update system regularly
- Monitor access logs

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Active Target Time Tracking System**
*Quick deployment for Raspberry Pi master devices*
