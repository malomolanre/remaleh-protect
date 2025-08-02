# 🚀 Remaleh Protect - Custom Hosting Deployment Guide

## 📋 **Overview**

This guide will help you deploy Remaleh Protect to your own hosting platform like Render, Vercel, Netlify, or any other hosting service. You'll have complete control over your deployment and can customize it further.

---

## 📦 **What You'll Need**

### **Code Files**
- Frontend React application
- Backend Flask API
- Configuration files
- Environment variables

### **Hosting Accounts**
- **Frontend**: Render, Vercel, Netlify, or similar
- **Backend**: Render, Railway, Heroku, or similar
- **Domain** (optional): Your custom domain

---

## 🔧 **Step 1: Prepare Your Code**

### **Frontend (React App)**
```bash
# Your frontend files structure:
remaleh-protect-frontend/
├── src/
│   ├── App.jsx          # Main application
│   ├── index.css        # Styles
│   └── main.jsx         # Entry point
├── public/
│   └── index.html       # HTML template
├── package.json         # Dependencies
├── vite.config.js       # Build configuration
└── dist/               # Built files (after npm run build)
```

### **Backend (Flask API)**
```bash
# Your backend files structure:
remaleh-protect-backend/
├── src/
│   ├── main.py          # Flask application
│   ├── routes/          # API endpoints
│   └── models/          # Data models
├── requirements.txt     # Python dependencies
└── Procfile            # Process configuration
```

---

## 🌐 **Step 2: Deploy Backend to Render**

### **2.1 Create Render Account**
1. Go to [render.com](https://render.com)
2. Sign up with GitHub (recommended)
3. Connect your GitHub account

### **2.2 Prepare Backend for Render**

**Create `Procfile` in backend root:**
```
web: python src/main.py
```

**Update `src/main.py` for production:**
```python
import os
from flask import Flask
# ... other imports

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug)
```

**Create `render.yaml` (optional):**
```yaml
services:
  - type: web
    name: remaleh-protect-api
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: python src/main.py
    envVars:
      - key: DEBUG
        value: false
```

### **2.3 Deploy Backend**
1. Push your backend code to GitHub
2. In Render dashboard, click "New +"
3. Select "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: `remaleh-protect-api`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python src/main.py`
6. Click "Create Web Service"
7. Note your backend URL: `https://your-app-name.onrender.com`

---

## 🎨 **Step 3: Deploy Frontend to Render**

### **3.1 Update Frontend Configuration**

**Update API URLs in `src/App.jsx`:**
```javascript
// Replace localhost URLs with your Render backend URL
const API_BASE_URL = 'https://your-backend-app.onrender.com';

// Update all fetch calls:
const response = await fetch(`${API_BASE_URL}/api/scam/comprehensive`, {
  // ... rest of the code
});
```

### **3.2 Create Build Configuration**

**Update `package.json` scripts:**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

**Create `render.yaml` for frontend:**
```yaml
services:
  - type: web
    name: remaleh-protect-frontend
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm run preview
    staticPublishPath: ./dist
```

### **3.3 Deploy Frontend**
1. Push your updated frontend code to GitHub
2. In Render dashboard, click "New +"
3. Select "Static Site"
4. Connect your GitHub repository
5. Configure:
   - **Name**: `remaleh-protect`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
6. Click "Create Static Site"
7. Your app will be live at: `https://your-app-name.onrender.com`

---

## 🔧 **Alternative Hosting Platforms**

### **Vercel (Frontend)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd your-frontend-folder
vercel

# Follow prompts to deploy
```

### **Netlify (Frontend)**
1. Drag and drop your `dist` folder to [netlify.com/drop](https://netlify.com/drop)
2. Or connect GitHub repository
3. Build settings:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`

### **Railway (Backend)**
1. Go to [railway.app](https://railway.app)
2. Connect GitHub repository
3. Railway auto-detects Python and deploys

### **Heroku (Backend)**
```bash
# Install Heroku CLI
# Create Procfile: web: python src/main.py

heroku create your-app-name
git push heroku main
```

---

## 🌍 **Step 4: Custom Domain (Optional)**

### **4.1 Configure Custom Domain**
1. In Render dashboard, go to your service
2. Click "Settings" → "Custom Domains"
3. Add your domain (e.g., `protect.remaleh.com.au`)
4. Update DNS records as instructed

### **4.2 SSL Certificate**
- Render automatically provides SSL certificates
- Your app will be accessible via HTTPS

---

## ⚙️ **Step 5: Environment Variables**

### **Backend Environment Variables**
```bash
# In Render dashboard → Environment
DEBUG=false
PORT=5001
FLASK_ENV=production
```

### **Frontend Environment Variables**
```bash
# Create .env file
VITE_API_URL=https://your-backend-app.onrender.com
```

**Update frontend to use environment variables:**
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
```

---

## 🔄 **Step 6: Continuous Deployment**

### **Auto-Deploy on Git Push**
1. Both Render and Vercel support auto-deployment
2. Every push to your main branch triggers a new deployment
3. Perfect for ongoing updates and improvements

### **Branch-Based Deployments**
- **Production**: Deploy from `main` branch
- **Staging**: Deploy from `develop` branch
- **Testing**: Deploy from feature branches

---

## 📊 **Step 7: Monitoring & Analytics**

### **Render Monitoring**
- Built-in metrics and logs
- Performance monitoring
- Error tracking

### **Add Analytics (Optional)**
```javascript
// Add to your frontend
// Google Analytics, Mixpanel, or similar
```

---

## 🛠️ **Troubleshooting**

### **Common Issues**

**CORS Errors:**
```python
# In your Flask app
from flask_cors import CORS
CORS(app, origins=['https://your-frontend-domain.com'])
```

**Build Failures:**
- Check Node.js version compatibility
- Verify all dependencies in package.json
- Check build logs for specific errors

**API Connection Issues:**
- Verify backend URL is correct
- Check HTTPS vs HTTP
- Ensure CORS is properly configured

---

## 💰 **Hosting Costs**

### **Render Pricing**
- **Static Sites**: Free tier available
- **Web Services**: $7/month for basic plan
- **Custom Domains**: Free

### **Alternative Costs**
- **Vercel**: Free tier, $20/month pro
- **Netlify**: Free tier, $19/month pro
- **Railway**: $5/month starter

---

## 🎯 **Next Steps**

1. **Deploy Backend** → Get your API URL
2. **Update Frontend** → Point to your API
3. **Deploy Frontend** → Get your app URL
4. **Test Everything** → Ensure all features work
5. **Custom Domain** → Use your own domain
6. **Monitor & Optimize** → Track performance

Your Remaleh Protect app will be running on your own infrastructure with complete control and customization options!

---

## 📞 **Support**

If you encounter issues:
1. Check hosting platform documentation
2. Review deployment logs
3. Test locally first
4. Verify environment variables
5. Check CORS configuration

**Your app will be production-ready and scalable! 🚀**

