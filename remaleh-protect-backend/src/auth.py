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
            
            # Check if user is admin
            if not getattr(current_user, 'is_admin', False) and getattr(current_user, 'role', '') != 'ADMIN':
                return jsonify({'message': 'Admin privileges required'}), 403
                
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token'}), 401
        except Exception as e:
            logger.error(f"Unexpected error in admin_required: {e}")
            return jsonify({'message': 'Authentication error'}), 500
        
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
        
        # Get admin password from environment
        admin_password = os.getenv('ADMIN_PASSWORD')
        
        if not admin_user:
            # Create new admin user
            if not admin_password:
                # Generate a secure random password for development
                admin_password = secrets.token_urlsafe(16)
                logger.warning(f"ADMIN_PASSWORD not set. Generated temporary password: {admin_password}")
                logger.warning("Please set ADMIN_PASSWORD environment variable in production!")
            
            # Create admin user with explicit password setting
            admin_user = User(
                email='admin@remaleh.com',
                first_name='Admin',
                last_name='User',
                bio='',
                is_active=True,
                is_admin=True,
                role='ADMIN',
                account_status='ACTIVE'
            )
            
            # Set password using the method
            admin_user.set_password(admin_password)
            
            # Add to session and commit
            db.session.add(admin_user)
            db.session.commit()
            
            logger.info("Admin user created successfully")
            logger.info(f"Admin user created with email: {admin_user.email}")
            
            # Verify the user was actually created
            created_user = User.query.filter_by(email='admin@remaleh.com').first()
            if created_user and created_user.check_password(admin_password):
                logger.info("✓ Admin user verified and password working correctly")
            else:
                logger.error("❌ Admin user creation verification failed")
                
        else:
            # Admin user exists - ensure proper permissions
            if not admin_user.is_admin:
                admin_user.is_admin = True
                admin_user.role = 'ADMIN'
                logger.info("Existing user upgraded to admin")
            
            # ALWAYS update password if ADMIN_PASSWORD environment variable is set
            if admin_password:
                # Check if password needs updating
                if not admin_user.check_password(admin_password):
                    admin_user.set_password(admin_password)
                    db.session.commit()
                    logger.info("✓ Admin user password updated from environment variable")
                else:
                    logger.info("✓ Admin user password already matches environment variable")
                
                # Verify password works
                if admin_user.check_password(admin_password):
                    logger.info("✓ Admin user password verified successfully")
                else:
                    logger.error("❌ Admin user password verification failed after update")
            else:
                logger.warning("⚠ ADMIN_PASSWORD environment variable not set - using existing password")
                
        logger.info("Admin user setup completed")
                
    except Exception as e:
        logger.error(f"Error creating admin user: {e}")
        db.session.rollback()
        # Try to get more detailed error information
        import traceback
        logger.error(f"Full traceback: {traceback.format_exc()}")
        raise

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
