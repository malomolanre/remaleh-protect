from flask import Flask, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import logging
import os
from datetime import datetime
from models import db

# Configure logging
logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("remaleh")


def create_app():
    """
    Create and configure the Flask application.

    This function sets up CORS, rate limiting, and registers all blueprints.
    """
    app = Flask(__name__)
    
    # Database configuration
    database_url = os.getenv('DATABASE_URL', 'sqlite:///remaleh_protect.db')
    
    # Handle Render's filesystem constraints
    if database_url.startswith('sqlite:///'):
        # For local development, use file-based SQLite
        app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    else:
        # For production (Render), use the provided DATABASE_URL
        app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize database
    db.init_app(app)
    
    # Create database tables and admin user on startup
    with app.app_context():
        try:
            db.create_all()
            print("✓ Database tables created successfully")
            
            # Create admin user if it doesn't exist
            from auth import create_admin_user
            create_admin_user()
            
            # Create sample learning modules if they don't exist
            from models import LearningModule
            if LearningModule.query.count() == 0:
                sample_modules = [
                    {
                        'title': 'Phishing Awareness',
                        'description': 'Learn to identify and avoid phishing attempts',
                        'difficulty': 'BEGINNER',
                        'estimated_time': 15
                    },
                    {
                        'title': 'Password Security',
                        'description': 'Best practices for creating and managing strong passwords',
                        'difficulty': 'BEGINNER',
                        'estimated_time': 10
                    },
                    {
                        'title': 'Social Engineering',
                        'description': 'Understanding and defending against social engineering attacks',
                        'difficulty': 'INTERMEDIATE',
                        'estimated_time': 20
                    }
                ]
                
                for module_data in sample_modules:
                    module = LearningModule(**module_data)
                    db.session.add(module)
                
                db.session.commit()
                print("✓ Sample learning modules created successfully")
            
            print(f"✓ Database initialized successfully with {LearningModule.query.count()} learning modules")
            
        except Exception as e:
            print(f"❌ Database initialization error: {e}")
            import traceback
            traceback.print_exc()
            # Continue anyway - the app might still work

    # Restrict CORS origins to the production front-end and local development
    allowed_origins = [
        "https://app.remalehprotect.remaleh.com.au",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:3000"
    ]
    
    CORS(app, resources={r"/api/*": {
        "origins": allowed_origins,
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }})

    # Set up rate limiting: 60 requests per minute per IP by default
    limiter = Limiter(
        get_remote_address,
        app=app,
        default_limits=["60 per minute"],
    )

    # Import and register blueprints
    from routes.scam import scam_bp
    from routes.enhanced_scam import enhanced_scam_bp
    from routes.link_analysis import link_analysis_bp
    from routes.breach_check import breach_bp
    from routes.chat import chat_bp
    from routes.auth import auth_bp
    from routes.threat_intelligence import threat_intel_bp
    from routes.risk_profile import risk_profile_bp
    from routes.community import community_bp
    from routes.admin import admin_bp

    # Example of applying a per-route limit on a heavy endpoint:
    # @scam_bp.route('/comprehensive', methods=['POST'])
    # @limiter.limit('10 per minute')
    # def comprehensive_scan():
    #     ...

    app.register_blueprint(scam_bp, url_prefix="/api/scam")
    app.register_blueprint(enhanced_scam_bp, url_prefix="/api/scam")
    app.register_blueprint(link_analysis_bp, url_prefix="/api/link")
    app.register_blueprint(breach_bp, url_prefix="/api/breach")
    app.register_blueprint(chat_bp, url_prefix="/api/chat")
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(threat_intel_bp, url_prefix="/api/threat_intelligence")
    app.register_blueprint(risk_profile_bp, url_prefix="/api/risk_profile")
    app.register_blueprint(community_bp, url_prefix="/api/community")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")

    @app.errorhandler(429)
    def ratelimit_handler(e):
        """Return JSON when rate limit is exceeded."""
        return jsonify(error="Too many requests", description=str(e)), 429

    @app.get("/api/health")
    def health():
        """Health check endpoint."""
        return jsonify({
            "ok": True,
            "service": "remaleh-protect-api",
            "timestamp": datetime.now().isoformat()
        })
    
    @app.get("/api/test")
    def test():
        """Test endpoint for debugging deployment."""
        return jsonify({
            "message": "API is working!",
            "database_url": app.config['SQLALCHEMY_DATABASE_URI'].replace('://', '://***:***@') if '://' in app.config['SQLALCHEMY_DATABASE_URI'] else 'sqlite',
            "timestamp": datetime.now().isoformat()
        })

    return app


# Create the Flask application instance
app = create_app()


if __name__ == "__main__":
    # Start the Flask app with a dynamic port, defaulting to 10000
    port = int(os.getenv("PORT", 10000))
    logger.info(f"Starting on 0.0.0.0:{port}")
    app.run(host="0.0.0.0", port=port)
