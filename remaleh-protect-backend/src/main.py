from flask import Flask, jsonify, request, g
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import logging
import os
from datetime import datetime
import time

# Import production modules - try relative imports first, then absolute
try:
    from .config import get_config
    from .cache import cache
    from .database import db_manager
    from .monitoring import monitor, track_performance
    from .models import db
except ImportError:
    from config import get_config
    from cache import cache
    from database import db_manager
    from monitoring import monitor, track_performance
    from models import db

# Configure logging
logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("remaleh")

def create_app():
    """
    Create and configure the Flask application with production features.

    This function sets up CORS, rate limiting, caching, monitoring, and registers all blueprints.
    """
    app = Flask(__name__)
    
    # Load production configuration
    app.config.from_object(get_config())
    
    # Initialize production modules
    cache.init_app(app)
    db_manager.init_app(app)
    monitor.init_app(app)
    
    # Initialize database
    db.init_app(app)
    
    # Create database tables and admin user on startup
    with app.app_context():
        try:
            db.create_all()
            logger.info("✓ Database tables created successfully")
            
            # Create admin user if it doesn't exist
            try:
                from .auth import create_admin_user
            except ImportError:
                from auth import create_admin_user
            create_admin_user()
            
            # Create sample learning modules if they don't exist
            try:
                from .models import LearningModule
            except ImportError:
                from models import LearningModule
            if LearningModule.query.count() == 0:
                sample_modules = [
                    {
                        'title': 'Phishing Awareness',
                        'description': 'Learn to identify and avoid phishing attempts',
                        'difficulty': 'BEGINNER',
                        'estimated_time': 15,
                        'content': {
                            'lessons': [
                                {
                                    'id': 1,
                                    'title': 'What is Phishing?',
                                    'content': 'Phishing is a cyber attack where attackers pretend to be legitimate organizations to steal sensitive information.',
                                    'duration': 5,
                                    'type': 'info'
                                },
                                {
                                    'id': 2,
                                    'title': 'Common Phishing Signs',
                                    'content': 'Learn to spot urgent language, suspicious links, and requests for sensitive information.',
                                    'duration': 5,
                                    'type': 'info'
                                },
                                {
                                    'id': 3,
                                    'title': 'How to Protect Yourself',
                                    'content': 'Never click suspicious links, verify sender addresses, and use multi-factor authentication.',
                                    'duration': 5,
                                    'type': 'info'
                                }
                            ]
                        }
                    },
                    {
                        'title': 'Password Security',
                        'description': 'Best practices for creating and managing strong passwords',
                        'difficulty': 'BEGINNER',
                        'estimated_time': 10,
                        'content': {
                            'lessons': [
                                {
                                    'id': 1,
                                    'title': 'Creating Strong Passwords',
                                    'content': 'Use at least 12 characters with a mix of letters, numbers, and symbols.',
                                    'duration': 5,
                                    'type': 'info'
                                },
                                {
                                    'id': 2,
                                    'title': 'Password Managers',
                                    'content': 'Use a password manager to generate and store unique passwords securely.',
                                    'duration': 5,
                                    'type': 'info'
                                }
                            ]
                        }
                    },
                    {
                        'title': 'Social Engineering',
                        'description': 'Understanding and defending against social engineering attacks',
                        'difficulty': 'INTERMEDIATE',
                        'estimated_time': 20,
                        'content': {
                            'lessons': [
                                {
                                    'id': 1,
                                    'title': 'Types of Social Engineering',
                                    'content': 'Learn about pretexting, baiting, quid pro quo, and tailgating attacks.',
                                    'duration': 8,
                                    'type': 'info'
                                },
                                {
                                    'id': 2,
                                    'title': 'Defense Strategies',
                                    'content': 'Verify identities, be suspicious of unsolicited requests, and train your team.',
                                    'duration': 7,
                                    'type': 'info'
                                },
                                {
                                    'id': 3,
                                    'title': 'Real-World Examples',
                                    'content': 'Study actual social engineering attacks to understand the tactics used.',
                                    'duration': 5,
                                    'type': 'info'
                                }
                            ]
                        }
                    }
                ]
                
                for module_data in sample_modules:
                    module = LearningModule(**module_data)
                    db.session.add(module)
                
                db.session.commit()
                logger.info("✓ Sample learning modules created successfully")
            
            logger.info(f"✓ Database initialized successfully with {LearningModule.query.count()} learning modules")
            
        except Exception as e:
            logger.error(f"❌ Database initialization error: {e}")
            import traceback
            traceback.print_exc()

    # Restrict CORS origins to local development and production
    allowed_origins = [
        "http://localhost:5173",  # Vite dev server
        "http://localhost:5174",  # Vite dev server alternative
        "http://localhost:5175",  # Vite dev server alternative
        "http://localhost:3000",  # Alternative dev server
        "https://app.remalehprotect.remaleh.com.au",  # Production Render frontend
        "https://api.remalehprotect.remaleh.com.au"   # Production Render backend
    ]
    
    # Add additional production domains from environment variables
    production_frontend = os.getenv('FRONTEND_URL')
    if production_frontend and production_frontend not in allowed_origins:
        allowed_origins.append(production_frontend)
        logger.info(f"Added production frontend to CORS: {production_frontend}")
    
    production_backend = os.getenv('BACKEND_URL')
    if production_backend and production_backend not in allowed_origins:
        allowed_origins.append(production_backend)
        logger.info(f"Added production backend to CORS: {production_backend}")
    
    CORS(app, resources={r"/api/*": {
        "origins": allowed_origins,
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }})

    # Set up rate limiting with Redis storage
    limiter = Limiter(
        get_remote_address,
        app=app,
        default_limits=[app.config.get('RATE_LIMIT_DEFAULT', '60 per minute')],
        storage_uri=app.config.get('RATE_LIMIT_STORAGE_URL'),
        strategy=app.config.get('RATE_LIMIT_STRATEGY', 'fixed-window')
    )

    # Import and register blueprints
    try:
        from .routes.scam import scam_bp
        from .routes.enhanced_scam import enhanced_scam_bp
        from .routes.link_analysis import link_analysis_bp
        from .routes.breach_check import breach_bp
        from .routes.chat import chat_bp
        from .routes.auth import auth_bp
        from .routes.community import community_bp
        from .routes.admin import admin_bp
        from .routes.learning_content import learning_content_bp
    except ImportError:
        from routes.scam import scam_bp
        from routes.enhanced_scam import enhanced_scam_bp
        from routes.link_analysis import link_analysis_bp
        from routes.breach_check import breach_bp
        from routes.chat import chat_bp
        from routes.auth import auth_bp
        from routes.community import community_bp
        from routes.admin import admin_bp
        from routes.learning_content import learning_content_bp

    # Register blueprints
    try:
        app.register_blueprint(scam_bp, url_prefix="/api/scam")
        logger.info("✓ Scam analysis blueprint registered at /api/scam")
        
        app.register_blueprint(enhanced_scam_bp, url_prefix="/api/enhanced-scam")
        logger.info("✓ Enhanced scam detection blueprint registered at /api/enhanced-scam")
        
        app.register_blueprint(link_analysis_bp, url_prefix="/api/link")
        logger.info("✓ Link analysis blueprint registered at /api/link")
        
        app.register_blueprint(breach_bp, url_prefix="/api/breach")
        logger.info("✓ Breach checker blueprint registered at /api/breach")
        
        app.register_blueprint(chat_bp, url_prefix="/api/chat")
        logger.info("✓ Chat assistant blueprint registered at /api/chat")
        
        app.register_blueprint(auth_bp, url_prefix="/api/auth")
        logger.info("✓ Authentication blueprint registered at /api/auth")
        
        app.register_blueprint(community_bp, url_prefix="/api/community")
        logger.info("✓ Community hub blueprint registered at /api/community")
        
        app.register_blueprint(admin_bp, url_prefix="/api/admin")
        logger.info("✓ Admin panel blueprint registered at /api/admin")
        
        app.register_blueprint(learning_content_bp, url_prefix="/api/learning")
        logger.info("✓ Learning content blueprint registered at /api/learning")
        
        logger.info("✓ All security analysis blueprints registered successfully")
        
    except Exception as e:
        logger.error(f"❌ Error registering blueprints: {e}")
        raise

    @app.errorhandler(429)
    def ratelimit_handler(e):
        """Return JSON when rate limit is exceeded."""
        return jsonify(error="Too many requests", description=str(e)), 429

    @app.errorhandler(500)
    def internal_error(e):
        """Handle internal server errors."""
        logger.error(f"Internal server error: {e}")
        return jsonify(error="Internal server error"), 500

    @app.before_request
    def before_request():
        """Log request details and start timing."""
        g.start_time = time.time()
        logger.info(f"Request: {request.method} {request.path} from {request.remote_addr}")

    @app.after_request
    def after_request(response):
        """Log response details and timing."""
        duration = time.time() - g.start_time
        logger.info(f"Response: {response.status_code} in {duration:.3f}s")
        return response

    @app.get("/api/health")
    @track_performance
    def health():
        """Health check endpoint with database and cache status."""
        db_status = db_manager.health_check() if db_manager else False
        cache_status = cache.redis_client.ping() if cache.redis_client else False
        
        return jsonify({
            "ok": True,
            "service": "remaleh-protect-api",
            "timestamp": datetime.now().isoformat(),
            "database": "healthy" if db_status else "unhealthy",
            "cache": "healthy" if cache_status else "unhealthy",
            "environment": app.config.get('FLASK_ENV', 'development')
        })
    
    @app.get("/api/test")
    @track_performance
    def test():
        """Test endpoint for debugging deployment."""
        return jsonify({
            "message": "API is working!",
            "database_url": app.config['SQLALCHEMY_DATABASE_URI'].replace('://', '://***:***@') if '://' in app.config['SQLALCHEMY_DATABASE_URI'] else 'sqlite',
            "timestamp": datetime.now().isoformat(),
            "cache_enabled": cache.redis_client is not None,
            "monitoring_enabled": monitor.redis_client is not None
        })

    @app.get("/api/security/status")
    @track_performance
    def security_status():
        """Security analysis services status endpoint."""
        return jsonify({
            "service": "remaleh-protect-security-engine",
            "status": "operational",
            "timestamp": datetime.now().isoformat(),
            "available_services": {
                "scam_analysis": "/api/scam/comprehensive",
                "enhanced_scam_detection": "/api/enhanced-scam/analyze",
                "link_analysis": "/api/link/analyze-url",
                "breach_checker": "/api/breach/check",
                "chat_assistant": "/api/chat/",
                "community_hub": "/api/community/",
                "admin_panel": "/api/admin/"
            },
            "capabilities": [
                "Advanced text pattern analysis",
                "ML-based scam detection",
                "URL and link security analysis",
                "Email breach checking",
                "Real-time threat intelligence",
                "Community-driven security reporting"
            ],
            "version": "2.0.0"
        })

    @app.get("/api/metrics")
    def metrics():
        """Prometheus metrics endpoint."""
        if app.config.get('ENABLE_METRICS', True):
            return monitor.get_metrics()
        else:
            return jsonify({"error": "Metrics disabled"}), 404

    @app.get("/api/performance")
    @track_performance
    def performance():
        """Performance summary endpoint."""
        if app.config.get('ENABLE_METRICS', True):
            return jsonify({
                "database": db_manager.get_connection_info() if db_manager else {"status": "not_initialized"},
                "performance_summary": monitor.get_performance_summary(),
                "cache_status": "connected" if cache.redis_client else "disconnected"
            })
        else:
            return jsonify({"error": "Performance monitoring disabled"}), 404

    return app


# Create the Flask application instance
app = create_app()


if __name__ == "__main__":
    # Start the Flask app with a dynamic port, defaulting to 10000
    port = int(os.getenv("PORT", 10000))
    logger.info(f"Starting on 0.0.0.0:{port}")
    app.run(host="0.0.0.0", port=port)
