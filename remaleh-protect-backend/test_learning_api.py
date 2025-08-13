#!/usr/bin/env python3
"""
Learning API Test Script for Remaleh Protect
This script tests the learning content endpoints
"""

import requests
import json
import os
from datetime import datetime

# Configuration
BASE_URL = os.getenv('BACKEND_URL', 'https://api.remalehprotect.remaleh.com.au')
API_BASE = f"{BASE_URL}/api"

def test_learning_api():
    """Test learning content API endpoints"""
    
    print("🔍 Learning API Endpoint Test")
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
        f"{API_BASE}/learning/next-lesson",
    ]
    
    for endpoint in endpoints_to_test:
        try:
            response = requests.get(endpoint, timeout=10)
            print(f"   {endpoint}: {response.status_code} - {response.reason}")
            
            if response.status_code == 401:
                print("   ✅ Endpoint accessible (requires authentication)")
            elif response.status_code == 200:
                print("   ⚠️  Endpoint accessible without authentication (security issue!)")
            elif response.status_code == 500:
                print("   ❌ Server error (500) - Check backend logs!")
                # Try to get error details
                try:
                    error_data = response.json()
                    print(f"      Error details: {error_data}")
                except:
                    print(f"      Response text: {response.text[:200]}...")
            else:
                print(f"   ❌ Unexpected status: {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            print(f"   ❌ Error accessing {endpoint}: {e}")
    
    print()
    
    # Test 2: Check backend health
    print("2️⃣ Testing backend health...")
    
    try:
        # Try to access a health endpoint or root
        health_endpoints = [
            f"{BASE_URL}/",
            f"{BASE_URL}/health",
            f"{BASE_URL}/api/health"
        ]
        
        for endpoint in health_endpoints:
            try:
                response = requests.get(endpoint, timeout=10)
                print(f"   {endpoint}: {response.status_code}")
                if response.status_code == 200:
                    print("   ✅ Backend is responding")
                    break
            except:
                continue
        else:
            print("   ❌ No health endpoints responded")
            
    except Exception as e:
        print(f"   ❌ Health check failed: {e}")
    
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
    
    # Test 6: Detailed error analysis for 500 errors
    print("6️⃣ Detailed 500 Error Analysis...")
    
    try:
        response = requests.get(f"{API_BASE}/learning/modules", timeout=15)
        
        if response.status_code == 500:
            print("   ❌ Got 500 error - analyzing response...")
            
            # Check response headers
            print(f"   Content-Type: {response.headers.get('Content-Type', 'Not set')}")
            print(f"   Content-Length: {response.headers.get('Content-Length', 'Not set')}")
            
            # Try to get response content
            try:
                if response.text:
                    print(f"   Response text (first 500 chars): {response.text[:500]}")
                    
                    # Try to parse as JSON
                    try:
                        error_json = response.json()
                        print(f"   JSON error: {json.dumps(error_json, indent=2)}")
                    except:
                        print("   Response is not valid JSON")
                else:
                    print("   Response is empty")
            except Exception as e:
                print(f"   Error reading response: {e}")
        else:
            print(f"   ✅ No 500 error (status: {response.status_code})")
            
    except Exception as e:
        print(f"   ❌ Error during detailed analysis: {e}")
    
    print()
    print("=" * 50)
    print("🏁 Learning API test complete!")
    print()
    
    if any("500" in line for line in print.__self__.output if hasattr(print, '__self__')):
        print("📋 500 Error Detected - Next Steps:")
        print("1. Check Render backend logs for specific error details")
        print("2. Verify DATABASE_URL environment variable is set correctly")
        print("3. Check if database tables exist (run check_database.py)")
        print("4. Verify database connection in Render")
        print("5. Check if backend service is running properly")
    else:
        print("📋 All endpoints responding correctly")
        print("   If you're still having issues, check:")
        print("   1. Frontend authentication")
        print("   2. User permissions")
        print("   3. Network connectivity")

if __name__ == "__main__":
    test_learning_api()
