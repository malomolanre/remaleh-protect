from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import uuid

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(100))
    last_name = db.Column(db.String(100))
    risk_level = db.Column(db.String(20), default='MEDIUM')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    is_active = db.Column(db.Boolean, default=True)
    
    # Relationships
    scans = db.relationship('UserScan', backref='user', lazy=True)
    learning_progress = db.relationship('LearningProgress', backref='user', lazy=True)
    reports = db.relationship('CommunityReport', backref='user', lazy=True)
    votes = db.relationship('ReportVote', backref='user', lazy=True)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'risk_level': self.risk_level,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }

class UserScan(db.Model):
    __tablename__ = 'user_scans'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    message = db.Column(db.Text, nullable=False)
    risk_level = db.Column(db.String(20), nullable=False)
    risk_score = db.Column(db.Integer)
    threat_type = db.Column(db.String(100))
    analysis_result = db.Column(db.JSON)
    scanned_at = db.Column(db.DateTime, default=datetime.utcnow)
    learned_from = db.Column(db.Boolean, default=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'message': self.message,
            'risk_level': self.risk_level,
            'risk_score': self.risk_score,
            'threat_type': self.threat_type,
            'scanned_at': self.scanned_at.isoformat() if self.scanned_at else None,
            'learned_from': self.learned_from
        }

class Threat(db.Model):
    __tablename__ = 'threats'
    
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    risk_level = db.Column(db.String(20), nullable=False)
    region = db.Column(db.String(100))
    source = db.Column(db.String(100))
    reported_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(50), default='ACTIVE')
    impact_score = db.Column(db.Integer)
    affected_users = db.Column(db.Integer, default=0)
    
    def to_dict(self):
        return {
            'id': self.id,
            'type': self.type,
            'description': self.description,
            'risk_level': self.risk_level,
            'region': self.region,
            'source': self.source,
            'reported_at': self.reported_at.isoformat() if self.reported_at else None,
            'status': self.status,
            'impact_score': self.impact_score,
            'affected_users': self.affected_users
        }

class CommunityAlert(db.Model):
    __tablename__ = 'community_alerts'
    
    id = db.Column(db.Integer, primary_key=True)
    message = db.Column(db.Text, nullable=False)
    severity = db.Column(db.String(20), nullable=False)
    threat_type = db.Column(db.String(100))
    region = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='ACTIVE')
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    
    def to_dict(self):
        return {
            'id': self.id,
            'message': self.message,
            'severity': self.severity,
            'threat_type': self.threat_type,
            'region': self.region,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'status': self.status
        }

class CommunityReport(db.Model):
    __tablename__ = 'community_reports'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    threat_type = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    location = db.Column(db.String(255))
    urgency = db.Column(db.String(20), default='MEDIUM')
    status = db.Column(db.String(20), default='PENDING')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    votes_up = db.Column(db.Integer, default=0)
    votes_down = db.Column(db.Integer, default=0)
    verified = db.Column(db.Boolean, default=False)
    
    # Relationships
    votes = db.relationship('ReportVote', backref='report', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'threat_type': self.threat_type,
            'description': self.description,
            'location': self.location,
            'urgency': self.urgency,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'votes_up': self.votes_up,
            'votes_down': self.votes_down,
            'verified': self.verified
        }

class ReportVote(db.Model):
    __tablename__ = 'report_votes'
    
    id = db.Column(db.Integer, primary_key=True)
    report_id = db.Column(db.Integer, db.ForeignKey('community_reports.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    vote_type = db.Column(db.String(10), nullable=False)  # 'up' or 'down'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (db.UniqueConstraint('report_id', 'user_id'),)

class LearningModule(db.Model):
    __tablename__ = 'learning_modules'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    content = db.Column(db.JSON)
    difficulty = db.Column(db.String(20), default='BEGINNER')
    estimated_time = db.Column(db.Integer)  # in minutes
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'difficulty': self.difficulty,
            'estimated_time': self.estimated_time,
            'is_active': self.is_active
        }

class LearningProgress(db.Model):
    __tablename__ = 'learning_progress'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    module_id = db.Column(db.Integer, db.ForeignKey('learning_modules.id'), nullable=False)
    completed = db.Column(db.Boolean, default=False)
    score = db.Column(db.Integer, default=0)
    started_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime)
    
    __table_args__ = (db.UniqueConstraint('user_id', 'module_id'),)
    
    def to_dict(self):
        return {
            'id': self.id,
            'module_id': self.module_id,
            'completed': self.completed,
            'score': self.score,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }


