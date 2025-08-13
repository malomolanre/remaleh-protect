from flask import Blueprint, request, jsonify, make_response
import os
from openai import OpenAI
import logging

# Set up minimal logging for production
logging.basicConfig(level=logging.WARNING)
logger = logging.getLogger(__name__)

chat_bp = Blueprint('chat', __name__)

# Configure OpenAI
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

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
    },
    'scam_reporting': {
        'keywords': ['report scam', 'report fraud', 'report cybercrime', 'report phishing', 'report suspicious', 'who to report', 'where to report'],
        'response': """**Scam Reporting Options:**

• **Local Police**: Contact your local police department or cybercrime unit
• **National Cybercrime Reporting**: Use your country's official cybercrime reporting website
• **Financial Institutions**: Report to your bank if money was involved
• **Consumer Protection Agencies**: Contact your country's consumer protection authority
• **Online Platforms**: Report to the platform where the scam occurred (social media, email provider, etc.)
• **Document Everything**: Keep records of communications, transactions, and evidence

**Important**: Never share personal or financial information when reporting. If you need help with cybersecurity protection, Remaleh can assist with security assessments and training."""
    }
}

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
    """Check if message should be escalated to Guardian with enhanced detection"""
    # High priority escalation keywords (immediate Guardian contact)
    high_priority_keywords = [
        'hacked', 'hack', 'stolen', 'breach', 'compromised', 'attacked',
        'help me', 'urgent', 'emergency', 'crisis', 'threat', 'malicious',
        'scammed', 'fraud', 'identity theft', 'ransomware', 'blackmail',
        'suspicious activity', 'unauthorized access', 'data stolen',
        'account compromised', 'credit card fraud', 'bank account',
        'what do i do', 'need help', 'been hacked', 'lost money'
    ]
    
    # Medium priority keywords (suggest Guardian contact)
    medium_priority_keywords = [
        'worried', 'concerned', 'suspicious', 'strange', 'unusual',
        'not sure', 'confused', 'advice', 'guidance', 'recommendation'
    ]
    
    message_lower = message.lower()
    
    # Check for high priority escalation
    for keyword in high_priority_keywords:
        if keyword in message_lower:
            return 'high'
    
    # Check for medium priority escalation
    for keyword in medium_priority_keywords:
        if keyword in message_lower:
            return 'medium'
    
    return None

def get_guardian_response(escalation_level, base_response=""):
    """Generate appropriate guardian escalation response"""
    if escalation_level == 'high':
        guardian_message = """

**🛡️ REMALEH GUARDIAN ESCALATION**

This appears to be a serious cybersecurity concern that requires immediate expert attention. Our cybersecurity specialists are ready to help you.

**Immediate Actions:**
• **Contact our Guardian team** for personalized assistance
• **Document any evidence** of the security incident
• **Don't panic** - we're here to help you through this

**Get Expert Help Now:**
[Contact Remaleh Guardian →](https://www.remaleh.com.au/contact-us)

Our team will provide you with step-by-step guidance to resolve your security concerns safely and effectively."""

    else:  # medium priority
        guardian_message = """

**💡 Need More Personalized Help?**

For complex cybersecurity situations or personalized advice, our Guardian team is available to provide expert guidance tailored to your specific needs.

**Get Expert Consultation:**
[Contact Remaleh Guardian →](https://www.remaleh.com.au/contact-us)

Our cybersecurity specialists can provide detailed analysis and customized security recommendations."""

    return base_response + guardian_message

def get_openai_response(message):
    """Get response from OpenAI API"""
    try:
        if not client.api_key:
            return None
            
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "You are a friendly cybersecurity expert assistant for Remaleh. Provide helpful, accurate information about cybersecurity topics. Keep responses conversational and easy to understand. Focus on the user's country of residence context when relevant. IMPORTANT: Only mention Remaleh services that actually exist - do not make up fake organizations, agencies, or services. If you're unsure about Remaleh's specific services, focus on providing accurate cybersecurity advice. Always verify information before sharing it."
                },
                {
                    "role": "user",
                    "content": message
                }
            ],
            max_tokens=300,
            temperature=0.7
        )
        
        return response.choices[0].message.content.strip()
        
    except Exception as e:
        logger.error(f"OpenAI API error: {str(e)}")
        return None

