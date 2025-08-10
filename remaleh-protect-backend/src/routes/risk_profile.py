from flask import Blueprint, request, jsonify
try:
    from src.models import db, User, UserScan, LearningModule, LearningProgress, ProtectionStatus
    from src.auth import token_required, get_current_user_id
except ImportError:
    from models import db, User, UserScan, LearningModule, LearningProgress, ProtectionStatus
    from auth import token_required, get_current_user_id
from datetime import datetime, timedelta
from sqlalchemy import func, desc
import json

risk_profile_bp = Blueprint('risk_profile', __name__)

@risk_profile_bp.route('/profile', methods=['GET'])
@token_required
def get_risk_profile(current_user):
    """Get user's complete risk profile"""
    try:
        # Get user's scan history
        recent_scans = UserScan.query.filter(
            UserScan.user_id == current_user.id
        ).order_by(
            UserScan.scanned_at.desc()
        ).limit(10).all()
        
        # Get risk factors analysis
        risk_factors = db.session.query(
            UserScan.threat_type,
            func.count(UserScan.id).label('frequency'),
            func.avg(UserScan.risk_score).label('avg_risk')
        ).filter(
            UserScan.user_id == current_user.id,
            UserScan.threat_type.isnot(None)
        ).group_by(
            UserScan.threat_type
        ).all()
        
        # Get learning progress
        learning_progress = LearningProgress.query.filter(
            LearningProgress.user_id == current_user.id
        ).all()
        
        # Get protection status
        protection_status = ProtectionStatus.query.filter(
            ProtectionStatus.user_id == current_user.id
        ).first()
        
        # Calculate overall risk level
        total_scans = len(recent_scans)
        high_risk_scans = len([s for s in recent_scans if s.risk_level in ['HIGH', 'CRITICAL']])
        
        if total_scans == 0:
            risk_level = 'LOW'
        elif high_risk_scans / total_scans > 0.5:
            risk_level = 'HIGH'
        elif high_risk_scans / total_scans > 0.2:
            risk_level = 'MEDIUM'
        else:
            risk_level = 'LOW'
        
        # Update user's risk level if it changed
        if current_user.risk_level != risk_level:
            current_user.risk_level = risk_level
            db.session.commit()
        
        # Calculate learning progress percentage
        total_modules = LearningModule.query.filter(LearningModule.is_active == True).count()
        completed_modules = len([p for p in learning_progress if p.completed])
        learning_percentage = int((completed_modules / total_modules * 100) if total_modules > 0 else 0)
        
        # Format recent scans
        formatted_scans = []
        for scan in recent_scans:
            formatted_scans.append({
                'id': scan.id,
                'message': scan.message[:50] + '...' if len(scan.message) > 50 else scan.message,
                'risk': scan.risk_level,
                'date': scan.scanned_at.strftime('%Y-%m-%d'),
                'learned': scan.learned_from
            })
        
        # Format risk factors
        formatted_risk_factors = []
        for factor in risk_factors:
            avg_risk = factor.avg_risk or 0
            if avg_risk > 75:
                risk_level = 'HIGH'
            elif avg_risk > 50:
                risk_level = 'MEDIUM'
            else:
                risk_level = 'LOW'
            
            formatted_risk_factors.append({
                'factor': factor.threat_type,
                'frequency': factor.frequency,
                'risk': risk_level
            })
        
        # Format learning modules
        all_modules = LearningModule.query.filter(LearningModule.is_active == True).all()
        formatted_modules = []
        for module in all_modules:
            progress = next((p for p in learning_progress if p.module_id == module.id), None)
            formatted_modules.append({
                'id': module.id,
                'title': module.title,
                'completed': progress.completed if progress else False,
                'score': progress.score if progress else 0
            })
        
        return jsonify({
            'riskLevel': risk_level,
            'totalScans': total_scans,
            'threatsDetected': high_risk_scans,
            'learningProgress': learning_percentage,
            'recentScans': formatted_scans,
            'riskFactors': formatted_risk_factors,
            'learningModules': formatted_modules,
            'protectionStatus': protection_status.to_dict() if protection_status else None
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@risk_profile_bp.route('/scans', methods=['GET'])
@token_required
def get_user_scans(current_user):
    """Get user's scan history with pagination"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        risk_level = request.args.get('risk_level')
        threat_type = request.args.get('threat_type')
        
        query = UserScan.query.filter(UserScan.user_id == current_user.id)
        
        if risk_level:
            query = query.filter(UserScan.risk_level == risk_level)
        if threat_type:
            query = query.filter(UserScan.threat_type == threat_type)
        
        scans = query.order_by(UserScan.scanned_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'scans': [scan.to_dict() for scan in scans.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': scans.total,
                'pages': scans.pages
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@risk_profile_bp.route('/scans/<int:scan_id>/learn', methods=['POST'])
@token_required
def mark_scan_learned(current_user, scan_id):
    """Mark a scan as learned from"""
    try:
        scan = UserScan.query.filter(
            UserScan.id == scan_id,
            UserScan.user_id == current_user.id
        ).first()
        
        if not scan:
            return jsonify({'error': 'Scan not found'}), 404
        
        scan.learned_from = True
        db.session.commit()
        
        return jsonify({'message': 'Scan marked as learned'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@risk_profile_bp.route('/learning/modules', methods=['GET'])
@token_required
def get_learning_modules(current_user):
    """Get available learning modules"""
    try:
        modules = LearningModule.query.filter(LearningModule.is_active == True).all()
        
        # Get user's progress for each module
        user_progress = LearningProgress.query.filter(
            LearningProgress.user_id == current_user.id
        ).all()
        
        progress_dict = {p.module_id: p for p in user_progress}
        
        formatted_modules = []
        for module in modules:
            progress = progress_dict.get(module.id)
            formatted_modules.append({
                'id': module.id,
                'title': module.title,
                'description': module.description,
                'difficulty': module.difficulty,
                'estimatedTime': module.estimated_time,
                'completed': progress.completed if progress else False,
                'score': progress.score if progress else 0,
                'startedAt': progress.started_at.isoformat() if progress else None,
                'completedAt': progress.completed_at.isoformat() if progress and progress.completed_at else None
            })
        
        return jsonify({'modules': formatted_modules}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@risk_profile_bp.route('/learning/modules/<int:module_id>/start', methods=['POST'])
@token_required
def start_learning_module(current_user, module_id):
    """Start a learning module"""
    try:
        module = LearningModule.query.get_or_404(module_id)
        
        # Check if already started
        existing_progress = LearningProgress.query.filter(
            LearningProgress.user_id == current_user.id,
            LearningProgress.module_id == module_id
        ).first()
        
        if existing_progress:
            return jsonify({'error': 'Module already started'}), 400
        
        # Create new progress entry
        progress = LearningProgress(
            user_id=current_user.id,
            module_id=module_id,
            started_at=datetime.utcnow()
        )
        
        db.session.add(progress)
        db.session.commit()
        
        return jsonify({'message': 'Module started successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@risk_profile_bp.route('/learning/modules/<int:module_id>/complete', methods=['POST'])
@token_required
def complete_learning_module(current_user, module_id):
    """Complete a learning module with score"""
    try:
        data = request.get_json()
        score = data.get('score', 0)
        
        progress = LearningProgress.query.filter(
            LearningProgress.user_id == current_user.id,
            LearningProgress.module_id == module_id
        ).first()
        
        if not progress:
            return jsonify({'error': 'Module not started'}), 400
        
        if progress.completed:
            return jsonify({'error': 'Module already completed'}), 400
        
        progress.completed = True
        progress.score = score
        progress.completed_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({'message': 'Module completed successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@risk_profile_bp.route('/recommendations', methods=['GET'])
@token_required
def get_recommendations(current_user):
    """Get personalized recommendations based on user's profile"""
    try:
        recommendations = []
        
        # Get user's recent high-risk scans
        high_risk_scans = UserScan.query.filter(
            UserScan.user_id == current_user.id,
            UserScan.risk_level.in_(['HIGH', 'CRITICAL'])
        ).order_by(UserScan.scanned_at.desc()).limit(5).all()
        
        # Get user's learning progress
        completed_modules = LearningProgress.query.filter(
            LearningProgress.user_id == current_user.id,
            LearningProgress.completed == True
        ).all()
        completed_module_ids = [p.module_id for p in completed_modules]
        
        # Recommend modules based on threat types encountered
        threat_types = list(set([s.threat_type for s in high_risk_scans if s.threat_type]))
        
        for threat_type in threat_types:
            # Find relevant learning modules
            relevant_modules = LearningModule.query.filter(
                LearningModule.title.ilike(f'%{threat_type}%'),
                LearningModule.id.notin_(completed_module_ids)
            ).limit(2).all()
            
            for module in relevant_modules:
                recommendations.append({
                    'type': 'learning',
                    'title': f'Learn about {threat_type}',
                    'description': f'Complete "{module.title}" to better understand {threat_type} threats',
                    'priority': 'HIGH',
                    'action': f'Start module {module.id}'
                })
        
        # Add general security recommendations
        if not completed_modules:
            recommendations.append({
                'type': 'general',
                'title': 'Start Learning Journey',
                'description': 'Begin with basic security awareness modules',
                'priority': 'HIGH',
                'action': 'Browse learning modules'
            })
        
        # Add protection recommendations
        protection_status = ProtectionStatus.query.filter(
            ProtectionStatus.user_id == current_user.id
        ).first()
        
        if not protection_status or not protection_status.browser_extension:
            recommendations.append({
                'type': 'protection',
                'title': 'Install Browser Extension',
                'description': 'Get real-time protection while browsing',
                'priority': 'MEDIUM',
                'action': 'Download extension'
            })
        
        return jsonify({'recommendations': recommendations}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
