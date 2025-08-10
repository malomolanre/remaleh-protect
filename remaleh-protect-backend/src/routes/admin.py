from flask import Blueprint, request, jsonify
try:
    from ..models import db, User, UserScan, CommunityReport, LearningProgress
    from ..auth import admin_required, token_required
except ImportError:
    from models import db, User, UserScan, CommunityReport, LearningProgress
    from auth import admin_required, token_required
from datetime import datetime, timedelta
from sqlalchemy import func, desc
import json

admin_bp = Blueprint('admin', __name__)

# ============================================================================
# DEBUG ENDPOINT
# ============================================================================

@admin_bp.route('/ping', methods=['GET'])
def admin_ping():
    """Simple ping endpoint to test if admin routes are accessible"""
    return jsonify({
        'message': 'Admin routes are working',
        'timestamp': datetime.utcnow().isoformat()
    }), 200

@admin_bp.route('/test-users', methods=['GET'])
@admin_required
def test_users_endpoint(current_user):
    """Test endpoint to return basic user data for debugging"""
    try:
        users = User.query.limit(5).all()
        return jsonify({
            'users': [user.to_dict() for user in users],
            'total': len(users),
            'test': True
        }), 200
    except Exception as e:
        print(f"Error in test_users_endpoint: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/test', methods=['GET'])
@admin_required
def test_admin_access(current_user):
    """Test endpoint to verify admin access"""
    return jsonify({
        'message': 'Admin access verified',
        'user': {
            'id': current_user.id,
            'email': current_user.email,
            'is_admin': current_user.is_admin,
            'role': current_user.role
        }
    }), 200

# ============================================================================
# USER MANAGEMENT
# ============================================================================

@admin_bp.route('/users', methods=['GET'])
@admin_required
def get_all_users(current_user):
    """Get all users with pagination and filtering"""
    try:
        print(f"Admin users endpoint called by user: {current_user.email} (is_admin: {current_user.is_admin})")
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        role = request.args.get('role')
        status = request.args.get('status')
        search = request.args.get('search')
        
        query = User.query
        
        if role:
            query = query.filter(User.role == role)
        if status:
            query = query.filter(User.account_status == status)
        if search:
            query = query.filter(
                (User.email.contains(search)) |
                (User.first_name.contains(search)) |
                (User.last_name.contains(search))
            )
        
        users = query.order_by(User.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        print(f"Found {users.total} users, returning {len(users.items)} for page {page}")
        
        # Convert users to dict and print first one for debugging
        users_dict = [user.to_dict() for user in users.items]
        if users_dict:
            print(f"First user data: {users_dict[0]}")
        
        response_data = {
            'users': users_dict,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': users.total,
                'pages': users.pages
            }
        }
        
        print(f"Response data structure: {response_data}")
        return jsonify(response_data), 200
        
    except Exception as e:
        print(f"Error in get_all_users: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users', methods=['POST'])
@admin_required
def create_user(current_user):
    """Create a new user (admin only)"""
    try:
        print(f"Admin create user endpoint called by: {current_user.email}")
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Required fields
        required_fields = ['email', 'password', 'first_name', 'last_name']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Check if user already exists
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user:
            return jsonify({'error': 'User with this email already exists'}), 400
        
        # Create new user
        new_user = User(
            email=data['email'],
            first_name=data['first_name'],
            last_name=data['last_name'],
            risk_level=data.get('risk_level', 'MEDIUM'),
            role=data.get('role', 'USER'),
            account_status=data.get('account_status', 'ACTIVE'),
            is_active=data.get('is_active', True),
            is_admin=data.get('is_admin', False)
        )
        
        # Set password
        new_user.set_password(data['password'])
        
        # Add to database
        db.session.add(new_user)
        db.session.commit()
        
        print(f"User created successfully: {new_user.email}")
        
        return jsonify({
            'message': 'User created successfully',
            'user': new_user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Error creating user: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<int:user_id>', methods=['GET'])
@admin_required
def get_user_details(current_user, user_id):
    """Get detailed information about a specific user"""
    try:
        user = User.query.get_or_404(user_id)
        
        # Get user statistics
        total_scans = UserScan.query.filter_by(user_id=user_id).count()
        high_risk_scans = UserScan.query.filter_by(
            user_id=user_id, 
            risk_level='HIGH'
        ).count()
        
        # Get recent activity
        recent_scans = UserScan.query.filter_by(user_id=user_id).order_by(
            UserScan.scanned_at.desc()
        ).limit(5).all()
        
        learning_progress = LearningProgress.query.filter_by(user_id=user_id).all()
        completed_modules = len([p for p in learning_progress if p.completed])
        
        user_data = user.to_dict()
        user_data.update({
            'statistics': {
                'total_scans': total_scans,
                'high_risk_scans': high_risk_scans,
                'completed_modules': completed_modules,
                'risk_percentage': (high_risk_scans / total_scans * 100) if total_scans > 0 else 0
            },
            'recent_activity': [scan.to_dict() for scan in recent_scans]
        })
        
        return jsonify({'user': user_data}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<int:user_id>', methods=['PUT'])
@admin_required
def update_user(current_user, user_id):
    """Update user information (admin only)"""
    try:
        user = User.query.get_or_404(user_id)
        data = request.get_json()
        
        # Prevent admin from demoting themselves
        if user.id == current_user.id and data.get('role') != 'ADMIN':
            return jsonify({'error': 'Cannot change your own admin role'}), 400
        
        # Update allowed fields
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'role' in data:
            user.role = data['role']
            user.is_admin = (data['role'] == 'ADMIN')
        if 'account_status' in data:
            user.account_status = data['account_status']
        if 'risk_level' in data:
            user.risk_level = data['risk_level']
        
        db.session.commit()
        
        return jsonify({
            'message': 'User updated successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<int:user_id>/reset-password', methods=['POST'])
@admin_required
def reset_user_password(current_user, user_id):
    """Reset a user's password (admin only)"""
    try:
        user = User.query.get_or_404(user_id)
        data = request.get_json()
        
        if not data or 'new_password' not in data:
            return jsonify({'error': 'New password is required'}), 400
        
        new_password = data['new_password']
        
        # Validate password strength
        from ..auth import validate_password_strength
        is_valid, message = validate_password_strength(new_password)
        if not is_valid:
            return jsonify({'error': f'Password validation failed: {message}'}), 400
        
        # Set new password
        user.set_password(new_password)
        
        # Update last modified timestamp if available
        if hasattr(user, 'updated_at'):
            user.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': f'Password for user {user.email} has been reset successfully',
            'user_id': user.id,
            'email': user.email
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error resetting user password: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<int:user_id>/suspend', methods=['POST'])
@admin_required
def suspend_user(current_user, user_id):
    """Suspend a user account"""
    try:
        user = User.query.get_or_404(user_id)
        
        if user.id == current_user.id:
            return jsonify({'error': 'Cannot suspend your own account'}), 400
        
        user.account_status = 'SUSPENDED'
        user.is_active = False
        db.session.commit()
        
        return jsonify({
            'message': f'User {user.email} suspended successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<int:user_id>/activate', methods=['POST'])
@admin_required
def activate_user(current_user, user_id):
    """Activate a suspended user account"""
    try:
        user = User.query.get_or_404(user_id)
        
        user.account_status = 'ACTIVE'
        user.is_active = True
        db.session.commit()
        
        return jsonify({
            'message': f'User {user.email} activated successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<int:user_id>/delete', methods=['DELETE'])
@admin_required
def delete_user(current_user, user_id):
    """Delete a user account (admin only)"""
    try:
        user = User.query.get_or_404(user_id)
        
        if user.id == current_user.id:
            return jsonify({'error': 'Cannot delete your own account'}), 400
        
        # Soft delete - mark as deleted instead of actually removing
        user.account_status = 'DELETED'
        user.is_active = False
        user.email = f"deleted_{user.id}_{user.email}"
        db.session.commit()
        
        return jsonify({
            'message': f'User {user.email} deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ============================================================================
# ADMIN DASHBOARD
# ============================================================================

@admin_bp.route('/dashboard', methods=['GET'])
@admin_required
def admin_dashboard(current_user):
    """Get admin dashboard statistics"""
    try:
        # User statistics
        total_users = User.query.count()
        active_users = User.query.filter_by(account_status='ACTIVE').count()
        suspended_users = User.query.filter_by(account_status='SUSPENDED').count()
        new_users_today = User.query.filter(
            User.created_at >= datetime.now().date()
        ).count()
        
        # Scan statistics
        total_scans = UserScan.query.count()
        scans_today = UserScan.query.filter(
            UserScan.scanned_at >= datetime.now().date()
        ).count()
        high_risk_scans = UserScan.query.filter_by(risk_level='HIGH').count()
        
        # Community statistics
        total_reports = CommunityReport.query.count()
        pending_reports = CommunityReport.query.filter_by(status='PENDING').count()
        verified_reports = CommunityReport.query.filter_by(verified=True).count()
        
        # Learning statistics
        total_modules = LearningProgress.query.count()
        completed_modules = LearningProgress.query.filter_by(completed=True).count()
        
        return jsonify({
            'users': {
                'total': total_users,
                'active': active_users,
                'suspended': suspended_users,
                'new_today': new_users_today
            },
            'scans': {
                'total': total_scans,
                'today': scans_today,
                'high_risk': high_risk_scans
            },
            'community': {
                'total_reports': total_reports,
                'pending': pending_reports,
                'verified': verified_reports
            },
            'learning': {
                'total_progress': total_modules,
                'completed': completed_modules,
                'completion_rate': (completed_modules / total_modules * 100) if total_modules > 0 else 0
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============================================================================
# BULK OPERATIONS
# ============================================================================

@admin_bp.route('/users/bulk-action', methods=['POST'])
@admin_required
def bulk_user_action(current_user):
    """Perform bulk actions on users"""
    try:
        data = request.get_json()
        user_ids = data.get('user_ids', [])
        action = data.get('action')
        
        if not user_ids or not action:
            return jsonify({'error': 'User IDs and action are required'}), 400
        
        # Prevent admin from affecting themselves
        if current_user.id in user_ids:
            return jsonify({'error': 'Cannot perform action on your own account'}), 400
        
        users = User.query.filter(User.id.in_(user_ids)).all()
        
        if action == 'suspend':
            for user in users:
                user.account_status = 'SUSPENDED'
                user.is_active = False
        elif action == 'activate':
            for user in users:
                user.account_status = 'ACTIVE'
                user.is_active = True
        elif action == 'delete':
            for user in users:
                user.account_status = 'DELETED'
                user.is_active = False
                user.email = f"deleted_{user.id}_{user.email}"
        else:
            return jsonify({'error': 'Invalid action'}), 400
        
        db.session.commit()
        
        return jsonify({
            'message': f'Bulk action "{action}" completed successfully for {len(users)} users'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/bulk-reset-password', methods=['POST'])
@admin_required
def bulk_reset_passwords(current_user):
    """Reset passwords for multiple users (admin only)"""
    try:
        data = request.get_json()
        user_ids = data.get('user_ids', [])
        new_password = data.get('new_password')
        
        if not user_ids or not new_password:
            return jsonify({'error': 'User IDs and new password are required'}), 400
        
        # Prevent admin from affecting themselves
        if current_user.id in user_ids:
            return jsonify({'error': 'Cannot reset your own password through bulk operation'}), 400
        
        # Validate password strength
        from ..auth import validate_password_strength
        is_valid, message = validate_password_strength(new_password)
        if not is_valid:
            return jsonify({'error': f'Password validation failed: {message}'}), 400
        
        users = User.query.filter(User.id.in_(user_ids)).all()
        
        if not users:
            return jsonify({'error': 'No valid users found'}), 404
        
        # Reset passwords for all users
        for user in users:
            user.set_password(new_password)
            # Update last modified timestamp if available
            if hasattr(user, 'updated_at'):
                user.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': f'Passwords reset successfully for {len(users)} users',
            'affected_users': [{'id': user.id, 'email': user.email} for user in users]
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error in bulk password reset: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

# ============================================================================
# COMMUNITY REPORTS MANAGEMENT
# ============================================================================

@admin_bp.route('/community-reports', methods=['GET'])
@admin_required
def get_admin_community_reports(current_user):
    """Get community reports for admin management with filtering and pagination"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        threat_type = request.args.get('threat_type')
        urgency = request.args.get('urgency')
        status = request.args.get('status')
        verified = request.args.get('verified')
        
        query = CommunityReport.query
        
        if threat_type:
            query = query.filter(CommunityReport.threat_type == threat_type)
        if urgency:
            query = query.filter(CommunityReport.urgency == urgency)
        if status:
            query = query.filter(CommunityReport.status == status)
        if verified:
            if verified.lower() == 'true':
                query = query.filter(CommunityReport.verified == True)
            elif verified.lower() == 'false':
                query = query.filter(CommunityReport.verified == False)
        
        reports = query.order_by(CommunityReport.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        # Format reports with user information
        formatted_reports = []
        for report in reports.items:
            report_data = report.to_dict()
            if report.user:
                report_data['creator'] = {
                    'id': report.user.id,
                    'name': f"{report.user.first_name} {report.user.last_name}".strip() or 'Anonymous',
                    'email': report.user.email
                }
            else:
                report_data['creator'] = {
                    'id': None,
                    'name': 'Unknown User',
                    'email': 'N/A'
                }
            formatted_reports.append(report_data)
        
        return jsonify({
            'reports': formatted_reports,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': reports.total,
                'pages': reports.pages
            }
        }), 200
        
    except Exception as e:
        print(f"Error in get_admin_community_reports: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/community-reports/<int:report_id>/verify', methods=['POST'])
@admin_required
def admin_verify_report(current_user, report_id):
    """Mark a community report as verified (admin only)"""
    try:
        report = CommunityReport.query.get_or_404(report_id)
        report.verified = True
        report.status = 'VERIFIED'
        
        db.session.commit()
        
        return jsonify({
            'message': 'Report verified successfully',
            'report': report.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/community-reports/<int:report_id>/reject', methods=['POST'])
@admin_required
def admin_reject_report(current_user, report_id):
    """Mark a community report as rejected (admin only)"""
    try:
        report = CommunityReport.query.get_or_404(report_id)
        report.status = 'REJECTED'
        
        db.session.commit()
        
        return jsonify({
            'message': 'Report rejected successfully',
            'report': report.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/community-reports/<int:report_id>/escalate', methods=['POST'])
@admin_required
def admin_escalate_report(current_user, report_id):
    """Mark a community report as escalated (admin only)"""
    try:
        report = CommunityReport.query.get_or_404(report_id)
        report.status = 'ESCALATED'
        
        db.session.commit()
        
        return jsonify({
            'message': 'Report escalated successfully',
            'report': report.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/community-reports/<int:report_id>', methods=['DELETE'])
@admin_required
def admin_delete_report(current_user, report_id):
    """Delete a community report (admin only)"""
    try:
        report = CommunityReport.query.get_or_404(report_id)
        
        # Delete associated votes first
        from ..models import ReportVote
        ReportVote.query.filter_by(report_id=report_id).delete()
        
        db.session.delete(report)
        db.session.commit()
        
        return jsonify({
            'message': 'Report deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/community-reports/bulk-action', methods=['POST'])
@admin_required
def admin_bulk_report_action(current_user):
    """Perform bulk actions on community reports (admin only)"""
    try:
        data = request.get_json()
        report_ids = data.get('report_ids', [])
        action = data.get('action')
        
        if not report_ids or not action:
            return jsonify({'error': 'Report IDs and action are required'}), 400
        
        reports = CommunityReport.query.filter(CommunityReport.id.in_(report_ids)).all()
        
        if action == 'verify':
            for report in reports:
                report.verified = True
                report.status = 'VERIFIED'
        elif action == 'reject':
            for report in reports:
                report.status = 'REJECTED'
        elif action == 'escalate':
            for report in reports:
                report.status = 'ESCALATED'
        elif action == 'delete':
            # Delete associated votes first
            from ..models import ReportVote
            ReportVote.query.filter(ReportVote.report_id.in_(report_ids)).delete(synchronize_session=False)
            
            for report in reports:
                db.session.delete(report)
        else:
            return jsonify({'error': 'Invalid action'}), 400
        
        db.session.commit()
        
        return jsonify({
            'message': f'Bulk action "{action}" completed successfully for {len(reports)} reports'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ============================================================================
# SYSTEM MAINTENANCE
# ============================================================================

@admin_bp.route('/system-stats', methods=['GET'])
@admin_required
def get_system_stats(current_user):
    """Get system statistics for admin dashboard"""
    try:
        # Get user counts
        total_users = User.query.count()
        active_users = User.query.filter_by(is_active=True).count()
        admin_users = User.query.filter_by(is_admin=True).count()
        
        # Get scan counts
        total_scans = UserScan.query.count()
        recent_scans = UserScan.query.filter(
            UserScan.scanned_at >= datetime.utcnow() - timedelta(days=7)
        ).count()
        
        # Get report counts
        total_reports = CommunityReport.query.count()
        pending_reports = CommunityReport.query.filter_by(status='PENDING').count()
        verified_reports = CommunityReport.query.filter_by(verified=True).count()
        
        # Get learning progress
        total_progress = LearningProgress.query.count()
        completed_modules = LearningProgress.query.filter_by(completed=True).count()
        
        return jsonify({
            'users': {
                'total': total_users,
                'active': active_users,
                'admin': admin_users
            },
            'scans': {
                'total': total_scans,
                'recent_7_days': recent_scans
            },
            'reports': {
                'total': total_reports,
                'pending': pending_reports,
                'verified': verified_reports
            },
            'learning': {
                'total_progress': total_progress,
                'completed_modules': completed_modules
            }
        }), 200
        
    except Exception as e:
        print(f"Error in get_system_stats: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/threats', methods=['GET'])
@admin_required
def get_admin_threats(current_user):
    """Get threats for admin management"""
    try:
        from ..models import Threat
        
        threats = Threat.query.order_by(Threat.reported_at.desc()).all()
        
        return jsonify({
            'threats': [threat.to_dict() for threat in threats]
        }), 200
        
    except Exception as e:
        print(f"Error in get_admin_threats: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/threats/<int:threat_id>/deactivate', methods=['POST'])
@admin_required
def deactivate_threat(current_user, threat_id):
    """Deactivate a threat"""
    try:
        from ..models import Threat
        
        threat = Threat.query.get_or_404(threat_id)
        threat.status = 'INACTIVE'
        db.session.commit()
        
        return jsonify({
            'message': 'Threat deactivated successfully',
            'threat': threat.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/threats/<int:threat_id>/activate', methods=['POST'])
@admin_required
def activate_threat(current_user, threat_id):
    """Activate a threat"""
    try:
        from ..models import Threat
        
        threat = Threat.query.get_or_404(threat_id)
        threat.status = 'ACTIVE'
        db.session.commit()
        
        return jsonify({
            'message': 'Threat activated successfully',
            'threat': threat.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/threats/<int:threat_id>', methods=['DELETE'])
@admin_required
def delete_threat(current_user, threat_id):
    """Delete a threat"""
    try:
        from ..models import Threat
        
        threat = Threat.query.get_or_404(threat_id)
        db.session.delete(threat)
        db.session.commit()
        
        return jsonify({
            'message': 'Threat deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/learning-modules', methods=['GET'])
@admin_required
def get_admin_learning_modules(current_user):
    """Get learning modules for admin management"""
    try:
        from ..models import LearningModule
        
        modules = LearningModule.query.order_by(LearningModule.created_at.desc()).all()
        
        return jsonify({
            'modules': [module.to_dict() for module in modules]
        }), 200
        
    except Exception as e:
        print(f"Error in get_admin_learning_modules: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/learning-modules', methods=['POST'])
@admin_required
def create_learning_module(current_user):
    """Create a new learning module"""
    try:
        from ..models import LearningModule
        
        data = request.get_json()
        
        if not data or not data.get('title') or not data.get('description'):
            return jsonify({'error': 'Title and description are required'}), 400
        
        module = LearningModule(
            title=data['title'],
            description=data['description'],
            difficulty=data.get('difficulty', 'BEGINNER'),
            estimated_time=data.get('estimated_time', 15),
            content=data.get('content', {}),
            is_active=data.get('is_active', True)
        )
        
        db.session.add(module)
        db.session.commit()
        
        return jsonify({
            'message': 'Learning module created successfully',
            'module': module.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/learning-modules/<int:module_id>', methods=['PUT'])
@admin_required
def update_learning_module(current_user, module_id):
    """Update a learning module"""
    try:
        from ..models import LearningModule
        
        module = LearningModule.query.get_or_404(module_id)
        data = request.get_json()
        
        if data.get('title'):
            module.title = data['title']
        if data.get('description'):
            module.description = data['description']
        if data.get('difficulty'):
            module.difficulty = data['difficulty']
        if data.get('estimated_time'):
            module.estimated_time = data['estimated_time']
        if data.get('content'):
            module.content = data['content']
        if data.get('is_active') is not None:
            module.is_active = data['is_active']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Learning module updated successfully',
            'module': module.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/learning-modules/<int:module_id>/deactivate', methods=['POST'])
@admin_required
def deactivate_learning_module(current_user, module_id):
    """Deactivate a learning module"""
    try:
        from ..models import LearningModule
        
        module = LearningModule.query.get_or_404(module_id)
        module.is_active = False
        db.session.commit()
        
        return jsonify({
            'message': 'Learning module deactivated successfully',
            'module': module.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/learning-modules/<int:module_id>/activate', methods=['POST'])
@admin_required
def activate_learning_module(current_user, module_id):
    """Activate a learning module"""
    try:
        from ..models import LearningModule
        
        module = LearningModule.query.get_or_404(module_id)
        module.is_active = True
        db.session.commit()
        
        return jsonify({
            'message': 'Learning module activated successfully',
            'module': module.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/learning-modules/<int:module_id>', methods=['DELETE'])
@admin_required
def delete_learning_module(current_user, module_id):
    """Delete a learning module"""
    try:
        from ..models import LearningModule
        
        module = LearningModule.query.get_or_404(module_id)
        db.session.delete(module)
        db.session.commit()
        
        return jsonify({
            'message': 'Learning module deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/maintenance/cleanup', methods=['POST'])
@admin_required
def system_cleanup(current_user):
    """Perform system cleanup tasks"""
    try:
        # Clean up old scans (older than 90 days)
        cutoff_date = datetime.now() - timedelta(days=90)
        old_scans = UserScan.query.filter(UserScan.scanned_at < cutoff_date).all()
        
        for scan in old_scans:
            db.session.delete(scan)
        
        # Clean up old reports (older than 180 days)
        cutoff_date = datetime.now() - timedelta(days=180)
        old_reports = CommunityReport.query.filter(CommunityReport.created_at < cutoff_date).all()
        
        for report in old_reports:
            db.session.delete(report)
        
        db.session.commit()
        
        return jsonify({
            'message': 'System cleanup completed',
            'deleted_scans': len(old_scans),
            'deleted_reports': len(old_reports)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
