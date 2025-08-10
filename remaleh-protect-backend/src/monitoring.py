import time
import logging
from functools import wraps
from flask import request, g, current_app
from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
import redis

logger = logging.getLogger(__name__)

# Prometheus metrics
REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint', 'status'])
REQUEST_DURATION = Histogram('http_request_duration_seconds', 'HTTP request duration in seconds', ['method', 'endpoint'])
ACTIVE_REQUESTS = Gauge('http_active_requests', 'Number of active HTTP requests', ['method', 'endpoint'])

# Database metrics
DB_QUERY_DURATION = Histogram('database_query_duration_seconds', 'Database query duration in seconds', ['operation'])
DB_CONNECTION_POOL_SIZE = Gauge('database_connection_pool_size', 'Database connection pool size')
DB_CONNECTION_POOL_OVERFLOW = Gauge('database_connection_pool_overflow', 'Database connection pool overflow')

# Cache metrics
CACHE_HIT_COUNT = Counter('cache_hits_total', 'Total cache hits', ['cache_type'])
CACHE_MISS_COUNT = Counter('cache_misses_total', 'Total cache misses', ['cache_type'])
CACHE_OPERATION_DURATION = Histogram('cache_operation_duration_seconds', 'Cache operation duration in seconds', ['operation'])

# Business metrics
SCAN_COUNT = Counter('scam_scans_total', 'Total scam scans performed', ['risk_level'])
THREAT_DETECTED = Counter('threats_detected_total', 'Total threats detected', ['threat_type'])
USER_REGISTRATION = Counter('user_registrations_total', 'Total user registrations')

