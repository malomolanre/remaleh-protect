#!/bin/bash

# Production Deployment Script for Remaleh Protect Backend
# This script sets up the production environment with proper security

set -e  # Exit on any error

echo "🚀 Starting Remaleh Protect Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons"
   exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p logs
mkdir -p logs/nginx
mkdir -p monitoring/grafana/dashboards
mkdir -p monitoring/grafana/datasources
mkdir -p nginx/ssl

# Check if .env file exists
if [ ! -f .env ]; then
    print_warning ".env file not found. Creating from template..."
    if [ -f env.example ]; then
        cp env.example .env
        print_warning "Please edit .env file with your production values before continuing!"
        print_warning "Key variables to set:"
        print_warning "  - SECRET_KEY (generate a secure random key)"
        print_warning "  - POSTGRES_PASSWORD (secure database password)"
        print_warning "  - REDIS_PASSWORD (secure Redis password)"
        print_warning "  - ADMIN_PASSWORD (secure admin password)"
        print_warning "  - HIBP_API_KEY (HaveIBeenPwned API key)"
        print_warning "  - OPENAI_API_KEY (OpenAI API key)"
        exit 1
    else
        print_error "env.example not found. Cannot create .env file."
        exit 1
    fi
fi

# Generate secure secrets if not set
print_status "Generating secure secrets..."

# Generate SECRET_KEY if not set
if ! grep -q "SECRET_KEY=" .env || grep -q "SECRET_KEY=your-secret-key-change-this-in-production" .env; then
    SECRET_KEY=$(openssl rand -hex 32)
    sed -i "s/SECRET_KEY=.*/SECRET_KEY=$SECRET_KEY/" .env
    print_status "Generated new SECRET_KEY"
fi

# Generate POSTGRES_PASSWORD if not set
if ! grep -q "POSTGRES_PASSWORD=" .env || grep -q "POSTGRES_PASSWORD=your-secure-postgres-password" .env; then
    POSTGRES_PASSWORD=$(openssl rand -base64 32)
    sed -i "s/POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=$POSTGRES_PASSWORD/" .env
    print_status "Generated new POSTGRES_PASSWORD"
fi

# Generate REDIS_PASSWORD if not set
if ! grep -q "REDIS_PASSWORD=" .env || grep -q "REDIS_PASSWORD=your-secure-redis-password" .env; then
    REDIS_PASSWORD=$(openssl rand -base64 32)
    sed -i "s/REDIS_PASSWORD=.*/REDIS_PASSWORD=$REDIS_PASSWORD/" .env
    print_status "Generated new REDIS_PASSWORD"
fi

# Generate ADMIN_PASSWORD if not set
if ! grep -q "ADMIN_PASSWORD=" .env || grep -q "ADMIN_PASSWORD=your-secure-admin-password" .env; then
    ADMIN_PASSWORD=$(openssl rand -base64 16)
    sed -i "s/ADMIN_PASSWORD=.*/ADMIN_PASSWORD=$ADMIN_PASSWORD/" .env
    print_status "Generated new ADMIN_PASSWORD"
fi

# Load environment variables
print_status "Loading environment variables..."
source .env

# Validate required environment variables
print_status "Validating environment variables..."
required_vars=("HIBP_API_KEY" "OPENAI_API_KEY")
missing_vars=()

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ] || [[ "${!var}" == *"your-"* ]]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    print_error "Missing or invalid required environment variables:"
    for var in "${missing_vars[@]}"; do
        print_error "  - $var"
    done
    print_error "Please update your .env file with valid values."
    exit 1
fi

# Build and start services
print_status "Building and starting production services..."
docker-compose -f docker-compose.prod.yml build

print_status "Starting services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
print_status "Waiting for services to be healthy..."
sleep 30

# Check service health
print_status "Checking service health..."
if docker-compose -f docker-compose.prod.yml ps | grep -q "unhealthy"; then
    print_error "Some services are unhealthy. Check logs with: docker-compose -f docker-compose.prod.yml logs"
    exit 1
fi

# Test API endpoints
print_status "Testing API endpoints..."
if curl -f http://localhost:10000/api/health > /dev/null 2>&1; then
    print_status "✅ API health check passed"
else
    print_error "❌ API health check failed"
    exit 1
fi

# Display deployment information
print_status "🎉 Deployment completed successfully!"
echo ""
echo "📋 Deployment Information:"
echo "  - Backend API: http://localhost:10000"
echo "  - Health Check: http://localhost:10000/api/health"
echo "  - Metrics: http://localhost:10000/api/metrics"
echo "  - Performance: http://localhost:10000/api/performance"
echo ""
echo "🔐 Admin Credentials:"
echo "  - Email: admin@remaleh.com"
echo "  - Password: $ADMIN_PASSWORD"
echo ""
echo "📊 Monitoring (Optional):"
echo "  - Prometheus: http://localhost:9090"
echo "  - Grafana: http://localhost:3000 (admin/$GRAFANA_PASSWORD)"
echo ""
echo "📝 Useful Commands:"
echo "  - View logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "  - Stop services: docker-compose -f docker-compose.prod.yml down"
echo "  - Restart services: docker-compose -f docker-compose.prod.yml restart"
echo "  - Update services: docker-compose -f docker-compose.prod.yml pull && docker-compose -f docker-compose.prod.yml up -d"
echo ""
print_warning "⚠️  IMPORTANT: Change the generated passwords in production!"
print_warning "⚠️  Store the admin password securely - it won't be shown again!"
print_warning "⚠️  Consider setting up SSL/TLS certificates for production use."
