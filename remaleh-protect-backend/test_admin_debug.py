#!/usr/bin/env python3
"""
Test script to debug admin endpoint issues
"""

import requests
import json

def test_admin_with_valid_token():
    """Test admin endpoints with a valid token"""
    
    # First, try to login to get a valid token
    login_url = "https://api.remalehprotect.remaleh.com.au/api/auth/login"
    login_data = {
        "email": "admin@remaleh.com",
        "password": "admin123"
    }
    
    print("🔐 Attempting to login...")
    try:
        login_response = requests.post(login_url, json=login_data)
        print(f"Login status: {login_response.status_code}")
        
        if login_response.status_code == 200:
            login_result = login_response.json()
            access_token = login_result.get('access_token')
            
            if access_token:
                print("✅ Login successful, got access token")
                print(f"Token: {access_token[:20]}...")
                
                # Test admin users endpoint
                headers = {"Authorization": f"Bearer {access_token}"}
                users_url = "https://api.remalehprotect.remaleh.com.au/api/admin/users"
                
                print("\n🔍 Testing admin users endpoint...")
                users_response = requests.get(users_url, headers=headers)
                print(f"Users endpoint status: {users_response.status_code}")
                print(f"Response: {users_response.text}")
                
                # Test admin stats endpoint
                stats_url = "https://api.remalehprotect.remaleh.com.au/api/admin/stats"
                print("\n📊 Testing admin stats endpoint...")
                stats_response = requests.get(stats_url, headers=headers)
                print(f"Stats endpoint status: {stats_response.status_code}")
                print(f"Response: {stats_response.text}")
                
            else:
                print("❌ No access token in response")
                print(f"Response: {login_result}")
        else:
            print(f"❌ Login failed: {login_response.status_code}")
            print(f"Response: {login_response.text}")
            
    except Exception as e:
        print(f"❌ Error during test: {e}")

if __name__ == "__main__":
    test_admin_with_valid_token()
