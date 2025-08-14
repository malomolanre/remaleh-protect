#!/usr/bin/env python3
"""
Manual admin user creation script
Use this if the automatic admin user creation failed during app startup
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def create_admin_user_manually():
    """Manually create an admin user"""
    print("🔧 Manual Admin User Creation")
    print("=" * 50)
    
    try:
        # Import required components
        sys.path.append('src')
        from src.config import get_config
        from src.models import db, User
        from src.auth import create_admin_user
        
        # Get configuration
        config = get_config()
        print(f"📊 Configuration: {config.__class__.__name__}")
        print(f"  Database URI: {config.SQLALCHEMY_DATABASE_URI}")
        
        # Create Flask app context
        from flask import Flask
        app = Flask(__name__)
        app.config.from_object(config)
        
        # Initialize database
        db.init_app(app)
        
        with app.app_context():
            try:
                # Test database connection
                print("\n🔌 Testing database connection...")
                from sqlalchemy import text
                result = db.session.execute(text('SELECT 1 as test'))
                row = result.fetchone()
                if row and row[0] == 1:
                    print("✅ Database connection successful!")
                else:
                    print("❌ Database connection failed")
                    return False
                
                # Check if admin user already exists
                print("\n👥 Checking existing users...")
                existing_admin = User.query.filter_by(email='admin@remaleh.com').first()
                
                if existing_admin:
                    print(f"✅ Admin user already exists: {existing_admin.email}")
                    print(f"  ID: {existing_admin.id}")
                    print(f"  Role: {existing_admin.role}")
                    print(f"  Is Admin: {existing_admin.is_admin}")
                    print(f"  Status: {existing_admin.account_status}")
                    
                    # Check if admin privileges are correct
                    if existing_admin.is_admin and existing_admin.role == 'ADMIN':
                        print("✅ Admin user has correct privileges")
                        
                        # Test password
                        admin_password = os.getenv('ADMIN_PASSWORD', 'admin123')
                        if existing_admin.check_password(admin_password):
                            print("✅ Admin password is working")
                            print(f"  You can login with: admin@remaleh.com / {admin_password}")
                        else:
                            print("⚠️  Admin password is not working")
                            print("  Updating password...")
                            existing_admin.set_password(admin_password)
                            db.session.commit()
                            print(f"✅ Password updated to: {admin_password}")
                    else:
                        print("⚠️  Admin user exists but lacks privileges")
                        print("  Updating privileges...")
                        existing_admin.is_admin = True
                        existing_admin.role = 'ADMIN'
                        existing_admin.account_status = 'ACTIVE'
                        db.session.commit()
                        print("✅ Admin privileges updated")
                else:
                    print("❌ Admin user does not exist")
                    print("  Creating admin user...")
                    
                    # Create admin user
                    create_admin_user()
                    
                    # Verify creation
                    new_admin = User.query.filter_by(email='admin@remaleh.com').first()
                    if new_admin:
                        print("✅ Admin user created successfully")
                        print(f"  Email: {new_admin.email}")
                        print(f"  Role: {new_admin.role}")
                        print(f"  Is Admin: {new_admin.is_admin}")
                        
                        # Get password from environment or use default
                        admin_password = os.getenv('ADMIN_PASSWORD', 'admin123')
                        print(f"  Password: {admin_password}")
                    else:
                        print("❌ Failed to create admin user")
                        return False
                
                # Show all users
                print("\n📋 All users in database:")
                all_users = User.query.all()
                for user in all_users:
                    print(f"  - {user.email} (Role: {user.role}, Admin: {user.is_admin})")
                
                return True
                
            except Exception as e:
                print(f"❌ Error: {e}")
                import traceback
                print(f"Full traceback: {traceback.format_exc()}")
                return False
                
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def main():
    """Main function"""
    print("🚀 Remaleh Protect - Manual Admin User Creation")
    print("=" * 60)
    
    success = create_admin_user_manually()
    
    print("\n" + "=" * 60)
    if success:
        print("🎉 Admin user setup completed successfully!")
        print("\nNext steps:")
        print("1. Restart your backend service")
        print("2. Try logging in with admin@remaleh.com")
        print("3. Test the AdminDashboard")
        print("4. Check if users are now loading")
    else:
        print("❌ Admin user setup failed!")
        print("\nTroubleshooting:")
        print("1. Check your database connection")
        print("2. Verify environment variables are set")
        print("3. Check backend logs for errors")
        print("4. Ensure database tables exist")

if __name__ == "__main__":
    main()
