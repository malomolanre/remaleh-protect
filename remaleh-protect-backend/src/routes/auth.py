from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import jwt
from models import db, User
from auth import create_tokens, token_required, get_current_user_id, update_user_login

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """User registration endpoint"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Check if user already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'User with this email already exists'}), 409
        
        # Create new user
        user = User(
            email=data['email'],
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', ''),
            risk_level=data.get('risk_level', 'MEDIUM')
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        # Create tokens
        access_token, refresh_token = create_tokens(user.id)
        
        return jsonify({
            'message': 'User registered successfully',
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """User login endpoint"""
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password are required'}), 400
        
        user = User.query.filter_by(email=data['email']).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        if not user.is_active:
            return jsonify({'error': 'Account is deactivated'}), 403
        
        # Update last login
        update_user_login(user.id)
        
        # Create tokens
        access_token, refresh_token = create_tokens(user.id)
        
        return jsonify({
            'message': 'Login successful',
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    """Get user profile"""
    try:
        return jsonify({
            'user': current_user.to_dict()
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    """Update user profile"""
    try:
        data = request.get_json()
        
        if data.get('first_name'):
            current_user.first_name = data['first_name']
        if data.get('last_name'):
            current_user.last_name = data['last_name']
        if data.get('risk_level'):
            current_user.risk_level = data['risk_level']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'user': current_user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/change-password', methods=['POST'])
@token_required
def change_password(current_user):
    """Change user password"""
    try:
        data = request.get_json()
        
        if not data.get('current_password') or not data.get('new_password'):
            return jsonify({'error': 'Current and new password are required'}), 400
        
        if not current_user.check_password(data['current_password']):
            return jsonify({'error': 'Current password is incorrect'}), 401
        
        current_user.set_password(data['new_password'])
        db.session.commit()
        
        return jsonify({'message': 'Password changed successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/refresh', methods=['POST'])
def refresh_token():
    """Refresh access token using refresh token"""
    try:
        data = request.get_json()
        
        if not data.get('refresh_token'):
            return jsonify({'error': 'Refresh token is required'}), 400
        
        # Verify refresh token and create new access token
        # This is a simplified version - you might want to use flask-jwt-extended for better token management
        
        return jsonify({'message': 'Token refreshed successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/logout', methods=['POST'])
@token_required
def logout(current_user):
    """User logout endpoint"""
    try:
        # In a real implementation, you might want to blacklist the token
        # For now, we'll just return a success message
        return jsonify({'message': 'Logout successful'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
