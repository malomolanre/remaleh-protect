from flask import Blueprint, request, jsonify, current_app
from functools import wraps
from datetime import datetime
import logging
from sqlalchemy import text

# Import production modules - try relative imports first, then absolute
try:
    from ..models import db, User, CommunityReport
    from ..auth import token_required, admin_required
except ImportError:
    from models import db, User, CommunityReport
    from auth import token_required, admin_required

logger = logging.getLogger(__name__)
admin_bp = Blueprint('admin', __name__)

def admin_required(f):
    """Decorator to check if user is admin - must be used AFTER token_required"""
    @wraps(f)
    def decorated_function(current_user, *args, **kwargs):
        try:
            logger.info(f"Admin check for user: {current_user.email if current_user else 'None'}")
            logger.info(f"User is_admin: {current_user.is_admin if current_user else 'None'}")
            logger.info(f"User role: {current_user.role if current_user else 'None'}")
            
            # current_user is passed from token_required decorator
            if not current_user or not current_user.is_admin:
                logger.warning(f"Admin access denied for user: {current_user.email if current_user else 'None'}")
                return jsonify({'error': 'Admin access required'}), 403
            
            logger.info(f"Admin access granted for user: {current_user.email}")
            return f(current_user, *args, **kwargs)
        except Exception as e:
            logger.error(f"Error in admin_required decorator: {e}")
            return jsonify({'error': 'Authentication error'}), 500
    return decorated_function

