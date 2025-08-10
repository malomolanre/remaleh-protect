# 🧪 Render Testing Guide for Remaleh Protect

This guide will help you test your Remaleh Protect application on Render's cloud platform instead of local development.

## 🎯 Why Test on Render?

- **Production-like environment**: Test in the same environment as your live users
- **Real database**: Test with actual PostgreSQL and Redis instances
- **Network conditions**: Experience real-world latency and connection issues
- **Environment variables**: Test with production configuration
- **CORS handling**: Verify cross-origin requests work correctly
- **Mobile testing**: Test mobile app behavior with cloud APIs

## 🚀 Prerequisites

1. **Backend deployed on Render** (see `remaleh-protect-backend/RENDER_DEPLOYMENT.md`)
2. **Frontend deployed on Render** (see `remaleh-protect-frontend/RENDER_DEPLOYMENT.md`)
3. **Database services running** (PostgreSQL and Redis)
4. **Environment variables configured** in both services

## 🔧 Backend Testing Setup

### 1. Verify Backend Deployment

Check your backend service is running:
```bash
# Replace with your actual backend URL
curl https://your-backend-service.onrender.com/api/health
```

Expected response:
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

### 2. Test Backend Endpoints

```bash
# Test basic API functionality
curl https://your-backend-service.onrender.com/api/test

# Test authentication (create admin user first)
curl -X POST https://your-backend-service.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@remaleh.com", "password": "your-admin-password"}'

# Test breach checking
curl -X POST https://your-backend-service.onrender.com/api/breach/check \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### 3. Monitor Backend Logs

In your Render dashboard:
1. Go to your backend service
2. Click "Logs" tab
3. Monitor for errors during testing
4. Check database connection logs

## 🌐 Frontend Testing Setup

### 1. Verify Frontend Deployment

1. Open your frontend URL in a browser
2. Check browser console for API base URL logs
3. Verify environment variables are loaded correctly

### 2. Test Frontend-Backend Connection

1. **Open Browser Developer Tools**
   - Press F12 or right-click → Inspect
   - Go to Console tab
   - Look for API base URL logs

2. **Check Network Tab**
   - Go to Network tab in DevTools
   - Try to login or perform any action
   - Verify API calls are going to Render backend

3. **Test Authentication Flow**
   - Try to register a new user
   - Try to login with existing credentials
   - Check if tokens are received and stored

### 3. Environment Variable Verification

Your frontend should log these in development mode:
```javascript
API Base URL: https://your-backend-service.onrender.com
Environment Variables: {
  VITE_API_BASE: "https://your-backend-service.onrender.com",
  VITE_API_URL: undefined
}
```

## 📱 Mobile App Testing

### 1. Build for Testing

```bash
cd remaleh-protect-frontend

# Build the web app
npm run build

# Build for Android
npm run android

# Build for iOS
npm run ios
```

### 2. Test API Calls

1. **Open mobile app**
2. **Check network requests** using mobile debugging tools
3. **Verify API calls** go to Render backend
4. **Test authentication** on mobile device

### 3. Mobile Debugging Tools

- **Android**: Chrome DevTools remote debugging
- **iOS**: Safari Web Inspector
- **Flipper**: Facebook's mobile app debugging platform

## 🧪 Testing Scenarios

### 1. Authentication Testing

```bash
# Test user registration
curl -X POST https://your-backend-service.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "first_name": "Test",
    "last_name": "User"
  }'

# Test user login
curl -X POST https://your-backend-service.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'
```

### 2. Feature Testing

```bash
# Test breach checking
curl -X POST https://your-backend-service.onrender.com/api/breach/check \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"email": "test@example.com"}'

# Test scam analysis
curl -X POST https://your-backend-service.onrender.com/api/scam/comprehensive \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"url": "https://example.com", "description": "Test scam"}'

# Test link analysis
curl -X POST https://your-backend-service.onrender.com/api/link/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"url": "https://example.com"}'
```

### 3. Admin Panel Testing

```bash
# Test admin dashboard
curl -X GET https://your-backend-service.onrender.com/api/admin/dashboard \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Test user management
curl -X GET https://your-backend-service.onrender.com/api/admin/users \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

## 🔍 Debugging Common Issues

### 1. CORS Errors

**Problem**: Browser blocks requests due to CORS policy
**Solution**: 
- Verify backend CORS configuration includes your frontend domain
- Check that frontend and backend URLs are correct
- Ensure backend is sending proper CORS headers

