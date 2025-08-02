import os
from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin

app = Flask(__name__)

# Simple, bulletproof CORS configuration
CORS(app)

# Import and register blueprints with error handling
try:
    from src.routes.scam import scam_bp
    app.register_blueprint(scam_bp, url_prefix='/api/scam')
    print("✅ Scam detection routes registered")
except Exception as e:
    print(f"⚠️ Scam routes error: {e}")

try:
    from src.routes.breach_check import breach_bp
    app.register_blueprint(breach_bp, url_prefix='/api/breach')
    print("✅ Breach check routes registered")
except Exception as e:
    print(f"⚠️ Breach check routes error: {e}")

try:
    from src.routes.chat import chat_bp
    app.register_blueprint(chat_bp, url_prefix='/api/chat')
    print("✅ Chat routes registered")
except Exception as e:
    print(f"⚠️ Chat routes error: {e}")

# Health check endpoint with CORS
@app.route('/health', methods=['GET'])
@cross_origin()
def health_check():
    return jsonify({
        'status': 'healthy',
        'message': 'Remaleh Protect API is running',
        'version': '2.0',
        'cors': 'enabled'
    })

# Root endpoint
@app.route('/', methods=['GET'])
@cross_origin()
def root():
    return jsonify({
        'message': 'Remaleh Protect API',
        'status': 'running',
        'endpoints': [
            '/api/scam/comprehensive',
            '/api/breach/check', 
            '/api/chat/message',
            '/health'
        ]
    })

# Test endpoint for debugging
@app.route('/test', methods=['GET', 'POST'])
@cross_origin()
def test_endpoint():
    return jsonify({
        'message': 'Test endpoint working',
        'method': request.method,
        'cors': 'working'
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    print(f"🚀 Starting Remaleh Protect API on port {port}")
    print(f"🌐 CORS enabled for all routes")
    app.run(host='0.0.0.0', port=port, debug=False)
