# 🚀 Render Testing Quick Reference

## 🎯 Quick Start

1. **Setup**: `./setup_render_testing.sh`
2. **Configure**: Edit `render_env.env` with your Render URLs
3. **Test**: `./test_render_deployment.sh`

## 🔧 Essential Commands

### Backend Health Check
```bash
curl https://your-backend.onrender.com/api/health
```

### Test Authentication
```bash
# Login
curl -X POST https://your-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@remaleh.com", "password": "your-password"}'

# Register
curl -X POST https://your-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "TestPass123!", "first_name": "Test", "last_name": "User"}'
```

### Test Core Features
```bash
# Breach check
curl -X POST https://your-backend.onrender.com/api/breach/check \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Scam analysis
curl -X POST https://your-backend.onrender.com/api/scam/comprehensive \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "description": "Test"}'

# Link analysis
curl -X POST https://your-backend.onrender.com/api/link/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

## 🌐 Frontend Testing

### Browser Console Check
```javascript
// Should show your Render backend URL
console.log('API Base URL:', import.meta.env.VITE_API_BASE);
```

### Network Tab Verification
1. Open DevTools (F12)
2. Go to Network tab
3. Perform any action (login, etc.)
4. Verify API calls go to Render backend

## 📱 Mobile Testing

### Build Commands
```bash
cd remaleh-protect-frontend

# Web build
npm run build

# Mobile builds
npm run android
npm run ios
```

### Mobile Debugging
- **Android**: Chrome DevTools remote debugging
- **iOS**: Safari Web Inspector
- **Check network requests** go to Render backend

## 🔍 Troubleshooting

### Common Issues

| Problem | Solution |
|---------|----------|
| CORS errors | Check backend CORS config includes frontend domain |
| Database connection | Verify `DATABASE_URL` in Render environment variables |
| Redis connection | Verify `REDIS_URL` in Render environment variables |
| Frontend using localhost | Check `VITE_API_BASE` is set in Render dashboard |

### Debug Mode
```bash
# Temporarily enable debug mode in Render
FLASK_DEBUG=true
LOG_LEVEL=DEBUG
```

## 📊 Monitoring

### Health Endpoints
- **Health**: `/api/health`
- **Performance**: `/api/performance`
- **Metrics**: `/api/metrics`

### Render Dashboard
- Service status
- Build logs
- Service logs
- Performance metrics

## 🎯 Testing Checklist

### Backend
- [ ] Health endpoint responds
- [ ] Database connection healthy
- [ ] Redis connection healthy
- [ ] Authentication works
- [ ] All API endpoints respond

### Frontend
- [ ] Environment variables load
- [ ] API calls go to Render backend
- [ ] Authentication flow works
- [ ] All features function

### Integration
- [ ] Frontend-backend communication
- [ ] Database operations work
- [ ] Caching improves performance
- [ ] Mobile app works with cloud APIs

## 📞 Quick Support

1. **Check Render logs** in dashboard
2. **Verify environment variables** are set
3. **Test endpoints directly** with curl
4. **Check browser console** for errors
5. **Review RENDER_TESTING_GUIDE.md** for details

---

**Remember**: Always test on Render before deploying to production! 🚀
