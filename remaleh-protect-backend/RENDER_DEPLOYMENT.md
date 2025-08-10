# 🚀 Render Deployment Guide for Remaleh Protect Backend

This guide will help you deploy your Remaleh Protect backend on Render's cloud platform.

## 📋 Prerequisites

- A Render account
- Your Remaleh Protect backend code in a Git repository
- API keys for external services (OpenAI, HaveIBeenPwned)

## 🔧 Service Setup

### 1. Create a New Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your Git repository
4. Choose the repository containing your Remaleh Protect backend

### 2. Service Configuration

**Name**: `remaleh-protect-backend` (or your preferred name)

**Environment**: `Python 3`

**Build Command**:
```bash
pip install -r requirements.txt
```

**Start Command**:
```bash
gunicorn --bind 0.0.0.0:$PORT --workers 4 --worker-class sync --timeout 30 --keep-alive 2 --max-requests 1000 --max-requests-jitter 100 src.main:app
```

**Auto-Deploy**: Enable for automatic deployments on Git pushes

## 🌍 Environment Variables

Add these environment variables in your Render service settings:

### Security & API Keys
```bash
SECRET_KEY=your-super-secret-key-change-this-in-production
HIBP_API_KEY=your-haveibeenpwned-api-key
OPENAI_API_KEY=your-openai-api-key
ADMIN_PASSWORD=your-secure-admin-password
```

### Database Configuration
```bash
# Render will provide this automatically when you add a PostgreSQL database
DATABASE_URL=postgresql://username:password@host:port/database_name

# Optional database tuning
DB_POOL_SIZE=20
DB_POOL_RECYCLE=3600
DB_MAX_OVERFLOW=30
```

### Redis Configuration
```bash
# Render will provide this automatically when you add a Redis database
REDIS_URL=redis://username:password@host:port

# Optional Redis tuning
REDIS_PASSWORD=your-redis-password
REDIS_DB=0
```

### Application Settings
```bash
FLASK_ENV=production
FLASK_DEBUG=false
LOG_LEVEL=INFO
ENABLE_METRICS=true
METRICS_PORT=9090
```

### Rate Limiting & Caching
```bash
RATE_LIMIT_STORAGE_URL=redis://username:password@host:port/1
RATE_LIMIT_DEFAULT=60 per minute
RATE_LIMIT_STRATEGY=fixed-window
CACHE_TTL=3600
THREAT_INTEL_CACHE_TTL=1800
USER_SCAN_CACHE_TTL=900
```

### SSL & Security
```bash
FORCE_HTTPS=true
```

## 🗄️ Database Setup

### 1. Add PostgreSQL Database

1. In your Render dashboard, click "New +" → "PostgreSQL"
2. Choose a plan (Free tier available for development)
3. Name it `remaleh-protect-db`
4. Copy the `DATABASE_URL` to your web service environment variables

### 2. Database Initialization

Your backend will automatically create tables and indexes on first run. The database manager includes:

- Connection pooling optimization
- Performance indexes on frequently queried fields
- Automatic health checks
- SSL connection support (required by Render)

## 🔴 Redis Setup

### 1. Add Redis Database

1. In your Render dashboard, click "New +" → "Redis"
2. Choose a plan (Free tier available for development)
3. Name it `remaleh-protect-redis`
4. Copy the `REDIS_URL` to your web service environment variables

### 2. Redis Usage

Redis is used for:
- **Caching**: Threat intelligence, user profiles, scan results
- **Rate Limiting**: API request throttling
- **Session Storage**: User authentication tokens
- **Performance Metrics**: Request timing and monitoring data

## 📊 Monitoring & Health Checks

### Built-in Endpoints

Your backend includes these monitoring endpoints:

- **Health Check**: `/api/health` - Database and cache status
- **Performance**: `/api/performance` - Performance metrics and database info
- **Metrics**: `/api/metrics` - Prometheus-compatible metrics
- **Test**: `/api/test` - Basic API functionality test

### Render Health Checks

Render will automatically monitor your service health. The health check endpoint returns:

```json
{
  "ok": true,
  "service": "remaleh-protect-api",
  "timestamp": "2024-01-01T00:00:00",
  "database": "healthy",
  "cache": "healthy",
  "environment": "production"
}
```

## 🚀 Deployment Process

### 1. Initial Deployment

1. Set all environment variables
2. Deploy the service
3. Monitor the build logs for any errors
4. Check the health endpoint: `https://your-service.onrender.com/api/health`

### 2. Database Migration

On first deployment, the backend will:
- Connect to PostgreSQL
- Create all necessary tables
- Add performance indexes
- Create the admin user (if `ADMIN_PASSWORD` is set)

### 3. Verification

Test these endpoints after deployment:
- `GET /api/health` - Should return healthy status
- `GET /api/test` - Should return API working message
- `POST /api/auth/login` - Test with admin credentials

## 🔧 Troubleshooting

### Common Issues

**Build Failures**:
- Check Python version compatibility
- Verify all dependencies in `requirements.txt`
- Check build logs for specific error messages

**Database Connection Issues**:
- Verify `DATABASE_URL` is correct
- Check if PostgreSQL service is running
- Ensure SSL mode is enabled (Render requirement)

**Redis Connection Issues**:
- Verify `REDIS_URL` is correct
- Check if Redis service is running
- Ensure Redis service is accessible from your web service

**Environment Variable Issues**:
- Verify all required variables are set
- Check for typos in variable names
- Ensure sensitive values are properly escaped

### Debug Mode

For debugging, temporarily set:
```bash
FLASK_DEBUG=true
LOG_LEVEL=DEBUG
```

**⚠️ Remember to disable debug mode in production!**

## 📈 Scaling Considerations

### Free Tier Limitations
- **PostgreSQL**: 90 days, 1GB storage
- **Redis**: 90 days, 256MB storage
- **Web Service**: Sleeps after 15 minutes of inactivity

### Paid Tier Benefits
- **PostgreSQL**: Persistent storage, larger capacity
- **Redis**: Persistent storage, larger capacity
- **Web Service**: Always-on, custom domains, SSL certificates

### Performance Tuning

For production workloads, consider:
- Increasing `DB_POOL_SIZE` based on your database plan
- Adjusting `CACHE_TTL` values based on data freshness requirements
- Monitoring `/api/performance` endpoint for optimization opportunities

## 🔐 Security Best Practices

1. **Never commit `.env` files** to your repository
2. **Use strong, unique passwords** for all services
3. **Rotate API keys** regularly
4. **Monitor access logs** through Render dashboard
5. **Enable HTTPS** (automatic with Render)
6. **Use environment variables** for all sensitive configuration

## 📞 Support

- **Render Support**: [help.render.com](https://help.render.com/)
- **Service Logs**: Available in your Render dashboard
- **Health Monitoring**: Built-in health checks and metrics

## 🎯 Next Steps

After successful deployment:

1. **Test all API endpoints** to ensure functionality
2. **Set up monitoring alerts** in Render dashboard
3. **Configure custom domain** if needed
4. **Set up CI/CD** for automatic deployments
5. **Monitor performance metrics** using built-in endpoints

Your Remaleh Protect backend is now running on Render with enterprise-grade infrastructure! 🎉
