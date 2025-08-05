from flask import Blueprint, request, jsonify, make_response
import openai
import os
import re

chat_bp = Blueprint('chat', __name__)

# Configure OpenAI
openai.api_key = os.getenv('OPENAI_API_KEY')

# Rule-based cybersecurity knowledge base
CYBERSECURITY_KNOWLEDGE = {
    'password': {
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
        'keywords': ['phishing', 'phish', 'suspicious email', 'fake email', 'email scam', 'verify email'],
        'response': """**How to Spot Phishing Emails:**

• **Check sender's email address carefully**
• **Look for urgent language and pressure tactics**
• **Hover over links to see real destination**
• **Be suspicious of unexpected attachments**
• **Verify requests through official channels**
• **Never provide personal info via email**"""
    },
    'malware': {
        'keywords': ['malware', 'virus', 'ransomware', 'trojan', 'spyware', 'infected', 'antivirus'],
        'response': """**Malware Protection Guide:**

• **Keep operating system and software updated**
• **Use reputable antivirus software**
• **Avoid downloading from untrusted sources**
• **Be cautious with email attachments**
• **Regular system backups are essential**
• **If infected, disconnect from internet immediately**"""
    },
    'breach': {
        'keywords': ['data breach', 'breach', 'hacked', 'compromised', 'stolen data', 'identity theft'],
        'response': """**Data Breach Response Steps:**

• **Change passwords for affected accounts immediately**
• **Enable 2FA on all important accounts**
• **Monitor bank and credit card statements**
• **Consider credit monitoring services**
• **Report to relevant authorities if needed**
• **Document everything for potential legal action**"""
    },
    'social_media': {
        'keywords': ['social media', 'facebook', 'instagram', 'twitter', 'linkedin', 'privacy settings'],
        'response': """**Social Media Security Tips:**

• **Review and tighten privacy settings regularly**
• **Be selective about friend/connection requests**
• **Avoid sharing personal information publicly**
• **Think before posting location data**
• **Use strong, unique passwords**
• **Enable login alerts and 2FA**"""
    },
    'network': {
        'keywords': ['wifi', 'network', 'router', 'vpn', 'public wifi', 'network security'],
        'response': """**Network Security Best Practices:**

• **Use WPA3 encryption on home WiFi**
• **Change default router passwords**
• **Avoid public WiFi for sensitive activities**
• **Use VPN when on public networks**
• **Keep router firmware updated**
• **Hide network name (SSID) if possible**"""
    },
    'mobile': {
        'keywords': ['mobile', 'smartphone', 'phone security', 'app security', 'mobile device'],
        'response': """**Mobile Device Security:**

• **Keep OS and apps updated**
• **Use screen lock with PIN/biometric**
• **Download apps only from official stores**
• **Review app permissions carefully**
• **Enable remote wipe capability**
• **Avoid charging at public USB ports**"""
    },
    'business': {
        'keywords': ['business security', 'company', 'enterprise', 'employee training', 'business'],
        'response': """**Business Cybersecurity Essentials:**

• **Implement comprehensive security policies**
• **Regular employee cybersecurity training**
• **Use endpoint detection and response (EDR)**
• **Maintain offline backups**
• **Conduct regular security audits**
• **Have an incident response plan ready**"""
    }
}

# Guardian escalation keywords
GUARDIAN_KEYWORDS = [
    'hacked', 'breach', 'stolen', 'compromised', 'attacked', 'emergency',
    'urgent', 'help', 'crisis', 'incident', 'threat', 'suspicious activity',
    'identity theft', 'fraud', 'scammed', 'malware infected', 'ransomware'
]

def get_rule_based_response(message):
    """Check if message matches rule-based knowledge"""
    message_lower = message.lower()
    
    for category, data in CYBERSECURITY_KNOWLEDGE.items():
        for keyword in data['keywords']:
            if keyword in message_lower:
                return {
                    'response': data['response'],
                    'source': 'expert_knowledge',
                    'category': category
                }
    
    return None

def should_escalate_to_guardian(message):
    """Check if message should be escalated to Guardian"""
    message_lower = message.lower()
    return any(keyword in message_lower for keyword in GUARDIAN_KEYWORDS)

def get_llm_response(message):
    """Get response from OpenAI LLM"""
    try:
        if not openai.api_key:
            return None
            
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system", 
                    "content": "You are a cybersecurity expert assistant. Provide helpful, accurate cybersecurity advice. Keep responses concise but informative. Focus on practical, actionable guidance."
                },
                {"role": "user", "content": message}
            ],
            max_tokens=300,
            temperature=0.7
        )
        
        return {
            'response': response.choices[0].message.content.strip(),
            'source': 'ai_analysis',
            'model': 'gpt-3.5-turbo'
        }
        
    except Exception as e:
        print(f"OpenAI API error: {str(e)}")
        return None

@chat_bp.route('/', methods=['OPTIONS'])
def handle_preflight():
    """Handle CORS preflight requests"""
    response = make_response()
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add('Access-Control-Allow-Headers', "Content-Type,Authorization")
    response.headers.add('Access-Control-Allow-Methods', "GET,PUT,POST,DELETE,OPTIONS")
    return response

@chat_bp.route('/', methods=['POST'])
def chat_message():
    """Handle chat messages with hybrid intelligence"""
    try:
        # Handle CORS for actual request
        response_headers = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,OPTIONS"
        }
        
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({
                'error': 'Message is required'
            }), 400, response_headers
        
        user_message = data['message'].strip()
        if not user_message:
            return jsonify({
                'error': 'Message cannot be empty'
            }), 400, response_headers
        
        # Check for Guardian escalation first
        needs_guardian = should_escalate_to_guardian(user_message)
        
        # Try rule-based response first
        rule_response = get_rule_based_response(user_message)
        
        if rule_response:
            # Rule-based response found
            return jsonify({
                'response': rule_response['response'],
                'source': rule_response['source'],
                'category': rule_response['category'],
                'needs_guardian': needs_guardian,
                'guardian_url': 'https://www.remaleh.com.au/contact-us' if needs_guardian else None
            }), 200, response_headers
        
        # No rule-based response, try LLM
        llm_response = get_llm_response(user_message)
        
        if llm_response:
            # LLM response available
            return jsonify({
                'response': llm_response['response'],
                'source': llm_response['source'],
                'model': llm_response['model'],
                'needs_guardian': needs_guardian,
                'guardian_url': 'https://www.remaleh.com.au/contact-us' if needs_guardian else None
            }), 200, response_headers
        
        # Fallback response
        fallback_response = """I understand you have a cybersecurity question. While I can help with common topics like passwords, phishing, and malware protection, your specific question might need expert attention.

For immediate assistance with complex cybersecurity issues, please contact our Remaleh Guardians."""
        
        return jsonify({
            'response': fallback_response,
            'source': 'fallback',
            'needs_guardian': True,
            'guardian_url': 'https://www.remaleh.com.au/contact-us'
        }), 200, response_headers
        
    except Exception as e:
        print(f"Chat error: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'message': 'Please try again or contact support'
        }), 500, {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,OPTIONS"
        }

@chat_bp.route('/health', methods=['GET'])
def chat_health():
    """Health check endpoint for chat service"""
    return jsonify({
        'status': 'healthy',
        'service': 'chat',
        'openai_configured': bool(os.getenv('OPENAI_API_KEY')),
        'knowledge_base_categories': len(CYBERSECURITY_KNOWLEDGE)
    }), 200, {
        "Access-Control-Allow-Origin": "*"
    }

