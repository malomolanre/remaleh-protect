"""
AI Chatbot with Expert Routing for Cybersecurity Help
Provides intelligent responses and determines when to escalate to human experts
"""

from flask import Blueprint, request, jsonify
import re
import json
from datetime import datetime

chat_bp = Blueprint('chat', __name__)

class CyberSecurityChatbot:
    def __init__(self):
        # Keywords that indicate high-priority situations requiring human expert
        self.urgent_keywords = [
            'hacked', 'compromised', 'stolen', 'fraud', 'scammed', 'money', 'bank',
            'credit card', 'identity theft', 'ransomware', 'virus', 'malware',
            'blackmail', 'extortion', 'threatening', 'urgent', 'help me', 'emergency'
        ]
        
        # Keywords for different categories of help
        self.category_keywords = {
            'password': ['password', 'login', 'account', 'forgot', 'reset', 'locked'],
            'email': ['email', 'phishing', 'spam', 'suspicious message', 'attachment'],
            'phone': ['phone', 'call', 'sms', 'text message', 'voicemail'],
            'social': ['facebook', 'instagram', 'twitter', 'social media', 'profile'],
            'financial': ['bank', 'credit card', 'payment', 'transaction', 'money', 'paypal'],
            'device': ['computer', 'laptop', 'phone', 'tablet', 'slow', 'pop-up', 'virus']
        }
        
        # Response templates
        self.responses = {
            'greeting': [
                "Hi! I'm here to help you with your cybersecurity concerns. Can you tell me more about what's happening?",
                "Hello! I understand you might be dealing with a security issue. Please describe what you've experienced.",
                "Hi there! I'm your cybersecurity assistant. What specific problem can I help you with today?"
            ],
            'password': {
                'advice': "For password issues, here are immediate steps:\n\n1. **Change your password immediately** on the affected account\n2. **Use a strong, unique password** (12+ characters with letters, numbers, symbols)\n3. **Enable two-factor authentication** if available\n4. **Check for suspicious activity** in your account\n\nWould you like me to connect you with a human expert for personalized assistance?",
                'urgent': "This sounds like your account may be compromised. I'm connecting you with a human expert right away for immediate assistance."
            },
            'email': {
                'advice': "For suspicious emails:\n\n1. **Don't click any links or attachments**\n2. **Don't reply or provide personal information**\n3. **Mark as spam/phishing** in your email client\n4. **Delete the email**\n5. **Report to your IT department** if it's a work email\n\nIf you already clicked something, let me know and I'll escalate to an expert.",
                'urgent': "Since you may have interacted with a malicious email, I'm connecting you with a human expert for immediate guidance."
            },
            'financial': {
                'advice': "For financial security concerns:\n\n1. **Contact your bank immediately** to report suspicious activity\n2. **Monitor your accounts** for unauthorized transactions\n3. **Consider placing a fraud alert** on your credit reports\n4. **Don't provide financial info** to unsolicited contacts\n\nThis is serious - would you like me to connect you with a human expert?",
                'urgent': "Financial security issues require immediate attention. I'm connecting you with a human expert right now."
            },
            'device': {
                'advice': "For device security issues:\n\n1. **Disconnect from the internet** if you suspect malware\n2. **Run a full antivirus scan**\n3. **Don't enter passwords** on the affected device\n4. **Back up important data** if possible\n\nIf your device is acting very strangely, I can connect you with an expert.",
                'urgent': "Device compromise can be serious. I'm connecting you with a human expert for immediate assistance."
            },
            'general': {
                'advice': "Here are some general security steps:\n\n1. **Stay calm** - most issues can be resolved\n2. **Document what happened** (screenshots, emails, etc.)\n3. **Change passwords** for any affected accounts\n4. **Monitor your accounts** for suspicious activity\n\nWould you like specific guidance for your situation?",
                'escalate': "Based on what you've described, I think it would be best to connect you with a human expert who can provide personalized assistance."
            }
        }

    def analyze_message(self, message):
        """Analyze user message to determine urgency and category"""
        message_lower = message.lower()
        
        # Check for urgent keywords
        urgent_score = sum(1 for keyword in self.urgent_keywords if keyword in message_lower)
        
        # Determine category
        category_scores = {}
        for category, keywords in self.category_keywords.items():
            score = sum(1 for keyword in keywords if keyword in message_lower)
            if score > 0:
                category_scores[category] = score
        
        # Get primary category
        primary_category = max(category_scores.items(), key=lambda x: x[1])[0] if category_scores else 'general'
        
        # Determine if urgent (needs human expert)
        is_urgent = urgent_score >= 2 or any(word in message_lower for word in ['help me', 'emergency', 'hacked', 'stolen money'])
        
        return {
            'urgent_score': urgent_score,
            'is_urgent': is_urgent,
            'primary_category': primary_category,
            'category_scores': category_scores
        }

    def generate_response(self, message, conversation_history=None):
        """Generate appropriate response based on message analysis"""
        analysis = self.analyze_message(message)
        
        response_data = {
            'message': '',
            'escalate_to_human': False,
            'category': analysis['primary_category'],
            'urgency_level': 'high' if analysis['is_urgent'] else 'medium' if analysis['urgent_score'] > 0 else 'low',
            'suggested_actions': [],
            'analysis': analysis
        }
        
        # Handle urgent cases
        if analysis['is_urgent']:
            response_data['escalate_to_human'] = True
            if analysis['primary_category'] in self.responses:
                response_data['message'] = self.responses[analysis['primary_category']].get('urgent', 
                    "This situation requires immediate expert attention. I'm connecting you with a human expert right away.")
            else:
                response_data['message'] = "This situation requires immediate expert attention. I'm connecting you with a human expert right away."
        
        # Handle category-specific responses
        elif analysis['primary_category'] in self.responses:
            category_responses = self.responses[analysis['primary_category']]
            response_data['message'] = category_responses.get('advice', self.responses['general']['advice'])
            
            # Add suggested actions based on category
            if analysis['primary_category'] == 'password':
                response_data['suggested_actions'] = ['Change password', 'Enable 2FA', 'Check account activity']
            elif analysis['primary_category'] == 'email':
                response_data['suggested_actions'] = ['Delete suspicious email', 'Mark as spam', 'Don\'t click links']
            elif analysis['primary_category'] == 'financial':
                response_data['suggested_actions'] = ['Contact bank', 'Monitor accounts', 'Place fraud alert']
                response_data['escalate_to_human'] = True  # Financial issues often need human help
        
        # Handle general cases
        else:
            response_data['message'] = self.responses['general']['advice']
            response_data['suggested_actions'] = ['Document incident', 'Change passwords', 'Monitor accounts']
        
        return response_data

