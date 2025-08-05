from flask import Blueprint, request, jsonify, make_response
import os
import openai
import logging
from flask_cors import cross_origin

# Set up enhanced logging for debugging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

chat_bp = Blueprint('chat', __name__)

# Configure OpenAI - but we'll check the key for each request
openai.api_key = os.getenv('OPENAI_API_KEY')

# Rule-based knowledge base - keeping your comprehensive categories
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
    message_lower = message.lower()
    
    for category, data in CYBERSECURITY_KNOWLEDGE.items():
        for keyword in data['keywords']:
            if keyword in message_lower:
                logger.debug(f"Found rule-based match in category: {category}")
                return {
                    'response': data['response'],
                    'source': 'expert_knowledge',
                    'category': category
                }
    
    logger.debug("No rule-based match found")
    return None

def should_escalate_to_guardian(message):
    """Check if message should be escalated to Guardian"""
    escalation_keywords = [
        'hacked', 'hack', 'stolen', 'breach', 'compromised', 'attacked',
        'help', 'urgent', 'emergency', 'crisis', 'threat', 'malicious'
    ]
    
    message_lower = message.lower()
    for keyword in escalation_keywords:
        if keyword in message_lower:
            logger.debug(f"Guardian escalation triggered by keyword: {keyword}")
            return True
    
    return False

def get_openai_response(message):
    """Get response from OpenAI API with enhanced error handling"""
    # Check if OpenAI API key is set
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        logger.error("OpenAI API key not found in environment variables")
        return {
            'response': "I'm sorry, but I'm having trouble accessing my advanced AI capabilities. For complex questions, please check resources like the Australian Cyber Security Centre (cyber.gov.au) or contact a cybersecurity professional.",
            'source': 'ai_analysis',
            'error': 'api_key_missing'
        }
    
    try:
        # Set the API key
        openai.api_key = api_key
        
        # Log that we're making an API call
        logger.debug("Making OpenAI API call")
        
        # Make the API call
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a cybersecurity expert assistant. Provide concise, accurate information about cybersecurity topics. Focus on practical advice for everyday users in Australia. Keep responses under 150 words and use bullet points where appropriate."},
                {"role": "user", "content": message}
            ],
            max_tokens=300,
            temperature=0.7
        )
        
        # Log successful response (but not the full content)
        logger.debug(f"OpenAI API call successful, received {len(response.choices[0].message.content)} characters")
        
        # Return the response
        return {
            'response': response.choices[0].message.content.strip(),
            'source': 'ai_analysis',
            'success': True
        }
        
    except Exception as e:
        # Log the error
        logger.error(f"Error calling OpenAI API: {str(e)}")
        
        # Return a user-friendly error message
        return {
            'response': "I'm sorry, but I'm having trouble connecting to my advanced AI capabilities right now. For complex questions like this, you might want to check resources like the Australian Cyber Security Centre (cyber.gov.au) or contact a cybersecurity professional.",
            'source': 'ai_analysis',
            'error': str(e)
        }

@chat_bp.route('/', methods=['POST', 'OPTIONS'])
@cross_origin()
def chat_message():
    # Handle preflight requests
    if request.method == 'OPTIONS':
        return jsonify({"status": "ok"})
    
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            logger.warning("No message provided in request")
            return jsonify({
                'error': 'No message provided',
                'success': False
            }), 400
        
        message = data['message']
        logger.debug(f"Received chat request with message: {message}")
        
        # Try rule-based response first
        rule_response = get_rule_based_response(message)
        if rule_response:
            response_data = {
                'response': rule_response['response'],
                'source': 'expert_knowledge',
                'success': True
            }
            
            logger.debug(f"Sending rule-based response for category: {rule_response.get('category')}")
            return jsonify(response_data)
        
        # Try OpenAI for complex questions
        logger.debug("No rule-based match, attempting to use OpenAI")
        openai_response = get_openai_response(message)
        
        if openai_response and 'error' not in openai_response:
            response_data = {
                'response': openai_response['response'],
                'source': 'ai_analysis',
                'success': True
            }
            
            # Check if Guardian escalation is needed
            if should_escalate_to_guardian(message):
                response_data['show_guardian'] = True
                response_data['guardian_url'] = 'https://www.remaleh.com.au/contact-us'
                logger.debug("Adding guardian escalation to response")
            
            logger.debug("Sending OpenAI response")
            return jsonify(response_data)
        
        # Fallback response
        logger.debug("Using fallback response")
        response_data = {
            'response': "I'm here to help with cybersecurity questions. Could you please rephrase your question or ask about topics like passwords, phishing, malware, or data breaches?",
            'source': 'fallback',
            'success': True,
            'show_guardian': True,
            'guardian_url': 'https://www.remaleh.com.au/contact-us'
        }
        
        return jsonify(response_data)
        
    except Exception as e:
        logger.error(f"Chat processing error: {str(e)}")
        error_response = {
            'error': 'Processing error occurred',
            'success': False
        }
        
        return jsonify(error_response), 500

@chat_bp.route('/health', methods=['GET'])
@cross_origin()
def health_check():
    """Health check endpoint"""
    api_key_status = bool(os.getenv('OPENAI_API_KEY'))
    logger.debug(f"Health check: OpenAI API key configured: {api_key_status}")
    
    return jsonify({
        'status': 'healthy',
        'service': 'chat',
        'openai_configured': api_key_status
    })

