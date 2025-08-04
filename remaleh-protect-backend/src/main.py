from flask import Flask
from flask_cors import CORS

# Import only the routes that exist
try:
    from routes.scam import scam_bp
except ImportError:
    scam_bp = None

try:
    from routes.breach_check import breach_bp
except ImportError:
    breach_bp = None

try:
    from routes.enhanced_scam import enhanced_scam_bp
except ImportError:
    enhanced_scam_bp = None

try:
    from routes.link_analysis import link_analysis_bp
except ImportError:
    link_analysis_bp = None

try:
    from routes.chat import chat_bp
except ImportError:
    chat_bp = None

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    available_endpoints = {}
    
    if scam_bp:
        available_endpoints["scam_detection"] = "/api/scam/"
    if enhanced_scam_bp:
        available_endpoints["enhanced_scam"] = "/api/enhanced-scam/"
    if breach_bp:
        available_endpoints["breach_check"] = "/api/breach/"
    if link_analysis_bp:
        available_endpoints["link_analysis"] = "/api/link/"
    if chat_bp:
        available_endpoints["chat_support"] = "/api/chat/"
    
    return {
        "message": "Remaleh Protect API",
        "version": "2.0",
        "endpoints": available_endpoints,
        "status": "active"
    }

@app.route('/health')
def health():
    return {"status": "healthy", "service": "remaleh-protect-api"}

# Register only the blueprints that exist
if scam_bp:
    app.register_blueprint(scam_bp, url_prefix='/api/scam')

if breach_bp:
    app.register_blueprint(breach_bp, url_prefix='/api/breach')

if enhanced_scam_bp:
    app.register_blueprint(enhanced_scam_bp, url_prefix='/api/enhanced-scam')

if link_analysis_bp:
    app.register_blueprint(link_analysis_bp, url_prefix='/api/link')

if chat_bp:
    app.register_blueprint(chat_bp, url_prefix='/api/chat')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

