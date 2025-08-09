from functools import wraps
from flask import request, jsonify, current_app
from flask_jwt_extended import (
    create_access_token, create_refresh_token, 
    jwt_required, get_jwt_identity, get_jwt
)
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import jwt
from models import db, User

def create_tokens(user_id):
    """Create access and refresh tokens for a user"""
    access_token = create_access_token(
        identity=user_id,
        expires_delta=timedelta(hours=1)
    )
    refresh_token = create_refresh_token(
        identity=user_id,
        expires_delta=timedelta(days=30)
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
            admin_user = User(
                email='admin@remaleh.com',
                first_name='Admin',
                last_name='User',
                risk_level='LOW',
                is_active=True
            )
            admin_user.set_password('admin123')  # Change this in production
            db.session.add(admin_user)
            db.session.commit()
            print("Admin user created successfully")
        else:
            print("Admin user already exists")
    except Exception as e:
        print(f"Error creating admin user: {e}")
        db.session.rollback()
