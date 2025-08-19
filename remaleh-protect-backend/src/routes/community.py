from flask import Blueprint, request, jsonify, current_app, send_from_directory
try:
    from ..models import db, User, CommunityReport, ReportVote, CommunityAlert, CommunityReportMedia, CommunityReportComment, UserPointLog
    from ..auth import token_required, get_current_user_id
    from ..cache import cache
except ImportError:
    from models import db, User, CommunityReport, ReportVote, CommunityAlert, CommunityReportMedia, CommunityReportComment, UserPointLog
    from auth import token_required, get_current_user_id
    from cache import cache
from datetime import datetime, timedelta
def compute_user_tier(points):
    if points >= 500:
        return 'Guardian'
    if points >= 250:
        return 'Champion'
    if points >= 100:
        return 'Ally'
    return 'Helper'

def award_points_with_daily_cap(user_id, base_points, reason, report_id=None, daily_cap=120):
    # Sum awarded today
    start_of_day = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_points = db.session.query(func.coalesce(func.sum(UserPointLog.points), 0)).filter(
        UserPointLog.user_id == user_id,
        UserPointLog.created_at >= start_of_day
    ).scalar() or 0

    remaining = max(0, daily_cap - int(today_points))
    to_award = min(base_points, remaining)
    if to_award <= 0:
        return 0
    log = UserPointLog(user_id=user_id, report_id=report_id, points=to_award, reason=reason)
    db.session.add(log)
    try:
        db.session.flush()  # ensure subsequent reads see this award within the same transaction
    except Exception:
        pass
    return to_award
import os
from werkzeug.utils import secure_filename
from sqlalchemy import func, desc, case, or_
import json
from urllib.parse import urlparse

# Optional Cloudinary support
try:
    import cloudinary
    import cloudinary.uploader
