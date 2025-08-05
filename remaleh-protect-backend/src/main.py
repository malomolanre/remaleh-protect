"""
Main Flask application with DEBUG LOGGING ENABLED
"""
from flask import Flask, jsonify
from flask_cors import CORS
import logging
import os

# Enable comprehensive logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),  # Console output
        logging.FileHandler('app.log') if os.path.exists('/tmp') else logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

def create_app():
    app = Flask(__name__)
    
    # Enable CORS for all routes
    CORS(app)
    
    # Set Flask to debug mode
    app.config['DEBUG'] = True
    app.config['TESTING'] = False
    
    logger.info("=== REMALEH PROTECT BACKEND STARTING ===")
    logger.info(f"Debug mode: {app.config['DEBUG']}")
    
    # Import and register blueprints
    try:
        from routes.chat import chat_bp
        app.register_blueprint(chat_bp, url_prefix='/api/chat')
        logger.info("✅ Chat blueprint registered at /api/chat")
    except ImportError as e:
        logger.error(f"❌ Failed to import chat blueprint: {e}")
    
    try:
        from routes.scam import scam_bp
        app.register_blueprint(scam_bp, url_prefix='/api/scam')
        logger.info("✅ Scam blueprint registered at /api/scam")
    except ImportError as e:
        logger.error(f"❌ Failed to import scam blueprint: {e}")
    
    try:
        from routes.breach_check import breach_bp
        app.register_blueprint(breach_bp, url_prefix='/api/breach')
        logger.info("✅ Breach check blueprint registered at /api/breach")
    except ImportError as e:
        logger.error(f"❌ Failed to import breach_check blueprint: {e}")
    
    try:
        from routes.enhanced_scam import enhanced_scam_bp
        app.register_blueprint(enhanced_scam_bp, url_prefix='/api/enhanced-scam')
        logger.info("✅ Enhanced scam blueprint registered at /api/enhanced-scam")
    except ImportError as e:
        logger.warning(f"⚠️ Enhanced scam blueprint not available: {e}")
    
    try:
        from routes.link_analysis import link_bp
        app.register_blueprint(link_bp, url_prefix='/api/link')
        logger.info("✅ Link analysis blueprint registered at /api/link")
    except ImportError as e:
        logger.warning(f"⚠️ Link analysis blueprint not available: {e}")
    
    @app.route('/')
    def home():
        logger.info("Root endpoint accessed")
        return jsonify({
            'message': 'Remaleh Protect API - Debug Mode',
            'version': '2.0.0-debug',
            'debug_mode': True,
            'available_endpoints': [
                '/api/chat/',
                '/api/scam/comprehensive',
                '/api/breach/check',
                '/api/breach/health',
                '/api/breach/debug',
                '/api/enhanced-scam/analyze',
                '/api/link/analyze'
            ],
            'environment_check': {
                'HIBP_API_KEY': 'present' if os.getenv('HIBP_API_KEY') else 'missing',
                'OPENAI_API_KEY': 'present' if os.getenv('OPENAI_API_KEY') else 'missing'
            }
        })
    
    @app.route('/debug')
    def debug_info():
        """Global debug endpoint"""
        logger.info("Global debug info requested")
        
        return jsonify({
            'flask_debug': app.config['DEBUG'],
            'environment_variables': {
                'HIBP_API_KEY': 'present' if os.getenv('HIBP_API_KEY') else 'missing',
                'OPENAI_API_KEY': 'present' if os.getenv('OPENAI_API_KEY') else 'missing',
                'FLASK_ENV': os.getenv('FLASK_ENV', 'not_set')
            },
            'registered_blueprints': list(app.blueprints.keys()),
            'logging_level': logging.getLogger().level,
            'all_routes': [str(rule) for rule in app.url_map.iter_rules()]
        })
    
    @app.errorhandler(404)
    def not_found(error):
        logger.warning(f"404 error: {error}")
        return jsonify({'error': 'Endpoint not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        logger.error(f"500 error: {error}")
        return jsonify({'error': 'Internal server error'}), 500
    
    # Log all requests in debug mode
    @app.before_request
    def log_request_info():
        from flask import request
        logger.debug(f"Request: {request.method} {request.url}")
        logger.debug(f"Headers: {dict(request.headers)}")
        if request.is_json:
            logger.debug(f"JSON data: {request.get_json()}")
    
    @app.after_request
    def log_response_info(response):
        logger.debug(f"Response status: {response.status_code}")
        return response
    
    logger.info("=== FLASK APP INITIALIZATION COMPLETE ===")
    return app

if __name__ == '__main__':
    app = create_app()
    
    # Get port from environment or default to 5000
    port = int(os.environ.get('PORT', 5000))
    
    logger.info(f"Starting server on port {port}")
    logger.info("Debug mode enabled - detailed logging active")
    
    app.run(host='0.0.0.0', port=port, debug=True)

