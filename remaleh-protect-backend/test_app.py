#!/usr/bin/env python3
"""
Test script to verify the Flask app can be created and run
"""

import os
import sys

# Add the src directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

def test_app_creation():
    """Test that the Flask app can be created"""
    try:
        from main import create_app
        app = create_app()
        print("✅ Flask app created successfully!")
        print(f"✅ App name: {app.name}")
        print("✅ App environment:", app.config.get("ENV", "production"))
        return True
    except Exception as e:
        print(f"❌ Error creating Flask app: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_gunicorn():
    """Test that gunicorn can be imported"""
    try:
        import gunicorn
        print("✅ Gunicorn available!")
        return True
    except ImportError as e:
        print(f"❌ Gunicorn not available: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Testing Flask app creation...")
    app_ok = test_app_creation()
    
    print("\n🧪 Testing Gunicorn availability...")
    gunicorn_ok = test_gunicorn()
    
    if app_ok and gunicorn_ok:
        print("\n🎉 All tests passed! Your app is ready for Render deployment.")
        print("\n📋 Next steps:")
        print("1. Update your Render start command to:")
        print("   gunicorn --bind 0.0.0.0:$PORT --workers 4 --worker-class sync --timeout 30 --keep-alive 2 --max-requests 1000 --max-requests-jitter 100 src.main:app")
        print("2. Make sure your build command is:")
        print("   pip install -r requirements.txt")
        print("3. Deploy!")
    else:
        print("\n❌ Some tests failed. Please check the errors above.")
        sys.exit(1)
