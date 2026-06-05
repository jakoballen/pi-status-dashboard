# Pi Status Dashboard

A lightweight dashboard for monitoring Raspberry Pi system health and homelab services. The dashboard collects status information from the local system and displays it through a responsive web interface.

## Features

- System uptime monitoring
- CPU temperature monitoring
- Memory usage monitoring
- Disk usage monitoring
- External storage detection
- Pi-hole statistics (queries, blocked, percentage)
- MinIO service status
- WireGuard service status
- Clickable service cards (quick access to web UIs)
- Responsive dashboard layout
- Modular architecture (easy to add new services)

## Services Supported

- Pi-hole (API-based stats)
- MinIO (service status)
- WireGuard (service status)
- System metrics (CPU, RAM, disk, uptime)

## Technologies Used

- Node.js
- Express
- HTML5
- CSS3
- JavaScript (ES Modules)
- Fetch API
- Linux systemd services

## Architecture

The dashboard runs locally on a Raspberry Pi and gathers information from the operating system and installed services.

Frontend is split into clear layers:

```text
Browser
  ↓
app.js (orchestrator)
  ├── data.js (API calls)
  └── ui.js (rendering)
```

Backend:

```text
Express Server
  ↓
Service Modules
  ├── system.js
  ├── pihole.js
  ├── minio.js
  └── wireguard.js
```

## Screenshot

### Dashboard Overview

<img src="screenshots/dashboard-overview.png" alt="Pi Status Dashboard overview" width="800">

## Project Structure

```text
pi-status-dashboard/
├── public/
│   ├── index.html
│   ├── styles.css
│   ├── app.js        # frontend entry point
│   ├── data.js       # API/data layer
│   └── ui.js         # rendering layer
├── scripts/
│   ├── dev.sh
│   └── prod.sh
├── services/
│   ├── system.js
│   ├── pihole.js
│   ├── minio.js
│   └── wireguard.js
├── server.js         # Express backend
├── package.json
└── README.md
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the project root (required for certain services):

```bash
cp .env.example .env
```

If you don't have an example file, create one manually:

```env
# Pi-hole
PIHOLE_URL=http://localhost
PIHOLE_PASSWORD=your_password_here

# Optional: Terminal access
TERMINAL_URL=http://<raspberry-pi-ip>:7681
```

- `PIHOLE_PASSWORD` is required for fetching Pi-hole stats (v6 API requires authentication)
- `TERMINAL_URL` is optional and enables the terminal button in the UI

3. Start the server:

```bash
npm start
```

4. Open the dashboard in your browser:

```text
http://<raspberry-pi-ip>:3000
```

Ensure required services (Pi-hole, MinIO, WireGuard) are installed and running if you want their status to appear.

> Note: If environment variables are missing or incorrect, some services (like Pi-hole) may show as unavailable in the dashboard.

## Notes

This project is intended for personal homelab monitoring and is designed to run on a Raspberry Pi over a trusted local network or VPN connection.
