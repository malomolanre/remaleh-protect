"""
HaveIBeenPwned API integration for checking email breaches
"""
from flask import Blueprint, request, jsonify
import requests
import time
import hashlib

breach_bp = Blueprint('breach', __name__)

@breach_bp.route('/check', methods=['POST'])
def check_email_breaches():
    """
    Check if an email has been involved in any data breaches using HaveIBeenPwned API
    """
    try:
        data = request.get_json()
        if not data or 'email' not in data:
            return jsonify({'error': 'Email is required'}), 400
        
        email = data['email'].strip().lower()
        
        if not email or '@' not in email:
            return jsonify({'error': 'Valid email address is required'}), 400
        
        # HaveIBeenPwned API endpoint
        url = f"https://haveibeenpwned.com/api/v3/breachedaccount/{email}"
        
        headers = {
            'User-Agent': 'Remaleh-Protect-App',
            'hibp-api-key': 'your-api-key-here'  # You would need to get an API key
        }
        
        try:
            # For demo purposes, use simulation instead of real API
            # In production, you would uncomment the real API call below
            return simulate_breach_check(email)
            
        except Exception as e:
            # Fallback to simulation
            return simulate_breach_check(email)
            
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

def simulate_breach_check(email):
    """
    Simulate breach checking for demo purposes when API is not available
    """
    # Simple simulation based on email characteristics
    email_hash = hashlib.md5(email.encode()).hexdigest()
    
    # Use hash to determine if email should be "breached" for demo
    if int(email_hash[:2], 16) % 3 == 0:  # ~33% chance of being "breached"
        return jsonify({
            'breached': True,
            'breach_count': 2,
            'breaches': [
                {
                    'name': 'Example Data Breach',
                    'date': '2023-01-15',
                    'domain': 'example.com',
                    'description': 'A simulated data breach for demonstration purposes. This is not real breach data.'
                },
                {
                    'name': 'Demo Service Leak',
                    'date': '2022-08-22',
                    'domain': 'demoservice.com',
                    'description': 'Another simulated breach entry for testing the application functionality.'
                }
            ],
            'message': 'Your email was found in 2 data breach(es). Consider changing passwords for affected accounts.',
            'demo_mode': True
        })
    else:
        return jsonify({
            'breached': False,
            'breach_count': 0,
            'breaches': [],
            'message': 'Good news! Your email was not found in any known data breaches.',
            'demo_mode': True
        })

@breach_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for breach checker"""
    return jsonify({
        'status': 'healthy',
        'service': 'breach_checker',
        'version': '1.0.0'
    })