class PerformanceMonitor:
    """Performance monitoring and metrics collection"""
    
    def __init__(self, app=None):
        self.app = app
        self.redis_client = None
        if app is not None:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize monitoring with the Flask app"""
        try:
            # Initialize Redis for metrics storage
            redis_url = app.config.get('REDIS_URL', 'redis://localhost:6379/0')
            self.redis_client = redis.from_url(redis_url)
            self.redis_client.ping()
            logger.info("Monitoring Redis connection established")
        except Exception as e:
            logger.warning(f"Monitoring Redis connection failed: {e}")
            self.redis_client = None
    
    def track_request(self, f):
        """Decorator to track request performance"""
        @wraps(f)
        def decorated_function(*args, **kwargs):
            start_time = time.time()
            method = request.method
            endpoint = request.endpoint or 'unknown'
            
            # Track active requests
            ACTIVE_REQUESTS.labels(method=method, endpoint=endpoint).inc()
            
            try:
                response = f(*args, **kwargs)
                status_code = response.status_code if hasattr(response, 'status_code') else 200
                
                # Record metrics
                REQUEST_COUNT.labels(method=method, endpoint=endpoint, status=status_code).inc()
                
                return response
            except Exception as e:
                # Record error metrics
                REQUEST_COUNT.labels(method=method, endpoint=endpoint, status=500).inc()
                raise
            finally:
                # Record duration and decrement active requests
                duration = time.time() - start_time
                REQUEST_DURATION.labels(method=method, endpoint=endpoint).observe(duration)
                ACTIVE_REQUESTS.labels(method=method, endpoint=endpoint).dec()
                
                # Store detailed metrics in Redis if available
                if self.redis_client:
                    self._store_request_metrics(method, endpoint, duration, status_code)
        
        return decorated_function
    
    def track_database_operation(self, operation_name):
        """Decorator to track database operation performance"""
        def decorator(func):
            @wraps(func)
            def wrapper(*args, **kwargs):
                start_time = time.time()
                try:
                    result = func(*args, **kwargs)
                    return result
                finally:
                    duration = time.time() - start_time
                    DB_QUERY_DURATION.labels(operation=operation_name).observe(duration)
            return wrapper
        return decorator
    
    def track_cache_operation(self, operation_name, cache_type):
        """Decorator to track cache operation performance"""
        def decorator(func):
            @wraps(func)
            def wrapper(*args, **kwargs):
                start_time = time.time()
                try:
                    result = func(*args, **kwargs)
                    # Track cache hit/miss
                    if operation_name == 'get':
                        if result is not None:
                            CACHE_HIT_COUNT.labels(cache_type=cache_type).inc()
                        else:
                            CACHE_MISS_COUNT.labels(cache_type=cache_type).inc()
                    return result
                finally:
                    duration = time.time() - start_time
                    CACHE_OPERATION_DURATION.labels(operation=operation_name).observe(duration)
            return wrapper
        return decorator
    
    def _store_request_metrics(self, method, endpoint, duration, status_code):
        """Store detailed request metrics in Redis"""
        try:
            key = f"metrics:requests:{endpoint}:{method}"
            data = {
                'count': 1,
                'total_duration': duration,
                'avg_duration': duration,
                'min_duration': duration,
                'max_duration': duration,
                'status_codes': {str(status_code): 1}
            }
            
            # Get existing metrics
            existing = self.redis_client.hgetall(key)
            if existing:
                # Update existing metrics
                data['count'] = int(existing.get(b'count', 0)) + 1
                data['total_duration'] = float(existing.get(b'total_duration', 0)) + duration
                data['avg_duration'] = data['total_duration'] / data['count']
                data['min_duration'] = min(float(existing.get(b'min_duration', duration)), duration)
                data['max_duration'] = max(float(existing.get(b'max_duration', duration)), duration)
                
                # Update status code counts
                existing_status = existing.get(b'status_codes', b'{}')
                if existing_status:
                    import json
                    try:
                        status_counts = json.loads(existing_status.decode())
                        status_counts[str(status_code)] = status_counts.get(str(status_code), 0) + 1
                        data['status_codes'] = status_counts
                    except:
                        data['status_codes'] = {str(status_code): 1}
            
            # Store updated metrics
            self.redis_client.hset(key, mapping={
                'count': data['count'],
                'total_duration': data['total_duration'],
                'avg_duration': data['avg_duration'],
                'min_duration': data['min_duration'],
                'max_duration': data['max_duration'],
                'status_codes': str(data['status_codes']),
                'last_updated': time.time()
            })
            
            # Set expiration (keep metrics for 24 hours)
            self.redis_client.expire(key, 86400)
            
        except Exception as e:
            logger.error(f"Error storing request metrics: {e}")
    
    def get_metrics(self):
        """Get Prometheus metrics"""
        return generate_latest(), CONTENT_TYPE_LATEST
    
    def get_performance_summary(self):
        """Get performance summary from Redis"""
        if not self.redis_client:
            return {"error": "Redis not available"}
        
        try:
            # Get all metrics keys
            keys = self.redis_client.keys("metrics:requests:*")
            summary = {}
            
            for key in keys:
                endpoint_method = key.decode().replace("metrics:requests:", "")
                metrics = self.redis_client.hgetall(key)
                
                if metrics:
                    summary[endpoint_method] = {
                        'count': int(metrics.get(b'count', 0)),
                        'avg_duration': float(metrics.get(b'avg_duration', 0)),
                        'min_duration': float(metrics.get(b'min_duration', 0)),
                        'max_duration': float(metrics.get(b'max_duration', 0)),
                        'last_updated': float(metrics.get(b'last_updated', 0))
                    }
            
            return summary
            
        except Exception as e:
            logger.error(f"Error getting performance summary: {e}")
            return {"error": str(e)}

# Global monitoring instance
monitor = PerformanceMonitor()

# Convenience decorators
def track_performance(f):
    """Track request performance"""
    return monitor.track_request(f)

def track_db_performance(operation_name):
    """Track database operation performance"""
    return monitor.track_database_operation(operation_name)

def track_cache_performance(operation_name, cache_type):
    """Track cache operation performance"""
    return monitor.track_cache_operation(operation_name, cache_type)

# Business metrics functions
def record_scan(risk_level):
    """Record a scam scan"""
    SCAN_COUNT.labels(risk_level=risk_level).inc()

def record_threat(threat_type):
    """Record a detected threat"""
    THREAT_DETECTED.labels(threat_type=threat_type).inc()

def record_user_registration():
    """Record a user registration"""
    USER_REGISTRATION.inc()
