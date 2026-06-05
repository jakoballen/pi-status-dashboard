#!/bin/bash

echo "Stopping dev processes (if any)..."
pkill -f nodemon || true

echo "Starting systemd service..."
sudo systemctl start pi-status-dashboard

echo "Service is running under systemd."
