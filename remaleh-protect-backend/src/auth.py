from functools import wraps
from flask import request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import jwt
import os
import secrets
import logging

logger = logging.getLogger(__name__)

try:
    from .models import db, User
except ImportError:
    from models import db, User

def create_tokens(user_id):
    """Create access and refresh tokens for a user"""
    from flask import current_app
    
    # Create access token (1 hour expiry)
    access_token = jwt.encode(
        {
            'user_id': user_id,
            'exp': datetime.utcnow() + timedelta(hours=1),
            'iat': datetime.utcnow(),
            'type': 'access'
        },
        current_app.config['SECRET_KEY'],
        algorithm='HS256'
    )
    
    # Create refresh token (30 days expiry)
    refresh_token = jwt.encode(
        {
            'user_id': user_id,
            'exp': datetime.utcnow() + timedelta(days=30),
            'iat': datetime.utcnow(),
            'type': 'refresh'
        },
        current_app.config['SECRET_KEY'],
        algorithm='HS256'
    )
    
    return access_token, refresh_token

def token_required(f):
    """Decorator to protect routes that require authentication"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({'message': 'Invalid token format'}), 401
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            # Decode the token
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.get(data['user_id'])
            
            if not current_user:
                return jsonify({'message': 'Invalid token'}), 401
                
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token'}), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated

def admin_required(f):
    """Decorator to protect routes that require admin privileges"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({'message': 'Invalid token format'}), 401
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.get(data['user_id'])
            
            if not current_user:
                return jsonify({'message': 'Invalid token'}), 401
            
            # Check if user is admin (you can add an admin field to User model)
            if not getattr(current_user, 'is_admin', False):
                return jsonify({'message': 'Admin privileges required'}), 403
                
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token'}), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated

def get_current_user_id():
    """Get current user ID from token"""
    token = None
    
    if 'Authorization' in request.headers:
        auth_header = request.headers['Authorization']
        try:
            token = auth_header.split(" ")[1]
        except IndexError:
            return None
    
    if not token:
        return None
    
    try:
        data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
        return data['user_id']
    except:
        return None

def update_user_login(user_id):
    """Update user's last login timestamp"""
    user = User.query.get(user_id)
    if user:
        user.last_login = datetime.utcnow()
        db.session.commit()

def create_admin_user():
    """Create a default admin user if it doesn't exist"""
    try:
        # Check if admin user already exists
        admin_user = User.query.filter_by(email='admin@remaleh.com').first()
        if not admin_user:
            # Generate secure admin password from environment or generate random one
            admin_password = os.getenv('ADMIN_PASSWORD')
            if not admin_password:
                # Generate a secure random password for development
                admin_password = secrets.token_urlsafe(16)
                logger.warning(f"ADMIN_PASSWORD not set. Generated temporary password: {admin_password}")
                logger.warning("Please set ADMIN_PASSWORD environment variable in production!")
            
            admin_user = User(
                email='admin@remaleh.com',
                first_name='Admin',
                last_name='User',
                risk_level='LOW',
                is_active=True,
                is_admin=True,
                role='ADMIN',
                account_status='ACTIVE'
            )
            admin_user.set_password(admin_password)
            db.session.add(admin_user)
            db.session.commit()
            logger.info("Admin user created successfully")
            
            # Log admin creation for security audit
            logger.info(f"Admin user created with email: {admin_user.email}")
            
        else:
            # Ensure existing admin user has proper permissions
            if not admin_user.is_admin:
                admin_user.is_admin = True
                admin_user.role = 'ADMIN'
                db.session.commit()
                logger.info("Existing user upgraded to admin")
            else:
                logger.info("Admin user already exists")
                
    except Exception as e:
        logger.error(f"Error creating admin user: {e}")
        db.session.rollback()

def validate_password_strength(password):
    """Validate password strength for production security"""
    if len(password) < 12:
        return False, "Password must be at least 12 characters long"
    
    if not any(c.isupper() for c in password):
        return False, "Password must contain at least one uppercase letter"
    
    if not any(c.islower() for c in password):
        return False, "Password must contain at least one lowercase letter"
    
    if not any(c.isdigit() for c in password):
        return False, "Password must contain at least one digit"
    
    if not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password):
        return False, "Password must contain at least one special character"
    
    return True, "Password meets security requirements"

def rate_limit_login_attempts(user_id):
    """Rate limit login attempts for security"""
    try:
        from .cache import cache
        from .monitoring import record_login_attempt
    except ImportError:
        from cache import cache
        from monitoring import record_login_attempt
    
    cache_key = f"login_attempts:{user_id}"
    attempts = cache.get(cache_key) or 0
    
    if attempts >= 5:  # Max 5 attempts
        return False, "Too many login attempts. Please try again later."
    
    # Increment attempts
    cache.set(cache_key, attempts + 1, timeout=300)  # 5 minutes
    
    # Record login attempt for monitoring
    record_login_attempt(user_id, attempts + 1)
    
    return True, "Login attempt recorded"
