from flask import Blueprint, request, jsonify, current_app
from functools import wraps
from datetime import datetime
import logging

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
    """Decorator to check if user is admin"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            # Get current user from the request context
            from flask import g
            current_user = getattr(g, 'current_user', None)
            
            if not current_user or not current_user.is_admin:
                return jsonify({'error': 'Admin access required'}), 403
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
        # Check database connectivity
        try:
            db.session.execute('SELECT 1')
        except Exception as db_error:
            logger.error(f"Database connection error: {db_error}")
            return jsonify({'error': 'Database connection failed', 'details': str(db_error)}), 503
        
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

@admin_bp.route('/users/<int:user_id>/role', methods=['PUT'])
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
            db.session.execute('SELECT 1')
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
