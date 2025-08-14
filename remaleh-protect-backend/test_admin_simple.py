#!/usr/bin/env python3
"""
Simple test to check admin route structure
"""

import requests

def test_admin_route_structure():
    """Test if admin routes are accessible (should return 401, not 500)"""
    
    print("🔍 Testing Admin Route Structure")
    print("=" * 50)
    
    # Test admin users endpoint without auth (should return 401)
    users_url = "https://api.remalehprotect.remaleh.com.au/api/admin/users"
    print(f"\nTesting: {users_url}")
    
    try:
        response = requests.get(users_url)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text[:200]}...")
        
        if response.status_code == 401:
            print("✅ Route structure working - returns 401 as expected")
        elif response.status_code == 500:
            print("❌ Route structure broken - returns 500 error")
        else:
            print(f"⚠️ Unexpected status: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test admin stats endpoint without auth (should return 401)
    stats_url = "https://api.remalehprotect.remaleh.com.au/api/admin/stats"
    print(f"\nTesting: {stats_url}")
    
    try:
        response = requests.get(stats_url)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text[:200]}...")
        
        if response.status_code == 401:
            print("✅ Route structure working - returns 401 as expected")
        elif response.status_code == 500:
            print("❌ Route structure broken - returns 500 error")
        else:
            print(f"⚠️ Unexpected status: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_admin_route_structure()
