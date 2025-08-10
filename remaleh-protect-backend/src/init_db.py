#!/usr/bin/env python3
"""
Database initialization script for Remaleh Protect Backend
This script creates the SQLite database and all required tables
"""

import os
import sys
from pathlib import Path

# Add the src directory to the Python path
sys.path.append(str(Path(__file__).parent))

from main import create_app
from models import db
from auth import create_admin_user

def init_database():
    """Initialize the database with all tables and sample data"""
    app = create_app()
    
    with app.app_context():
        # Create all tables
        print("Creating database tables...")
        db.create_all()
        print("✓ Database tables created successfully")
        
        # Create admin user if it doesn't exist
        print("Setting up admin user...")
        try:
            create_admin_user()
            print("✓ Admin user created successfully")
        except Exception as e:
            print(f"⚠ Admin user setup: {e}")
        
        print("\n🎉 Database initialization completed!")
        print("You can now start the backend server with: python src/main.py")

if __name__ == "__main__":
    # Ensure we're in the right directory
    if not os.path.exists("src/models.py"):
        print("❌ Error: Please run this script from the remaleh-protect-backend directory")
        sys.exit(1)
    
    init_database()