except ImportError:
    cloudinary = None

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
        sort = request.args.get('sort', 'newest').lower()  # newest | top | verified
        
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

        # Sorting
        if sort == 'top':
            query = query.order_by((CommunityReport.votes_up - CommunityReport.votes_down).desc(), CommunityReport.created_at.desc())
        elif sort == 'verified':
            # Put verified first, then newest
            query = query.order_by(CommunityReport.verified.desc(), CommunityReport.created_at.desc())
        else:
            # newest
            query = query.order_by(CommunityReport.created_at.desc())
        
        reports = query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        # Prepare tiers for creators (all-time points)
        creator_ids = list({r.user_id for r in reports.items})
        user_id_to_tier = {}
        if creator_ids:
            points_by_user = db.session.query(
                UserPointLog.user_id,
                func.coalesce(func.sum(UserPointLog.points), 0).label('points')
            ).filter(UserPointLog.user_id.in_(creator_ids)).group_by(UserPointLog.user_id).all()
            for uid, pts in points_by_user:
                user_id_to_tier[int(uid)] = compute_user_tier(int(pts or 0))

        # Get user's votes for these reports (guard against empty list)
        report_ids = [r.id for r in reports.items]
        vote_dict = {}
        if report_ids:
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
            # Creator info (robust if user is missing)
            creator_user = getattr(report, 'user', None)
            creator_name = 'Anonymous'
            creator_id = None
            if creator_user is not None:
                creator_id = getattr(creator_user, 'id', None)
                first_name = getattr(creator_user, 'first_name', '') or ''
                last_name = getattr(creator_user, 'last_name', '') or ''
                combined = f"{first_name} {last_name}".strip()
                if combined:
                    creator_name = combined
                else:
                    # try email prefix
                    email = getattr(creator_user, 'email', '') or ''
                    creator_name = (email.split('@')[0] if email else 'Anonymous')
            creator_bio = getattr(creator_user, 'bio', None) if creator_user is not None else None
            report_data['creator'] = {'id': creator_id, 'name': creator_name, 'tier': user_id_to_tier.get(creator_id), 'bio': creator_bio}
            # Attach media
            report_data['media'] = [m.to_dict() for m in getattr(report, 'media', [])]
            # Attach latest comments (limit 3)
            comments = CommunityReportComment.query.filter_by(report_id=report.id).order_by(CommunityReportComment.created_at.desc()).limit(3).all()
            report_data['comments'] = [c.to_dict() for c in comments]
            formatted_reports.append(report_data)
        
        return jsonify({
            'reports': formatted_reports,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': reports.total,
                'pages': reports.pages,
                'has_next': reports.has_next,
                'has_prev': reports.has_prev,
                'next_num': reports.next_num,
                'prev_num': reports.prev_num
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@community_bp.route('/reports', methods=['POST'])
@token_required
def create_report(current_user):
    """Create a new community threat report"""
    try:
        # Rate limit submissions: max 5/minute and 20 per 5-minute window per user
        try:
            if cache and cache.redis_client:
                now = datetime.utcnow()
                minute_bucket = now.strftime('%Y%m%d%H%M')
                five_min_bucket = now.strftime('%Y%m%d%H') + f"{now.minute // 5}"
                k1 = f"ratelimit:report:{current_user.id}:m:{minute_bucket}"
                k5 = f"ratelimit:report:{current_user.id}:m5:{five_min_bucket}"
                m_count = cache.redis_client.incr(k1)
                if m_count == 1:
                    cache.redis_client.expire(k1, 65)
                f_count = cache.redis_client.incr(k5)
                if f_count == 1:
                    cache.redis_client.expire(k5, 5*60 + 10)
                if int(m_count) > 5 or int(f_count) > 20:
                    return jsonify({'error': 'Rate limit exceeded. Please wait before submitting more reports.'}), 429
        except Exception:
            pass

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
        report_data['comments'] = [c.to_dict() for c in getattr(report, 'comments', [])]
        
        return jsonify(report_data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@community_bp.route('/reports/<int:report_id>', methods=['DELETE'])
@token_required
def delete_report(current_user, report_id):
    """Delete a report owned by the current user, or by admin.
    Cleans up media (local files or Cloudinary) and comments via cascade.
    """
    try:
        report = CommunityReport.query.get_or_404(report_id)
        if report.user_id != current_user.id and not getattr(current_user, 'is_admin', False):
            return jsonify({'error': 'Not authorized to delete this report'}), 403

        # Delete associated media files (local or Cloudinary)
        for m in list(getattr(report, 'media', [])):
            media_url = m.media_url or ''
            if media_url.startswith('/api/community/uploads/'):
                try:
                    filename = media_url.split('/api/community/uploads/', 1)[1]
                    upload_folder = current_app.config.get('UPLOAD_FOLDER')
                    if upload_folder:
                        file_path = os.path.join(upload_folder, filename)
                        if os.path.exists(file_path):
                            os.remove(file_path)
                except Exception:
                    pass
            else:
                if cloudinary and ('res.cloudinary.com' in media_url):
                    try:
                        cloud_name = current_app.config.get('CLOUDINARY_CLOUD_NAME')
                        api_key = current_app.config.get('CLOUDINARY_API_KEY')
                        api_secret = current_app.config.get('CLOUDINARY_API_SECRET')
                        if cloud_name and api_key and api_secret:
                            cloudinary.config(cloud_name=cloud_name, api_key=api_key, api_secret=api_secret, secure=True)
                            parsed = urlparse(media_url)
                            parts = parsed.path.split('/')
                            if 'upload' in parts:
                                upload_idx = parts.index('upload')
                                public_parts = parts[upload_idx+2:]
                                public_id_with_ext = '/'.join(public_parts)
                                if public_id_with_ext:
                                    public_id = os.path.splitext(public_id_with_ext)[0]
                                    cloudinary.uploader.destroy(public_id)
                    except Exception:
                        pass

        # Clean up related point logs referencing this report to avoid FK constraint
        try:
            from ..models import UserPointLog
        except ImportError:
            from models import UserPointLog
        db.session.query(UserPointLog).filter_by(report_id=report.id).delete(synchronize_session=False)

        db.session.delete(report)
        db.session.commit()
        return jsonify({'message': 'Report deleted', 'report_id': report_id}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@community_bp.route('/reports/<int:report_id>/comments', methods=['GET'])
@token_required
def list_report_comments(current_user, report_id):
    """List comments for a report with pagination"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)

        # Ensure report exists
        CommunityReport.query.get_or_404(report_id)

        comments = CommunityReportComment.query.filter_by(report_id=report_id).order_by(
            CommunityReportComment.created_at.desc()
        ).paginate(page=page, per_page=per_page, error_out=False)

        return jsonify({
            'comments': [c.to_dict() for c in comments.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': comments.total,
                'pages': comments.pages
            }
        }), 200
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
        # Allow admin or moderator
        role = (getattr(current_user, 'role', None) or '').upper()
        is_admin = getattr(current_user, 'is_admin', False)
        if not (is_admin or role in ('MODERATOR','ADMIN')):
            return jsonify({'error': 'Moderator or admin privileges required'}), 403
        
        report = CommunityReport.query.get_or_404(report_id)
        total_awarded = 0
        if not report.verified:
            report.verified = True
            report.status = 'VERIFIED'

            # Points model: +10 base per verified report, +5 bonus if evidence is attached
            base_points = 10
            has_evidence = bool(getattr(report, 'media', []))
            bonus_points = 5 if has_evidence else 0

            # Award with daily cap 120
            total_awarded += award_points_with_daily_cap(report.user_id, base_points, 'Verified report', report_id=report.id)
            if bonus_points:
                total_awarded += award_points_with_daily_cap(report.user_id, bonus_points, 'Verified report with evidence', report_id=report.id)

            # If the report was APPROVED before, optionally it may have awarded +2 already.
            # We do NOT revoke it; verified awards are additive.

        db.session.commit()

        return jsonify({
            'message': 'Report verified successfully',
            'report': report.to_dict(),
            'awarded_points': total_awarded
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

        # Multipart file path (local upload or Cloudinary)
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        filename = secure_filename(file.filename)
        ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''
        if ext not in current_app.config.get('ALLOWED_EXTENSIONS', set(['png','jpg','jpeg','gif','webp','mp4','mov','webm','mkv','avi'])):
            return jsonify({'error': 'File type not allowed'}), 400

        media_url = None
        media_type = 'image'
        cloud_name = current_app.config.get('CLOUDINARY_CLOUD_NAME')
        api_key = current_app.config.get('CLOUDINARY_API_KEY')
        api_secret = current_app.config.get('CLOUDINARY_API_SECRET')

        if cloudinary and cloud_name and api_key and api_secret:
            cloudinary.config(
                cloud_name=cloud_name,
                api_key=api_key,
                api_secret=api_secret,
                secure=True
            )
            upload_result = cloudinary.uploader.upload(file, folder='community_reports', resource_type='auto', use_filename=True, unique_filename=True, timeout=60)
            media_url = upload_result.get('secure_url') or upload_result.get('url')
            media_type = upload_result.get('resource_type', 'image')
        else:
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
            media_url = f"/api/community/uploads/{filename}"

        media = CommunityReportMedia(report_id=report.id, media_url=media_url, media_type=media_type)
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

@community_bp.route('/reports/<int:report_id>/media/<int:media_id>', methods=['DELETE'])
@token_required
def delete_report_media(current_user, report_id, media_id):
    """Admin-only: Delete a media attachment from a community report.
    If the media is a locally uploaded file, also remove it from disk.
    """
    try:
        if not getattr(current_user, 'is_admin', False):
            return jsonify({'error': 'Admin privileges required'}), 403

        media = CommunityReportMedia.query.filter_by(id=media_id, report_id=report_id).first()
        if not media:
            return jsonify({'error': 'Media not found'}), 404

        deleted_file = False
        media_url = media.media_url or ''
        # If it's a locally stored file, remove from disk; if it's Cloudinary, delete via API
        if media_url.startswith('/api/community/uploads/'):
            try:
                filename = media_url.split('/api/community/uploads/', 1)[1]
                upload_folder = current_app.config.get('UPLOAD_FOLDER')
                file_path = os.path.join(upload_folder, filename)
                if os.path.exists(file_path):
                    os.remove(file_path)
                    deleted_file = True
            except Exception:
                pass
        else:
            # Attempt Cloudinary deletion if configured and URL looks like Cloudinary
            if cloudinary and ('res.cloudinary.com' in media_url):
                try:
                    cloud_name = current_app.config.get('CLOUDINARY_CLOUD_NAME')
                    api_key = current_app.config.get('CLOUDINARY_API_KEY')
                    api_secret = current_app.config.get('CLOUDINARY_API_SECRET')
                    if cloud_name and api_key and api_secret:
                        cloudinary.config(cloud_name=cloud_name, api_key=api_key, api_secret=api_secret, secure=True)
                        # Extract public_id by stripping extension and folder from URL path
                        parsed = urlparse(media_url)
                        # Example path: /<cloud_name>/image/upload/v1699999999/community_reports/abc123.jpg
                        parts = parsed.path.split('/')
                        # Find index of 'upload' and take the rest as public_id (without extension)
                        if 'upload' in parts:
                            upload_idx = parts.index('upload')
                            public_parts = parts[upload_idx+2:]  # skip 'v<timestamp>'
                            public_id_with_ext = '/'.join(public_parts)
                            if public_id_with_ext:
                                public_id = os.path.splitext(public_id_with_ext)[0]
                                cloudinary.uploader.destroy(public_id)
                except Exception:
                    pass

        db.session.delete(media)
        db.session.commit()
        return jsonify({'message': 'Media deleted', 'deleted_file': deleted_file}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@community_bp.route('/media/migrate-to-cloudinary', methods=['POST'])
@token_required
def migrate_local_media_to_cloudinary(current_user):
    """Admin-only: migrate locally stored media files to Cloudinary and update DB URLs.
    Useful when moving from ephemeral storage to Cloudinary.
    """
    try:
        if not getattr(current_user, 'is_admin', False):
            return jsonify({'error': 'Admin privileges required'}), 403

        cloud_name = current_app.config.get('CLOUDINARY_CLOUD_NAME')
        api_key = current_app.config.get('CLOUDINARY_API_KEY')
        api_secret = current_app.config.get('CLOUDINARY_API_SECRET')
        if not (cloudinary and cloud_name and api_key and api_secret):
            return jsonify({'error': 'Cloudinary not configured'}), 400

        cloudinary.config(cloud_name=cloud_name, api_key=api_key, api_secret=api_secret, secure=True)

        migrated = []
        failed = []

        # Find media with local URLs
        local_media = CommunityReportMedia.query.filter(CommunityReportMedia.media_url.like('/api/community/uploads/%')).all()
        upload_folder = current_app.config.get('UPLOAD_FOLDER')

        for m in local_media:
            try:
                filename = m.media_url.split('/api/community/uploads/', 1)[1]
                file_path = os.path.join(upload_folder, filename)
                if not os.path.exists(file_path):
                    failed.append({'media_id': m.id, 'reason': 'file_missing', 'path': file_path})
                    continue
                result = cloudinary.uploader.upload(file_path, folder='community_reports', resource_type='image', use_filename=True, unique_filename=True)
                new_url = result.get('secure_url') or result.get('url')
                if new_url:
                    m.media_url = new_url
                    m.media_type = result.get('resource_type', m.media_type)
                    db.session.add(m)
                    migrated.append({'media_id': m.id, 'old': filename, 'new': new_url})
                    # Optionally delete local file
                    try:
                        os.remove(file_path)
                    except Exception:
                        pass
                else:
                    failed.append({'media_id': m.id, 'reason': 'upload_no_url'})
            except Exception as ex:
                failed.append({'media_id': m.id, 'reason': str(ex)})

        db.session.commit()
        return jsonify({'migrated': migrated, 'failed': failed, 'count': {'migrated': len(migrated), 'failed': len(failed)}}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@community_bp.route('/leaderboard', methods=['GET'])
@token_required
def get_leaderboard(current_user):
    """Get top reporters leaderboard by points.
    Query param: period=90d|all (default 90d)
    """
    try:
        period = (request.args.get('period') or '90d').lower()
        if period == 'all':
            points_by_user = db.session.query(
                UserPointLog.user_id.label('uid'),
                func.coalesce(func.sum(UserPointLog.points), 0).label('points')
            ).group_by(UserPointLog.user_id).subquery()
        else:
            lookback_start = datetime.utcnow() - timedelta(days=90)
            points_by_user = db.session.query(
                UserPointLog.user_id.label('uid'),
                func.coalesce(func.sum(UserPointLog.points), 0).label('points')
            ).filter(UserPointLog.created_at >= lookback_start).group_by(UserPointLog.user_id).subquery()

        # Only include users who have points in the selected period
        results = db.session.query(
            User.id,
            User.first_name,
            User.last_name,
            points_by_user.c.points.label('points')
        ).join(points_by_user, points_by_user.c.uid == User.id).order_by(desc('points')).limit(20).all()

        leaderboard = []
        rank = 1
        for r in results:
            pts = int(r.points or 0)
            leaderboard.append({
                'id': r.id,
                'name': f"{r.first_name} {r.last_name}".strip() or 'Anonymous',
                'points': pts,
                'tier': compute_user_tier(pts),
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
    """Get current user's reporting stats including rank, points and tier.
    Query param: period=90d|all (default 90d) applies to points and rank only.
    """
    try:
        period = (request.args.get('period') or '90d').lower()
        # Base counts
        report_count = CommunityReport.query.filter_by(user_id=current_user.id).count()
        approved_count = CommunityReport.query.filter_by(user_id=current_user.id, status='APPROVED').count()
        verified_count = CommunityReport.query.filter_by(user_id=current_user.id, status='VERIFIED').count()
        pending_count = CommunityReport.query.filter_by(user_id=current_user.id, status='PENDING').count()
        rejected_count = CommunityReport.query.filter_by(user_id=current_user.id, status='REJECTED').count()

        # Points from logs (period-bound)
        q = db.session.query(func.coalesce(func.sum(UserPointLog.points), 0)).filter(UserPointLog.user_id == current_user.id)
        if period != 'all':
            lookback_start = datetime.utcnow() - timedelta(days=90)
            q = q.filter(UserPointLog.created_at >= lookback_start)
        total_points = q.scalar() or 0
        points = int(total_points)
        tier = compute_user_tier(points)

        # Rank by points (period-bound)
        pq = db.session.query(
            UserPointLog.user_id,
            func.coalesce(func.sum(UserPointLog.points), 0).label('points')
        )
        if period != 'all':
            lookback_start = datetime.utcnow() - timedelta(days=90)
            pq = pq.filter(UserPointLog.created_at >= lookback_start)
        points_by_user = pq.group_by(UserPointLog.user_id).order_by(desc('points')).all()

        rank = None
        if points_by_user:
            for idx, row in enumerate(points_by_user, start=1):
                if row.user_id == current_user.id:
                    rank = idx
                    break

        return jsonify({
            'report_count': report_count,
            'approved_count': approved_count,
            'verified_count': verified_count,
            'pending_count': pending_count,
            'rejected_count': rejected_count,
            'points': points,
            'tier': tier,
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
        data = request.get_json() or {}
        comment_text = (data.get('comment') or '').strip()
        
        if not comment_text:
            return jsonify({'error': 'Comment text is required'}), 400

        report = CommunityReport.query.get_or_404(report_id)
        comment = CommunityReportComment(report_id=report.id, user_id=current_user.id, comment=comment_text)
        db.session.add(comment)
        db.session.commit()
        
        return jsonify(comment.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@community_bp.route('/comments/<int:comment_id>', methods=['DELETE'])
@token_required
def delete_comment(current_user, comment_id):
    """Delete a comment (owner or admin only)"""
    try:
        comment = CommunityReportComment.query.get_or_404(comment_id)
        if comment.user_id != current_user.id and not getattr(current_user, 'is_admin', False):
            return jsonify({'error': 'Not authorized to delete this comment'}), 403
        db.session.delete(comment)
        db.session.commit()
        return jsonify({'message': 'Comment deleted', 'comment_id': comment_id}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