# Initialize chatbot
chatbot = CyberSecurityChatbot()

@chat_bp.route('/message', methods=['POST'])
def chat_message():
    """Handle chat messages from users"""
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({'error': 'Message is required'}), 400
        
        user_message = data['message'].strip()
        conversation_history = data.get('conversation_history', [])
        
        if not user_message:
            return jsonify({'error': 'Message cannot be empty'}), 400
        
        # Generate response
        response = chatbot.generate_response(user_message, conversation_history)
        
        # Add timestamp
        response['timestamp'] = datetime.now().isoformat()
        
        return jsonify(response)
    
    except Exception as e:
        return jsonify({'error': f'Failed to process message: {str(e)}'}), 500

@chat_bp.route('/escalate', methods=['POST'])
def escalate_to_human():
    """Handle escalation to human expert"""
    try:
        data = request.get_json()
        
        conversation_history = data.get('conversation_history', [])
        user_info = data.get('user_info', {})
        
        # In a real implementation, this would:
        # 1. Create a support ticket
        # 2. Notify human experts
        # 3. Provide queue information
        
        # For demo purposes, simulate the escalation
        response = {
            'escalated': True,
            'ticket_id': f"CYBER-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            'estimated_wait_time': '5-10 minutes',
            'message': "I've escalated your case to our cybersecurity experts. You'll be connected with a human specialist within 5-10 minutes. Please stay on this page.",
            'expert_status': 'connecting',
            'priority': 'high' if any('urgent' in msg.get('message', '').lower() for msg in conversation_history) else 'normal'
        }
        
        return jsonify(response)
    
    except Exception as e:
        return jsonify({'error': f'Failed to escalate: {str(e)}'}), 500

@chat_bp.route('/status', methods=['GET'])
def chat_status():
    """Get chat system status"""
    return jsonify({
        'status': 'online',
        'ai_available': True,
        'human_experts_available': True,
        'average_response_time': '< 1 minute',
        'queue_length': 2
    })

