from flask import Blueprint, request, jsonify, make_response
import os
import openai
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

chat_bp = Blueprint('chat', __name__)

# Configure OpenAI
openai.api_key = os.getenv('OPENAI_API_KEY')

# Rule-based knowledge base
CYBERSECURITY_KNOWLEDGE = {
    'passwords': {
        'keywords': ['password', 'passwords', 'strong password', 'password security', 'password manager', '2fa', 'two-factor'],
        'response': """**Password Security Best Practices:**

• **Use unique passwords for each account**
• **Enable two-factor authentication (2FA)**
• **Use a reputable password manager**
• **Passwords should be 12+ characters with mixed case, numbers, and symbols**
• **Never share passwords via email or text**
• **Change passwords immediately if you suspect a breach**"""
    },
    'phishing': {
        'keywords': ['phishing', 'phish', 'suspicious email', 'fake email', 'scam email', 'email scam'],
        'response': """**Phishing Detection Tips:**

• **Check sender email address carefully**
• **Look for urgent language and threats**
• **Verify links before clicking (hover to see URL)**
• **Be suspicious of unexpected attachments**
• **Contact the organization directly to verify**
• **Never provide personal info via email**"""
    },
    'malware': {
        'keywords': ['malware', 'virus', 'ransomware', 'trojan', 'spyware', 'infected'],
        'response': """**Malware Protection:**

• **Keep software and OS updated**
• **Use reputable antivirus software**
• **Avoid downloading from untrusted sources**
• **Be cautious with email attachments**
• **Regular system backups**
• **If infected: disconnect from internet, run antivirus scan**"""
    },
    'breach': {
        'keywords': ['data breach', 'breach', 'hacked', 'compromised', 'stolen data'],
        'response': """**Data Breach Response:**

• **Change passwords immediately**
• **Enable 2FA on all accounts**
• **Monitor financial statements**
• **Check credit reports**
• **Report to relevant authorities**
• **Document the incident**"""
    },
    'social_media': {
        'keywords': ['social media', 'facebook', 'instagram', 'twitter', 'privacy settings'],
        'response': """**Social Media Security:**

• **Review privacy settings regularly**
• **Limit personal information sharing**
• **Be cautious with friend requests**
• **Avoid posting location in real-time**
• **Use strong, unique passwords**
• **Enable two-factor authentication**"""
    },
    'network': {
        'keywords': ['wifi', 'network', 'router', 'vpn', 'public wifi'],
        'response': """**Network Security:**

• **Use WPA3 encryption on home WiFi**
• **Change default router passwords**
• **Avoid public WiFi for sensitive activities**
• **Use VPN on public networks**
• **Keep router firmware updated**
• **Hide network name (SSID) if needed**"""
    },
    'mobile': {
        'keywords': ['mobile', 'smartphone', 'phone security', 'app security', 'mobile device'],
        'response': """**Mobile Device Security:**

• **Keep OS and apps updated**
• **Use screen lock (PIN, password, biometric)**
• **Download apps only from official stores**
• **Review app permissions carefully**
• **Enable remote wipe capability**
• **Use mobile security software**"""
    },
    'business': {
        'keywords': ['business security', 'company', 'enterprise', 'workplace', 'employee'],
        'response': """**Business Cybersecurity:**

• **Implement security awareness training**
• **Use endpoint protection software**
• **Regular security audits and assessments**
• **Backup data regularly and test restores**
• **Implement access controls and least privilege**
• **Have an incident response plan**"""
    }
}

def get_rule_based_response(message):
    """Check if message matches rule-based knowledge"""
    logger.info(f"Checking rule-based response for: {message}")
    
    message_lower = message.lower()
    
    for category, data in CYBERSECURITY_KNOWLEDGE.items():
        for keyword in data['keywords']:
            if keyword in message_lower:
                logger.info(f"Found rule-based match in category: {category}")
                return {
                    'response': data['response'],
                    'source': 'expert_knowledge',
                    'category': category
                }
    
    logger.info("No rule-based match found")
    return None

def should_escalate_to_guardian(message):
    """Check if message should be escalated to Guardian"""
    logger.info(f"Checking Guardian escalation for: {message}")
    
    escalation_keywords = [
        'hacked', 'hack', 'stolen', 'breach', 'compromised', 'attacked',
        'help', 'urgent', 'emergency', 'crisis', 'threat', 'malicious'
    ]
    
    message_lower = message.lower()
    for keyword in escalation_keywords:
        if keyword in message_lower:
            logger.info(f"Guardian escalation triggered by keyword: {keyword}")
            return True
    
    logger.info("No Guardian escalation needed")
    return False

