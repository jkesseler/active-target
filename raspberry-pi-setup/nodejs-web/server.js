const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"]
        }
    }
}));

// Compression middleware
app.use(compression());

// CORS middleware
app.use(cors({
    origin: [
        'http://active-target.local',
        'http://flow.active-target.local',
        'http://192.168.4.1'
    ],
    credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Main route
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Active Target - Time Tracking System</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }

        .container {
            text-align: center;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 3rem;
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
            border: 1px solid rgba(255, 255, 255, 0.18);
            max-width: 600px;
            margin: 2rem;
        }

        h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
            font-weight: 300;
        }

        .subtitle {
            font-size: 1.2rem;
            margin-bottom: 2rem;
            opacity: 0.9;
        }

        .system-info {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            padding: 1.5rem;
            margin: 2rem 0;
        }

        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-top: 1rem;
        }

        .info-item {
            padding: 1rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 8px;
        }

        .info-label {
            font-weight: bold;
            display: block;
            margin-bottom: 0.5rem;
        }

        .services {
            margin-top: 2rem;
        }

        .service-link {
            display: inline-block;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            text-decoration: none;
            padding: 0.8rem 1.5rem;
            border-radius: 8px;
            margin: 0.5rem;
            transition: all 0.3s ease;
        }

        .service-link:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
        }

        .status {
            margin-top: 2rem;
            font-size: 0.9rem;
            opacity: 0.8;
        }

        @media (max-width: 768px) {
            h1 {
                font-size: 2rem;
            }

            .container {
                padding: 2rem;
                margin: 1rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Welcome to Active Target</h1>
        <p class="subtitle">Time Tracking System - Master Device</p>

        <div class="system-info">
            <h3>System Information</h3>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Hostname</span>
                    active-target.local
                </div>
                <div class="info-item">
                    <span class="info-label">WiFi Network</span>
                    active-target
                </div>
                <div class="info-item">
                    <span class="info-label">System Time</span>
                    ${new Date().toLocaleString()}
                </div>
                <div class="info-item">
                    <span class="info-label">NTP Server</span>
                    ntp.active-target.local
                </div>
            </div>
        </div>

        <div class="services">
            <h3>Available Services</h3>
            <a href="http://flow.active-target.local" class="service-link">Node-RED Flow Editor</a>
            <a href="#" class="service-link" onclick="showMqttInfo()">MQTT Server Info</a>
        </div>

        <div class="status">
            <p>System Status: <strong style="color: #4ade80;">Online</strong></p>
            <p>Server Time: ${new Date().toISOString()}</p>
        </div>
    </div>

    <script>
        function showMqttInfo() {
            alert('MQTT Server Details:\\n\\n' +
                  'Host: mqtt.active-target.local\\n' +
                  'Port: 1883 (MQTT)\\n' +
                  'Port: 9001 (WebSocket)\\n' +
                  'No authentication required');
        }

        // Update time every second
        setInterval(() => {
            const timeElements = document.querySelectorAll('.status p:last-child');
            if (timeElements.length > 0) {
                timeElements[0].innerHTML = 'Server Time: ' + new Date().toISOString();
            }
        }, 1000);
    </script>
</body>
</html>
    `);
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        hostname: 'active-target.local'
    });
});

// System info endpoint
app.get('/api/system', (req, res) => {
    res.json({
        hostname: 'active-target.local',
        time: new Date().toISOString(),
        uptime: process.uptime(),
        services: {
            web: 'http://active-target.local',
            nodeRed: 'http://flow.active-target.local',
            mqtt: 'mqtt://mqtt.active-target.local:1883',
            mqttWs: 'ws://mqtt.active-target.local:9001',
            ntp: 'ntp.active-target.local'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not found',
        message: 'The requested resource was not found'
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Active Target web server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Access: http://active-target.local`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});
