from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import jwt
import os
import random
import string
import smtplib
from email.mime.text import MIMEText
try:
    from ..models import db, User
    from ..auth import create_tokens, token_required, get_current_user_id, update_user_login
    from ..cache import cache
except ImportError:
    from models import db, User
    from auth import create_tokens, token_required, get_current_user_id, update_user_login
    from cache import cache

auth_bp = Blueprint('auth', __name__)
def _generate_code(length=6):
    return ''.join(random.choices(string.digits, k=length))

def _send_email(subject, to_email, html_body):
    provider = current_app.config.get('EMAIL_PROVIDER', 'SMTP')
    sender = current_app.config.get('EMAIL_SENDER') or 'no-reply@remalehprotect.remaleh.com.au'
    if provider == 'SMTP':
        host = current_app.config.get('SMTP_HOST')
        username = current_app.config.get('SMTP_USERNAME')
        password = current_app.config.get('SMTP_PASSWORD')
        port = current_app.config.get('SMTP_PORT', 587)
        use_tls = current_app.config.get('SMTP_USE_TLS', True)
        if not host or not username or not password:
            return False, 'SMTP not configured'
        msg = MIMEText(html_body, 'html')
        msg['Subject'] = subject
        msg['From'] = sender
        msg['To'] = to_email
        try:
            with smtplib.SMTP(host, port, timeout=10) as server:
                if use_tls:
                    server.starttls()
                server.login(username, password)
                server.sendmail(sender, [to_email], msg.as_string())
            return True, None
        except Exception as e:
            return False, str(e)
    # Future: add RESEND/SENDGRID if configured
    return False, 'Email provider not configured'


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
            bio=data.get('bio')
        )
        user.set_password(data['password'])
        
        # If email verification required, generate code and send email
        require_verification = current_app.config.get('REQUIRE_EMAIL_VERIFICATION', False)
        if require_verification:
            code = _generate_code(6)
            user.email_verified = False
            user.email_verification_code = code
            user.email_verification_expires_at = datetime.utcnow() + timedelta(minutes=15)
        db.session.add(user)
        db.session.commit()
        if require_verification:
            subject = 'Verify your Remaleh Protect account'
            html = f"""
                <p>Welcome to Remaleh Protect!</p>
                <p>Your verification code is:</p>
                <h2 style='letter-spacing:4px'>{code}</h2>
                <p>This code expires in 15 minutes.</p>
            """
            _send_email(subject, user.email, html)
        
        # If verification required, do not issue tokens yet
        if require_verification:
            return jsonify({
                'message': 'User registered. Verification code sent to email.',
                'user': user.to_dict(),
                'requires_verification': True
            }), 201
        else:
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
        
        if not user:
            return jsonify({'error': 'Invalid email or password', 'debug': 'User not found'}), 401
        
        if not user.is_active:
            return jsonify({'error': 'Account is deactivated'}), 403
        
        # Test password verification
        password_valid = user.check_password(data['password'])
        if not password_valid:
            return jsonify({
                'error': 'Invalid email or password', 
                'debug': 'Password verification failed',
                'user_found': True,
                'user_active': user.is_active,
                'user_admin': user.is_admin
            }), 401
        
        # Enforce email verification if required
        if current_app.config.get('REQUIRE_EMAIL_VERIFICATION', False) and not user.email_verified:
            return jsonify({'error': 'Email not verified', 'requires_verification': True}), 403
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
@auth_bp.route('/verify-email', methods=['POST'])
def verify_email():
    try:
        data = request.get_json()
        email = data.get('email')
        code = data.get('code')
        # Rate limit: 10 attempts per hour per email and IP
        rl_key_ip = f"verify_attempts:ip:{request.remote_addr}"
        rl_key_email = f"verify_attempts:email:{(email or '').lower()}"
        if cache and cache.redis_client:
            attempts_ip = cache.redis_client.incr(rl_key_ip)
            if attempts_ip == 1:
                cache.redis_client.expire(rl_key_ip, 3600)
            attempts_email = cache.redis_client.incr(rl_key_email)
            if attempts_email == 1:
                cache.redis_client.expire(rl_key_email, 3600)
            if attempts_ip > 50 or attempts_email > 10:
                return jsonify({'error': 'Too many verification attempts. Please try again later.'}), 429
        if not email or not code:
            return jsonify({'error': 'Email and code are required'}), 400
        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        if user.email_verified:
            return jsonify({'message': 'Already verified'}), 200
        if not user.email_verification_code or user.email_verification_code != code:
            return jsonify({'error': 'Invalid verification code'}), 400
        if user.email_verification_expires_at and datetime.utcnow() > user.email_verification_expires_at:
            return jsonify({'error': 'Verification code expired'}), 400
        user.email_verified = True
        user.email_verification_code = None
        user.email_verification_expires_at = None
        db.session.commit()
        # Issue tokens after successful verification
        access_token, refresh_token = create_tokens(user.id)
        return jsonify({
            'message': 'Email verified successfully',
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/resend-verification', methods=['POST'])
def resend_verification():
    try:
        data = request.get_json()
        email = data.get('email')
        # Rate limit: 1/min and 5/day per email and IP
        rl_ip_min = f"resend:min:ip:{request.remote_addr}"
        rl_email_min = f"resend:min:email:{(email or '').lower()}"
        rl_ip_day = f"resend:day:ip:{request.remote_addr}"
        rl_email_day = f"resend:day:email:{(email or '').lower()}"
        if cache and cache.redis_client:
            if cache.redis_client.exists(rl_ip_min) or cache.redis_client.exists(rl_email_min):
                return jsonify({'error': 'Please wait before requesting another code.'}), 429
            day_ip = cache.redis_client.incr(rl_ip_day)
            if day_ip == 1:
                cache.redis_client.expire(rl_ip_day, 86400)
            day_email = cache.redis_client.incr(rl_email_day)
            if day_email == 1:
                cache.redis_client.expire(rl_email_day, 86400)
            if day_ip > 20 or day_email > 5:
                return jsonify({'error': 'Daily resend limit reached. Try again tomorrow.'}), 429
            cache.redis_client.setex(rl_ip_min, 60, 1)
            cache.redis_client.setex(rl_email_min, 60, 1)
        if not email:
            return jsonify({'error': 'Email is required'}), 400
        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        if user.email_verified:
            return jsonify({'message': 'Already verified'}), 200
        code = _generate_code(6)
        user.email_verification_code = code
        user.email_verification_expires_at = datetime.utcnow() + timedelta(minutes=15)
        db.session.commit()
        subject = 'Verify your Remaleh Protect account'
        html = f"""
            <p>Your verification code is:</p>
            <h2 style='letter-spacing:4px'>{code}</h2>
            <p>This code expires in 15 minutes.</p>
        """
        _send_email(subject, user.email, html)
        return jsonify({'message': 'Verification code resent'}), 200
    except Exception as e:
        db.session.rollback()
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
        if data.get('bio') is not None:
            current_user.bio = data.get('bio')
        
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
        try:
            import jwt
            from flask import current_app
            
            # Decode the refresh token
            payload = jwt.decode(data['refresh_token'], current_app.config['SECRET_KEY'], algorithms=["HS256"])
            
            # Check if it's a refresh token
            if payload.get('type') != 'refresh':
                return jsonify({'error': 'Invalid token type'}), 401
            
            user_id = payload.get('user_id')
            if not user_id:
                return jsonify({'error': 'Invalid token payload'}), 401
            
            # Get user to ensure they still exist and are active
            user = User.query.get(user_id)
            if not user or not user.is_active:
                return jsonify({'error': 'User not found or inactive'}), 401
            
            # Create new tokens
            from ..auth import create_tokens
            new_access_token, new_refresh_token = create_tokens(user.id)
            
            return jsonify({
                'message': 'Token refreshed successfully',
                'access_token': new_access_token,
                'refresh_token': new_refresh_token
            }), 200
            
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Refresh token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid refresh token'}), 401
        
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

@auth_bp.route('/profile/delete-account', methods=['POST'])
@token_required
def delete_own_account(current_user):
    """Allow users to delete their own account"""
    try:
        data = request.get_json()
        
        if not data.get('confirm_password'):
            return jsonify({'error': 'Password confirmation required'}), 400
        
        if not current_user.check_password(data['confirm_password']):
            return jsonify({'error': 'Password confirmation incorrect'}), 401
        
        # Soft delete - mark as deleted instead of actually removing
        current_user.account_status = 'DELETED'
        current_user.is_active = False
        current_user.email = f"deleted_{current_user.id}_{current_user.email}"
        
        db.session.commit()
        
        return jsonify({'message': 'Account deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/profile/recovery', methods=['POST'])
def recover_account():
    """Account recovery endpoint for suspended users"""
    try:
        data = request.get_json()
        email = data.get('email')
        
        if not email:
            return jsonify({'error': 'Email is required'}), 400
        
        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if user.account_status != 'SUSPENDED':
            return jsonify({'error': 'Account is not suspended'}), 400
        
        # In a real implementation, you would send a recovery email
        # For now, we'll just return a message
        return jsonify({
            'message': 'Recovery instructions sent to your email',
            'note': 'Contact support for immediate assistance'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/profile/activity', methods=['GET'])
@token_required
def get_user_activity(current_user):
    """Get user's recent activity"""
    try:
        # Get recent scans
        recent_scans = UserScan.query.filter_by(
            user_id=current_user.id
        ).order_by(
            UserScan.scanned_at.desc()
        ).limit(10).all()
        
        # Get learning progress
        learning_progress = LearningProgress.query.filter_by(
            user_id=current_user.id
        ).order_by(
            LearningProgress.started_at.desc()
        ).limit(10).all()
        
        # Get community reports
        community_reports = CommunityReport.query.filter_by(
            user_id=current_user.id
        ).order_by(
            CommunityReport.created_at.desc()
        ).limit(5).all()
        
        return jsonify({
            'recent_scans': [scan.to_dict() for scan in recent_scans],
            'learning_progress': [progress.to_dict() for progress in learning_progress],
            'community_reports': [report.to_dict() for report in community_reports]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/debug/admin-check', methods=['GET'])
def debug_admin_check():
    """Debug endpoint to check admin user status"""
    try:
        admin_user = User.query.filter_by(email='admin@remaleh.com').first()
        
        if not admin_user:
            return jsonify({
                'status': 'error',
                'message': 'Admin user not found',
                'admin_exists': False
            }), 404
        
        # Test password verification with environment variable
        admin_password = os.getenv('ADMIN_PASSWORD')
        password_works = False
        
        if admin_password:
            password_works = admin_user.check_password(admin_password)
        
        return jsonify({
            'status': 'success',
            'admin_exists': True,
            'admin_user': {
                'id': admin_user.id,
                'email': admin_user.email,
                'is_admin': admin_user.is_admin,
                'is_active': admin_user.is_active,
                'role': admin_user.role,
                'account_status': admin_user.account_status,
                'created_at': admin_user.created_at.isoformat() if admin_user.created_at else None
            },
            'password_check': {
                'admin_password_set': bool(admin_password),
                'password_verification_works': password_works,
                'password_length': len(admin_password) if admin_password else 0
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e),
            'admin_exists': False
        }), 500

@auth_bp.route('/reset-admin-password', methods=['POST'])
def reset_admin_password():
    """Reset admin user password - use only in emergency"""
    try:
        data = request.get_json()
        new_password = data.get('new_password')
        
        if not new_password:
            return jsonify({'error': 'New password is required'}), 400
        
        # Find admin user
        admin_user = User.query.filter_by(email='admin@remaleh.com').first()
        
        if not admin_user:
            return jsonify({'error': 'Admin user not found'}), 404
        
        if not admin_user.is_admin:
            return jsonify({'error': 'User is not an admin'}), 403
        
        # Set new password
        admin_user.set_password(new_password)
        db.session.commit()
        
        return jsonify({
            'message': 'Admin password reset successfully',
            'email': admin_user.email
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/deployment-check', methods=['GET'])
def deployment_check():
    """Check deployment status and environment variables"""
    try:
        # Check environment variables
        env_vars = {
            'ADMIN_PASSWORD_SET': bool(os.getenv('ADMIN_PASSWORD')),
            'ADMIN_PASSWORD_LENGTH': len(os.getenv('ADMIN_PASSWORD', '')),
            'SECRET_KEY_SET': bool(os.getenv('SECRET_KEY')),
            'DATABASE_URL_SET': bool(os.getenv('DATABASE_URL')),
            'FLASK_ENV': os.getenv('FLASK_ENV', 'not_set'),
            'RENDER': bool(os.getenv('RENDER'))
        }
        
        # Check admin user status
        admin_user = User.query.filter_by(email='admin@remaleh.com').first()
        
        if admin_user:
            # Test password verification with environment variable
            admin_password = os.getenv('ADMIN_PASSWORD')
            password_works = False
            
            if admin_password:
                password_works = admin_user.check_password(admin_password)
            
            admin_status = {
                'exists': True,
                'is_admin': admin_user.is_admin,
                'is_active': admin_user.is_active,
                'password_from_env_works': password_works,
                'can_login_with_env_password': password_works
            }
        else:
            admin_status = {
                'exists': False,
                'is_admin': False,
                'is_active': False,
                'password_from_env_works': False,
                'can_login_with_env_password': False
            }
        
        return jsonify({
            'status': 'success',
            'deployment_info': {
                'timestamp': datetime.utcnow().isoformat(),
                'environment_variables': env_vars,
                'admin_user': admin_status
            },
            'recommendations': [
                'Set ADMIN_PASSWORD environment variable for secure admin access',
                'Ensure SECRET_KEY is set for JWT token security',
                'Verify DATABASE_URL is correctly configured'
            ] if not env_vars['ADMIN_PASSWORD_SET'] else [
                'Environment variables look good!',
                'Admin password is properly configured'
            ]
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500