@chat_bp.route('/', methods=['POST', 'OPTIONS'])
def chat_message():
    # Handle preflight requests
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "*")
        response.headers.add('Access-Control-Allow-Methods', "*")
        return response
    
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({
                'error': 'No message provided',
                'success': False
            }), 400
        
        message = data['message']
        
        # Check for Guardian escalation first
        escalation_level = should_escalate_to_guardian(message)
        
        # Try rule-based response first
        rule_response = get_rule_based_response(message)
        if rule_response:
            base_response = rule_response['response']
            
            # Add Guardian escalation if needed
            if escalation_level:
                final_response = get_guardian_response(escalation_level, base_response)
                source = 'expert_knowledge_with_guardian'
            else:
                final_response = base_response
                source = 'expert_knowledge'
            
            response_data = {
                'response': final_response,
                'source': source,
                'success': True,
                'escalation_level': escalation_level,
                'guardian_url': 'https://www.remaleh.com.au/contact-us' if escalation_level else None
            }
            
            response = make_response(jsonify(response_data))
            response.headers.add("Access-Control-Allow-Origin", "*")
            response.headers.add('Access-Control-Allow-Headers', "*")
            response.headers.add('Access-Control-Allow-Methods', "*")
            return response
        
        # Try OpenAI for complex questions
        openai_response = get_openai_response(message)
        
        if openai_response:
            # Add Guardian escalation if needed
            if escalation_level:
                final_response = get_guardian_response(escalation_level, openai_response)
                source = 'ai_analysis_with_guardian'
            else:
                final_response = openai_response
                source = 'ai_analysis'
            
            response_data = {
                'response': final_response,
                'source': source,
                'success': True,
                'escalation_level': escalation_level,
                'guardian_url': 'https://www.remaleh.com.au/contact-us' if escalation_level else None
            }
            
            response = make_response(jsonify(response_data))
            response.headers.add("Access-Control-Allow-Origin", "*")
            response.headers.add('Access-Control-Allow-Headers', "*")
            response.headers.add('Access-Control-Allow-Methods', "*")
            return response
        
        # Fallback response with Guardian escalation
        fallback_response = "I'm here to help with cybersecurity questions. Could you please rephrase your question or ask about topics like passwords, phishing, malware, or data breaches?"
        
        if escalation_level:
            final_response = get_guardian_response(escalation_level, fallback_response)
            source = 'fallback_with_guardian'
        else:
            final_response = get_guardian_response('medium', fallback_response)  # Always offer Guardian for fallback
            source = 'fallback_with_guardian'
            escalation_level = 'medium'
        
        response_data = {
            'response': final_response,
            'source': source,
            'success': True,
            'escalation_level': escalation_level,
            'guardian_url': 'https://www.remaleh.com.au/contact-us'
        }
        
        response = make_response(jsonify(response_data))
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "*")
        response.headers.add('Access-Control-Allow-Methods', "*")
        return response
        
    except Exception as e:
        logger.error(f"Chat processing error: {str(e)}")
        error_response = {
            'error': 'Processing error occurred',
            'success': False,
            'guardian_url': 'https://www.remaleh.com.au/contact-us'
        }
        
        response = make_response(jsonify(error_response), 500)
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "*")
        response.headers.add('Access-Control-Allow-Methods', "*")
        return response

@chat_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'chat',
        'openai_configured': bool(os.getenv('OPENAI_API_KEY')),
        'guardian_url': 'https://www.remaleh.com.au/contact-us'
    })

