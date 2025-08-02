# 🛡️ Remaleh Protect - Complete Cybersecurity Suite

## 📋 Overview

Remaleh Protect is a comprehensive, user-friendly cybersecurity application that provides advanced scam detection, password breach monitoring, cybersecurity education, and AI-powered expert help. Built with privacy-first principles and cost-effective local AI processing.

## ✨ Features

### 🔍 **Smart Scam Detection**
- Advanced AI-powered text analysis
- Multiple scam category detection
- Local processing for complete privacy
- Instant results with clear safety recommendations

### 🔐 **Password Breach Monitoring**
- HaveIBeenPwned integration
- Email breach checking
- Privacy-protected queries
- Clear visual results

### 📚 **Cybersecurity Education**
- Comprehensive safety guides
- Latest threat awareness
- Easy-to-understand content
- Perfect for all technical levels

### 🤖 **AI-Powered Help Chat**
- Intelligent conversation analysis
- Automatic expert routing
- Category-specific assistance
- Human specialist escalation

## 🏗️ Architecture

### **Frontend (React + Vite)**
- Modern React application
- Mobile-first responsive design
- Tailwind CSS styling
- Capacitor-ready for mobile apps

### **Backend (Flask + Python)**
- RESTful API architecture
- Local ML/AI processing
- Multiple endpoint support
- Production-ready deployment

## 🚀 Quick Start

### **Local Development**

```bash
# Clone the repository
git clone <your-repo-url>
cd remaleh-protect

# Start backend
cd remaleh-protect-backend
pip install -r requirements.txt
python src/main.py

# Start frontend (new terminal)
cd remaleh-protect-frontend
npm install
npm run dev
```

### **Docker Deployment**

```bash
# Run entire stack with Docker
docker-compose up -d

# Access application
# Frontend: http://localhost:3000
# Backend: http://localhost:5001
```

## 📦 Deployment Options

### **1. Render Deployment**
- Use included `render.yaml` configuration
- Automatic deployments from Git
- Free tier available

### **2. Vercel/Netlify (Frontend)**
- Static site deployment
- Automatic builds from Git
- Global CDN distribution

### **3. Heroku/Railway (Backend)**
- Use included `Procfile`
- Easy Git-based deployment
- Automatic scaling

### **4. Docker Containers**
- Use included Dockerfiles
- Deploy to any container platform
- Kubernetes-ready

## 📱 Mobile App Development

### **Convert to Mobile Apps**

```bash
# Install Capacitor
cd remaleh-protect-frontend
npm install @capacitor/core @capacitor/cli

# Initialize mobile platforms
npx cap init "Remaleh Protect" "com.remaleh.protect"
npx cap add ios
npx cap add android

# Build and deploy
npm run build
npx cap copy
npx cap open ios     # For iOS
npx cap open android # For Android
```

## 🔧 Configuration

### **Environment Variables**

**Backend (.env):**
```
DEBUG=false
FLASK_ENV=production
PORT=5001
```

**Frontend (.env):**
```
VITE_API_URL=https://your-backend-url.com
```

### **Customization**

**Branding:**
- Update logo in `src/assets/`
- Modify colors in `src/index.css`
- Change app name in `index.html`

**API Endpoints:**
- Add new routes in `src/routes/`
- Update frontend API calls in `src/App.jsx`

## 📊 API Documentation

### **Scam Detection**
```
POST /api/scam/comprehensive
Body: { "text": "message to analyze" }
Response: { "is_dangerous": boolean, "risk_score": number, ... }
```

### **Breach Checking**
```
POST /api/breach/check
Body: { "email": "user@example.com" }
Response: { "breaches_found": number, "is_compromised": boolean, ... }
```

### **Chat Support**
```
POST /api/chat/message
Body: { "message": "user message" }
Response: { "response": "ai response", "escalate_to_human": boolean, ... }
```

## 🛠️ Development

### **Project Structure**

```
remaleh-protect/
├── remaleh-protect-frontend/    # React application
│   ├── src/
│   │   ├── App.jsx             # Main application
│   │   ├── index.css           # Styles
│   │   └── main.jsx            # Entry point
│   ├── public/                 # Static assets
│   ├── package.json            # Dependencies
│   └── vite.config.js          # Build config
├── remaleh-protect-backend/     # Flask API
│   ├── src/
│   │   ├── main.py             # Flask app
│   │   ├── routes/             # API endpoints
│   │   └── models/             # Data models
│   ├── requirements.txt        # Python dependencies
│   └── Procfile               # Deployment config
├── docker-compose.yml          # Full stack deployment
└── README.md                   # This file
```

### **Adding New Features**

1. **Backend API Endpoint:**
   - Create new route in `src/routes/`
   - Register blueprint in `src/main.py`
   - Test with curl or Postman

2. **Frontend Feature:**
   - Add new component/function in `src/App.jsx`
   - Update UI and navigation
   - Connect to backend API

3. **Mobile Feature:**
   - Add Capacitor plugin if needed
   - Update mobile-specific code
   - Test on device/simulator

## 🧪 Testing

### **Backend Testing**
```bash
# Test API endpoints
curl -X POST http://localhost:5001/api/scam/comprehensive \
  -H "Content-Type: application/json" \
  -d '{"text": "URGENT! You won $1,000,000!"}'
```

### **Frontend Testing**
```bash
# Run development server
npm run dev

# Build for production
npm run build
```

### **Mobile Testing**
```bash
# Test on iOS simulator
npx cap run ios

# Test on Android emulator
npx cap run android
```

## 📈 Performance

### **Optimization Features**
- Local AI processing (no external API calls)
- Efficient React rendering
- Optimized build with Vite
- Responsive design for all devices

### **Monitoring**
- Built-in health check endpoints
- Error handling and logging
- Performance metrics available

## 🔒 Security

### **Privacy Features**
- All processing happens locally
- No data sent to external services
- User data never stored
- HTTPS-ready deployment

### **Security Best Practices**
- Input validation and sanitization
- CORS configuration
- Secure headers
- Rate limiting ready

## 📄 License

This project is proprietary software owned by Remaleh. All rights reserved.

## 🤝 Support

For support and questions:
- Website: [remaleh.com.au](https://remaleh.com.au)
- Email: support@remaleh.com.au

## 🚀 Deployment Checklist

### **Before Deployment:**
- [ ] Update API URLs in frontend
- [ ] Set production environment variables
- [ ] Test all features locally
- [ ] Build and test production builds
- [ ] Configure domain and SSL

### **After Deployment:**
- [ ] Test all features on live site
- [ ] Monitor performance and errors
- [ ] Set up analytics (optional)
- [ ] Configure backups
- [ ] Plan update strategy

## 🎯 Roadmap

### **Planned Features**
- [ ] Multi-language support
- [ ] Advanced threat intelligence
- [ ] User accounts and history
- [ ] Enterprise features
- [ ] API rate limiting
- [ ] Advanced analytics

---

**Built with ❤️ by the Remaleh team**

*Protecting users from cyber threats with privacy-first, cost-effective solutions.*

