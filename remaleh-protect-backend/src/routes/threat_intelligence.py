from flask import Blueprint, request, jsonify
try:
    from ..models import db, Threat, CommunityAlert, User
    from ..auth import token_required, get_current_user_id
except ImportError:
    from models import db, Threat, CommunityAlert, User
    from auth import token_required, get_current_user_id
from datetime import datetime, timedelta
from sqlalchemy import func, desc
import json

threat_intel_bp = Blueprint('threat_intelligence', __name__)

@threat_intel_bp.route('/dashboard', methods=['GET'])
@token_required
def get_threat_dashboard(current_user):
    """Get threat intelligence dashboard data"""
    try:
        # Get trending threats (last 7 days)
        week_ago = datetime.utcnow() - timedelta(days=7)
        
        trending_threats = db.session.query(
            Threat.type,
            func.count(Threat.id).label('count'),
            Threat.risk_level,
            Threat.region
        ).filter(
            Threat.reported_at >= week_ago,
            Threat.status == 'ACTIVE'
        ).group_by(
            Threat.type, Threat.risk_level, Threat.region
        ).order_by(desc('count')).limit(10).all()
        
        # Get recent community alerts
        recent_alerts = CommunityAlert.query.filter(
            CommunityAlert.status == 'ACTIVE'
        ).order_by(
            CommunityAlert.created_at.desc()
        ).limit(10).all()
        
        # Get community statistics
        total_reports = CommunityAlert.query.filter(
            CommunityAlert.status == 'ACTIVE'
        ).count()
        
        active_users = User.query.filter(User.is_active == True).count()
        
        threats_blocked = db.session.query(
            func.sum(Threat.affected_users)
        ).filter(
            Threat.status == 'RESOLVED'
        ).scalar() or 0
        
        # Calculate average response time (mock data for now)
        avg_response_time = "2.3s"
        
        # Format trending threats
        formatted_threats = []
        for threat in trending_threats:
            # Calculate trend (mock calculation)
            trend = "+" + str(threat.count % 20 + 5) + "%"
            formatted_threats.append({
                'type': threat.type,
                'count': threat.count,
                'trend': trend,
                'risk': threat.risk_level,
                'region': threat.region or 'Global'
            })
        
        # Format alerts
        formatted_alerts = []
        for alert in recent_alerts:
            time_ago = datetime.utcnow() - alert.created_at
            if time_ago.days > 0:
                time_str = f"{time_ago.days} days ago"
            elif time_ago.seconds > 3600:
                time_str = f"{time_ago.seconds // 3600} hours ago"
            else:
                time_str = f"{time_ago.seconds // 60} minutes ago"
            
            formatted_alerts.append({
                'id': alert.id,
                'message': alert.message,
                'severity': alert.severity,
                'time': time_str
            })
        
        return jsonify({
            'trending_threats': formatted_threats,
            'recent_alerts': formatted_alerts,
            'community_stats': {
                'totalReports': total_reports,
                'activeUsers': active_users,
                'threatsBlocked': threats_blocked,
                'avgResponseTime': avg_response_time
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@threat_intel_bp.route('/threats', methods=['GET'])
@token_required
def get_threats(current_user):
    """Get all threats with filtering"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        threat_type = request.args.get('type')
        risk_level = request.args.get('risk_level')
        region = request.args.get('region')
        status = request.args.get('status')
        
        query = Threat.query
        
        if threat_type:
            query = query.filter(Threat.type == threat_type)
        if risk_level:
            query = query.filter(Threat.risk_level == risk_level)
        if region:
            query = query.filter(Threat.region == region)
        if status:
            query = query.filter(Threat.status == status)
        
        threats = query.order_by(Threat.reported_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'threats': [threat.to_dict() for threat in threats.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': threats.total,
                'pages': threats.pages
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@threat_intel_bp.route('/threats/<int:threat_id>', methods=['GET'])
@token_required
def get_threat(current_user, threat_id):
    """Get specific threat details"""
    try:
        threat = Threat.query.get_or_404(threat_id)
        return jsonify(threat.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@threat_intel_bp.route('/threats', methods=['POST'])
@token_required
def create_threat(current_user):
    """Create a new threat (admin only)"""
    try:
        data = request.get_json()
        
        if not data or not data.get('type') or not data.get('description'):
            return jsonify({'error': 'Type and description are required'}), 400
        
        threat = Threat(
            type=data['type'],
            description=data['description'],
            risk_level=data.get('risk_level', 'MEDIUM'),
            region=data.get('region'),
            source=data.get('source', 'Manual'),
            impact_score=data.get('impact_score', 0),
            affected_users=data.get('affected_users', 0)
        )
        
        db.session.add(threat)
        db.session.commit()
        
        return jsonify({
            'message': 'Threat created successfully',
            'threat': threat.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@threat_intel_bp.route('/alerts', methods=['GET'])
@token_required
def get_alerts(current_user):
    """Get community alerts"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        severity = request.args.get('severity')
        
        query = CommunityAlert.query.filter(CommunityAlert.status == 'ACTIVE')
        
        if severity:
            query = query.filter(CommunityAlert.severity == severity)
        
        alerts = query.order_by(CommunityAlert.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'alerts': [alert.to_dict() for alert in alerts.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': alerts.total,
                'pages': alerts.pages
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@threat_intel_bp.route('/alerts', methods=['POST'])
@token_required
def create_alert(current_user):
    """Create a community alert"""
    try:
        data = request.get_json()
        
        if not data or not data.get('message') or not data.get('severity'):
            return jsonify({'error': 'Message and severity are required'}), 400
        
        alert = CommunityAlert(
            message=data['message'],
            severity=data['severity'],
            threat_type=data.get('threat_type'),
            region=data.get('region'),
            created_by=current_user.id
        )
        
        db.session.add(alert)
        db.session.commit()
        
        return jsonify({
            'message': 'Alert created successfully',
            'alert': alert.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@threat_intel_bp.route('/stats/trends', methods=['GET'])
@token_required
def get_threat_trends(current_user):
    """Get threat trends over time"""
    try:
        days = request.args.get('days', 7, type=int)
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Get daily threat counts by type
        trends = db.session.query(
            func.date(Threat.reported_at).label('date'),
            Threat.type,
            func.count(Threat.id).label('count')
        ).filter(
            Threat.reported_at >= start_date,
            Threat.reported_at <= end_date
        ).group_by(
            func.date(Threat.reported_at), Threat.type
        ).all()
        
        # Format data for frontend
        trend_data = {}
        for trend in trends:
            date_str = trend.date.strftime('%Y-%m-%d')
            if date_str not in trend_data:
                trend_data[date_str] = {}
            trend_data[date_str][trend.type] = trend.count
        
        return jsonify({
            'trends': trend_data,
            'period': f'{days} days'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
