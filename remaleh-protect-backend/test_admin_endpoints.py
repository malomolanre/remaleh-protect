#!/usr/bin/env python3
"""
Admin Endpoints Test Script for Remaleh Protect
This script tests the admin endpoints to identify the 500 error
"""

import requests
import json
import os
from datetime import datetime

# Configuration
BASE_URL = os.getenv('BACKEND_URL', 'https://api.remalehprotect.remaleh.com.au')
API_BASE = f"{BASE_URL}/api"

def test_admin_endpoints():
    """Test admin endpoints to identify 500 errors"""
    
    print("🔍 Admin Endpoints Test")
    print("=" * 50)
    print(f"Base URL: {BASE_URL}")
    print(f"API Base: {API_BASE}")
    print(f"Timestamp: {datetime.now()}")
    print()
    
    # Test admin endpoints
    print("1️⃣ Testing Admin Endpoints:")
    
    admin_endpoints = [
        f"{API_BASE}/admin/users",
        f"{API_BASE}/admin/users?page=1&per_page=10",
        f"{API_BASE}/admin/users?status=ACTIVE",
        f"{API_BASE}/admin/users?role=USER"
    ]
    
    for endpoint in admin_endpoints:
        try:
            print(f"\n   Testing: {endpoint}")
            response = requests.get(endpoint, timeout=15)
            print(f"   Status: {response.status_code} - {response.reason}")
            
            if response.status_code == 500:
                print("   ❌ 500 ERROR DETECTED!")
                print("   Response Headers:")
                for key, value in response.headers.items():
                    print(f"     {key}: {value}")
                
                print("   Response Content:")
                try:
                    if response.text:
                        print(f"     Text (first 500 chars): {response.text[:500]}")
                        
                        # Try to parse as JSON
                        try:
                            error_json = response.json()
                            print(f"     JSON Error: {json.dumps(error_json, indent=2)}")
                        except:
                            print("     Response is not valid JSON")
                    else:
                        print("     Response is empty")
                except Exception as e:
                    print(f"     Error reading response: {e}")
                    
            elif response.status_code == 401:
                print("   ✅ Endpoint accessible (requires authentication)")
            elif response.status_code == 403:
                print("   ✅ Endpoint accessible (requires admin privileges)")
            elif response.status_code == 200:
                print("   ⚠️  Endpoint accessible without authentication (security issue!)")
            else:
                print(f"   ❌ Unexpected status: {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            print(f"   ❌ Request failed: {e}")
    
    print()
    
    # Test with different HTTP methods
    print("2️⃣ Testing HTTP Methods:")
    
    methods_to_test = ['GET', 'POST', 'PUT', 'DELETE']
    
    for method in methods_to_test:
        try:
            print(f"\n   Testing {method}: {API_BASE}/admin/users")
            
            if method == 'GET':
                response = requests.get(f"{API_BASE}/admin/users", timeout=10)
            elif method == 'POST':
                response = requests.post(f"{API_BASE}/admin/users", json={}, timeout=10)
            elif method == 'PUT':
                response = requests.put(f"{API_BASE}/admin/users/1", json={}, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(f"{API_BASE}/admin/users/1", timeout=10)
            
            print(f"   Status: {response.status_code} - {response.reason}")
            
            if response.status_code == 500:
                print("   ❌ 500 ERROR!")
                print(f"   Response: {response.text[:200]}...")
                
        except requests.exceptions.RequestException as e:
            print(f"   ❌ {method} failed: {e}")
    
    print()
    
    # Test backend health and configuration
    print("3️⃣ Backend Health Check:")
    
    try:
        # Check health endpoint
        response = requests.get(f"{API_BASE}/health", timeout=10)
        if response.status_code == 200:
            print("   ✅ Health endpoint responding")
            try:
                health_data = response.json()
                print(f"   Health data: {json.dumps(health_data, indent=2)}")
            except:
                print("   Health response not JSON")
        else:
            print(f"   ❌ Health endpoint: {response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Health check failed: {e}")
    
    print()
    
    # Test database-related endpoints
    print("4️⃣ Database-Related Endpoints:")
    
    db_endpoints = [
        f"{API_BASE}/learning/modules",
        f"{API_BASE}/auth/profile",
        f"{API_BASE}/community/reports"
    ]
    
    for endpoint in db_endpoints:
        try:
            response = requests.get(endpoint, timeout=10)
            print(f"   {endpoint}: {response.status_code}")
            
            if response.status_code == 500:
                print(f"     ❌ 500 ERROR: {response.text[:100]}...")
                
        except Exception as e:
            print(f"   {endpoint}: ❌ Failed - {e}")
    
    print()
    print("=" * 50)
    print("🏁 Admin endpoints test complete!")
    
    # Summary
    print("\n📋 Summary:")
    print("If you see 500 errors, the issue is likely:")
    print("1. Database connection problems in Render")
    print("2. Missing environment variables (DATABASE_URL)")
    print("3. Backend service not properly initialized")
    print("4. Database tables missing in production")
    print("\nNext steps:")
    print("1. Check Render backend logs")
    print("2. Verify DATABASE_URL environment variable")
    print("3. Check if database service is running")

if __name__ == "__main__":
    test_admin_endpoints()
