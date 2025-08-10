# 🔧 Troubleshooting Guide

## 🚨 "Network error occurred" on Admin Login

This error typically occurs when the frontend can't connect to the backend API. Here's how to fix it:

### 1. Check Environment Variables

**Problem**: Frontend is still using localhost URL instead of Render backend URL

**Solution**: 
1. Go to your Render dashboard
2. Navigate to your frontend service
3. Go to "Environment" tab
4. Add/update `VITE_API_BASE` with your backend URL:
   ```
   VITE_API_BASE=https://your-backend-service-name.onrender.com
   ```

### 2. Verify Backend Service is Running

**Problem**: Backend service is down or not responding

**Solution**:
1. Check your backend service status in Render dashboard
2. Test the health endpoint directly: `https://your-backend.onrender.com/api/health`
3. If backend is down, restart it or check the logs

### 3. Check API Base URL in Browser Console

**Problem**: Environment variables not loading correctly

**Solution**:
1. Open your deployed frontend in browser
2. Open Developer Tools (F12)
3. Check Console tab for API base URL logs
4. You should see something like:
   ```
   API Base URL: https://your-backend.onrender.com
   ```
5. If you see `http://localhost:10000`, the environment variable isn't set correctly

### 4. Redeploy After Environment Changes

**Problem**: Environment variable changes not taking effect

**Solution**:
1. After setting environment variables, redeploy your frontend service
2. In Render dashboard, click "Manual Deploy" → "Deploy latest commit"
3. Wait for build to complete
4. Test again

### 5. CORS Issues

**Problem**: Browser blocking requests due to CORS policy

**Solution**:
1. Ensure your backend has CORS properly configured
2. Check that frontend and backend URLs are correct
3. Verify backend allows requests from your frontend domain

### 6. Network/Firewall Issues

**Problem**: Network blocking connections to Render

**Solution**:
1. Check if you're behind a corporate firewall
2. Try accessing from a different network
3. Test backend health endpoint from different locations

## 🧪 Testing Steps

1. **Set Environment Variable**:
   ```
   VITE_API_BASE=https://your-backend-service-name.onrender.com
   ```

2. **Redeploy Frontend**:
   - Manual deploy in Render dashboard

3. **Check Console Logs**:
   - Open browser console
   - Look for API base URL confirmation

4. **Test Backend Health**:
   - Visit: `https://your-backend.onrender.com/api/health`
   - Should return JSON with status information

5. **Test Login**:
   - Try admin login again
   - Check network tab for API calls

## 📞 Still Having Issues?

If the problem persists:

1. **Check Render Logs**: Look at both frontend and backend service logs
2. **Verify URLs**: Double-check all URLs are correct
3. **Test Backend Directly**: Use Postman or curl to test backend endpoints
4. **Check Dependencies**: Ensure all required environment variables are set

## 🔍 Debug Information

The frontend now includes enhanced logging. Check your browser console for:

- API Base URL being used
- Environment variables loaded
- Detailed error messages during login attempts
- Network request details
