from flask import Blueprint, request, jsonify
from functools import wraps
from datetime import datetime
import logging
import json

# Import production modules - try relative imports first, then absolute
try:
    from ..models import db, LearningModule, LearningProgress, User
    from ..auth import token_required
except ImportError:
    from models import db, LearningModule, LearningProgress, User
    from auth import token_required

logger = logging.getLogger(__name__)
learning_content_bp = Blueprint('learning_content', __name__)

def admin_required_learning(f):
    """Custom admin_required decorator for learning content routes"""
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        try:
            # Check if user is admin
            if not getattr(current_user, 'is_admin', False) and getattr(current_user, 'role', '') != 'ADMIN':
                logger.warning(f"Admin access denied for user: {current_user.email}")
                return jsonify({'error': 'Admin privileges required'}), 403
            
            logger.info(f"Admin access granted for user: {current_user.email}")
            return f(current_user, *args, **kwargs)
        except Exception as e:
            logger.error(f"Error in admin_required_learning decorator: {e}")
            return jsonify({'error': 'Authentication error'}), 500
    return decorated

@learning_content_bp.route('/test-put', methods=['PUT'])
def test_put():
    """Test endpoint to verify PUT requests work"""
    logger.info("PUT /test-put called")
    logger.info(f"Request method: {request.method}")
    logger.info(f"Request headers: {dict(request.headers)}")
    
    try:
        data = request.get_json()
        logger.info(f"Request data: {data}")
        
        return jsonify({
            'message': 'PUT request successful',
            'method': request.method,
            'data': data
        }), 200
    except Exception as e:
        logger.error(f"Error in test PUT: {e}")
        return jsonify({'error': str(e)}), 500

