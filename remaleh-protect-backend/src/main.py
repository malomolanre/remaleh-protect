# Updated main.py with correct link analysis blueprint registration

from flask import Flask, jsonify
from flask_cors import CORS
import logging
import os
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create Flask app
app = Flask(__name__)
CORS(app)

# Import blueprints
try:
    from routes.chat import chat_bp
    logger.info("✅ Chat blueprint imported successfully")
except ImportError as e:
    logger.error(f"❌ Failed to import chat blueprint: {e}")
    chat_bp = None

try:
    from routes.breach_check import breach_bp
    logger.info("✅ Breach check blueprint imported successfully")
except ImportError as e:
    logger.error(f"❌ Failed to import breach check blueprint: {e}")
    breach_bp = None

try:
    from routes.scam import scam_bp
    logger.info("✅ Basic scam blueprint imported successfully")
except ImportError as e:
    logger.error(f"❌ Failed to import basic scam blueprint: {e}")
    scam_bp = None

try:
    from routes.enhanced_scam import enhanced_scam_bp
    logger.info("✅ Enhanced scam blueprint imported successfully")
except ImportError as e:
    logger.error(f"❌ Failed to import enhanced scam blueprint: {e}")
    enhanced_scam_bp = None

try:
    # FIXED: Correct import name for link analysis blueprint
    from routes.link_analysis import link_analysis_bp
    logger.info("✅ Link analysis blueprint imported successfully")
except ImportError as e:
    logger.error(f"❌ Failed to import link analysis blueprint: {e}")
    link_analysis_bp = None

# Register blueprints
if chat_bp:
    app.register_blueprint(chat_bp, url_prefix='/api')
    logger.info("✅ Chat blueprint registered at /api/chat")

if breach_bp:
    app.register_blueprint(breach_bp, url_prefix='/api/breach')
    logger.info("✅ Breach check blueprint registered at /api/breach")

if scam_bp:
    app.register_blueprint(scam_bp, url_prefix='/api/scam')
    logger.info("✅ Basic scam blueprint registered at /api/scam")

if enhanced_scam_bp:
    app.register_blueprint(enhanced_scam_bp, url_prefix='/api/enhanced-scam')
    logger.info("✅ Enhanced scam blueprint registered at /api/enhanced-scam")

if link_analysis_bp:
    # FIXED: Proper registration of link analysis blueprint
    app.register_blueprint(link_analysis_bp, url_prefix='/api/link')
    logger.info("✅ Link analysis blueprint registered at /api/link")

@app.route('/')
def root():
    """Root endpoint with service information"""
    available_endpoints = []
    
    if chat_bp:
        available_endpoints.append("/api/chat/")
    if scam_bp:
        available_endpoints.append("/api/scam/comprehensive")
    if breach_bp:
        available_endpoints.extend(["/api/breach/check", "/api/breach/health", "/api/breach/debug"])
    if enhanced_scam_bp:
        available_endpoints.append("/api/enhanced-scam/analyze")
    if link_analysis_bp:
        # FIXED: Correct endpoint paths for link analysis
        available_endpoints.extend(["/api/link/analyze", "/api/link/health", "/api/link/debug"])
    
    # Environment check
    environment_check = {
        "HIBP_API_KEY": "present" if os.getenv('HIBP_API_KEY') else "not_present",
        "OPENAI_API_KEY": "present" if os.getenv('OPENAI_API_KEY') else "not_present"
    }
    
    return jsonify({
        "message": "Remaleh Protect API - Debug Mode",
        "version": "2.0.0-debug",
        "available_endpoints": available_endpoints,
        "debug_mode": True,
        "environment_check": environment_check,
        "timestamp": datetime.now().isoformat()
    })

@app.route('/debug')
def debug_info():
    """Global debug information"""
    return jsonify({
        "service": "Remaleh Protect API",
        "debug_mode": True,
        "registered_blueprints": [
            {"name": "chat", "available": chat_bp is not None},
            {"name": "breach_check", "available": breach_bp is not None},
            {"name": "scam", "available": scam_bp is not None},
            {"name": "enhanced_scam", "available": enhanced_scam_bp is not None},
            {"name": "link_analysis", "available": link_analysis_bp is not None}
        ],
        "environment_variables": {
            "HIBP_API_KEY": "present" if os.getenv('HIBP_API_KEY') else "not_present",
            "OPENAI_API_KEY": "present" if os.getenv('OPENAI_API_KEY') else "not_present"
        },
        "timestamp": datetime.now().isoformat()
    })

if __name__ == '__main__':
    logger.info("=== FLASK APP INITIALIZATION COMPLETE ===")
    logger.info(f"Starting server on port {os.getenv('PORT', 10000)}")
    logger.info("Debug mode enabled - detailed logging active")
    
    app.run(
        host='0.0.0.0',
        port=int(os.getenv('PORT', 10000)),
        debug=True
    )
