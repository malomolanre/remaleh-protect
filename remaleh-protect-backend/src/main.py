import os
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)

# Configure CORS to allow requests from any origin
CORS(app, origins=['*'])

# Import and register blueprints
try:
    from src.routes.scam import scam_bp
    app.register_blueprint(scam_bp, url_prefix='/api/scam')
    print("✅ Scam detection routes registered")
except ImportError as e:
    print(f"⚠️ Could not import scam routes: {e}")

try:
    from src.routes.breach_check import breach_bp
    app.register_blueprint(breach_bp, url_prefix='/api/breach')
    print("✅ Breach check routes registered")
except ImportError as e:
    print(f"⚠️ Could not import breach check routes: {e}")

try:
    from src.routes.chat import chat_bp
    app.register_blueprint(chat_bp, url_prefix='/api/chat')
    print("✅ Chat routes registered")
except ImportError as e:
    print(f"⚠️ Could not import chat routes: {e}")

# Health check endpoint
@app.route('/health')
@app.route('/api/health')
def health_check():
    return {
        'status': 'healthy',
        'message': 'Remaleh Protect API is running',
        'version': '2.0'
    }

# Root endpoint
@app.route('/')
def root():
    return {
        'message': 'Remaleh Protect API',
        'status': 'running',
        'endpoints': [
            '/api/scam/comprehensive',
            '/api/breach/check', 
            '/api/chat/message',
            '/health'
        ]
    }

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'
    
    print(f"🚀 Starting Remaleh Protect API on port {port}")
    print(f"🔧 Debug mode: {debug}")
    
    app.run(host='0.0.0.0', port=port, debug=debug)
