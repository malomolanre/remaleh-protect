#!/usr/bin/env python3
"""
Simple API testing script for Remaleh Protect backend
"""

import requests
import json
import sys

# Test API endpoints for Remaleh Protect Backend
import requests
import json
import time

# Configuration
BASE_URL = "https://api.remalehprotect.remaleh.com.au"

def test_health_endpoints():
    """Test health and status endpoints"""
    print("🏥 Testing Health Endpoints...")
    
    try:
        # Test main health
        response = requests.get(f"{BASE_URL}/api/health")
        print(f"✅ Main Health: {response.status_code} - {response.json()}")
        
        # Test database health
        response = requests.get(f"{BASE_URL}/health/db")
        print(f"✅ Database Health: {response.status_code} - {response.json()}")
        
        # Test cache health
        response = requests.get(f"{BASE_URL}/health/cache")
        print(f"✅ Cache Health: {response.status_code} - {response.json()}")
        
    except Exception as e:
        print(f"❌ Health test failed: {e}")

def test_admin_login(email, password):
    """Test admin login"""
    print(f"\n🔐 Testing Admin Login for {email}...")
    
    try:
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": email,
            "password": password
        })
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Login successful!")
            print(f"   Access Token: {data.get('access_token', 'N/A')[:20]}...")
            print(f"   User: {data.get('user', {}).get('email', 'N/A')}")
            print(f"   Admin: {data.get('user', {}).get('is_admin', 'N/A')}")
            return data.get('access_token')
        else:
            print(f"❌ Login failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Login test failed: {e}")
        return None

def test_admin_endpoints(access_token):
    """Test admin-protected endpoints"""
    if not access_token:
        print("❌ No access token, skipping admin endpoint tests")
        return
    
    print(f"\n👑 Testing Admin Endpoints...")
    
    headers = {"Authorization": f"Bearer {access_token}"}
    
    try:
        # Test admin dashboard
        response = requests.get(f"{BASE_URL}/api/admin/dashboard", headers=headers)
        print(f"✅ Admin Dashboard: {response.status_code}")
        
        # Test user management
        response = requests.get(f"{BASE_URL}/api/admin/users", headers=headers)
        print(f"✅ User Management: {response.status_code}")
        
        # Test system maintenance
        response = requests.get(f"{BASE_URL}/api/admin/maintenance", headers=headers)
        print(f"✅ System Maintenance: {response.status_code}")
        
    except Exception as e:
        print(f"❌ Admin endpoint test failed: {e}")

def test_database_operations():
    """Test basic database operations"""
    print(f"\n🗄️ Testing Database Operations...")
    
    try:
        # Test user registration
        test_user = {
            "email": "test@example.com",
            "password": "TestPassword123!",
            "first_name": "Test",
            "last_name": "User"
        }
        
        response = requests.post(f"{BASE_URL}/api/auth/register", json=test_user)
        if response.status_code == 201:
            print(f"✅ User Registration: {response.status_code}")
        else:
            print(f"⚠️ User Registration: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"❌ Database operation test failed: {e}")

def main():
    print("🚀 Remaleh Protect Backend API Testing")
    print("=" * 50)
    
    # Test health endpoints first
    test_health_endpoints()
    
    # Test admin login
    admin_email = input("\n📧 Enter admin email (or press Enter for default): ").strip()
    if not admin_email:
        admin_email = "admin@remaleh.com"
    
    admin_password = input("🔑 Enter admin password: ").strip()
    
    if admin_password:
        access_token = test_admin_login(admin_email, admin_password)
        test_admin_endpoints(access_token)
    else:
        print("⚠️ No password provided, skipping admin tests")
    
    # Test database operations
    test_database_operations()
    
    print(f"\n🎉 Testing complete!")
    print(f"\n📋 Next steps:")
    print(f"1. Check your Render logs for admin password if needed")
    print(f"2. Set ADMIN_PASSWORD environment variable for consistent access")
    print(f"3. Test your frontend integration")

if __name__ == "__main__":
    main()
