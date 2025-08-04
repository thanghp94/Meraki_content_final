#!/bin/bash

# This script deploys Watchtower container to auto-update your app container

# Variables
WATCHTOWER_CONTAINER_NAME="nextn-watchtower"
APP_CONTAINER_NAME="nextn-container"
WATCHTOWER_IMAGE="containrrr/watchtower"
POLL_INTERVAL=300  # seconds

# Stop and remove existing Watchtower container if exists
docker stop $WATCHTOWER_CONTAINER_NAME || true
docker rm $WATCHTOWER_CONTAINER_NAME || true

# Run Watchtower container
docker run -d \
  --name $WATCHTOWER_CONTAINER_NAME \
  --restart unless-stopped \
  -v /var/run/docker.sock:/var/run/docker.sock \
  $WATCHTOWER_IMAGE \
  --interval $POLL_INTERVAL \
  $APP_CONTAINER_NAME

echo "Watchtower deployed to monitor container: $APP_CONTAINER_NAME"
