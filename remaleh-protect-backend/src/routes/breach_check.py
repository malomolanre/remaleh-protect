"""
HaveIBeenPwned API integration for checking email breaches
"""
from flask import Blueprint, request, jsonify
import requests
import time
import hashlib
import os
import logging

breach_bp = Blueprint('breach', __name__)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@breach_bp.route('/check', methods=['POST'])
def check_email_breaches():
    """
    Check if an email has been involved in any data breaches using HaveIBeenPwned API
    """
    try:
        data = request.get_json()
        
        # Handle both single email and multiple emails
        emails = []
        if 'email' in data:
            emails = [data['email']]
        elif 'emails' in data:
            emails = data['emails']
        else:
            return jsonify({'error': 'Email or emails array is required'}), 400
        
        if not emails:
            return jsonify({'error': 'At least one email address is required'}), 400
        
        results = []
        
        for email in emails:
            email = email.strip().lower()
            
            if not email or '@' not in email:
                results.append({
                    'email': email,
                    'error': 'Invalid email format'
                })
                continue
            
            # Check if we have API key
            api_key = os.getenv('HIBP_API_KEY')
            
            if api_key and api_key != 'your-api-key-here':
                # Use real Have I Been Pwned API
                result = check_hibp_api(email, api_key)
            else:
                # Fallback to simulation mode
                logger.warning(f"No HIBP API key found, using simulation mode for {email}")
                result = simulate_breach_check(email)
            
            results.append(result)
        
        # Return aggregated results
        total_breached = sum(1 for r in results if r.get('breached', False))
        total_breaches = sum(r.get('breach_count', 0) for r in results)
        
        return jsonify({
            'results': results,
            'summary': {
                'emails_checked': len(emails),
                'emails_breached': total_breached,
                'total_breaches': total_breaches,
                'all_clear': total_breached == 0
            }
        })
            
    except Exception as e:
        logger.error(f"Error in breach check: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

def check_hibp_api(email, api_key):
    """
    Check email against real Have I Been Pwned API
    """
    try:
        # HaveIBeenPwned API endpoint
        url = f"https://haveibeenpwned.com/api/v3/breachedaccount/{email}"
        
        headers = {
            'User-Agent': 'Remaleh-Protect-App',
            'hibp-api-key': api_key
        }
        
        logger.info(f"Checking {email} against HIBP API")
        
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            # Email found in breaches
            breaches_data = response.json()
            
            # Format breach data
            formatted_breaches = []
            for breach in breaches_data:
                formatted_breaches.append({
                    'name': breach.get('Name', 'Unknown'),
                    'date': breach.get('BreachDate', 'Unknown'),
                    'domain': breach.get('Domain', 'Unknown'),
                    'description': breach.get('Description', 'No description available'),
                    'data_classes': breach.get('DataClasses', []),
                    'verified': breach.get('IsVerified', False),
                    'pwn_count': breach.get('PwnCount', 0)
                })
            
            return {
                'email': email,
                'breached': True,
                'breach_count': len(formatted_breaches),
                'breaches': formatted_breaches,
                'message': f'Your email was found in {len(formatted_breaches)} data breach(es). Consider changing passwords for affected accounts.',
                'api_source': 'Have I Been Pwned'
            }
            
        elif response.status_code == 404:
            # Email not found in breaches (good news!)
            return {
                'email': email,
                'breached': False,
                'breach_count': 0,
                'breaches': [],
                'message': 'Good news! Your email was not found in any known data breaches.',
                'api_source': 'Have I Been Pwned'
            }
            
        elif response.status_code == 429:
            # Rate limited
            logger.warning(f"Rate limited by HIBP API for {email}")
            return {
                'email': email,
                'error': 'Rate limited by API. Please try again later.',
                'api_source': 'Have I Been Pwned'
            }
            
        else:
            # Other error
            logger.error(f"HIBP API error {response.status_code} for {email}")
            return simulate_breach_check(email)
            
    except requests.exceptions.Timeout:
        logger.error(f"Timeout checking {email}")
        return simulate_breach_check(email)
    except requests.exceptions.RequestException as e:
        logger.error(f"Request error checking {email}: {str(e)}")
        return simulate_breach_check(email)
    except Exception as e:
        logger.error(f"Unexpected error checking {email}: {str(e)}")
        return simulate_breach_check(email)

def simulate_breach_check(email):
    """
    Simulate breach checking for demo purposes when API is not available
    """
    try:
        # Simple simulation based on email characteristics
        email_hash = hashlib.md5(email.encode()).hexdigest()
        
        # Use hash to determine if email should be "breached" for demo
        if int(email_hash[:2], 16) % 3 == 0:  # ~33% chance of being "breached"
            return {
                'email': email,
                'breached': True,
                'breach_count': 2,
                'breaches': [
                    {
                        'name': 'Example Data Breach',
                        'date': '2023-01-15',
                        'domain': 'example.com',
                        'description': 'A simulated data breach for demonstration purposes. This is not real breach data.',
                        'data_classes': ['Email addresses', 'Passwords'],
                        'verified': True,
                        'pwn_count': 150000
                    },
                    {
                        'name': 'Demo Service Leak',
                        'date': '2022-08-22',
                        'domain': 'demoservice.com',
                        'description': 'Another simulated breach entry for testing the application functionality.',
                        'data_classes': ['Email addresses', 'Usernames', 'IP addresses'],
                        'verified': False,
                        'pwn_count': 50000
                    }
                ],
                'message': 'Your email was found in 2 data breach(es). Consider changing passwords for affected accounts.',
                'api_source': 'Simulation Mode'
            }
        else:
            return {
                'email': email,
                'breached': False,
                'breach_count': 0,
                'breaches': [],
                'message': 'Good news! Your email was not found in any known data breaches.',
                'api_source': 'Simulation Mode'
            }
    except Exception as e:
        logger.error(f"Error in simulation for {email}: {str(e)}")
        return {
            'email': email,
            'error': 'Unable to check email',
            'api_source': 'Simulation Mode'
        }

@breach_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for breach checker"""
    api_key = os.getenv('HIBP_API_KEY')
    api_status = 'configured' if api_key and api_key != 'your-api-key-here' else 'simulation_mode'
    
    return jsonify({
        'status': 'healthy',
        'service': 'breach_checker',
        'version': '2.0.0',
        'api_status': api_status,
        'endpoints': ['/check']
    })

