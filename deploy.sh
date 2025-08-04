#!/bin/bash

# Deployment script for Next.js application
# This script builds the Docker image and prepares it for deployment

set -e  # Exit on any error

echo "🚀 Starting deployment build process..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Build the Docker image
echo "📦 Building Docker image..."
docker build -t nextn-app:latest .

# Tag the image for production
echo "🏷️  Tagging image for production..."
docker tag nextn-app:latest nextn-app:production

# Show image details
echo "✅ Build completed successfully!"
echo "📊 Image details:"
docker images | grep nextn-app

echo ""
echo "🚀 Deployment commands:"
echo "To run locally:"
echo "  docker run -p 3000:3000 nextn-app:latest"
echo ""
echo "To push to registry (replace with your registry):"
echo "  docker tag nextn-app:latest your-registry/nextn-app:latest"
echo "  docker push your-registry/nextn-app:latest"
echo ""
echo "To deploy with docker-compose:"
echo "  docker-compose up -d"
