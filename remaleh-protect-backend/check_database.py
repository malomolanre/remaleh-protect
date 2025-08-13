#!/usr/bin/env python3
"""
Database Check Script for Remaleh Protect
This script checks database connectivity and table status
"""

import os
import sys
from sqlalchemy import text, inspect
from dotenv import load_dotenv

# Add the src directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

# Load environment variables
load_dotenv()

def check_database():
    """Check database connection and tables"""
    
    print("🔍 Database Connection Check")
    print("=" * 50)
    
    # Check environment variables
    print("\n1️⃣ Environment Variables:")
    database_url = os.getenv('DATABASE_URL')
    render_env = os.getenv('RENDER')
    
    if database_url:
        # Mask sensitive parts
        if 'postgresql' in database_url:
            parts = database_url.split('@')
            if len(parts) > 1:
                masked_url = f"{parts[0].split(':')[0]}:***:***@{parts[1]}"
                print(f"   DATABASE_URL: {masked_url}")
            else:
                print(f"   DATABASE_URL: {database_url}")
        else:
            print(f"   DATABASE_URL: {database_url}")
    else:
        print("   DATABASE_URL: ❌ Not set")
    
    print(f"   RENDER: {render_env or 'Not set'}")
    
    # Try to import and initialize database
    try:
        print("\n2️⃣ Database Import Test:")
        from models import db, LearningModule, User, CommunityReport
        print("   ✅ Database models imported successfully")
        
        # Try to create a test app context
        from main import create_app
        app = create_app()
        
        with app.app_context():
            print("\n3️⃣ Database Connection Test:")
            
            # Test basic connection
            try:
                result = db.session.execute(text('SELECT 1'))
                print("   ✅ Database connection successful")
            except Exception as e:
                print(f"   ❌ Database connection failed: {e}")
                return
            
            # Check if tables exist
            print("\n4️⃣ Table Status Check:")
            inspector = inspect(db.engine)
            existing_tables = inspector.get_table_names()
            
            expected_tables = ['learning_modules', 'users', 'community_reports']
            
            for table in expected_tables:
                if table in existing_tables:
                    print(f"   ✅ {table}: Exists")
                else:
                    print(f"   ❌ {table}: Missing")
            
            # Check table contents
            print("\n5️⃣ Table Contents Check:")
            
            try:
                module_count = LearningModule.query.count()
                print(f"   Learning Modules: {module_count}")
                
                user_count = User.query.count()
                print(f"   Users: {user_count}")
                
                report_count = CommunityReport.query.count()
                print(f"   Community Reports: {report_count}")
                
            except Exception as e:
                print(f"   ❌ Error querying tables: {e}")
            
            # Try to create a test module
            print("\n6️⃣ Test Module Creation:")
            try:
                test_module = LearningModule(
                    title='Test Module',
                    description='This is a test module',
                    difficulty='BEGINNER',
                    estimated_time=5,
                    content={'lessons': []}
                )
                db.session.add(test_module)
                db.session.commit()
                print("   ✅ Test module created successfully")
                
                # Clean up test module
                db.session.delete(test_module)
                db.session.commit()
                print("   ✅ Test module cleaned up")
                
            except Exception as e:
                print(f"   ❌ Test module creation failed: {e}")
                db.session.rollback()
            
            # Check database schema
            print("\n7️⃣ Database Schema Check:")
            try:
                if 'learning_modules' in existing_tables:
                    columns = inspector.get_columns('learning_modules')
                    print(f"   Learning Module columns: {len(columns)}")
                    for col in columns:
                        print(f"     - {col['name']}: {col['type']}")
                else:
                    print("   ❌ Learning Module table not found")
                    
            except Exception as e:
                print(f"   ❌ Schema check failed: {e}")
                
    except ImportError as e:
        print(f"   ❌ Import error: {e}")
        return
    except Exception as e:
        print(f"   ❌ Unexpected error: {e}")
        return
    
    print("\n" + "=" * 50)
    print("🏁 Database check complete!")
    
    if not database_url:
        print("\n❌ CRITICAL: DATABASE_URL is not set!")
        print("   Please set this environment variable in Render")
    elif 'learning_modules' not in existing_tables:
        print("\n❌ CRITICAL: Learning Module table is missing!")
        print("   The database tables may not have been created")
        print("   Check your backend logs for initialization errors")
    else:
        print("\n✅ Database appears to be working correctly")
        print("   If you're still getting 500 errors, check:")
        print("   1. Backend logs in Render")
        print("   2. API endpoint accessibility")
        print("   3. Authentication/authorization")

if __name__ == "__main__":
    check_database()
