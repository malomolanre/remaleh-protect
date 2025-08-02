import os
import sys
from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin

app = Flask(__name__)
CORS(app)

# Add the src directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

print("🔍 Attempting to import routes...")

# Import and register scam routes
try:
    from routes.scam import scam_bp
    app.register_blueprint(scam_bp, url_prefix='/api/scam')
    print("✅ Scam detection routes registered successfully")
except ImportError as e:
    print(f"❌ Failed to import scam routes: {e}")
    # Create a simple fallback route
    @app.route('/api/scam/comprehensive', methods=['POST'])
    @cross_origin()
    def fallback_scam_analysis():
        try:
            data = request.get_json()
            text = data.get('text', '')
            
            # Simple analysis
            risk_score = 0
            threats = []
            
            if any(word in text.lower() for word in ['urgent', 'winner', 'prize', 'million']):
                risk_score = 85
                threats = ['Urgency pressure', 'Financial fraud']
            else:
                risk_score = 15
                threats = []
            
            return jsonify({
                'overall_assessment': {
                    'risk_level': 'HIGH' if risk_score > 70 else 'LOW',
                    'risk_score': risk_score,
                    'message': f'Analysis complete. Risk level: {"HIGH" if risk_score > 70 else "LOW"}'
                },
                'threats_detected': threats,
                'text_analysis': {
                    'length': len(text),
                    'word_count': len(text.split()),
                    'suspicious_patterns': len(threats)
                },
                'link_analysis': {
                    'urls_found': [],
                    'url_count': 0
                }
            })
        except Exception as e:
            return jsonify({'error': str(e)}), 500

# Import other routes with fallbacks
try:
    from routes.breach_check import breach_bp
    app.register_blueprint(breach_bp, url_prefix='/api/breach')
    print("✅ Breach check routes registered")
except ImportError as e:
    print(f"❌ Breach check routes error: {e}")

try:
    from routes.chat import chat_bp
    app.register_blueprint(chat_bp, url_prefix='/api/chat')
    print("✅ Chat routes registered")
except ImportError as e:
    print(f"❌ Chat routes error: {e}")

@app.route('/health', methods=['GET'])
@cross_origin()
def health_check():
    return jsonify({
        'status': 'healthy',
        'message': 'Remaleh Protect API is running',
        'version': '2.0',
        'cors': 'enabled'
    })

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
