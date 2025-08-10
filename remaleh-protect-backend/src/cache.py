import redis
import json
import pickle
from functools import wraps
from flask import current_app, request
import logging

logger = logging.getLogger(__name__)

class RedisCache:
    """Redis-based caching implementation"""
    
    def __init__(self, app=None):
        self.app = app
        self.redis_client = None
        if app is not None:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize Redis connection"""
        try:
            redis_url = app.config.get('REDIS_URL', 'redis://localhost:6379/0')
            self.redis_client = redis.from_url(
                redis_url,
                decode_responses=False,  # Keep as bytes for pickle
                socket_connect_timeout=5,
                socket_timeout=5,
                retry_on_timeout=True,
                health_check_interval=30
            )
            # Test connection
            self.redis_client.ping()
            logger.info("Redis connection established successfully")
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            self.redis_client = None
    
    def get(self, key, default=None):
        """Get value from cache"""
        if not self.redis_client:
            return default
        
        try:
            value = self.redis_client.get(key)
            if value is not None:
                return pickle.loads(value)
            return default
        except Exception as e:
            logger.error(f"Error getting cache key {key}: {e}")
            return default
    
    def set(self, key, value, timeout=None):
        """Set value in cache with optional timeout"""
        if not self.redis_client:
            return False
        
        try:
            serialized_value = pickle.dumps(value)
            if timeout:
                return self.redis_client.setex(key, timeout, serialized_value)
            else:
                return self.redis_client.set(key, serialized_value)
        except Exception as e:
            logger.error(f"Error setting cache key {key}: {e}")
            return False
    
    def delete(self, key):
        """Delete key from cache"""
        if not self.redis_client:
            return False
        
        try:
            return self.redis_client.delete(key)
        except Exception as e:
            logger.error(f"Error deleting cache key {key}: {e}")
            return False
    
    def exists(self, key):
        """Check if key exists in cache"""
        if not self.redis_client:
            return False
        
        try:
            return bool(self.redis_client.exists(key))
        except Exception as e:
            logger.error(f"Error checking cache key {key}: {e}")
            return False
    
    def clear_pattern(self, pattern):
        """Clear all keys matching pattern"""
        if not self.redis_client:
            return False
        
        try:
            keys = self.redis_client.keys(pattern)
            if keys:
                return self.redis_client.delete(*keys)
            return True
        except Exception as e:
            logger.error(f"Error clearing cache pattern {pattern}: {e}")
            return False

# Global cache instance
cache = RedisCache()

def cached(timeout=300, key_prefix=''):
    """Decorator for caching function results"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            if not cache.redis_client:
                return func(*args, **kwargs)
            
            # Generate cache key
            args_str = str(args) + str(sorted(kwargs.items()))
            cache_key = f"{key_prefix}:{func.__name__}:{hash(args_str)}"
            
            # Try to get from cache
            result = cache.get(cache_key)
            if result is not None:
                return result
            
            # Execute function and cache result
            result = func(*args, **kwargs)
            cache.set(cache_key, result, timeout)
            return result
        return wrapper
    return decorator

def invalidate_cache(pattern):
    """Invalidate cache entries matching pattern"""
    return cache.clear_pattern(pattern)

# Cache keys for different data types
class CacheKeys:
    THREAT_INTEL = "threat_intel"
    USER_SCAN = "user_scan"
    COMMUNITY_REPORT = "community_report"
    LEARNING_MODULE = "learning_module"
    USER_PROFILE = "user_profile"
    
    @staticmethod
    def threat_intel(region=None, threat_type=None):
        key = f"{CacheKeys.THREAT_INTEL}"
        if region:
            key += f":{region}"
        if threat_type:
            key += f":{threat_type}"
        return key
    
    @staticmethod
    def user_scan(user_id, scan_hash):
        return f"{CacheKeys.USER_SCAN}:{user_id}:{scan_hash}"
    
    @staticmethod
    def community_report(report_id):
        return f"{CacheKeys.COMMUNITY_REPORT}:{report_id}"
    
    @staticmethod
    def learning_module(module_id):
        return f"{CacheKeys.LEARNING_MODULE}:{module_id}"
    
    @staticmethod
    def user_profile(user_id):
        return f"{CacheKeys.USER_PROFILE}:{user_id}"
