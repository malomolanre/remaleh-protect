#!/bin/bash

# 🚀 Render Testing Setup Script
# This script helps you set up testing for your Render deployment

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Remaleh Protect Render Testing Setup${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "test_render_deployment.sh" ]; then
    echo -e "${RED}❌ Please run this script from the project root directory${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Prerequisites Check${NC}"
echo "====================="

# Check if curl is available
if command -v curl &> /dev/null; then
    echo -e "${GREEN}✅ curl is available${NC}"
else
    echo -e "${RED}❌ curl is not available. Please install curl first.${NC}"
    exit 1
fi

# Check if we have the testing files
if [ -f "RENDER_TESTING_GUIDE.md" ]; then
    echo -e "${GREEN}✅ Testing guide found${NC}"
else
    echo -e "${RED}❌ Testing guide not found${NC}"
fi

if [ -f "test_render_deployment.sh" ]; then
    echo -e "${GREEN}✅ Testing script found${NC}"
else
    echo -e "${RED}❌ Testing script not found${NC}"
fi

echo ""

echo -e "${YELLOW}🔧 Configuration Setup${NC}"
echo "======================="

# Check if environment file exists
if [ -f "render_env.env" ]; then
    echo -e "${GREEN}✅ Environment file found${NC}"
    echo "Current configuration:"
    cat render_env.env
else
    echo -e "${YELLOW}⚠️  Environment file not found${NC}"
    echo "Creating from example..."
    
    if [ -f "render_env_example.env" ]; then
        cp render_env_example.env render_env.env
        echo -e "${GREEN}✅ Environment file created${NC}"
        echo ""
        echo -e "${YELLOW}📝 Please edit render_env.env with your actual Render service URLs${NC}"
        echo "You can find these URLs in your Render dashboard:"
        echo "1. Go to https://dashboard.render.com/"
        echo "2. Find your backend and frontend services"
        echo "3. Copy the URLs and update render_env.env"
        echo ""
        echo -e "${BLUE}Example:${NC}"
        echo "BACKEND_URL=https://remaleh-protect-api.onrender.com"
        echo "FRONTEND_URL=https://remaleh-protect-frontend.onrender.com"
    else
        echo -e "${RED}❌ Example environment file not found${NC}"
    fi
fi

echo ""

echo -e "${YELLOW}📚 Documentation${NC}"
echo "==============="

if [ -f "remaleh-protect-backend/RENDER_DEPLOYMENT.md" ]; then
    echo -e "${GREEN}✅ Backend deployment guide found${NC}"
else
    echo -e "${RED}❌ Backend deployment guide not found${NC}"
fi

if [ -f "remaleh-protect-frontend/RENDER_DEPLOYMENT.md" ]; then
    echo -e "${GREEN}✅ Frontend deployment guide found${NC}"
else
    echo -e "${RED}❌ Frontend deployment guide not found${NC}"
fi

echo ""

echo -e "${YELLOW}🎯 Next Steps${NC}"
echo "============="
echo "1. ${BLUE}Deploy your services to Render${NC}"
echo "   - Backend: Follow remaleh-protect-backend/RENDER_DEPLOYMENT.md"
echo "   - Frontend: Follow remaleh-protect-frontend/RENDER_DEPLOYMENT.md"
echo ""
echo "2. ${BLUE}Update environment variables${NC}"
echo "   - Edit render_env.env with your actual Render URLs"
echo "   - Set environment variables in Render dashboard"
echo ""
echo "3. ${BLUE}Run tests${NC}"
echo "   - Source environment: source render_env.env"
echo "   - Run tests: ./test_render_deployment.sh"
echo ""
echo "4. ${BLUE}Manual testing${NC}"
echo "   - Open frontend in browser"
echo "   - Check browser console for API logs"
echo "   - Test all features manually"
echo ""

echo -e "${GREEN}✅ Setup completed!${NC}"
echo ""
echo -e "${BLUE}For detailed instructions, see: RENDER_TESTING_GUIDE.md${NC}"
