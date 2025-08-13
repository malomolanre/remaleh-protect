#!/usr/bin/env python3
"""
Test script to verify blueprint imports work correctly
"""

import sys
import os

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

def test_blueprint_imports():
    """Test that all blueprints can be imported"""
    try:
        print("Testing blueprint imports...")
        
        # Test learning_content blueprint import
        from routes.learning_content import learning_content_bp
        print(f"✓ learning_content_bp imported successfully: {learning_content_bp.name}")
        
        # Test other blueprints
        from routes.scam import scam_bp
        print(f"✓ scam_bp imported successfully: {scam_bp.name}")
        
        from routes.enhanced_scam import enhanced_scam_bp
        print(f"✓ enhanced_scam_bp imported successfully: {enhanced_scam_bp.name}")
        
        from routes.link_analysis import link_analysis_bp
        print(f"✓ link_analysis_bp imported successfully: {link_analysis_bp.name}")
        
        from routes.breach_check import breach_bp
        print(f"✓ breach_bp imported successfully: {breach_bp.name}")
        
        from routes.chat import chat_bp
        print(f"✓ chat_bp imported successfully: {chat_bp.name}")
        
        from routes.auth import auth_bp
        print(f"✓ auth_bp imported successfully: {auth_bp.name}")
        
        from routes.community import community_bp
        print(f"✓ community_bp imported successfully: {community_bp.name}")
        
        from routes.admin import admin_bp
        print(f"✓ admin_bp imported successfully: {admin_bp.name}")
        
        print("\n✅ All blueprints imported successfully!")
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def test_blueprint_registration():
    """Test that blueprints can be registered to a Flask app"""
    try:
        print("\nTesting blueprint registration...")
        
        from flask import Flask
        
        # Create a test Flask app
        app = Flask(__name__)
        
        # Import blueprints
        from routes.learning_content import learning_content_bp
        from routes.scam import scam_bp
        from routes.enhanced_scam import enhanced_scam_bp
        from routes.link_analysis import link_analysis_bp
        from routes.breach_check import breach_bp
        from routes.chat import chat_bp
        from routes.auth import auth_bp
        from routes.community import community_bp
        from routes.admin import admin_bp
        
        # Register blueprints
        app.register_blueprint(scam_bp, url_prefix="/api/scam")
        app.register_blueprint(enhanced_scam_bp, url_prefix="/api/enhanced-scam")
        app.register_blueprint(link_analysis_bp, url_prefix="/api/link")
        app.register_blueprint(breach_bp, url_prefix="/api/breach")
        app.register_blueprint(chat_bp, url_prefix="/api/chat")
        app.register_blueprint(auth_bp, url_prefix="/api/auth")
        app.register_blueprint(community_bp, url_prefix="/api/community")
        app.register_blueprint(admin_bp, url_prefix="/api/admin")
        app.register_blueprint(learning_content_bp, url_prefix="/api/learning")
        
        print("✅ All blueprints registered successfully!")
        
        # Print registered routes
        routes = list(app.url_map.iter_rules())
        print(f"\nRegistered routes: {len(routes)}")
        for rule in routes:
            if rule.endpoint.startswith('learning_content.'):
                print(f"  - {rule.rule} -> {rule.endpoint}")
        
        return True
        
    except Exception as e:
        print(f"❌ Blueprint registration error: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Testing Remaleh Protect Backend Blueprint System\n")
    
    # Test imports
    imports_ok = test_blueprint_imports()
    
    if imports_ok:
        # Test registration
        registration_ok = test_blueprint_registration()
        
        if registration_ok:
            print("\n🎉 All tests passed! Your backend is ready to run.")
            sys.exit(0)
        else:
            print("\n❌ Blueprint registration failed.")
            sys.exit(1)
    else:
        print("\n❌ Blueprint imports failed.")
        sys.exit(1)
