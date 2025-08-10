# Remaleh Protect Backend - Production Deployment Guide

This guide covers the production deployment of the Remaleh Protect Backend with all security, performance, and monitoring features enabled.

## 🚀 Production Features Implemented

### Security Enhancements
- ✅ Environment-based configuration management
- ✅ Secure secret generation and management
- ✅ Password strength validation
- ✅ Rate limiting with Redis storage
- ✅ JWT token security with configurable expiration
- ✅ Non-root Docker containers
- ✅ Secure admin user creation

### Performance Optimizations
- ✅ Redis-based caching for threat intelligence and user data
- ✅ Database connection pooling with PostgreSQL
- ✅ Database indexing for frequently queried fields
- ✅ Request/response performance monitoring
- ✅ Gunicorn WSGI server with optimized worker configuration
- ✅ Connection health checks and timeouts

### Monitoring & Observability
- ✅ Prometheus metrics collection
- ✅ Redis-based performance analytics
- ✅ Request duration tracking
- ✅ Database connection monitoring
- ✅ Cache hit/miss tracking
- ✅ Business metrics (scans, threats, registrations)
- ✅ Grafana dashboards (optional)

### Database & Storage
- ✅ PostgreSQL for production scalability
- ✅ Redis for caching and rate limiting
- ✅ Automated database indexing
- ✅ Connection pool management
- ✅ Health checks and failover

## 📋 Prerequisites

- Docker and Docker Compose installed
- OpenSSL for certificate generation
- curl for health checks
- At least 4GB RAM available
- 20GB+ disk space

## 🔧 Environment Setup

### 1. Clone and Navigate
```bash
cd remaleh-protect-backend
```

### 2. Environment Configuration
Copy the environment template and configure:
```bash
cp env.example .env
```

**Required Environment Variables:**
```bash
# API Keys (Required)
HIBP_API_KEY=your-haveibeenpwned-api-key
OPENAI_API_KEY=your-openai-api-key

# Optional - Will be auto-generated if not set
SECRET_KEY=your-super-secret-key
POSTGRES_PASSWORD=your-secure-postgres-password
REDIS_PASSWORD=your-secure-redis-password
ADMIN_PASSWORD=your-secure-admin-password
```

### 3. Quick Deployment
```bash
./deploy.sh
```

The deployment script will:
- Generate secure secrets automatically
- Validate environment variables
- Build and start all services
- Perform health checks
- Display deployment information

## 🐳 Manual Docker Deployment

### 1. Build Services
```bash
docker-compose -f docker-compose.prod.yml build
```

### 2. Start Services
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 3. Check Status
```bash
docker-compose -f docker-compose.prod.yml ps
```

### 4. View Logs
```bash
docker-compose -f docker-compose.prod.yml logs -f
```

## 📊 Service Endpoints

### Core API
- **Health Check**: `GET /api/health`
- **Performance Metrics**: `GET /api/performance`
- **Prometheus Metrics**: `GET /api/metrics`

### Application Endpoints
- **Authentication**: `/api/auth/*`
- **Scam Analysis**: `/api/scam/*`
- **Threat Intelligence**: `/api/threat_intelligence/*`
- **Community Reports**: `/api/community/*`
- **Admin Panel**: `/api/admin/*`

## 🔍 Monitoring & Debugging

### Health Checks
```bash
# API Health
curl http://localhost:10000/api/health

# Performance Summary
curl http://localhost:10000/api/performance

# Prometheus Metrics
curl http://localhost:10000/api/metrics
```

### Service Logs
```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f postgres
docker-compose -f docker-compose.prod.yml logs -f redis
```

### Database Connection
```bash
# Connect to PostgreSQL
docker exec -it remaleh_postgres psql -U remaleh_user -d remaleh_protect

# Redis CLI
docker exec -it remaleh_redis redis-cli -a your-redis-password
```

## 🚨 Production Security Checklist

### Before Going Live
- [ ] Change all auto-generated passwords
- [ ] Set up SSL/TLS certificates
- [ ] Configure firewall rules
- [ ] Set up log rotation
- [ ] Configure backup strategies
- [ ] Set up monitoring alerts
- [ ] Test disaster recovery procedures

### Ongoing Security
- [ ] Regular security updates
- [ ] Monitor access logs
- [ ] Review rate limiting effectiveness
- [ ] Audit admin access
- [ ] Monitor for suspicious activity

## 📈 Performance Tuning

### Database Optimization
- Monitor connection pool usage
- Adjust pool size based on load
- Review slow query logs
- Optimize indexes for your usage patterns

### Cache Optimization
- Monitor cache hit rates
- Adjust TTL values based on data freshness requirements
- Scale Redis memory based on usage

### Application Tuning
- Adjust Gunicorn worker count based on CPU cores
- Monitor memory usage per worker
- Tune rate limiting based on legitimate traffic patterns

## 🔧 Troubleshooting

### Common Issues

#### Service Won't Start
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs

# Check environment variables
docker-compose -f docker-compose.prod.yml config
```

#### Database Connection Issues
```bash
# Check PostgreSQL status
docker exec -it remaleh_postgres pg_isready -U remaleh_user

# Check connection pool
curl http://localhost:10000/api/performance
```

#### Cache Issues
```bash
# Test Redis connection
docker exec -it remaleh_redis redis-cli -a your-redis-password ping

# Check cache status
curl http://localhost:10000/api/performance
```

### Performance Issues
```bash
# Check request metrics
curl http://localhost:10000/api/metrics

# Monitor database connections
curl http://localhost:10000/api/performance

# Check cache hit rates
curl http://localhost:10000/api/metrics | grep cache
```

## 📚 Additional Resources

### Configuration Files
- `docker-compose.prod.yml` - Production service orchestration
- `Dockerfile.prod` - Production container configuration
- `src/config.py` - Application configuration management
- `src/cache.py` - Redis caching implementation
- `src/database.py` - Database performance management
- `src/monitoring.py` - Metrics and monitoring

### Environment Variables Reference
See `env.example` for all available configuration options.

### Monitoring Setup
Optional monitoring stack includes:
- Prometheus for metrics collection
- Grafana for dashboards
- Nginx for reverse proxy and SSL termination

## 🆘 Support

For production deployment issues:
1. Check the troubleshooting section above
2. Review service logs
3. Verify environment configuration
4. Check system resources (CPU, memory, disk)
5. Ensure all required services are running

## 🔄 Updates & Maintenance

### Updating Services
```bash
# Pull latest images
docker-compose -f docker-compose.prod.yml pull

# Restart with new images
docker-compose -f docker-compose.prod.yml up -d
```

### Database Migrations
The application automatically handles database schema updates on startup.

### Backup & Recovery
```bash
# Database backup
docker exec -it remaleh_postgres pg_dump -U remaleh_user remaleh_protect > backup.sql

# Restore database
docker exec -i remaleh_postgres psql -U remaleh_user remaleh_protect < backup.sql
```

---

**⚠️ Production Ready**: This deployment configuration includes enterprise-grade security, performance, and monitoring features suitable for production use.
