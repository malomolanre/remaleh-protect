from flask import Flask
from flask_cors import CORS

# Import all route blueprints
from routes.scam import scam_bp
from routes.breach_check import breach_bp
from routes.enhanced_scam import enhanced_scam_bp
from routes.link_analysis import link_analysis_bp
from routes.chat import chat_bp

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    """API information endpoint"""
    return {
        "message": "Remaleh Protect API",
        "version": "2.0",
        "endpoints": {
            "scam_detection": "/api/scam/comprehensive",
            "enhanced_scam": "/api/enhanced-scam/analyze", 
            "breach_check": "/api/breach/check",
            "link_analysis": "/api/link/analyze",
            "chat_support": "/api/chat/"
        },
        "status": "active",
        "description": "Comprehensive cybersecurity analysis API"
    }

@app.route('/health')
def health():
    """Global health check endpoint"""
    return {
        "status": "healthy", 
        "service": "remaleh-protect-api",
        "version": "2.0"
    }

# Register all blueprints with proper URL prefixes
app.register_blueprint(scam_bp, url_prefix='/api/scam')
app.register_blueprint(breach_bp, url_prefix='/api/breach')
app.register_blueprint(enhanced_scam_bp, url_prefix='/api/enhanced-scam')
app.register_blueprint(link_analysis_bp, url_prefix='/api/link')
app.register_blueprint(chat_bp, url_prefix='/api/chat')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

