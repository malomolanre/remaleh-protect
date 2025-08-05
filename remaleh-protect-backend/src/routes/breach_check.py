"""
HaveIBeenPwned API integration with COMPREHENSIVE DEBUGGING
"""
from flask import Blueprint, request, jsonify
import requests
import time
import hashlib
import os
import logging

# Set up detailed logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

breach_bp = Blueprint('breach', __name__)

@breach_bp.route('/check', methods=['POST'])
def check_email_breaches():
    """
    Check if an email has been involved in any data breaches using HaveIBeenPwned API
    WITH COMPREHENSIVE DEBUGGING
    """
    logger.info("=== BREACH CHECK API CALL STARTED ===")
    
    try:
        # Log the incoming request
        logger.debug(f"Request method: {request.method}")
        logger.debug(f"Request headers: {dict(request.headers)}")
        
        data = request.get_json()
        logger.debug(f"Request data received: {data}")
        
        # Handle both single email and emails array for compatibility
        email = None
        if data:
            if 'email' in data:
                email = data['email'].strip().lower()
                logger.info(f"Single email detected: {email}")
            elif 'emails' in data and len(data['emails']) > 0:
                email = data['emails'][0].strip().lower()  # Use first email for now
                logger.info(f"Email array detected, using first: {email}")
        
        if not email or '@' not in email:
            logger.error(f"Invalid email provided: {email}")
            return jsonify({'error': 'Valid email address is required'}), 400
        
        # Check for API key
        api_key = os.getenv('HIBP_API_KEY')
        logger.info(f"API key check - Present: {bool(api_key)}")
        logger.info(f"API key value (first 10 chars): {api_key[:10] if api_key else 'None'}...")
        
        if not api_key or api_key == 'your-api-key-here':
            logger.warning("No valid API key found, using enhanced simulation")
            return simulate_breach_check_enhanced(email)
        
        # Real HaveIBeenPwned API call
        logger.info("=== ATTEMPTING REAL HIBP API CALL ===")
        try:
            url = f"https://haveibeenpwned.com/api/v3/breachedaccount/{email}"
            logger.info(f"API URL: {url}")
            
            headers = {
                'User-Agent': 'Remaleh-Protect-App',
                'hibp-api-key': api_key
            }
            logger.debug(f"Request headers: {headers}")
            
            # Add delay to respect rate limiting
            logger.info("Adding 1.5 second delay for rate limiting...")
            time.sleep(1.5)
            
            logger.info("Making HTTP request to HIBP API...")
            response = requests.get(url, headers=headers, timeout=10)
            
            logger.info(f"API Response Status: {response.status_code}")
            logger.debug(f"API Response Headers: {dict(response.headers)}")
            
            if response.status_code == 200:
                logger.info("SUCCESS: Email found in breaches")
                breaches_data = response.json()
                logger.debug(f"Raw breach data: {breaches_data}")
                
                # Format response to match frontend expectations
                formatted_breaches = []
                for i, breach in enumerate(breaches_data[:5]):  # Limit to 5 most recent
                    logger.debug(f"Processing breach {i+1}: {breach.get('Name', 'Unknown')}")
                    formatted_breaches.append({
                        'name': breach.get('Name', 'Unknown Breach'),
                        'domain': breach.get('Domain', 'unknown.com'),
                        'date': breach.get('BreachDate', '2023-01-01'),
                        'data': breach.get('DataClasses', ['Email', 'Password']),
                        'description': breach.get('Description', 'Data breach detected')
                    })
                
                result = {
                    'breached': True,
                    'breach_count': len(breaches_data),
                    'breaches': formatted_breaches,
                    'breached_emails': [email],
                    'message': f'Your email was found in {len(breaches_data)} data breach(es). Consider changing passwords for affected accounts.',
                    'demo_mode': False,
                    'api_success': True
                }
                
                logger.info(f"Returning success result with {len(breaches_data)} breaches")
                return jsonify(result)
                
            elif response.status_code == 404:
                logger.info("SUCCESS: Email not found in breaches (404 = clean)")
                result = {
                    'breached': False,
                    'breach_count': 0,
                    'breaches': [],
                    'breached_emails': [],
                    'message': 'Good news! Your email was not found in any known data breaches.',
                    'demo_mode': False,
                    'api_success': True
                }
                
                logger.info("Returning clean result")
                return jsonify(result)
                
            elif response.status_code == 429:
                logger.warning("Rate limited by HIBP API")
                return jsonify({
                    'error': 'Rate limited. Please try again in a moment.',
                    'demo_mode': False,
                    'api_success': False
                }), 429
                
            elif response.status_code == 401:
                logger.error("API key authentication failed")
                logger.error(f"Response text: {response.text}")
                return jsonify({
                    'error': 'API authentication failed. Please check your API key.',
                    'demo_mode': False,
                    'api_success': False
                }), 401
                
            else:
                logger.error(f"Unexpected API response: {response.status_code}")
                logger.error(f"Response text: {response.text}")
                logger.warning("Falling back to simulation")
                return simulate_breach_check_enhanced(email)
                
        except requests.exceptions.Timeout as e:
            logger.error(f"API request timeout: {str(e)}")
            logger.warning("Falling back to simulation due to timeout")
            return simulate_breach_check_enhanced(email)
            
        except requests.exceptions.ConnectionError as e:
            logger.error(f"API connection error: {str(e)}")
            logger.warning("Falling back to simulation due to connection error")
            return simulate_breach_check_enhanced(email)
            
        except requests.exceptions.RequestException as e:
            logger.error(f"API request error: {str(e)}")
            logger.warning("Falling back to simulation due to request error")
            return simulate_breach_check_enhanced(email)
            
    except Exception as e:
        logger.error(f"Unexpected error in breach check: {str(e)}")
        logger.exception("Full exception details:")
        return jsonify({'error': 'Internal server error', 'debug': str(e)}), 500