def get_openai_response(message):
    """Get response from OpenAI API"""
    logger.info(f"Attempting OpenAI API call for: {message}")
    
    try:
        # Check if API key is available
        if not openai.api_key:
            logger.error("OpenAI API key not found in environment variables")
            return None
            
        logger.info(f"OpenAI API key found: {openai.api_key[:10]}...")
        
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "You are a cybersecurity expert assistant. Provide helpful, accurate information about cybersecurity topics. Keep responses concise but informative."
                },
                {
                    "role": "user",
                    "content": message
                }
            ],
            max_tokens=300,
            temperature=0.7
        )
        
        logger.info("OpenAI API call successful")
        return response.choices[0].message.content.strip()
        
    except Exception as e:
        logger.error(f"OpenAI API error: {str(e)}")
        return None

@chat_bp.route('/', methods=['POST', 'OPTIONS'])
def chat_message():
    logger.info(f"=== CHAT REQUEST RECEIVED ===")
    logger.info(f"Method: {request.method}")
    logger.info(f"Headers: {dict(request.headers)}")
    
    # Handle preflight requests
    if request.method == 'OPTIONS':
        logger.info("Handling OPTIONS preflight request")
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "*")
        response.headers.add('Access-Control-Allow-Methods', "*")
        return response
    
    try:
        # Get request data
        logger.info(f"Request content type: {request.content_type}")
        logger.info(f"Request data: {request.get_data()}")
        
        data = request.get_json()
        logger.info(f"Parsed JSON data: {data}")
        
        if not data or 'message' not in data:
            logger.error("No message in request data")
            return jsonify({
                'error': 'No message provided',
                'success': False
            }), 400
        
        message = data['message']
        logger.info(f"Processing message: {message}")
        
        # Try rule-based response first
        rule_response = get_rule_based_response(message)
        if rule_response:
            logger.info("Returning rule-based response")
            response_data = {
                'response': rule_response['response'],
                'source': 'expert_knowledge',
                'success': True
            }
            
            # Add CORS headers
            response = make_response(jsonify(response_data))
            response.headers.add("Access-Control-Allow-Origin", "*")
            response.headers.add('Access-Control-Allow-Headers', "*")
            response.headers.add('Access-Control-Allow-Methods', "*")
            return response
        
        # Try OpenAI for complex questions
        logger.info("Attempting OpenAI response")
        openai_response = get_openai_response(message)
        
        if openai_response:
            logger.info("Returning OpenAI response")
            response_data = {
                'response': openai_response,
                'source': 'ai_analysis',
                'success': True
            }
            
            # Check if Guardian escalation is needed
            if should_escalate_to_guardian(message):
                response_data['show_guardian'] = True
                response_data['guardian_url'] = 'https://www.remaleh.com.au/contact-us'
            
            # Add CORS headers
            response = make_response(jsonify(response_data))
            response.headers.add("Access-Control-Allow-Origin", "*")
            response.headers.add('Access-Control-Allow-Headers', "*")
            response.headers.add('Access-Control-Allow-Methods', "*")
            return response
        
        # Fallback response
        logger.info("Using fallback response")
        response_data = {
            'response': "I'm here to help with cybersecurity questions. Could you please rephrase your question or ask about topics like passwords, phishing, malware, or data breaches?",
            'source': 'fallback',
            'success': True,
            'show_guardian': True,
            'guardian_url': 'https://www.remaleh.com.au/contact-us'
        }
        
        # Add CORS headers
        response = make_response(jsonify(response_data))
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "*")
        response.headers.add('Access-Control-Allow-Methods', "*")
        return response
        
    except Exception as e:
        logger.error(f"Chat processing error: {str(e)}")
        error_response = {
            'error': f'Processing error: {str(e)}',
            'success': False
        }
        
        # Add CORS headers even for errors
        response = make_response(jsonify(error_response), 500)
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "*")
        response.headers.add('Access-Control-Allow-Methods', "*")
        return response

@chat_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    logger.info("Health check requested")
    return jsonify({
        'status': 'healthy',
        'service': 'chat',
        'openai_configured': bool(os.getenv('OPENAI_API_KEY'))
    })

