from flask import Flask, jsonify
from flask_cors import CORS
import logging
import os
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("remaleh")


def create_app():
    """Create and configure the Flask application."""
    app = Flask(__name__)

    # Restrict CORS origins to the production front-end and local development
    CORS(app, resources={r"/api/*": {
        "origins": [
            "https://app.remalehprotect.remaleh.com.au",
            "http://localhost:5173"
        ]
    }})

    # Import and register blueprints
    from routes.scam import scam_bp
    from routes.enhanced_scam import enhanced_scam_bp
    from routes.link_analysis import link_analysis_bp
    from routes.breach_check import breach_bp
    from routes.chat import chat_bp

    app.register_blueprint(scam_bp, url_prefix="/api/scam")
    app.register_blueprint(enhanced_scam_bp, url_prefix="/api/scam")
    app.register_blueprint(link_analysis_bp, url_prefix="/api/link")
    app.register_blueprint(breach_bp, url_prefix="/api/breach")
    app.register_blueprint(chat_bp, url_prefix="/api/chat")

    @app.get("/api/health")
    def health():
        """Health check endpoint."""
        return jsonify({
            "ok": True,
            "service": "remaleh-protect-api",
            "timestamp": datetime.now().isoformat()
        })

    return app


# Create the Flask application instance
app = create_app()


if __name__ == "__main__":
    port = int(os.getenv("PORT", 10000))
    logger.info(f"Starting on 0.0.0.0:{port}")
    app.run(host="0.0.0.0", port=port)