def simulate_breach_check_enhanced(email):
    """
    Enhanced simulation that matches frontend expectations exactly
    """
    logger.info("=== USING ENHANCED SIMULATION MODE ===")
    logger.info(f"Simulating breach check for: {email}")
    
    # Use email hash for consistent results
    email_hash = hashlib.md5(email.encode()).hexdigest()
    logger.debug(f"Email hash: {email_hash}")
    
    # Use hash to determine if email should be "breached" for demo
    hash_value = int(email_hash[:2], 16) % 3
    logger.debug(f"Hash value for simulation: {hash_value}")
    
    if hash_value == 0:  # ~33% chance of being "breached"
        logger.info("Simulation result: BREACHED")
        result = {
            'breached': True,
            'breach_count': 2,
            'breaches': [
                {
                    'name': 'ExampleSite',
                    'domain': 'example.com',
                    'date': '2023-01-15',
                    'data': ['Email', 'Password', 'Username']
                },
                {
                    'name': 'AnotherBreach',
                    'domain': 'anotherbreach.com',
                    'date': '2022-08-22',
                    'data': ['Email', 'Password', 'IP Address']
                }
            ],
            'breached_emails': [email],
            'message': f'Your email was found in 2 data breach(es). Consider changing passwords for affected accounts.',
            'demo_mode': True,
            'api_success': False
        }
    else:
        logger.info("Simulation result: CLEAN")
        result = {
            'breached': False,
            'breach_count': 0,
            'breaches': [],
            'breached_emails': [],
            'message': 'Good news! Your email was not found in any known data breaches.',
            'demo_mode': True,
            'api_success': False
        }
    
    logger.debug(f"Simulation result: {result}")
    return jsonify(result)

@breach_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for breach checker with debug info"""
    logger.info("Health check requested")
    
    api_key = os.getenv('HIBP_API_KEY')
    has_api_key = bool(api_key and api_key != 'your-api-key-here')
    
    result = {
        'status': 'healthy',
        'service': 'breach_checker',
        'version': '2.0.0-debug',
        'api_key_configured': has_api_key,
        'mode': 'production' if has_api_key else 'simulation',
        'debug_enabled': True,
        'environment_variables': {
            'HIBP_API_KEY': 'present' if api_key else 'missing'
        }
    }
    
    logger.info(f"Health check result: {result}")
    return jsonify(result)

@breach_bp.route('/debug', methods=['GET'])
def debug_info():
    """Debug endpoint to check configuration"""
    logger.info("Debug info requested")
    
    api_key = os.getenv('HIBP_API_KEY')
    
    debug_data = {
        'environment_check': {
            'HIBP_API_KEY_present': bool(api_key),
            'HIBP_API_KEY_length': len(api_key) if api_key else 0,
            'HIBP_API_KEY_preview': api_key[:10] + '...' if api_key and len(api_key) > 10 else api_key,
            'all_env_vars': list(os.environ.keys())
        },
        'logging_level': logging.getLogger().level,
        'service_status': 'debug_mode_active'
    }
    
    logger.debug(f"Debug data: {debug_data}")
    return jsonify(debug_data)

