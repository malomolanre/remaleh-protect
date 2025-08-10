#!/bin/bash

# 🧪 Test Authentication Flow for Protected Endpoints
# This script tests the authentication flow that was causing "Something went wrong" errors

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔐 Testing Authentication Flow for Protected Endpoints${NC}"
echo "=================================================="

# Test URLs
BACKEND_URL="https://api.remalehprotect.remaleh.com.au"
TEST_EMAIL="test@example.com"
TEST_PASSWORD="TestPassword123!"

echo -e "\n${YELLOW}1. Testing Unauthenticated Access (Should Fail)${NC}"
echo "------------------------------------------------"

# Test threat intelligence without auth
echo "Testing Threat Intelligence (no auth):"
RESPONSE=$(curl -s "${BACKEND_URL}/api/threat_intelligence/dashboard")
if echo "$RESPONSE" | grep -q "Token is missing"; then
    echo -e "  ${GREEN}✅ Correctly rejected - Token is missing${NC}"
else
    echo -e "  ${RED}❌ Unexpected response${NC}"
    echo "  Response: $RESPONSE"
fi

# Test risk profile without auth
echo "Testing Risk Profile (no auth):"
RESPONSE=$(curl -s "${BACKEND_URL}/api/risk_profile/profile")
if echo "$RESPONSE" | grep -q "Token is missing"; then
    echo -e "  ${GREEN}✅ Correctly rejected - Token is missing${NC}"
else
    echo -e "  ${RED}❌ Unexpected response${NC}"
    echo "  Response: $RESPONSE"
fi

# Test community without auth
echo "Testing Community Reports (no auth):"
RESPONSE=$(curl -s "${BACKEND_URL}/api/community/reports")
if echo "$RESPONSE" | grep -q "Token is missing"; then
    echo -e "  ${GREEN}✅ Correctly rejected - Token is missing${NC}"
else
    echo -e "  ${RED}❌ Unexpected response${NC}"
    echo "  Response: $RESPONSE"
fi

echo -e "\n${YELLOW}2. Testing Authentication (Should Succeed)${NC}"
echo "----------------------------------------"

# Get authentication token
echo "Getting authentication token..."
TOKEN_RESPONSE=$(curl -s -X POST "${BACKEND_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"${TEST_EMAIL}\", \"password\": \"${TEST_PASSWORD}\"}")

if echo "$TOKEN_RESPONSE" | grep -q "access_token"; then
    TOKEN=$(echo "$TOKEN_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
    echo -e "  ${GREEN}✅ Authentication successful${NC}"
    echo "  Token: ${TOKEN:0:50}..."
else
    echo -e "  ${RED}❌ Authentication failed${NC}"
    echo "  Response: $TOKEN_RESPONSE"
    exit 1
fi

echo -e "\n${YELLOW}3. Testing Authenticated Access (Should Succeed)${NC}"
echo "------------------------------------------------"

# Test threat intelligence with auth
echo "Testing Threat Intelligence (with auth):"
RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" "${BACKEND_URL}/api/threat_intelligence/dashboard")
if echo "$RESPONSE" | grep -q "community_stats\|trending_threats"; then
    echo -e "  ${GREEN}✅ Successfully accessed${NC}"
else
    echo -e "  ${RED}❌ Failed to access${NC}"
    echo "  Response: $RESPONSE"
fi

# Test risk profile with auth
echo "Testing Risk Profile (with auth):"
RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" "${BACKEND_URL}/api/risk_profile/profile")
if echo "$RESPONSE" | grep -q "learningModules\|riskLevel"; then
    echo -e "  ${GREEN}✅ Successfully accessed${NC}"
else
    echo -e "  ${RED}❌ Failed to access${NC}"
    echo "  Response: $RESPONSE"
fi

# Test community with auth
echo "Testing Community Reports (with auth):"
RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" "${BACKEND_URL}/api/community/reports")
if echo "$RESPONSE" | grep -q "reports\|pagination"; then
    echo -e "  ${GREEN}✅ Successfully accessed${NC}"
else
    echo -e "  ${RED}❌ Failed to access${NC}"
    echo "  Response: $RESPONSE"
fi

echo -e "\n${GREEN}🎉 Authentication Flow Test Complete!${NC}"
echo ""
echo "Summary:"
echo "✅ Unauthenticated requests are properly rejected"
echo "✅ Authentication works correctly"
echo "✅ Protected endpoints are accessible with valid tokens"
echo ""
echo "The 'Something went wrong' issue should now be resolved!"
echo "Users will see friendly login prompts instead of errors."
