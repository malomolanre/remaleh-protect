import os
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    """Base configuration class"""
    
    # Security
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    HIBP_API_KEY = os.getenv('HIBP_API_KEY')
    
    # Database
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///remaleh_protect.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_size': 10,
        'pool_recycle': 3600,
        'pool_pre_ping': True,
        'max_overflow': 20
    }
    
    # Redis Configuration
    REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
    REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
    REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))
    REDIS_DB = int(os.getenv('REDIS_DB', 0))
    REDIS_PASSWORD = os.getenv('REDIS_PASSWORD')
    
    # Rate Limiting
    RATE_LIMIT_STORAGE_URL = os.getenv('RATE_LIMIT_STORAGE_URL', 'redis://localhost:6379/1')
    RATE_LIMIT_DEFAULT = os.getenv('RATE_LIMIT_DEFAULT', '60 per minute')
    RATE_LIMIT_STRATEGY = os.getenv('RATE_LIMIT_STRATEGY', 'fixed-window')
    
    # Caching
    CACHE_TYPE = os.getenv('CACHE_TYPE', 'simple')
    CACHE_REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
    CACHE_DEFAULT_TIMEOUT = int(os.getenv('CACHE_TTL', 3600))
    CACHE_KEY_PREFIX = 'remaleh_'
    
    # JWT Configuration
    JWT_SECRET_KEY = os.getenv('SECRET_KEY', 'dev-jwt-secret-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=int(os.getenv('JWT_ACCESS_EXPIRES', 24)))
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=int(os.getenv('JWT_REFRESH_EXPIRES', 30)))
    
    # Logging
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    LOG_FILE = os.getenv('LOG_FILE', 'logs/app.log')
    
    # Performance
    THREAT_INTEL_CACHE_TTL = int(os.getenv('THREAT_INTEL_CACHE_TTL', 1800))
    USER_SCAN_CACHE_TTL = int(os.getenv('USER_SCAN_CACHE_TTL', 900))
    
    # SSL/HTTPS
    FORCE_HTTPS = os.getenv('FORCE_HTTPS', 'false').lower() == 'true'
    SSL_CERT_FILE = os.getenv('SSL_CERT_FILE')
    SSL_KEY_FILE = os.getenv('SSL_KEY_FILE')
    
    # Monitoring
    ENABLE_METRICS = os.getenv('ENABLE_METRICS', 'true').lower() == 'true'
    METRICS_PORT = int(os.getenv('METRICS_PORT', 9090))
    
    # Render-specific
    PORT = int(os.getenv('PORT', 10000))

    # File uploads
    UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', os.path.join(os.getcwd(), 'uploads'))
    ALLOWED_EXTENSIONS = set(os.getenv('ALLOWED_EXTENSIONS', 'png,jpg,jpeg,gif,webp').split(','))
    MAX_CONTENT_LENGTH = int(os.getenv('MAX_UPLOAD_BYTES', 16 * 1024 * 1024))  # 16 MB

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    # Only use SQLite if DATABASE_URL is not set
    if not os.getenv('DATABASE_URL'):
        SQLALCHEMY_DATABASE_URI = 'sqlite:///remaleh_protect.db'
    CACHE_TYPE = 'simple'

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    CACHE_TYPE = 'redis'
    
    # Production-specific settings
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_size': int(os.getenv('DB_POOL_SIZE', 20)),
        'pool_recycle': int(os.getenv('DB_POOL_RECYCLE', 3600)),
        'pool_pre_ping': True,
        'max_overflow': int(os.getenv('DB_MAX_OVERFLOW', 30)),
        'connect_args': {
            'connect_timeout': 10,
            'application_name': 'remaleh_protect',
            'sslmode': 'require'  # Render PostgreSQL requires SSL
        }
    }
    
    # Render-specific optimizations
    if os.getenv('RENDER'):
        # Use Render's managed services more efficiently
        CACHE_REDIS_URL = os.getenv('REDIS_URL')
        RATE_LIMIT_STORAGE_URL = os.getenv('REDIS_URL', '').replace('/0', '/1') if os.getenv('REDIS_URL') else None
        
        # Ensure we're using the DATABASE_URL from environment
        if os.getenv('DATABASE_URL'):
            SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')

class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    CACHE_TYPE = 'null'

# Configuration mapping
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}

def get_config():
    """Get configuration based on environment"""
    env = os.getenv('FLASK_ENV', 'development')
    return config.get(env, config['default'])
