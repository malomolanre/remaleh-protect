#!/bin/bash

# 🧪 Render Deployment Testing Script
# This script tests your Remaleh Protect backend and frontend on Render

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration - Your actual Render service URLs
BACKEND_URL="https://api.remalehprotect.remaleh.com.au"
FRONTEND_URL="https://app.remalehprotect.remaleh.com.au"

echo -e "${BLUE}🧪 Remaleh Protect Render Deployment Testing${NC}"
echo -e "${BLUE}=============================================${NC}"
echo ""

# Function to test endpoint
test_endpoint() {
    local endpoint=$1
    local method=${2:-GET}
    local data=${3:-""}
    local description=${4:-"Testing $endpoint"}
    
    echo -e "${YELLOW}${description}...${NC}"
    
    if [ "$method" = "POST" ] && [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$BACKEND_URL$endpoint")
    fi
    
    # Split response and status code
    http_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✅ Success (HTTP $http_code)${NC}"
        echo "Response: $response_body" | head -c 200
        if [ ${#response_body} -gt 200 ]; then
            echo "..."
        fi
    else
        echo -e "${RED}❌ Failed (HTTP $http_code)${NC}"
        echo "Response: $response_body"
    fi
    echo ""
}

# Function to test frontend
test_frontend() {
    echo -e "${YELLOW}Testing frontend accessibility...${NC}"
    
    if curl -s -f "$FRONTEND_URL" > /dev/null; then
        echo -e "${GREEN}✅ Frontend is accessible${NC}"
    else
        echo -e "${RED}❌ Frontend is not accessible${NC}"
    fi
    echo ""
}

# Check if backend URL is configured
if [ "$BACKEND_URL" = "https://your-backend-service.onrender.com" ]; then
    echo -e "${RED}⚠️  Please update the BACKEND_URL variable in this script${NC}"
    echo -e "${YELLOW}Current value: $BACKEND_URL${NC}"
    echo ""
fi

# Check if frontend URL is configured
if [ "$FRONTEND_URL" = "https://your-frontend-service.onrender.com" ]; then
    echo -e "${RED}⚠️  Please update the FRONTEND_URL variable in this script${NC}"
    echo -e "${YELLOW}Current value: $FRONTEND_URL${NC}"
    echo ""
fi

echo -e "${BLUE}🔧 Testing Backend Endpoints${NC}"
echo "================================"

# Test basic endpoints
test_endpoint "/api/health" "GET" "" "Health check"
test_endpoint "/api/test" "GET" "" "Basic API test"
test_endpoint "/api/performance" "GET" "" "Performance metrics"

echo -e "${BLUE}🔐 Testing Authentication Endpoints${NC}"
echo "====================================="

# Test authentication endpoints
test_endpoint "/api/auth/register" "POST" '{"email": "test'$(date +%s)'@example.com", "password": "TestPassword123!", "first_name": "Test", "last_name": "User"}' "User registration"
test_endpoint "/api/auth/login" "POST" '{"email": "test@example.com", "password": "TestPassword123!"}' "User login"

echo -e "${BLUE}🛡️ Testing Security Features${NC}"
echo "================================="

# Test security features
test_endpoint "/api/breach/check" "POST" '{"email": "test@example.com"}' "Breach checking"
test_endpoint "/api/scam/comprehensive" "POST" '{"url": "https://example.com", "description": "Test scam description", "text": "This is a test scam description for testing purposes"}' "Scam analysis"
test_endpoint "/api/link/analyze" "POST" '{"url": "https://example.com", "text": "This is a test link for analysis"}' "Link analysis"

echo -e "${BLUE}🌐 Testing Frontend${NC}"
echo "====================="

# Test frontend
test_frontend

echo -e "${BLUE}📊 Summary${NC}"
echo "=========="
echo -e "${GREEN}✅ Testing completed!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Check the results above for any failed endpoints"
echo "2. Review Render service logs for detailed error information"
echo "3. Verify environment variables are set correctly in Render dashboard"
echo "4. Test the frontend manually in a browser"
echo "5. Check mobile app functionality if applicable"
echo ""
echo -e "${BLUE}For detailed testing instructions, see: RENDER_TESTING_GUIDE.md${NC}"
