from flask import Blueprint, request, jsonify, current_app, send_from_directory
try:
    from ..models import db, User, CommunityReport, ReportVote, CommunityAlert, CommunityReportMedia
    from ..auth import token_required, get_current_user_id
except ImportError:
    from models import db, User, CommunityReport, ReportVote, CommunityAlert, CommunityReportMedia
    from auth import token_required, get_current_user_id
from datetime import datetime, timedelta
import os
from werkzeug.utils import secure_filename
from sqlalchemy import func, desc, case, or_
import json

community_bp = Blueprint('community', __name__)

@community_bp.route('/reports', methods=['GET'])
@token_required
def get_community_reports(current_user):
    """Get community reports with filtering and pagination"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        threat_type = request.args.get('threat_type')
        urgency = request.args.get('urgency')
        status = request.args.get('status')
        verified_only = request.args.get('verified_only', 'false').lower() == 'true'
        include_all = request.args.get('include_all', 'false').lower() == 'true'
        include_own = request.args.get('include_own', 'false').lower() == 'true'
        
        query = CommunityReport.query
        
        if threat_type:
            query = query.filter(CommunityReport.threat_type == threat_type)
        if urgency:
            query = query.filter(CommunityReport.urgency == urgency)
        # Visibility logic
        if status:
            base_filter = (CommunityReport.status == status)
        elif not include_all:
            base_filter = (CommunityReport.status.in_(['APPROVED', 'VERIFIED']))
        else:
            base_filter = None

        if verified_only:
            base_filter = (CommunityReport.verified == True) if base_filter is None else (base_filter & (CommunityReport.verified == True))

        if base_filter is not None:
            if include_own:
                query = query.filter(or_(CommunityReport.user_id == current_user.id, base_filter))
            else:
                query = query.filter(base_filter)
        
        reports = query.order_by(CommunityReport.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        # Get user's votes for these reports
        report_ids = [r.id for r in reports.items]
        user_votes = ReportVote.query.filter(
            ReportVote.user_id == current_user.id,
            ReportVote.report_id.in_(report_ids)
        ).all()
        vote_dict = {v.report_id: v.vote_type for v in user_votes}
        
        # Format reports with user's vote information
        formatted_reports = []
        for report in reports.items:
            report_data = report.to_dict()
            report_data['user_vote'] = vote_dict.get(report.id)
            report_data['creator'] = {
                'id': report.user.id,
                'name': f"{report.user.first_name} {report.user.last_name}".strip() or 'Anonymous'
            }
            # Attach media
            report_data['media'] = [m.to_dict() for m in getattr(report, 'media', [])]
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
        return jsonify({'error': str(e)}), 500

@community_bp.route('/reports', methods=['POST'])
@token_required
def create_report(current_user):
    """Create a new community threat report"""
    try:
        data = request.get_json()
        
        if not data or not data.get('threat_type') or not data.get('description'):
            return jsonify({'error': 'Threat type and description are required'}), 400
        
        report = CommunityReport(
            user_id=current_user.id,
            threat_type=data['threat_type'],
            description=data['description'],
            location=data.get('location'),
            urgency=data.get('urgency', 'MEDIUM')
        )
        
        db.session.add(report)
        db.session.commit()
        
        return jsonify({
            'message': 'Report submitted successfully',
            'report': report.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@community_bp.route('/reports/<int:report_id>', methods=['GET'])
@token_required
def get_report(current_user, report_id):
    """Get specific community report details"""
    try:
        report = CommunityReport.query.get_or_404(report_id)
        
        # Get user's vote for this report
        user_vote = ReportVote.query.filter(
            ReportVote.user_id == current_user.id,
            ReportVote.report_id == report_id
        ).first()
        
        report_data = report.to_dict()
        report_data['user_vote'] = user_vote.vote_type if user_vote else None
        report_data['creator'] = {
            'id': report.user.id,
            'name': f"{report.user.first_name} {report.user.last_name}".strip() or 'Anonymous'
        }
        report_data['media'] = [m.to_dict() for m in getattr(report, 'media', [])]
        
        return jsonify(report_data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@community_bp.route('/reports/<int:report_id>/vote', methods=['POST'])
@token_required
def vote_on_report(current_user, report_id):
    """Vote on a community report"""
    try:
        data = request.get_json()
        vote_type = data.get('vote_type')  # 'up' or 'down'
        
        if vote_type not in ['up', 'down']:
            return jsonify({'error': 'Vote type must be "up" or "down"'}), 400
        
        # Check if user already voted
        existing_vote = ReportVote.query.filter(
            ReportVote.user_id == current_user.id,
            ReportVote.report_id == report_id
        ).first()
        
        report = CommunityReport.query.get_or_404(report_id)
        
        if existing_vote:
            # Update existing vote
            if existing_vote.vote_type == vote_type:
                # Remove vote if clicking same button
                db.session.delete(existing_vote)
                if vote_type == 'up':
                    report.votes_up -= 1
                else:
                    report.votes_down -= 1
            else:
                # Change vote
                if existing_vote.vote_type == 'up':
                    report.votes_up -= 1
                    report.votes_down += 1
                else:
                    report.votes_down -= 1
                    report.votes_up += 1
                existing_vote.vote_type = vote_type
        else:
            # Create new vote
            vote = ReportVote(
                user_id=current_user.id,
                report_id=report_id,
                vote_type=vote_type
            )
            db.session.add(vote)
            
            if vote_type == 'up':
                report.votes_up += 1
            else:
                report.votes_down += 1
        
        db.session.commit()
        
        return jsonify({
            'message': 'Vote recorded successfully',
            'report': report.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@community_bp.route('/reports/<int:report_id>/verify', methods=['POST'])
@token_required
def verify_report(current_user, report_id):
    """Mark a report as verified (admin only)"""
    try:
        # Check if user is admin (you can add admin field to User model)
        if not getattr(current_user, 'is_admin', False):
            return jsonify({'error': 'Admin privileges required'}), 403
        
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

@community_bp.route('/reports/<int:report_id>/media', methods=['POST'])
@token_required
def upload_report_media(current_user, report_id):
    """Attach media to a community report.
    Accepts either JSON with media_url or multipart/form-data with a file field 'file'.
    """
    try:
        report = CommunityReport.query.get_or_404(report_id)
        # JSON path (remote URL)
        if request.is_json:
            data = request.get_json() or {}
            media_url = data.get('media_url')
            media_type = data.get('media_type', 'image')
            if not media_url:
                return jsonify({'error': 'media_url is required'}), 400
            media = CommunityReportMedia(report_id=report.id, media_url=media_url, media_type=media_type)
            db.session.add(media)
            db.session.commit()
            return jsonify({'message': 'Media uploaded', 'media': media.to_dict()}), 201

        # Multipart file path (local upload)
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        filename = secure_filename(file.filename)
        ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''
        if ext not in current_app.config.get('ALLOWED_EXTENSIONS', set(['png','jpg','jpeg','gif','webp'])):
            return jsonify({'error': 'File type not allowed'}), 400

        upload_folder = current_app.config.get('UPLOAD_FOLDER')
        os.makedirs(upload_folder, exist_ok=True)
        save_path = os.path.join(upload_folder, filename)
        # Ensure unique filename
        base, extension = os.path.splitext(filename)
        counter = 1
        while os.path.exists(save_path):
            filename = f"{base}_{counter}{extension}"
            save_path = os.path.join(upload_folder, filename)
            counter += 1
        file.save(save_path)

        public_url = f"/api/community/uploads/{filename}"
        media = CommunityReportMedia(report_id=report.id, media_url=public_url, media_type='image')
        db.session.add(media)
        db.session.commit()
        return jsonify({'message': 'Media uploaded', 'media': media.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@community_bp.route('/uploads/<path:filename>', methods=['GET'])
def serve_uploaded_media(filename):
    """Serve uploaded media files."""
    try:
        upload_folder = current_app.config.get('UPLOAD_FOLDER')
        return send_from_directory(upload_folder, filename)
    except Exception as e:
        return jsonify({'error': str(e)}), 404

@community_bp.route('/leaderboard', methods=['GET'])
@token_required
def get_leaderboard(current_user):
    """Get top reporters leaderboard"""
    try:
        results = db.session.query(
            User.id,
            User.first_name,
            User.last_name,
            func.count(CommunityReport.id).label('report_count')
        ).join(CommunityReport).group_by(User.id, User.first_name, User.last_name).order_by(desc('report_count')).limit(20).all()

        leaderboard = []
        rank = 1
        for r in results:
            leaderboard.append({
                'id': r.id,
                'name': f"{r.first_name} {r.last_name}".strip() or 'Anonymous',
                'reports': r.report_count,
                'rank': rank
            })
            rank += 1

        return jsonify({'leaderboard': leaderboard}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@community_bp.route('/trending', methods=['GET'])
@token_required
def get_trending_threats(current_user):
    """Get trending threats based on community reports"""
    try:
        # Get threat types with most reports in last 30 days
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        
        trending = db.session.query(
            CommunityReport.threat_type,
            func.count(CommunityReport.id).label('count'),
            func.avg(
                case(
                    (CommunityReport.urgency == 'HIGH', 3),
                    (CommunityReport.urgency == 'MEDIUM', 2),
                    (CommunityReport.urgency == 'LOW', 1)
                )
            ).label('avg_urgency')
        ).filter(
            CommunityReport.created_at >= thirty_days_ago,
            CommunityReport.status.in_(['PENDING', 'VERIFIED', 'APPROVED'])
        ).group_by(
            CommunityReport.threat_type
        ).order_by(
            desc('count')
        ).limit(10).all()
        
        formatted_trending = []
        for trend in trending:
            # Calculate trend indicator
            if trend.count > 20:
                trend_indicator = '🔥 Surging'
            elif trend.count > 10:
                trend_indicator = '📈 Rising'
            elif trend.count > 5:
                trend_indicator = '📊 Stable'
            else:
                trend_indicator = '📉 Low'
            
            formatted_trending.append({
                'threat_type': trend.threat_type,
                'report_count': trend.count,
                'urgency_score': round(trend.avg_urgency or 0, 1),
                'trend': trend_indicator
            })
        
        return jsonify({'trending_threats': formatted_trending}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@community_bp.route('/stats', methods=['GET'])
@token_required
def get_community_stats(current_user):
    """Get community statistics"""
    try:
        # Total reports
        total_reports = CommunityReport.query.count()
        
        # Reports by status
        status_counts = db.session.query(
            CommunityReport.status,
            func.count(CommunityReport.id).label('count')
        ).group_by(CommunityReport.status).all()
        
        # Reports by urgency
        urgency_counts = db.session.query(
            CommunityReport.urgency,
            func.count(CommunityReport.id).label('count')
        ).group_by(CommunityReport.urgency).all()
        
        # Top contributors
        top_contributors = db.session.query(
            User.id,
            User.first_name,
            User.last_name,
            func.count(CommunityReport.id).label('report_count')
        ).join(CommunityReport).group_by(
            User.id, User.first_name, User.last_name
        ).order_by(desc('report_count')).limit(5).all()
        
        # Recent activity
        recent_activity = db.session.query(
            CommunityReport.created_at,
            CommunityReport.threat_type,
            User.first_name,
            User.last_name
        ).join(User).order_by(
            CommunityReport.created_at.desc()
        ).limit(10).all()
        
        stats = {
            'total_reports': total_reports,
            'status_breakdown': {s.status: s.count for s in status_counts},
            'urgency_breakdown': {u.urgency: u.count for u in urgency_counts},
            'top_contributors': [
                {
                    'id': c.id,
                    'name': f"{c.first_name} {c.last_name}".strip() or 'Anonymous',
                    'report_count': c.report_count
                } for c in top_contributors
            ],
            'recent_activity': [
                {
                    'date': a.created_at.strftime('%Y-%m-%d %H:%M'),
                    'threat_type': a.threat_type,
                    'reporter': f"{a.first_name} {a.last_name}".strip() or 'Anonymous'
                } for a in recent_activity
            ]
        }
        
        return jsonify(stats), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@community_bp.route('/my-stats', methods=['GET'])
@token_required
def get_my_reporting_stats(current_user):
    """Get current user's reporting stats including rank and points"""
    try:
        # Base counts
        report_count = CommunityReport.query.filter_by(user_id=current_user.id).count()
        approved_count = CommunityReport.query.filter_by(user_id=current_user.id, status='APPROVED').count()
        verified_count = CommunityReport.query.filter_by(user_id=current_user.id, status='VERIFIED').count()
        pending_count = CommunityReport.query.filter_by(user_id=current_user.id, status='PENDING').count()
        rejected_count = CommunityReport.query.filter_by(user_id=current_user.id, status='REJECTED').count()

        # Aggregate votes
        votes_agg = db.session.query(
            func.coalesce(func.sum(CommunityReport.votes_up), 0),
            func.coalesce(func.sum(CommunityReport.votes_down), 0)
        ).filter(CommunityReport.user_id == current_user.id).first()
        total_upvotes = int(votes_agg[0] or 0)
        total_downvotes = int(votes_agg[1] or 0)

        # Points: simple formula (5 per report, +5 per verified, + upvotes)
        points = (report_count * 5) + (verified_count * 5) + total_upvotes

        # Rank by report count (descending)
        user_counts = db.session.query(
            User.id.label('uid'),
            func.count(CommunityReport.id).label('rc')
        ).join(CommunityReport).group_by(User.id).order_by(desc('rc')).all()

        rank = None
        if report_count > 0 and user_counts:
            for idx, row in enumerate(user_counts, start=1):
                if row.uid == current_user.id:
                    rank = idx
                    break

        return jsonify({
            'report_count': report_count,
            'approved_count': approved_count,
            'verified_count': verified_count,
            'pending_count': pending_count,
            'rejected_count': rejected_count,
            'total_upvotes': total_upvotes,
            'total_downvotes': total_downvotes,
            'points': points,
            'rank': rank
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@community_bp.route('/alerts', methods=['GET'])
@token_required
def get_community_alerts(current_user):
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

@community_bp.route('/alerts', methods=['POST'])
@token_required
def create_community_alert(current_user):
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

@community_bp.route('/reports/<int:report_id>/comment', methods=['POST'])
@token_required
def add_comment_to_report(current_user, report_id):
    """Add a comment to a community report"""
    try:
        data = request.get_json()
        comment_text = data.get('comment')
        
        if not comment_text:
            return jsonify({'error': 'Comment text is required'}), 400
        
        # In a real implementation, you'd have a Comment model
        # For now, we'll just return success
        return jsonify({
            'message': 'Comment added successfully',
            'comment_id': 1  # Mock ID
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
