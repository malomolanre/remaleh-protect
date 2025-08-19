from sqlalchemy import create_engine, Index, text
from sqlalchemy.orm import sessionmaker, scoped_session
from sqlalchemy.pool import QueuePool
from sqlalchemy.exc import SQLAlchemyError
import logging
from contextlib import contextmanager

logger = logging.getLogger(__name__)

class DatabaseManager:
    """Database connection and performance management"""
    
    def __init__(self, app=None):
        self.app = app
        self.engine = None
        self.session_factory = None
        self.Session = None
        
        if app is not None:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize database connection with performance optimizations"""
        try:
            database_url = app.config.get('SQLALCHEMY_DATABASE_URI')
            
            # Configure engine with connection pooling and performance options
            engine_options = {
                'poolclass': QueuePool,
                'pool_size': app.config.get('SQLALCHEMY_ENGINE_OPTIONS', {}).get('pool_size', 10),
                'max_overflow': app.config.get('SQLALCHEMY_ENGINE_OPTIONS', {}).get('max_overflow', 20),
                'pool_recycle': app.config.get('SQLALCHEMY_ENGINE_OPTIONS', {}).get('pool_recycle', 3600),
                'pool_pre_ping': app.config.get('SQLALCHEMY_ENGINE_OPTIONS', {}).get('pool_pre_ping', True),
                'echo': app.config.get('SQLALCHEMY_TRACK_MODIFICATIONS', False),
                'connect_args': app.config.get('SQLALCHEMY_ENGINE_OPTIONS', {}).get('connect_args', {})
            }
            
            # PostgreSQL specific optimizations
            if 'postgresql' in database_url:
                engine_options['connect_args'].update({
                    'application_name': 'remaleh_protect',
                    'connect_timeout': 10,
                    'options': '-c statement_timeout=30000 -c idle_in_transaction_session_timeout=60000'
                })
            
            self.engine = create_engine(database_url, **engine_options)
            self.session_factory = sessionmaker(bind=self.engine)
            self.Session = scoped_session(self.session_factory)
            
            logger.info("Database connection established successfully")
            
            # Create performance indexes
            self.create_performance_indexes()
            
        except Exception as e:
            logger.error(f"Failed to initialize database: {e}")
            raise
    
    def create_performance_indexes(self):
        """Create database indexes for performance optimization"""
        try:
            with self.engine.connect() as conn:
                # User table indexes
                conn.execute(text("""
                    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
                    CREATE INDEX IF NOT EXISTS idx_users_risk_level ON users(risk_level);
                    CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin);
                    CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
                """))
                
                # UserScan table indexes
                conn.execute(text("""
                    CREATE INDEX IF NOT EXISTS idx_user_scans_user_id ON user_scans(user_id);
                    CREATE INDEX IF NOT EXISTS idx_user_scans_risk_level ON user_scans(risk_level);
                    CREATE INDEX IF NOT EXISTS idx_user_scans_scanned_at ON user_scans(scanned_at);
                    CREATE INDEX IF NOT EXISTS idx_user_scans_threat_type ON user_scans(threat_type);
                """))
                
                # Threat table indexes
                conn.execute(text("""
                    CREATE INDEX IF NOT EXISTS idx_threats_type ON threats(type);
                    CREATE INDEX IF NOT EXISTS idx_threats_risk_level ON threats(risk_level);
                    CREATE INDEX IF NOT EXISTS idx_threats_region ON threats(region);
                    CREATE INDEX IF NOT EXISTS idx_threats_reported_at ON threats(reported_at);
                    CREATE INDEX IF NOT EXISTS idx_threats_status ON threats(status);
                """))
                
                # CommunityReport table indexes
                conn.execute(text("""
                    CREATE INDEX IF NOT EXISTS idx_community_reports_user_id ON community_reports(user_id);
                    CREATE INDEX IF NOT EXISTS idx_community_reports_threat_type ON community_reports(threat_type);
                    CREATE INDEX IF NOT EXISTS idx_community_reports_status ON community_reports(status);
                    CREATE INDEX IF NOT EXISTS idx_community_reports_created_at ON community_reports(created_at);
                    CREATE INDEX IF NOT EXISTS idx_community_reports_urgency ON community_reports(urgency);
                """))
                
                # LearningModule table indexes
                conn.execute(text("""
                    CREATE INDEX IF NOT EXISTS idx_learning_modules_difficulty ON learning_modules(difficulty);
                    CREATE INDEX IF NOT EXISTS idx_learning_modules_is_active ON learning_modules(is_active);
                """))
                
                # Lightweight schema migration: ensure new user columns exist
                # Use IF NOT EXISTS where supported (PostgreSQL). If an error occurs, rollback to clear aborted txn.
                try:
                    conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT"))
                    logger.info("Ensured 'bio' column on users table")
                except Exception as e:
                    logger.debug(f"Bio column add skipped/failed: {e}")
                    try:
                        conn.rollback()
                    except Exception:
                        pass
                try:
                    conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE"))
                    logger.info("Ensured 'email_verified' column on users table")
                except Exception as e:
                    logger.debug(f"email_verified column add skipped/failed: {e}")
                    try:
                        conn.rollback()
                    except Exception:
                        pass
                try:
                    conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_code VARCHAR(12)"))
                    logger.info("Ensured 'email_verification_code' column on users table")
                except Exception as e:
                    logger.debug(f"email_verification_code column add skipped/failed: {e}")
                    try:
                        conn.rollback()
                    except Exception:
                        pass
                try:
                    conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_expires_at TIMESTAMP"))
                    logger.info("Ensured 'email_verification_expires_at' column on users table")
                except Exception as e:
                    logger.debug(f"email_verification_expires_at column add skipped/failed: {e}")
                    try:
                        conn.rollback()
                    except Exception:
                        pass
                try:
                    conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS email_forward_token VARCHAR(64) UNIQUE"))
                    logger.info("Ensured 'email_forward_token' column on users table")
                except Exception as e:
                    logger.debug(f"email_forward_token column add skipped/failed: {e}")
                    try:
                        conn.rollback()
                    except Exception:
                        pass
                
                # LearningProgress table indexes
                conn.execute(text("""
                    CREATE INDEX IF NOT EXISTS idx_learning_progress_user_module ON learning_progress(user_id, module_id);
                    CREATE INDEX IF NOT EXISTS idx_learning_progress_completed ON learning_progress(completed);
                """))
                
                conn.commit()
                logger.info("Performance indexes created successfully")
                
        except SQLAlchemyError as e:
            logger.warning(f"Some indexes may already exist or failed to create: {e}")
        except Exception as e:
            logger.error(f"Error creating performance indexes: {e}")
    
    def get_session(self):
        """Get a new database session"""
        return self.Session()
    
    @contextmanager
    def session_scope(self):
        """Provide a transactional scope around a series of operations"""
        session = self.get_session()
        try:
            yield session
            session.commit()
        except Exception as e:
            session.rollback()
            logger.error(f"Database session error: {e}")
            raise
        finally:
            session.close()
    
    def health_check(self):
        """Check database health and connection"""
        try:
            with self.engine.connect() as conn:
                conn.execute(text("SELECT 1"))
                return True
        except Exception as e:
            logger.error(f"Database health check failed: {e}")
            return False
    
    def get_connection_info(self):
        """Get database connection information"""
        if not self.engine:
            return {"status": "not_initialized"}
        
        try:
            pool = self.engine.pool
            # Use safe methods that exist in all SQLAlchemy versions
            pool_info = {
                "status": "connected",
                "pool_size": getattr(pool, 'size', lambda: 'unknown')(),
                "checked_in": getattr(pool, 'checkedin', lambda: 'unknown')(),
                "checked_out": getattr(pool, 'checkedout', lambda: 'unknown')(),
                "overflow": getattr(pool, 'overflow', lambda: 'unknown')()
            }
            
            # Only add invalid count if the method exists
            if hasattr(pool, 'invalid'):
                pool_info["invalid"] = pool.invalid()
            else:
                pool_info["invalid"] = "not_available"
                
            return pool_info
        except Exception as e:
            logger.error(f"Error getting connection info: {e}")
            return {"status": "error", "message": str(e)}

# Global database manager instance
db_manager = DatabaseManager()

def get_db_session():
    """Get database session from manager"""
    return db_manager.get_session()

@contextmanager
def db_session_scope():
    """Database session context manager"""
    with db_manager.session_scope() as session:
        yield session
