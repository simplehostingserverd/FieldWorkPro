#!/bin/bash

# FieldPro Setup Script
# This script sets up the development environment for FieldPro

echo "Setting up FieldPro development environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null
then
    echo "Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

echo "Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null
then
    echo "npm is not installed. Please install npm."
    exit 1
fi

echo "npm version: $(npm --version)"

# Create .env file from example if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file from example..."
    cp env.example .env
    echo "Please update the .env file with your actual configuration values."
fi

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install

# Install web dashboard dependencies
echo "Installing web dashboard dependencies..."
cd ../web-dashboard
npm install

# Return to root
cd ..

echo "Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update the .env file with your actual configuration values"
echo "2. Start the development servers:"
echo "   - Backend: cd backend && npm run dev"
echo "   - Web Dashboard: cd web-dashboard && npm run dev"
echo "3. For mobile development, refer to the mobile app README files"
echo ""
echo "For Docker setup, run: docker-compose up"
