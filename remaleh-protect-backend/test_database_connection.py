#!/usr/bin/env python3
"""
Test script to verify database connection and configuration
Run this to check if your Render PostgreSQL database is properly configured
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_database_config():
    """Test database configuration"""
    print("🔍 Testing Database Configuration...")
    print("=" * 50)
    
    # Check environment variables
    print("📋 Environment Variables:")
    print(f"  FLASK_ENV: {os.getenv('FLASK_ENV', 'Not set')}")
    print(f"  DATABASE_URL: {'Set' if os.getenv('DATABASE_URL') else 'Not set'}")
    
    if os.getenv('DATABASE_URL'):
        db_url = os.getenv('DATABASE_URL')
        # Mask password in output
        if '@' in db_url and ':' in db_url:
            parts = db_url.split('@')
            if ':' in parts[0]:
                protocol_user = parts[0].split(':')
                if len(protocol_user) >= 3:  # postgresql://user:pass@host
                    masked_url = f"{protocol_user[0]}:{protocol_user[1]}:***@{parts[1]}"
                    print(f"  DATABASE_URL: {masked_url}")
                else:
                    print(f"  DATABASE_URL: {db_url}")
            else:
                print(f"  DATABASE_URL: {db_url}")
        else:
            print(f"  DATABASE_URL: {db_url}")
    else:
        print("  ⚠️  DATABASE_URL not set - this will cause connection issues!")
    
    print(f"  RENDER: {os.getenv('RENDER', 'Not set')}")
    print(f"  PORT: {os.getenv('PORT', 'Not set')}")
    
    # Check if we're in production mode
    if os.getenv('FLASK_ENV') == 'production' or os.getenv('RENDER'):
        print("\n✅ Production mode detected")
        if not os.getenv('DATABASE_URL'):
            print("❌ ERROR: DATABASE_URL must be set in production!")
            return False
    else:
        print("\n🔧 Development mode detected")
    
    return True

def test_database_connection():
    """Test actual database connection"""
    print("\n🔌 Testing Database Connection...")
    print("=" * 50)
    
    try:
        # Import database components
        sys.path.append('src')
        from src.config import get_config
        from src.database import db_manager
        
        # Get configuration
        config = get_config()
        print(f"📊 Configuration: {config.__class__.__name__}")
        print(f"  Database URI: {config.SQLALCHEMY_DATABASE_URI}")
        
        # Test database connection
        print("\n🔄 Attempting database connection...")
        
        # Create a simple Flask app context for testing
        from flask import Flask
        app = Flask(__name__)
        app.config.from_object(config)
        
        # Initialize database manager
        db_manager.init_app(app)
        
        # Test connection
        with app.app_context():
            try:
                # Test basic connection
                from sqlalchemy import text
                result = db_manager.engine.execute(text("SELECT 1 as test"))
                row = result.fetchone()
                if row and row[0] == 1:
                    print("✅ Database connection successful!")
                    
                    # Test if tables exist
                    print("\n📋 Checking database tables...")
                    tables_result = db_manager.engine.execute(text("""
                        SELECT table_name 
                        FROM information_schema.tables 
                        WHERE table_schema = 'public'
                        ORDER BY table_name
                    """))
                    
                    tables = [row[0] for row in tables_result]
                    if tables:
                        print(f"✅ Found {len(tables)} tables:")
                        for table in tables:
                            print(f"  - {table}")
                    else:
                        print("⚠️  No tables found - database may be empty")
                    
                    return True
                    
                else:
                    print("❌ Database connection test failed")
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

def main():
    """Main test function"""
    print("🚀 Remaleh Protect Database Connection Test")
    print("=" * 60)
    
    # Test configuration
    config_ok = test_database_config()
    if not config_ok:
        print("\n❌ Configuration test failed!")
        return
    
    # Test connection
    connection_ok = test_database_connection()
    
    print("\n" + "=" * 60)
    if connection_ok:
        print("🎉 All tests passed! Database is properly configured.")
        print("\nNext steps:")
        print("1. Start your Flask application")
        print("2. Test the AdminDashboard in your frontend")
        print("3. Check the /api/health endpoint")
    else:
        print("❌ Database connection test failed!")
        print("\nTroubleshooting:")
        print("1. Check your DATABASE_URL environment variable")
        print("2. Verify your Render PostgreSQL service is running")
        print("3. Check firewall and network settings")
        print("4. Verify SSL requirements for Render PostgreSQL")

if __name__ == "__main__":
    main()
