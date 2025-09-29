#!/bin/bash

# Enable PostgreSQL Remote Access Configuration Script

set -e

echo "🔐 Configuring PostgreSQL for Remote Access"
echo "==========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Get server IP address
SERVER_IP=$(hostname -I | awk '{print $1}')

print_status "Configuring PostgreSQL for remote connections..."

# Backup PostgreSQL configuration files
sudo cp /etc/postgresql/14/main/postgresql.conf /etc/postgresql/14/main/postgresql.conf.backup
sudo cp /etc/postgresql/14/main/pg_hba.conf /etc/postgresql/14/main/pg_hba.conf.backup

# Configure PostgreSQL to listen on all interfaces
print_status "Updating postgresql.conf to listen on all interfaces..."
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" /etc/postgresql/14/main/postgresql.conf

# Add remote connection rules to pg_hba.conf
print_status "Configuring pg_hba.conf for remote connections..."

# Add rule for specific database and user (recommended for security)
echo "
# Remote connections for Aula Virtual API
host    aula_virtual    aula_virtual_user    0.0.0.0/0    md5
host    aula_virtual    aula_virtual_user    ::/0         md5
" | sudo tee -a /etc/postgresql/14/main/pg_hba.conf

# Optionally, add rule for all databases (less secure)
read -p "Do you want to allow remote access to ALL databases? (NOT recommended for production) [y/N]: " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "
# Allow all remote connections (USE WITH CAUTION)
host    all    all    0.0.0.0/0    md5
host    all    all    ::/0         md5
" | sudo tee -a /etc/postgresql/14/main/pg_hba.conf
    print_warning "Remote access enabled for ALL databases - Please restrict this in production!"
fi

# Restart PostgreSQL to apply changes
print_status "Restarting PostgreSQL..."
sudo systemctl restart postgresql

# Configure firewall for PostgreSQL
print_status "Configuring firewall for PostgreSQL port 5432..."
sudo ufw allow 5432/tcp
sudo ufw reload

print_success "PostgreSQL configured for remote access!"

# Test the configuration
print_status "Testing PostgreSQL configuration..."
sudo -u postgres psql -c "SELECT version();" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    print_success "PostgreSQL is running correctly!"
else
    print_warning "PostgreSQL test failed - please check the configuration"
fi

# Display connection information
echo
echo "============================================="
print_success "PostgreSQL Remote Access Enabled!"
echo "============================================="
echo
echo "📊 Connection Details:"
echo "  • Host: $SERVER_IP"
echo "  • Port: 5432"
echo "  • Database: aula_virtual"
echo "  • Username: aula_virtual_user"
echo "  • Password: [Check your .env file]"
echo
echo "🔗 Connection String:"
echo "  postgresql://aula_virtual_user:PASSWORD@$SERVER_IP:5432/aula_virtual"
echo
echo "🛠️ Test from remote machine:"
echo "  psql -h $SERVER_IP -U aula_virtual_user -d aula_virtual"
echo
echo "📱 For GUI clients (pgAdmin, DBeaver, etc):"
echo "  Host: $SERVER_IP"
echo "  Port: 5432"
echo "  Database: aula_virtual"
echo "  Username: aula_virtual_user"
echo
print_warning "Security Notes:"
print_warning "  • Consider restricting IP ranges in pg_hba.conf"
print_warning "  • Use SSL connections in production"
print_warning "  • Regularly update PostgreSQL passwords"
print_warning "  • Monitor connection logs for suspicious activity"
echo
echo "📝 To restrict access to specific IPs, edit:"
echo "  /etc/postgresql/14/main/pg_hba.conf"
echo "  Replace 0.0.0.0/0 with your IP range (e.g., 192.168.1.0/24)"
echo
echo "🔄 After making changes, restart PostgreSQL:"
echo "  sudo systemctl restart postgresql"