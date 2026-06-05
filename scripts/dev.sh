#!/bin/bash

echo "Stopping systemd service..."
sudo systemctl stop pi-status-dashboard

echo "Starting dev server (nodemon)..."
npx nodemon server.js