@learning_content_bp.route('/modules', methods=['GET'])
@token_required
def get_modules(current_user):
    """Get all learning modules"""
    try:
        logger.info(f"Getting modules for user: {current_user.email}")
        modules = LearningModule.query.filter_by(is_active=True).all()
        
        # Debug: Log each module's content
        for module in modules:
            logger.info(f"Module {module.id} ({module.title}): content={module.content}, lessons_count={len(module.content.get('lessons', [])) if module.content else 0}")
        
        return jsonify({
            'modules': [module.to_dict() for module in modules]
        }), 200
    except Exception as e:
        logger.error(f"Error getting modules: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@learning_content_bp.route('/modules/<int:module_id>', methods=['GET'])
@token_required
def get_module(current_user, module_id):
    """Get specific learning module with full content"""
    try:
        module = LearningModule.query.get(module_id)
        if not module:
            return jsonify({'error': 'Module not found'}), 404
            
        module_data = module.to_dict()
        # Content is already included in to_dict() method
        
        return jsonify(module_data), 200
    except Exception as e:
        logger.error(f"Error getting module {module_id}: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@learning_content_bp.route('/modules', methods=['POST'])
@token_required
@admin_required_learning
def create_module(current_user):
    """Create a new learning module"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['title', 'description', 'difficulty', 'estimated_time']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Create new module
        new_module = LearningModule(
            title=data['title'],
            description=data['description'],
            content=data.get('content', {}),
            difficulty=data['difficulty'],
            estimated_time=data['estimated_time'],
            is_active=True
        )
        
        db.session.add(new_module)
        db.session.commit()
        
        logger.info(f"Created new learning module: {new_module.title}")
        return jsonify({
            'message': 'Module created successfully',
            'module': new_module.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating module: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@learning_content_bp.route('/modules/<int:module_id>', methods=['PUT'])
@token_required
@admin_required_learning
def update_module(current_user, module_id):
    """Update an existing learning module"""
    try:
        logger.info(f"PUT /modules/{module_id} called by user: {current_user.email}")
        logger.info(f"Request method: {request.method}")
        logger.info(f"Request headers: {dict(request.headers)}")
        
        module = LearningModule.query.get(module_id)
        if not module:
            logger.warning(f"Module {module_id} not found")
            return jsonify({'error': 'Module not found'}), 404
        
        data = request.get_json()
        logger.info(f"Request data: {data}")
        
        # Update fields if provided
        if 'title' in data:
            module.title = data['title']
        if 'description' in data:
            module.description = data['description']
        if 'content' in data:
            module.content = data['content']
        if 'difficulty' in data:
            module.difficulty = data['difficulty']
        if 'estimated_time' in data:
            module.estimated_time = data['estimated_time']
        if 'is_active' in data:
            module.is_active = data['is_active']
        
        db.session.commit()
        
        logger.info(f"Updated learning module: {module.title}")
        return jsonify({
            'message': 'Module updated successfully',
            'module': module.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating module {module_id}: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@learning_content_bp.route('/modules/<int:module_id>', methods=['DELETE'])
@token_required
@admin_required_learning
def delete_module(current_user, module_id):
    """Delete a learning module (soft delete)"""
    try:
        module = LearningModule.query.get(module_id)
        if not module:
            return jsonify({'error': 'Module not found'}), 404
        
        # Soft delete - mark as inactive
        module.is_active = False
        db.session.commit()
        
        logger.info(f"Deleted learning module: {module.title}")
        return jsonify({'message': 'Module deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting module {module_id}: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@learning_content_bp.route('/modules/<int:module_id>/lessons', methods=['POST'])
@token_required
@admin_required_learning
def add_lesson(current_user, module_id):
    """Add a lesson to a module"""
    try:
        logger.info(f"Adding lesson to module {module_id} by user {current_user.email}")
        
        module = LearningModule.query.get(module_id)
        if not module:
            logger.warning(f"Module {module_id} not found")
            return jsonify({'error': 'Module not found'}), 404
        
        data = request.get_json()
        
        # Validate required fields
        if 'title' not in data or 'content' not in data:
            logger.warning(f"Missing required fields in lesson data")
            return jsonify({'error': 'Missing required fields: title and content'}), 400
        
        # Get current content or initialize
        current_content = module.content or {}
        lessons = current_content.get('lessons', [])
        logger.info(f"Current lessons count: {len(lessons)}")
        
        # Generate unique lesson ID (find the highest existing ID and add 1)
        max_lesson_id = max([l.get('id', 0) for l in lessons]) if lessons else 0
        new_lesson_id = max_lesson_id + 1
        
        # Create new lesson
        new_lesson = {
            'id': new_lesson_id,
            'title': data['title'],
            'type': data.get('type', 'info'),
            'content': data['content'],
            'contentType': data.get('contentType', 'info'),
            'contentStyle': data.get('contentStyle', 'default'),
            'duration': data.get('duration', 5)
        }
        
        lessons.append(new_lesson)
        current_content['lessons'] = lessons
        
        # Update module content - Force SQLAlchemy to recognize the change
        # The issue is that SQLAlchemy doesn't detect changes in nested JSON objects
        # So we need to explicitly mark the field as modified
        from sqlalchemy.orm.attributes import flag_modified
        flag_modified(module, "content")
        logger.info("Using flag_modified to mark content field as changed")
        
        # Set the content
        module.content = current_content
        
        # Commit to database
        db.session.commit()
        logger.info(f"Database commit successful")
        
        # Refresh the module object to get the latest data
        db.session.refresh(module)
        logger.info(f"After refresh - lessons count: {len(module.content.get('lessons', [])) if module.content else 0}")
        
        logger.info(f"Successfully added lesson '{new_lesson['title']}' (ID: {new_lesson_id}) to module '{module.title}'")
        logger.info(f"Module now has {len(lessons)} lessons")
        
        return jsonify({
            'message': 'Lesson added successfully',
            'lesson': new_lesson
        }), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error adding lesson to module {module_id}: {e}")
        logger.error(f"Exception type: {type(e).__name__}")
        logger.error(f"Exception details: {str(e)}")
        import traceback
        logger.error(f"Full traceback: {traceback.format_exc()}")
        return jsonify({'error': 'Internal server error'}), 500

@learning_content_bp.route('/modules/<int:module_id>/lessons/<int:lesson_id>', methods=['PUT'])
@token_required
@admin_required_learning
def update_lesson(current_user, module_id, lesson_id):
    """Update a lesson in a module"""
    try:
        module = LearningModule.query.get(module_id)
        if not module:
            return jsonify({'error': 'Module not found'}), 404
        
        data = request.get_json()
        current_content = module.content or {}
        lessons = current_content.get('lessons', [])
        
        # Find lesson
        lesson = next((l for l in lessons if l['id'] == lesson_id), None)
        if not lesson:
            return jsonify({'error': 'Lesson not found'}), 404
        
        # Update lesson fields
        for field in ['title', 'type', 'content', 'contentType', 'contentStyle', 'duration']:
            if field in data:
                lesson[field] = data[field]
        
        module.content = current_content
        db.session.commit()
        
        logger.info(f"Updated lesson '{lesson['title']}' in module '{module.title}'")
        return jsonify({
            'message': 'Lesson updated successfully',
            'lesson': lesson
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating lesson {lesson_id} in module {module_id}: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@learning_content_bp.route('/modules/<int:module_id>/lessons/<int:lesson_id>', methods=['DELETE'])
@token_required
@admin_required_learning
def delete_lesson(current_user, module_id, lesson_id):
    """Delete a lesson from a module"""
    try:
        module = LearningModule.query.get(module_id)
        if not module:
            return jsonify({'error': 'Module not found'}), 404
        
        current_content = module.content or {}
        lessons = current_content.get('lessons', [])
        
        # Find and remove lesson
        lesson = next((l for l in lessons if l['id'] == lesson_id), None)
        if not lesson:
            return jsonify({'error': 'Lesson not found'}), 404
        
        lessons.remove(lesson)
        current_content['lessons'] = lessons
        
        # Update module content
        module.content = current_content
        db.session.commit()
        
        logger.info(f"Deleted lesson '{lesson['title']}' from module '{module.title}'")
        return jsonify({'message': 'Lesson deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting lesson {lesson_id} from module {module_id}: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@learning_content_bp.route('/modules/<int:module_id>/progress', methods=['GET'])
@token_required
def get_module_progress(current_user, module_id):
    """Get user's progress for a specific module"""
    try:
        user_id = current_user.id
        
        progress = LearningProgress.query.filter_by(
            user_id=user_id,
            module_id=module_id
        ).first()
        
        if not progress:
            return jsonify({
                'module_id': module_id,
                'completed': False,
                'score': 0,
                'started_at': None,
                'completed_at': None
            }), 200
        
        return jsonify(progress.to_dict()), 200
        
    except Exception as e:
        logger.error(f"Error getting module progress: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@learning_content_bp.route('/modules/<int:module_id>/progress', methods=['POST'])
@token_required
def update_module_progress(current_user, module_id):
    """Update user's progress for a module"""
    try:
        user_id = current_user.id
        data = request.get_json()
        
        progress = LearningProgress.query.filter_by(
            user_id=user_id,
            module_id=module_id
        ).first()
        
        if not progress:
            # Create new progress record
            progress = LearningProgress(
                user_id=user_id,
                module_id=module_id,
                completed=data.get('completed', False),
                score=data.get('score', 0)
            )
            db.session.add(progress)
        else:
            # Update existing progress
            progress.completed = data.get('completed', progress.completed)
            progress.score = data.get('score', progress.score)
            if data.get('completed') and not progress.completed:
                progress.completed_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Progress updated successfully',
            'progress': progress.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating module progress: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@learning_content_bp.route('/progress/overview', methods=['GET'])
@token_required
def get_progress_overview(current_user):
    """Get user's overall learning progress"""
    try:
        user_id = current_user.id
        
        # Get all progress records for the user
        progress_records = LearningProgress.query.filter_by(user_id=user_id).all()
        
        # Calculate statistics
        total_modules = LearningModule.query.filter_by(is_active=True).count()
        completed_modules = len([p for p in progress_records if p.completed])
        total_score = sum(p.score for p in progress_records)
        average_score = total_score / len(progress_records) if progress_records else 0
        
        return jsonify({
            'total_modules': total_modules,
            'completed_modules': completed_modules,
            'completion_percentage': (completed_modules / total_modules * 100) if total_modules > 0 else 0,
            'total_score': total_score,
            'average_score': round(average_score, 2),
            'progress_records': [p.to_dict() for p in progress_records]
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting progress overview: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@learning_content_bp.route('/content/export', methods=['GET'])
@token_required
@admin_required_learning
def export_content(current_user):
    """Export all learning content as JSON"""
    try:
        modules = LearningModule.query.filter_by(is_active=True).all()
        
        export_data = {
            'metadata': {
                'version': '1.0',
                'exported_at': datetime.utcnow().isoformat(),
                'total_modules': len(modules),
                'total_lessons': sum(len(m.content.get('lessons', [])) if m.content else 0 for m in modules)
            },
            'modules': []
        }
        
        for module in modules:
            module_data = module.to_dict()
            module_data['content'] = module.content
            export_data['modules'].append(module_data)
        
        return jsonify(export_data), 200
        
    except Exception as e:
        logger.error(f"Error exporting content: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@learning_content_bp.route('/content/import', methods=['POST'])
@token_required
@admin_required_learning
def import_content(current_user):
    """Import learning content from JSON"""
    try:
        data = request.get_json()
        
        if 'modules' not in data:
            return jsonify({'error': 'Invalid import format: missing modules'}), 400
        
        imported_count = 0
        for module_data in data['modules']:
            # Check if module exists
            existing_module = LearningModule.query.filter_by(title=module_data['title']).first()
            
            if existing_module:
                # Update existing module
                existing_module.description = module_data.get('description', existing_module.description)
                existing_module.content = module_data.get('content', existing_module.content)
                existing_module.difficulty = module_data.get('difficulty', existing_module.difficulty)
                existing_module.estimated_time = module_data.get('estimated_time', existing_module.estimated_time)
            else:
                # Create new module
                new_module = LearningModule(
                    title=module_data['title'],
                    description=module_data.get('description', ''),
                    content=module_data.get('content', {}),
                    difficulty=module_data.get('difficulty', 'BEGINNER'),
                    estimated_time=module_data.get('estimated_time', 15),
                    is_active=True
                )
                db.session.add(new_module)
            
            imported_count += 1
        
        db.session.commit()
        
        logger.info(f"Imported {imported_count} learning modules")
        return jsonify({
            'message': f'Successfully imported {imported_count} modules',
            'imported_count': imported_count
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error importing content: {e}")
        return jsonify({'error': 'Internal server error'}), 500
