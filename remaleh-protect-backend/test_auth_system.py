#!/usr/bin/env python3
"""
Comprehensive Authentication System Test Script
Tests all authentication endpoints and functionality
"""

import requests
import json
import time
import sys
from urllib.parse import urljoin

# Configuration
BASE_URL = "http://localhost:10000"
API_BASE = f"{BASE_URL}/api"

def test_endpoint(method, endpoint, data=None, headers=None, expected_status=200):
    """Test an API endpoint and return the response"""
    url = urljoin(API_BASE, endpoint)
    
    try:
        if method.upper() == 'GET':
            response = requests.get(url, headers=headers)
        elif method.upper() == 'POST':
            response = requests.post(url, json=data, headers=headers)
        elif method.upper() == 'PUT':
            response = requests.put(url, json=data, headers=headers)
        else:
            print(f"❌ Unsupported method: {method}")
            return None
            
        print(f"  {method} {endpoint} -> {response.status_code}")
        
        if response.status_code == expected_status:
            print(f"    ✅ Expected status {expected_status}")
        else:
            print(f"    ❌ Expected status {expected_status}, got {response.status_code}")
            
        if response.status_code == 200 or response.status_code == 201:
            try:
                response_data = response.json()
                print(f"    📄 Response: {json.dumps(response_data, indent=2)}")
            except:
                print(f"    📄 Response: {response.text}")
        else:
            try:
                error_data = response.json()
                print(f"    ❌ Error: {json.dumps(error_data, indent=2)}")
            except:
                print(f"    ❌ Error: {response.text}")
                
        return response
        
    except requests.exceptions.ConnectionError:
        print(f"  ❌ Connection failed - Is the backend running on {BASE_URL}?")
        return None
    except Exception as e:
        print(f"  ❌ Request failed: {e}")
        return None

def test_authentication_system():
    """Test the complete authentication system"""
    print("🔐 Testing Remaleh Protect Authentication System")
    print("=" * 60)
    
    # Test 1: Check if backend is running
    print("\n1️⃣ Testing Backend Availability")
    print("-" * 40)
    
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        print(f"✅ Backend health check: {response.status_code}")
    except:
        print(f"⚠️  Backend health check failed - trying to continue...")
    
    # Test 2: Test registration endpoint
    print("\n2️⃣ Testing User Registration")
    print("-" * 40)
    
    test_user = {
        "email": "test@example.com",
        "password": "TestPassword123!",
        "first_name": "Test",
        "last_name": "User"
    }
    
    register_response = test_endpoint('POST', '/auth/register', test_user, expected_status=201)
    
    if not register_response or register_response.status_code != 201:
        print("❌ Registration failed - cannot continue with other tests")
        return False
    
    # Extract tokens from registration
    try:
        register_data = register_response.json()
        access_token = register_data.get('access_token')
        refresh_token = register_data.get('refresh_token')
        
        if not access_token or not refresh_token:
            print("❌ No tokens received from registration")
            return False
            
        print(f"✅ Registration successful - tokens received")
        
    except Exception as e:
        print(f"❌ Failed to parse registration response: {e}")
        return False
    
    # Test 3: Test login endpoint
    print("\n3️⃣ Testing User Login")
    print("-" * 40)
    
    login_data = {
        "email": test_user["email"],
        "password": test_user["password"]
    }
    
    login_response = test_endpoint('POST', '/auth/login', login_data, expected_status=200)
    
    if not login_response or login_response.status_code != 200:
        print("❌ Login failed")
        return False
    
    # Extract tokens from login
    try:
        login_data = login_response.json()
        login_access_token = login_data.get('access_token')
        login_refresh_token = login_data.get('refresh_token')
        
        if not login_access_token or not login_refresh_token:
            print("❌ No tokens received from login")
            return False
            
        print(f"✅ Login successful - tokens received")
        
    except Exception as e:
        print(f"❌ Failed to parse login response: {e}")
        return False
    
    # Test 4: Test profile endpoint with authentication
    print("\n4️⃣ Testing Authenticated Profile Access")
    print("-" * 40)
    
    auth_headers = {
        "Authorization": f"Bearer {access_token}"
    }
    
    profile_response = test_endpoint('GET', '/auth/profile', headers=auth_headers, expected_status=200)
    
    if not profile_response or profile_response.status_code != 200:
        print("❌ Profile access failed")
        return False
    
    # Test 5: Test token refresh
    print("\n5️⃣ Testing Token Refresh")
    print("-" * 40)
    
    refresh_data = {
        "refresh_token": refresh_token
    }
    
    refresh_response = test_endpoint('POST', '/auth/refresh', refresh_data, expected_status=200)
    
    if not refresh_response or refresh_response.status_code != 200:
        print("❌ Token refresh failed")
        return False
    
    # Test 6: Test logout
    print("\n6️⃣ Testing User Logout")
    print("-" * 40)
    
    logout_response = test_endpoint('POST', '/auth/logout', headers=auth_headers, expected_status=200)
    
    if not logout_response or logout_response.status_code != 200:
        print("❌ Logout failed")
        return False
    
    # Test 7: Test profile access after logout (should fail)
    print("\n7️⃣ Testing Profile Access After Logout")
    print("-" * 40)
    
    profile_after_logout = test_endpoint('GET', '/auth/profile', headers=auth_headers, expected_status=401)
    
    if profile_after_logout and profile_after_logout.status_code == 401:
        print("✅ Profile access correctly blocked after logout")
    else:
        print("❌ Profile access not properly blocked after logout")
    
    # Test 8: Test admin user creation
    print("\n8️⃣ Testing Admin User Setup")
    print("-" * 40)
    
    admin_check_response = test_endpoint('GET', '/auth/debug/admin-check', expected_status=200)
    
    if admin_check_response and admin_check_response.status_code == 200:
        try:
            admin_data = admin_check_response.json()
            admin_exists = admin_data.get('admin_exists', False)
            if admin_exists:
                print("✅ Admin user exists and is properly configured")
            else:
                print("⚠️  Admin user does not exist")
        except:
            print("⚠️  Could not parse admin check response")
    else:
        print("❌ Admin check failed")
    
    # Test 9: Test deployment check
    print("\n9️⃣ Testing Deployment Configuration")
    print("-" * 40)
    
    deployment_check = test_endpoint('GET', '/auth/deployment-check', expected_status=200)
    
    if deployment_check and deployment_check.status_code == 200:
        try:
            deployment_data = deployment_check.json()
            env_vars = deployment_data.get('deployment_info', {}).get('environment_variables', {})
            
            print("📋 Environment Variables Status:")
            for key, value in env_vars.items():
                status = "✅" if value else "❌"
                print(f"    {status} {key}: {value}")
                
        except:
            print("⚠️  Could not parse deployment check response")
    else:
        print("❌ Deployment check failed")
    
    print("\n" + "=" * 60)
    print("🎉 Authentication System Test Complete!")
    
    return True

if __name__ == "__main__":
    print("🚀 Starting Authentication System Tests...")
    
    try:
        success = test_authentication_system()
        if success:
            print("\n✅ All tests completed successfully!")
            sys.exit(0)
        else:
            print("\n❌ Some tests failed!")
            sys.exit(1)
    except KeyboardInterrupt:
        print("\n⏹️  Tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 Unexpected error: {e}")
        sys.exit(1)
