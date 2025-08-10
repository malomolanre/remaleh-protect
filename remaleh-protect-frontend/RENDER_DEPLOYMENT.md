# 🚀 Render Deployment Guide for Remaleh Protect Frontend

This guide will help you deploy your Remaleh Protect frontend on Render's cloud platform.

## 📋 Prerequisites

- A Render account
- Your Remaleh Protect frontend code in a Git repository
- Your backend API deployed on Render (see backend deployment guide)

## 🔧 Service Setup

### 1. Create a New Static Site

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Static Site"
3. Connect your Git repository
4. Choose the repository containing your Remaleh Protect frontend

### 2. Service Configuration

**Name**: `remaleh-protect-frontend` (or your preferred name)

**Build Command**:
```bash
npm install && npm run build
```

**Publish Directory**: `dist`

**Auto-Deploy**: Enable for automatic deployments on Git pushes

## 🌍 Environment Variables

**CRITICAL**: You must set the `VITE_API_BASE` environment variable to point to your backend service.

### Required Environment Variables

```bash
# Backend API URL - Replace with your actual Render backend service URL
VITE_API_BASE=https://your-backend-service-name.onrender.com

# Example:
VITE_API_BASE=https://api.remalehprotect.remaleh.com.au
```

### How to Set Environment Variables

1. In your Render dashboard, go to your frontend service
2. Click on "Environment" tab
3. Add the `VITE_API_BASE` variable with your backend URL
4. Save the changes

## 🔗 Backend Service URL

To find your backend service URL:

1. Go to your backend service in Render dashboard
2. Copy the URL shown (e.g., `https://api.remalehprotect.remaleh.com.au`)
3. Use this as your `VITE_API_BASE` value

## 🚨 Common Issues & Solutions

### 1. "Network error occurred" on Login

**Problem**: Frontend can't connect to backend API
**Solution**: 
- Verify `VITE_API_BASE` is set correctly
- Ensure backend service is running
- Check backend service health endpoint: `https://your-backend.onrender.com/api/health`

### 2. CORS Errors

**Problem**: Browser blocks requests due to CORS policy
**Solution**: 
- Ensure backend has CORS properly configured
- Check that frontend and backend URLs are correct

### 3. Environment Variables Not Loading

**Problem**: Frontend still using localhost URL
**Solution**:
- Verify environment variable is set in Render dashboard
- Redeploy the service after setting environment variables
- Check browser console for API base URL logs

## 🧪 Testing Your Deployment

1. **Check Environment Variables**: Open browser console and look for API base URL logs
2. **Test API Connection**: Try to login and check network tab for API calls
3. **Verify Backend Health**: Visit your backend health endpoint directly

## 📱 Mobile App Considerations

If you're building a mobile app with Capacitor:

1. **API Configuration**: Mobile app will use the same environment variables
2. **Build Process**: Use `npm run build` before building mobile app
3. **Testing**: Test API calls on both web and mobile versions

## 🔄 Deployment Workflow

1. Set environment variables in Render dashboard
2. Push code changes to Git repository
3. Render automatically builds and deploys
4. Test the deployed application
5. Verify API connections work correctly

## 📞 Support

If you encounter issues:

1. Check Render service logs
2. Verify environment variables are set correctly
3. Test backend API endpoints directly
4. Check browser console for error messages
5. Ensure backend service is running and healthy
