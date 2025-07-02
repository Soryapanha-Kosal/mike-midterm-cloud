#!/bin/bash

echo "Installing global tools..."
npm install -g concurrently nodemon
npm install http-proxy-middleware

echo "Setting up Clubbie project..."

services=(
  "Authentication_Microservice"
  "APIGateway_Microservice"
  "Budget-Service"
  "Club-Service"
  "Event-Service"
  "Inventory-Service"
)

for service in "${services[@]}"; do
  echo "Checking $service..."
  if [ -d "$service" ]; then
    cd "$service"
    if [ -f "package.json" ]; then
      echo "Installing dependencies for $service..."
      npm install
      echo "Ensuring critical packages..."
      npm install jsonwebtoken dotenv express mongoose
    else
      echo "⚠️ Skipped $service: No package.json found"
    fi
    cd ..
  else
    echo "❌ $service directory not found"
  fi
done

echo "✅ Setup complete! All dependencies installed and tools ready."
