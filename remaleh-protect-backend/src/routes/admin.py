from flask import Blueprint, request, jsonify, g
from functools import wraps
from datetime import datetime
import logging

# Import production modules - try relative imports first, then absolute
try:
    from ..models import db, User, ScamReport, CommunityReport
    from ..auth import token_required
except ImportError:
    from models import db, User, ScamReport, CommunityReport
    from auth import token_required

logger = logging.getLogger(__name__)
admin_bp = Blueprint('admin', __name__)

def admin_required(f):
    """Decorator to check if user is admin"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not g.current_user or not g.current_user.is_admin:
            return jsonify({'error': 'Admin access required'}), 403
        return f(*args, **kwargs)
    return decorated_function

@admin_bp.route('/users', methods=['GET'])
@token_required
@admin_required
def get_users():
    """Get all users with pagination and filtering"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        status = request.args.get('status')
        role = request.args.get('role')
        
        query = User.query
        
        if status:
            query = query.filter(User.status == status)
        if role:
            query = query.filter(User.role == role)
            
        users = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        user_list = []
        for user in users.items:
            user_data = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.role,
                'status': user.status,
                'is_admin': user.is_admin,
                'created_at': user.created_at.isoformat() if user.created_at else None,
                'last_login': user.last_login.isoformat() if user.last_login else None,
                'report_count': CommunityReport.query.filter_by(user_id=user.id).count()
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
def get_user(user_id):
    """Get specific user details"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        user_data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': user.role,
            'status': user.status,
            'is_admin': user.is_admin,
            'created_at': user.created_at.isoformat() if user.created_at else None,
            'last_login': user.last_login.isoformat() if user.last_login else None,
            'report_count': CommunityReport.query.filter_by(user_id=user.id).count(),
            'reports': []
        }
        
        # Get user's recent reports
        reports = CommunityReport.query.filter_by(user_id=user.id).order_by(CommunityReport.created_at.desc()).limit(10).all()
        for report in reports:
            user_data['reports'].append({
                'id': report.id,
                'title': report.title,
                'status': report.status,
                'created_at': report.created_at.isoformat() if report.created_at else None
            })
        
        return jsonify(user_data), 200
        
    except Exception as e:
        logger.error(f"Error getting user {user_id}: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@admin_bp.route('/users/<int:user_id>/status', methods=['PUT'])
@token_required
@admin_required
def update_user_status(user_id):
    """Update user status (active, suspended, banned)"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        data = request.get_json()
        new_status = data.get('status')
        
        if new_status not in ['active', 'suspended', 'banned']:
            return jsonify({'error': 'Invalid status'}), 400
            
        user.status = new_status
        db.session.commit()
        
        logger.info(f"Admin {g.current_user.username} updated user {user.username} status to {new_status}")
        
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
def update_user_role(user_id):
    """Update user role (user, moderator, admin)"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        data = request.get_json()
        new_role = data.get('role')
        
        if new_role not in ['user', 'moderator', 'admin']:
            return jsonify({'error': 'Invalid role'}), 400
            
        # Prevent removing the last admin
        if user.role == 'admin' and new_role != 'admin':
            admin_count = User.query.filter_by(role='admin').count()
            if admin_count <= 1:
                return jsonify({'error': 'Cannot remove the last admin user'}), 400
        
        user.role = new_role
        user.is_admin = (new_role == 'admin')
        db.session.commit()
        
        logger.info(f"Admin {g.current_user.username} updated user {user.username} role to {new_role}")
        
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
def delete_user(user_id):
    """Delete a user (soft delete by setting status to deleted)"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        # Prevent deleting the last admin
        if user.role == 'admin':
            admin_count = User.query.filter_by(role='admin').count()
            if admin_count <= 1:
                return jsonify({'error': 'Cannot delete the last admin user'}), 400
        
        # Soft delete by setting status to deleted
        user.status = 'deleted'
        user.email = f"deleted_{user.id}_{int(datetime.now().timestamp())}@deleted.com"
        user.username = f"deleted_{user.id}_{int(datetime.now().timestamp())}"
        db.session.commit()
        
        logger.info(f"Admin {g.current_user.username} deleted user {user.username}")
        
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
def get_reports():
    """Get all community reports with pagination and filtering"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        status = request.args.get('status')
        severity = request.args.get('severity')
        
        query = CommunityReport.query
        
        if status:
            query = query.filter(CommunityReport.status == status)
        if severity:
            query = query.filter(CommunityReport.severity == severity)
            
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
                'title': report.title,
                'description': report.description,
                'severity': report.severity,
                'status': report.status,
                'created_at': report.created_at.isoformat() if report.created_at else None,
                'updated_at': report.updated_at.isoformat() if report.updated_at else None,
                'reporter': {
                    'id': user.id if user else None,
                    'username': user.username if user else 'Unknown',
                    'email': user.email if user else None
                } if user else None,
                'evidence': report.evidence,
                'location': report.location,
                'tags': report.tags
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
def moderate_report(report_id):
    """Moderate a community report (approve, reject, flag)"""
    try:
        report = CommunityReport.query.get(report_id)
        if not report:
            return jsonify({'error': 'Report not found'}), 404
            
        data = request.get_json()
        action = data.get('action')
        admin_notes = data.get('admin_notes', '')
        
        if action not in ['approve', 'reject', 'flag']:
            return jsonify({'error': 'Invalid action'}), 400
            
        report.status = action
        report.admin_notes = admin_notes
        report.moderated_by = g.current_user.id
        report.moderated_at = datetime.utcnow()
        db.session.commit()
        
        logger.info(f"Admin {g.current_user.username} {action}ed report {report_id}")
        
        return jsonify({
            'message': f'Report {action}ed successfully',
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
def get_admin_stats():
    """Get admin dashboard statistics"""
    try:
        # User statistics
        total_users = User.query.count()
        active_users = User.query.filter_by(status='active').count()
        suspended_users = User.query.filter_by(status='suspended').count()
        admin_users = User.query.filter_by(role='admin').count()
        
        # Report statistics
        total_reports = CommunityReport.query.count()
        pending_reports = CommunityReport.query.filter_by(status='pending').count()
        approved_reports = CommunityReport.query.filter_by(status='approve').count()
        rejected_reports = CommunityReport.query.filter_by(status='reject').count()
        
        # Recent activity
        recent_users = User.query.order_by(User.created_at.desc()).limit(5).all()
        recent_reports = CommunityReport.query.order_by(CommunityReport.created_at.desc()).limit(5).all()
        
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
                        'username': user.username,
                        'created_at': user.created_at.isoformat() if user.created_at else None
                    } for user in recent_users
                ],
                'new_reports': [
                    {
                        'id': report.id,
                        'title': report.title,
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
def system_health():
    """Get system health information"""
    try:
        # Database health
        try:
            db.session.execute('SELECT 1')
            db_status = 'healthy'
        except Exception:
            db_status = 'unhealthy'
        
        # Basic system info
        import psutil
        system_info = {
            'cpu_percent': psutil.cpu_percent(interval=1),
            'memory_percent': psutil.virtual_memory().percent,
            'disk_percent': psutil.disk_usage('/').percent
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
