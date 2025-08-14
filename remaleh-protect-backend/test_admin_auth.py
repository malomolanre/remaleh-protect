#!/usr/bin/env python3
"""
Test script to verify admin user authentication and database access
Run this to check if your admin user exists and can access the database
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_admin_user_exists():
    """Test if admin user exists in database"""
    print("🔍 Testing Admin User Existence...")
    print("=" * 50)
    
    try:
        # Import database components
        sys.path.append('src')
        from src.config import get_config
        from src.models import db, User
        
        # Get configuration
        config = get_config()
        print(f"📊 Configuration: {config.__class__.__name__}")
        print(f"  Database URI: {config.SQLALCHEMY_DATABASE_URI}")
        
        # Create a simple Flask app context for testing
        from flask import Flask
        app = Flask(__name__)
        app.config.from_object(config)
        
        # Initialize database
        db.init_app(app)
        
        with app.app_context():
            try:
                # Test basic connection
                from sqlalchemy import text
                result = db.session.execute(text('SELECT 1 as test'))
                row = result.fetchone()
                if row and row[0] == 1:
                    print("✅ Database connection successful!")
                else:
                    print("❌ Database connection test failed")
                    return False
                
                # Check if users table exists and has data
                print("\n📋 Checking Users Table...")
                try:
                    total_users = User.query.count()
                    print(f"✅ Users table exists with {total_users} users")
                    
                    if total_users > 0:
                        # Get all users
                        users = User.query.all()
                        print(f"\n👥 Users in database:")
                        for user in users:
                            print(f"  - ID: {user.id}")
                            print(f"    Email: {user.email}")
                            print(f"    First Name: {user.first_name}")
                            print(f"    Last Name: {user.last_name}")
                            print(f"    Role: {user.role}")
                            print(f"    Is Admin: {user.is_admin}")
                            print(f"    Status: {user.account_status}")
                            print(f"    Created: {user.created_at}")
                            print()
                    
                    # Check specifically for admin user
                    admin_users = User.query.filter_by(is_admin=True).all()
                    if admin_users:
                        print(f"✅ Found {len(admin_users)} admin user(s):")
                        for admin in admin_users:
                            print(f"  - {admin.email} (Role: {admin.role})")
                    else:
                        print("❌ No admin users found!")
                        print("This explains why the AdminDashboard can't access users!")
                        
                        # Check for users with ADMIN role
                        admin_role_users = User.query.filter_by(role='ADMIN').all()
                        if admin_role_users:
                            print(f"⚠️  Found {len(admin_role_users)} user(s) with ADMIN role but is_admin=False:")
                            for user in admin_role_users:
                                print(f"  - {user.email} (is_admin: {user.is_admin})")
                        else:
                            print("⚠️  No users with ADMIN role found either")
                    
                    return True
                    
                except Exception as e:
                    print(f"❌ Error checking users table: {e}")
                    return False
                    
            except Exception as e:
                print(f"❌ Database connection error: {e}")
                return False
                
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("Make sure you're running this from the backend directory")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def test_admin_user_creation():
    """Test admin user creation process"""
    print("\n🔧 Testing Admin User Creation...")
    print("=" * 50)
    
    try:
        # Import auth components
        sys.path.append('src')
        from src.auth import create_admin_user
        
        print("✅ Admin user creation function imported successfully")
        print("This function should be called automatically when the app starts")
        
        # Check environment variables
        admin_password = os.getenv('ADMIN_PASSWORD')
        if admin_password:
            print(f"✅ ADMIN_PASSWORD environment variable is set")
            print(f"  Password length: {len(admin_password)} characters")
        else:
            print("⚠️  ADMIN_PASSWORD environment variable not set")
            print("  A random password will be generated")
        
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def main():
    """Main test function"""
    print("🚀 Remaleh Protect Admin User Authentication Test")
    print("=" * 60)
    
    # Test admin user existence
    user_exists = test_admin_user_exists()
    
    # Test admin user creation
    creation_ok = test_admin_user_creation()
    
    print("\n" + "=" * 60)
    if user_exists and creation_ok:
        print("🎉 Admin user tests completed!")
        print("\nNext steps:")
        print("1. Check your backend logs for authentication errors")
        print("2. Verify the admin user has is_admin=True")
        print("3. Test login with the admin user")
        print("4. Check if the JWT token is being sent correctly")
    else:
        print("❌ Some tests failed!")
        print("\nTroubleshooting:")
        print("1. Check if admin user was created during app startup")
        print("2. Verify database tables exist and have data")
        print("3. Check backend logs for errors")
        print("4. Ensure ADMIN_PASSWORD environment variable is set")

if __name__ == "__main__":
    main()
