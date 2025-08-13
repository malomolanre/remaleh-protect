#!/usr/bin/env python3
"""
Test Admin Fix Script
This script tests if the admin endpoint 500 error is fixed
"""

import requests
import os

# Configuration
BASE_URL = os.getenv('BACKEND_URL', 'https://api.remalehprotect.remaleh.com.au')
API_BASE = f"{BASE_URL}/api"

def test_admin_endpoint():
    """Test the admin users endpoint to see if 500 error is fixed"""
    
    print("🔍 Testing Admin Endpoint Fix")
    print("=" * 50)
    print(f"Testing: {API_BASE}/admin/users")
    print()
    
    try:
        # Test without authentication (should return 401, not 500)
        response = requests.get(f"{API_BASE}/admin/users", timeout=15)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.reason}")
        
        if response.status_code == 500:
            print("❌ 500 ERROR STILL EXISTS!")
            print("Response content:")
            print(response.text[:500])
        elif response.status_code == 401:
            print("✅ 500 ERROR FIXED! Endpoint now returns 401 (Unauthorized) as expected")
        else:
            print(f"⚠️  Unexpected status: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Request failed: {e}")
    
    print()
    print("=" * 50)
    print("🏁 Test complete!")

if __name__ == "__main__":
    test_admin_endpoint()
