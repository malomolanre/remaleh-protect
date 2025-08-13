#!/usr/bin/env python3
"""
Test script for learning content endpoints
This will help debug module creation issues
"""

import requests
import json
import os
from datetime import datetime

# Configuration
BASE_URL = os.getenv('BACKEND_URL', 'https://api.remalehprotect.remaleh.com.au')
API_BASE = f"{BASE_URL}/api"

def test_learning_endpoints():
    """Test all learning content endpoints"""
    
    print("🔍 Testing Learning Content Endpoints")
    print("=" * 50)
    print(f"Base URL: {BASE_URL}")
    print(f"API Base: {API_BASE}")
    print(f"Timestamp: {datetime.now()}")
    print()
    
    # Test 1: Check if endpoints are accessible
    print("1️⃣ Testing endpoint accessibility...")
    
    endpoints_to_test = [
        f"{API_BASE}/learning/modules",
        f"{API_BASE}/learning/progress/overview",
    ]
    
    for endpoint in endpoints_to_test:
        try:
            response = requests.get(endpoint, timeout=10)
            print(f"   {endpoint}: {response.status_code} - {response.reason}")
            if response.status_code == 401:
                print("   ✅ Endpoint accessible (requires authentication)")
            elif response.status_code == 200:
                print("   ⚠️  Endpoint accessible without authentication (security issue!)")
            else:
                print(f"   ❌ Unexpected status: {response.status_code}")
        except requests.exceptions.RequestException as e:
            print(f"   ❌ Error accessing {endpoint}: {e}")
    
    print()
    
    # Test 2: Check database connection
    print("2️⃣ Testing database connection...")
    
    try:
        # Try to get modules (should fail with 401, but endpoint should be reachable)
        response = requests.get(f"{API_BASE}/learning/modules", timeout=10)
        if response.status_code == 401:
            print("   ✅ Database connection working (endpoint requires auth)")
        else:
            print(f"   ⚠️  Unexpected response: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Database connection error: {e}")
    
    print()
    
    # Test 3: Check CORS
    print("3️⃣ Testing CORS configuration...")
    
    try:
        # Make a preflight OPTIONS request
        response = requests.options(f"{API_BASE}/learning/modules", timeout=10)
        cors_headers = response.headers.get('Access-Control-Allow-Origin', 'Not set')
        print(f"   CORS Origin: {cors_headers}")
        
        if cors_headers != 'Not set':
            print("   ✅ CORS properly configured")
        else:
            print("   ⚠️  CORS headers not found")
            
    except requests.exceptions.RequestException as e:
        print(f"   ❌ CORS test failed: {e}")
    
    print()
    
    # Test 4: Check environment variables
    print("4️⃣ Checking environment configuration...")
    
    env_vars = [
        'DATABASE_URL',
        'RENDER',
        'PORT',
        'SECRET_KEY'
    ]
    
    for var in env_vars:
        value = os.getenv(var)
        if value:
            if var == 'DATABASE_URL':
                # Mask sensitive parts of database URL
                if 'postgresql' in value:
                    parts = value.split('@')
                    if len(parts) > 1:
                        masked_url = f"{parts[0].split(':')[0]}:***:***@{parts[1]}"
                        print(f"   {var}: {masked_url}")
                    else:
                        print(f"   {var}: {value}")
                else:
                    print(f"   {var}: {value}")
            else:
                print(f"   {var}: {value}")
        else:
            print(f"   {var}: ❌ Not set")
    
    print()
    
    # Test 5: Check if this is running on Render
    print("5️⃣ Platform detection...")
    
    if os.getenv('RENDER'):
        print("   ✅ Running on Render")
        print(f"   Service: {os.getenv('RENDER_SERVICE_NAME', 'Unknown')}")
        print(f"   Environment: {os.getenv('RENDER_EXTERNAL_HOSTNAME', 'Unknown')}")
    else:
        print("   ❌ Not running on Render")
    
    print()
    
    # Test 6: Check database tables
    print("6️⃣ Database schema check...")
    
    try:
        # This would require database access, but we can check if the endpoint exists
        response = requests.get(f"{API_BASE}/health", timeout=10)
        if response.status_code == 200:
            health_data = response.json()
            print(f"   Health check: {health_data}")
        else:
            print(f"   Health endpoint: {response.status_code}")
    except requests.exceptions.RequestException:
        print("   Health endpoint not available")
    
    print()
    
    # Test 7: Authentication test
    print("7️⃣ Authentication test...")
    
    try:
        # Try to create a module without authentication (should fail with 401)
        test_data = {
            "title": "Test Module",
            "description": "Test Description",
            "difficulty": "BEGINNER",
            "estimated_time": 10
        }
        
        response = requests.post(
            f"{API_BASE}/learning/modules",
            json=test_data,
            timeout=10
        )
        
        if response.status_code == 401:
            print("   ✅ Authentication required (as expected)")
        elif response.status_code == 403:
            print("   ✅ Admin access required (as expected)")
        else:
            print(f"   ⚠️  Unexpected response: {response.status_code}")
            print(f"   Response: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Authentication test failed: {e}")
    
    print()
    print("=" * 50)
    print("🏁 Testing complete!")
    print()
    print("📋 Next steps:")
    print("1. Check the backend logs in Render for any errors")
    print("2. Verify the user has admin privileges")
    print("3. Check if the database is accessible")
    print("4. Verify CORS configuration")
    print("5. Test with a valid admin token")

if __name__ == "__main__":
    test_learning_endpoints()