@admin_bp.route('/users', methods=['GET'])
@token_required
@admin_required
def get_users(current_user):
    """Get all users with pagination and filtering"""
    try:
        # Debug logging
        logger.info(f"Admin users endpoint called by user: {current_user.email if current_user else 'None'}")
        logger.info(f"User is_admin: {current_user.is_admin if current_user else 'None'}")
        logger.info(f"User role: {current_user.role if current_user else 'None'}")
        
        # Check database connectivity
        try:
            db.session.execute(text('SELECT 1'))
            logger.info("Database connection test successful")
        except Exception as db_error:
            logger.error(f"Database connection error: {db_error}")
            return jsonify({'error': 'Database connection failed', 'details': str(db_error)}), 503
        
        # Check if users table has data
        total_users = User.query.count()
        logger.info(f"Total users in database: {total_users}")
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        status = request.args.get('status')
        role = request.args.get('role')
        
        query = User.query
        
        if status:
            query = query.filter(User.account_status == status)
        if role:
            query = query.filter(User.role == role)
            
        users = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        logger.info(f"Query returned {len(users.items)} users for page {page}")
        
        user_list = []
        for user in users.items:
            # Safely get report count, handle case where table might not exist
            try:
                report_count = CommunityReport.query.filter_by(user_id=user.id).count()
            except Exception:
                report_count = 0  # Default to 0 if table doesn't exist
                
            user_data = {
                'id': user.id,
                'username': user.email.split('@')[0] if user.email else 'Unknown',
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.role,
                'status': user.account_status,
                'is_admin': user.is_admin,
                'created_at': user.created_at.isoformat() if user.created_at else None,
                'last_login': user.last_login.isoformat() if user.last_login else None,
                'report_count': report_count
            }
            user_list.append(user_data)
        
        logger.info(f"Returning {len(user_list)} users")
        
        return jsonify({
            'users': user_list,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': users.total,
                'pages': users.pages,
                'has_next': users.has_next,
                'has_prev': users.has_prev
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting users: {e}")
        import traceback
        logger.error(f"Full traceback: {traceback.format_exc()}")
        return jsonify({'error': 'Internal server error'}), 500

@admin_bp.route('/users/<int:user_id>', methods=['GET'])
@token_required
@admin_required
def get_user(current_user, user_id):
    """Get specific user details"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        # Safely get report count and reports, handle case where table might not exist
        try:
            report_count = CommunityReport.query.filter_by(user_id=user.id).count()
            # Get user's recent reports
            reports = CommunityReport.query.filter_by(user_id=user.id).order_by(CommunityReport.created_at.desc()).limit(10).all()
            report_list = []
            for report in reports:
                report_list.append({
                    'id': report.id,
                    'threat_type': report.threat_type,
                    'status': report.status,
                    'created_at': report.created_at.isoformat() if report.created_at else None
                })
        except Exception:
            report_count = 0
            report_list = []
            
        user_data = {
            'id': user.id,
            'username': user.email.split('@')[0] if user.email else 'Unknown',
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': user.role,
            'status': user.account_status,
            'is_admin': user.is_admin,
            'created_at': user.created_at.isoformat() if user.created_at else None,
            'last_login': user.last_login.isoformat() if user.last_login else None,
            'report_count': report_count,
            'reports': report_list
        }
        
        return jsonify(user_data), 200
        
    except Exception as e:
        logger.error(f"Error getting user {user_id}: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@admin_bp.route('/users/<int:user_id>/status', methods=['PUT'])
@token_required
@admin_required
def update_user_status(current_user, user_id):
    """Update user status (ACTIVE, SUSPENDED, BANNED)"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        data = request.get_json()
        new_status = data.get('status')
        
        if new_status not in ['ACTIVE', 'SUSPENDED', 'BANNED']:
            return jsonify({'error': 'Invalid status'}), 400
            
        user.account_status = new_status
        db.session.commit()
        
        logger.info(f"Admin {current_user.email} updated user {user.email} status to {new_status}")
        
        return jsonify({
            'message': f'User status updated to {new_status}',
            'user_id': user_id,
            'new_status': new_status
        }), 200
        
    except Exception as e:
        logger.error(f"Error updating user status: {e}")
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500


@token_required
@admin_required
def update_user_role(current_user, user_id):
    """Update user role (USER, MODERATOR, ADMIN)"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        data = request.get_json()
        new_role = data.get('role')
        
        if new_role not in ['USER', 'MODERATOR', 'ADMIN']:
            return jsonify({'error': 'Invalid role'}), 400
            
        # Prevent removing the last admin
        if user.role == 'ADMIN' and new_role != 'ADMIN':
            admin_count = User.query.filter_by(role='ADMIN').count()
            if admin_count <= 1:
                return jsonify({'error': 'Cannot remove the last admin user'}), 400
        
        user.role = new_role
        user.is_admin = (new_role == 'ADMIN')
        db.session.commit()
        
        logger.info(f"Admin {current_user.email} updated user {user.email} role to {new_role}")
        
        return jsonify({
            'message': f'User role updated to {new_role}',
            'user_id': user_id,
            'new_role': new_role
        }), 200
        
    except Exception as e:
        logger.error(f"Error updating user role: {e}")
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

@admin_bp.route('/users/<int:user_id>', methods=['PUT'])
@token_required
@admin_required
def update_user(current_user, user_id):
    """Update user information (first name, last name, email)"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        data = request.get_json()
        
        # Update fields if provided
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'email' in data and data['email'] != user.email:
            # Check if email is already taken by another user
            existing_user = User.query.filter_by(email=data['email']).first()
            if existing_user and existing_user.id != user_id:
                return jsonify({'error': 'Email already taken by another user'}), 400
            user.email = data['email']
        
        # Update role if provided
        if 'role' in data:
            new_role = data['role']
            if new_role not in ['USER', 'ADMIN', 'MODERATOR']:
                return jsonify({'error': 'Invalid role'}), 400
            user.role = new_role
            logger.info(f"Admin {current_user.email} updated user {user.email} role to {new_role}")
        
        # Update status if provided
        if 'status' in data:
            new_status = data['status']
            if new_status not in ['ACTIVE', 'SUSPENDED', 'BANNED']:
                return jsonify({'error': 'Invalid status'}), 400
            user.account_status = new_status
            logger.info(f"Admin {current_user.email} updated user {user.email} status to {new_status}")
        
        db.session.commit()
        
        logger.info(f"Admin {current_user.email} updated user {user.email} information")
        
        return jsonify({
            'message': 'User information updated successfully',
            'user_id': user_id,
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.role,
                'status': user.account_status
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error updating user information: {e}")
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

@admin_bp.route('/users/<int:user_id>/password', methods=['PUT'])
@token_required
@admin_required
def update_user_password(current_user, user_id):
    """Update user password"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        data = request.get_json()
        new_password = data.get('password')
        
        if not new_password:
            return jsonify({'error': 'Password is required'}), 400
        
        # Update password
        user.set_password(new_password)
        db.session.commit()
        
        logger.info(f"Admin {current_user.email} updated password for user {user.email}")
        
        return jsonify({
            'message': 'User password updated successfully',
            'user_id': user_id
        }), 200
        
    except Exception as e:
        logger.error(f"Error updating user password: {e}")
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@token_required
@admin_required
def delete_user(current_user, user_id):
    """Delete a user (soft delete by setting status to deleted)"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        # Prevent deleting the last admin
        if user.role == 'ADMIN':
            admin_count = User.query.filter_by(role='ADMIN').count()
            if admin_count <= 1:
                return jsonify({'error': 'Cannot delete the last admin user'}), 400
        
        # Soft delete by setting status to deleted
        user.account_status = 'BANNED'  # Use BANNED as closest to deleted
        user.email = f"deleted_{user.id}_{int(datetime.now().timestamp())}@deleted.com"
        db.session.commit()
        
        logger.info(f"Admin {current_user.email} deleted user {user.email}")
        
        return jsonify({
            'message': 'User deleted successfully',
            'user_id': user_id
        }), 200
        
    except Exception as e:
        logger.error(f"Error deleting user: {e}")
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

@admin_bp.route('/reports', methods=['GET'])
@token_required
@admin_required
def get_reports(current_user):
    """Get all community reports with pagination and filtering"""
    try:
        # Check if CommunityReport table exists
        try:
            CommunityReport.query.first()
        except Exception:
            # Table doesn't exist, return empty results
            return jsonify({
                'reports': [],
                'pagination': {
                    'page': 1,
                    'per_page': 20,
                    'total': 0,
                    'pages': 0,
                    'has_next': False,
                    'has_prev': False
                }
            }), 200
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        status = request.args.get('status')
        urgency = request.args.get('urgency')
        
        query = CommunityReport.query
        
        if status:
            query = query.filter(CommunityReport.status == status)
        if urgency:
            query = query.filter(CommunityReport.urgency == urgency)
            
        reports = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        report_list = []
        for report in reports.items:
            user = User.query.get(report.user_id)
            report_data = {
                'id': report.id,
                'threat_type': report.threat_type,
                'description': report.description,
                'urgency': report.urgency,
                'status': report.status,
                'created_at': report.created_at.isoformat() if report.created_at else None,
                'reporter': {
                    'id': user.id if user else None,
                    'username': user.email.split('@')[0] if user and user.email else 'Unknown',
                    'email': user.email if user else None
                } if user else None,
                'location': report.location,
                'votes_up': report.votes_up,
                'votes_down': report.votes_down,
                'verified': report.verified
            }
            report_list.append(report_data)
        
        return jsonify({
            'reports': report_list,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': reports.total,
                'pages': reports.pages,
                'has_next': reports.has_next,
                'has_prev': reports.has_prev
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting reports: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@admin_bp.route('/reports/<int:report_id>/moderate', methods=['PUT'])
@token_required
@admin_required
def moderate_report(current_user, report_id):
    """Moderate a community report (approve, reject, flag)"""
    try:
        # Check if CommunityReport table exists
        try:
            report = CommunityReport.query.get(report_id)
        except Exception:
            return jsonify({'error': 'Community reports table not available'}), 503
            
        if not report:
            return jsonify({'error': 'Report not found'}), 404
            
        data = request.get_json()
        action = data.get('action')
        
        if action not in ['APPROVED', 'REJECTED', 'FLAGGED']:
            return jsonify({'error': 'Invalid action'}), 400
            
        report.status = action
        db.session.commit()
        
        logger.info(f"Admin {current_user.email} {action.lower()}ed report {report_id}")
        
        return jsonify({
            'message': f'Report {action.lower()}ed successfully',
            'report_id': report_id,
            'action': action
        }), 200
        
    except Exception as e:
        logger.error(f"Error moderating report: {e}")
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

@admin_bp.route('/stats', methods=['GET'])
@token_required
@admin_required
def get_admin_stats(current_user):
    """Get admin dashboard statistics"""
    try:
        # User statistics
        total_users = User.query.count()
        active_users = User.query.filter_by(account_status='ACTIVE').count()
        suspended_users = User.query.filter_by(account_status='SUSPENDED').count()
        admin_users = User.query.filter_by(role='ADMIN').count()
        
        # Report statistics - safely handle case where table might not exist
        try:
            total_reports = CommunityReport.query.count()
            pending_reports = CommunityReport.query.filter_by(status='PENDING').count()
            approved_reports = CommunityReport.query.filter_by(status='APPROVED').count()
            rejected_reports = CommunityReport.query.filter_by(status='REJECTED').count()
        except Exception:
            total_reports = 0
            pending_reports = 0
            approved_reports = 0
            rejected_reports = 0
        
        # Recent activity
        recent_users = User.query.order_by(User.created_at.desc()).limit(5).all()
        
        try:
            recent_reports = CommunityReport.query.order_by(CommunityReport.created_at.desc()).limit(5).all()
        except Exception:
            recent_reports = []
        
        stats = {
            'users': {
                'total': total_users,
                'active': active_users,
                'suspended': suspended_users,
                'admin': admin_users
            },
            'reports': {
                'total': total_reports,
                'pending': pending_reports,
                'approved': approved_reports,
                'rejected': rejected_reports
            },
            'recent_activity': {
                'new_users': [
                    {
                        'id': user.id,
                        'username': user.email.split('@')[0] if user.email else 'Unknown',
                        'created_at': user.created_at.isoformat() if user.created_at else None
                    } for user in recent_users
                ],
                'new_reports': [
                    {
                        'id': report.id,
                        'threat_type': report.threat_type,
                        'status': report.status,
                        'created_at': report.created_at.isoformat() if report.created_at else None
                    } for report in recent_reports
                ]
            }
        }
        
        return jsonify(stats), 200
        
    except Exception as e:
        logger.error(f"Error getting admin stats: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@admin_bp.route('/system/health', methods=['GET'])
@token_required
@admin_required
def system_health(current_user):
    """Get system health information"""
    try:
        # Database health
        try:
            db.session.execute(text('SELECT 1'))
            db_status = 'healthy'
        except Exception:
            db_status = 'unhealthy'
        
        # Basic system info
        try:
            import psutil
            system_info = {
                'cpu_percent': psutil.cpu_percent(interval=1),
                'memory_percent': psutil.virtual_memory().percent,
                'disk_percent': psutil.disk_usage('/').percent
            }
        except ImportError:
            system_info = {
                'cpu_percent': 'N/A',
                'memory_percent': 'N/A',
                'disk_percent': 'N/A'
            }
        
        health_data = {
            'status': 'healthy',
            'timestamp': datetime.utcnow().isoformat(),
            'database': db_status,
            'system': system_info
        }
        
        return jsonify(health_data), 200
        
    except Exception as e:
        logger.error(f"Error getting system health: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@admin_bp.route('/debug/auth', methods=['GET'])
@token_required
def debug_auth(current_user):
    """Debug endpoint to check authentication status - no admin required"""
    try:
        logger.info(f"Debug auth endpoint called by user: {current_user.email if current_user else 'None'}")
        
        user_info = {
            'id': current_user.id if current_user else None,
            'email': current_user.email if current_user else None,
            'first_name': current_user.first_name if current_user else None,
            'last_name': current_user.last_name if current_user else None,
            'role': current_user.role if current_user else None,
            'is_admin': current_user.is_admin if current_user else None,
            'account_status': current_user.account_status if current_user else None,
            'created_at': current_user.created_at.isoformat() if current_user and current_user.created_at else None
        }
        
        # Check database connectivity
        try:
            db.session.execute(text('SELECT 1'))
            db_status = 'connected'
        except Exception as db_error:
            db_status = f'error: {str(db_error)}'
        
        # Check total users
        try:
            total_users = User.query.count()
            admin_users = User.query.filter_by(is_admin=True).count()
            admin_role_users = User.query.filter_by(role='ADMIN').count()
        except Exception as e:
            total_users = f'error: {str(e)}'
            admin_users = f'error: {str(e)}'
            admin_role_users = f'error: {str(e)}'
        
        debug_info = {
            'user': user_info,
            'database': {
                'status': db_status,
                'total_users': total_users,
                'admin_users': admin_users,
                'admin_role_users': admin_role_users
            },
            'timestamp': datetime.utcnow().isoformat()
        }
        
        logger.info(f"Debug info: {debug_info}")
        
        return jsonify(debug_info), 200
        
    except Exception as e:
        logger.error(f"Error in debug auth: {e}")
        import traceback
        logger.error(f"Full traceback: {traceback.format_exc()}")
        return jsonify({'error': 'Debug endpoint error', 'details': str(e)}), 500

@admin_bp.route('/debug/users', methods=['GET'])
def debug_users():
    """Public debug endpoint to check users in database - no auth required"""
    try:
        logger.info("Debug users endpoint called")
        
        # Check database connectivity
        try:
            db.session.execute(text('SELECT 1'))
            db_status = 'connected'
        except Exception as db_error:
            db_status = f'error: {str(db_error)}'
            return jsonify({'error': 'Database connection failed', 'details': str(db_error)}), 503
        
        # Check users table
        try:
            total_users = User.query.count()
            
            if total_users > 0:
                # Get sample users (limit to 5 for security)
                users = User.query.limit(5).all()
                user_list = []
                for user in users:
                    user_data = {
                        'id': user.id,
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'role': user.role,
                        'is_admin': user.is_admin,
                        'account_status': user.account_status,
                        'created_at': user.created_at.isoformat() if user.created_at else None
                    }
                    user_list.append(user_data)
                
                # Count admin users
                admin_users = User.query.filter_by(is_admin=True).count()
                admin_role_users = User.query.filter_by(role='ADMIN').count()
                
                debug_info = {
                    'database': {
                        'status': db_status,
                        'total_users': total_users,
                        'admin_users': admin_users,
                        'admin_role_users': admin_role_users
                    },
                    'sample_users': user_list,
                    'timestamp': datetime.utcnow().isoformat()
                }
            else:
                debug_info = {
                    'database': {
                        'status': db_status,
                        'total_users': 0,
                        'admin_users': 0,
                        'admin_role_users': 0
                    },
                    'sample_users': [],
                    'message': 'No users found in database',
                    'timestamp': datetime.utcnow().isoformat()
                }
            
            logger.info(f"Debug users info: {debug_info}")
            return jsonify(debug_info), 200
            
        except Exception as e:
            logger.error(f"Error checking users: {e}")
            return jsonify({
                'error': 'Error checking users',
                'details': str(e),
                'database': {'status': db_status},
                'timestamp': datetime.utcnow().isoformat()
            }), 500
        
    except Exception as e:
        logger.error(f"Error in debug users: {e}")
        return jsonify({'error': 'Debug endpoint error', 'details': str(e)}), 500