### 2. Database Connection Issues

**Problem**: Backend can't connect to PostgreSQL
**Solution**:
- Verify `DATABASE_URL` environment variable is set correctly
- Check PostgreSQL service is running in Render
- Ensure SSL mode is enabled (Render requirement)

### 3. Redis Connection Issues

**Problem**: Backend can't connect to Redis
**Solution**:
- Verify `REDIS_URL` environment variable is set correctly
- Check Redis service is running in Render
- Ensure Redis service is accessible from your web service

### 4. Environment Variables Not Loading

**Problem**: Frontend still using localhost URL
**Solution**:
- Verify `VITE_API_BASE` is set in Render dashboard
- Redeploy the service after setting environment variables
- Check browser console for API base URL logs

## 📊 Monitoring and Metrics

### 1. Backend Health Monitoring

```bash
# Check service health
curl https://your-backend-service.onrender.com/api/health

# Check performance metrics
curl https://your-backend-service.onrender.com/api/performance

# Check Prometheus metrics
curl https://your-backend-service.onrender.com/api/metrics
```

### 2. Render Dashboard Monitoring

- **Service Status**: Check if services are running
- **Build Logs**: Monitor deployment and build processes
- **Service Logs**: View real-time application logs
- **Metrics**: Monitor CPU, memory, and request counts

## 🚀 Testing Workflow

### 1. Daily Testing Routine

1. **Morning Check**
   - Verify all services are running
   - Check health endpoints
   - Review error logs

2. **Feature Testing**
   - Test new features on Render
   - Verify API responses
   - Check frontend functionality

3. **End-of-Day Review**
   - Review performance metrics
   - Check for any errors
   - Plan next day's testing

### 2. Before Production Release

1. **Full Feature Test**
   - Test all major features on Render
   - Verify mobile app functionality
   - Check admin panel operations

2. **Performance Testing**
   - Monitor response times
   - Check database performance
   - Verify caching effectiveness

3. **Security Testing**
   - Test authentication flows
   - Verify authorization rules
   - Check API rate limiting

## 🔧 Testing Tools

### 1. API Testing

- **Postman**: GUI-based API testing
- **Insomnia**: Alternative to Postman
- **curl**: Command-line API testing
- **Browser DevTools**: Network monitoring

### 2. Mobile Testing

- **Chrome DevTools**: Remote debugging for Android
- **Safari Web Inspector**: iOS debugging
- **Flipper**: Mobile app debugging platform
- **React Native Debugger**: React Native specific debugging

### 3. Performance Testing

- **Lighthouse**: Web performance auditing
- **WebPageTest**: Detailed performance analysis
- **GTmetrix**: Performance monitoring
- **Built-in metrics**: Use `/api/performance` endpoint

## 📝 Testing Checklist

### Backend Testing
- [ ] Health endpoint responds correctly
- [ ] Database connection is healthy
- [ ] Redis connection is healthy
- [ ] All API endpoints respond
- [ ] Authentication works correctly
- [ ] Admin functions work properly
- [ ] Rate limiting is functional
- [ ] CORS headers are correct

### Frontend Testing
- [ ] Environment variables load correctly
- [ ] API calls go to Render backend
- [ ] Authentication flow works
- [ ] All features function properly
- [ ] Mobile responsiveness works
- [ ] Error handling works correctly
- [ ] Loading states display properly

### Integration Testing
- [ ] Frontend can communicate with backend
- [ ] Database operations work end-to-end
- [ ] Caching improves performance
- [ ] File uploads work correctly
- [ ] Real-time features function
- [ ] Mobile app works with cloud APIs

## 🎯 Next Steps

1. **Deploy both services** to Render if not already done
2. **Set environment variables** in Render dashboard
3. **Run initial health checks** on both services
4. **Test basic functionality** (login, registration)
5. **Test all major features** systematically
6. **Monitor performance** and error logs
7. **Test mobile app** with cloud APIs
8. **Document any issues** found during testing

## 📞 Support

If you encounter issues:

1. **Check Render service logs** for detailed error information
2. **Verify environment variables** are set correctly
3. **Test backend endpoints** directly with curl
4. **Check browser console** for frontend errors
5. **Review this guide** for common solutions
6. **Check Render documentation** for platform-specific issues

Your Remaleh Protect application is now ready for comprehensive testing on Render! 🎉
