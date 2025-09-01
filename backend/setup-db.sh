#!/bin/bash

echo "🔧 Setting up PostgreSQL for Aula Virtual..."

# Stop existing PostgreSQL service
brew services stop postgresql@16 2>/dev/null || echo "PostgreSQL not running via brew"

# Start PostgreSQL without authentication
echo "🚀 Starting PostgreSQL..."
pg_ctl -D /opt/homebrew/var/postgresql@16 -l /opt/homebrew/var/postgresql@16/server.log start 2>/dev/null || \
pg_ctl -D /usr/local/var/postgresql@16 -l /usr/local/var/postgresql@16/server.log start 2>/dev/null || \
brew services start postgresql@16

sleep 3

# Try to create database using system user (no password)
echo "📂 Creating database..."
createdb aula_virtual 2>/dev/null || echo "Database might already exist"

# Set user in environment for Node.js
export DB_USER=$(whoami)
export DB_PASSWORD=""

echo "✅ Database setup complete!"
echo "   Database: aula_virtual"
echo "   User: $(whoami)"
echo "   Password: (none - using system authentication)"
echo ""
echo "You can now run:"
echo "   npm run migrate"
echo "   npm run seed"
echo "   npm run dev"