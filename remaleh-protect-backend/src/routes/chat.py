from flask import Blueprint, request, jsonify
import openai
import os
import re

chat_bp = Blueprint('chat', __name__)

# Cybersecurity knowledge base for rule-based responses
def get_rule_based_response(message):
    """
    Check if message matches known cybersecurity topics and return rule-based response
    Returns None if no match found (should use LLM)
    """
    lowerMessage = message.lower()
    
    # Password-related queries
    if any(keyword in lowerMessage for keyword in ['password', 'passwords', '2fa', 'two factor', 'authentication']):
        return {
            "response": "🔐 **Password Security Best Practices:**\n\n• Use unique passwords for each account\n• Enable two-factor authentication (2FA)\n• Use a reputable password manager\n• Passwords should be 12+ characters with mixed case, numbers, and symbols\n• Never share passwords via email or text\n• Change passwords immediately if you suspect a breach\n\nWould you like specific help with password management tools or setting up 2FA?",
            "confidence": "high",
            "source": "rule_based",
            "show_guardian": False
        }
    
    # Phishing/scam queries
    if any(keyword in lowerMessage for keyword in ['phishing', 'scam', 'suspicious email', 'fake email', 'spam']):
        return {
            "response": "🎣 **Phishing & Scam Protection:**\n\n• Check sender's email address carefully\n• Look for urgent language or threats\n• Verify links before clicking (hover to see real URL)\n• Don't download unexpected attachments\n• When in doubt, contact the organization directly\n• Use our 'Check Text' feature to analyze suspicious messages\n\nIf you're dealing with an active threat or need immediate assistance, I can connect you with a Remaleh Guardian.",
            "confidence": "high",
            "source": "rule_based",
            "show_guardian": True
        }
    
    # Malware/virus queries
    if any(keyword in lowerMessage for keyword in ['malware', 'virus', 'infected', 'ransomware', 'trojan']):
        return {
            "response": "🦠 **Malware Protection & Response:**\n\n• Keep your antivirus software updated\n• Run regular system scans\n• Avoid downloading software from untrusted sources\n• Keep your operating system updated\n• If infected: disconnect from internet, run antivirus scan\n• For ransomware: DO NOT pay - contact authorities\n\n⚠️ **If you suspect active malware infection, this requires immediate expert assistance.**",
            "confidence": "high",
            "source": "rule_based",
            "show_guardian": True
        }
    
    # Data breach queries
    if any(keyword in lowerMessage for keyword in ['data breach', 'breach', 'hacked', 'compromised', 'stolen data']):
        return {
            "response": "🚨 **Data Breach Response:**\n\n• Change passwords for affected accounts immediately\n• Enable 2FA on all important accounts\n• Monitor your accounts for suspicious activity\n• Check credit reports for unauthorized activity\n• Use our 'Password Safety Check' to see if your email appears in known breaches\n\nFor business data breaches or complex incidents, expert guidance is essential.",
            "confidence": "high",
            "source": "rule_based",
            "show_guardian": True
        }
    
    # Social media security
    if any(keyword in lowerMessage for keyword in ['social media', 'facebook', 'instagram', 'twitter', 'linkedin', 'tiktok']):
        return {
            "response": "📱 **Social Media Security:**\n\n• Review privacy settings regularly\n• Be selective with friend/connection requests\n• Think before sharing personal information\n• Use strong, unique passwords\n• Enable 2FA on all social accounts\n• Be cautious of suspicious links in messages\n• Report and block suspicious accounts\n\nNeed help securing specific social media accounts?",
            "confidence": "high",
            "source": "rule_based",
            "show_guardian": False
        }
    
    # WiFi/network security
    if any(keyword in lowerMessage for keyword in ['wifi', 'network', 'public wifi', 'router', 'vpn']):
        return {
            "response": "📶 **Network & WiFi Security:**\n\n• Avoid sensitive activities on public WiFi\n• Use a VPN when on public networks\n• Change default router passwords\n• Use WPA3 encryption on home WiFi\n• Regularly update router firmware\n• Hide your network name (SSID) if possible\n• Monitor connected devices regularly\n\nFor business network security, professional assessment is recommended.",
            "confidence": "high",
            "source": "rule_based",
            "show_guardian": True
        }
    
    # Mobile security
    if any(keyword in lowerMessage for keyword in ['mobile', 'phone', 'smartphone', 'app', 'android', 'iphone', 'ios']):
        return {
            "response": "📱 **Mobile Device Security:**\n\n• Keep your OS and apps updated\n• Only download apps from official stores\n• Use screen locks (PIN, password, biometric)\n• Enable remote wipe capabilities\n• Be cautious with app permissions\n• Avoid clicking suspicious text message links\n• Use mobile antivirus if available\n\nConcerned about a specific mobile security issue?",
            "confidence": "high",
            "source": "rule_based",
            "show_guardian": False
        }
    
    # Business/enterprise security
    if any(keyword in lowerMessage for keyword in ['business', 'company', 'enterprise', 'employee', 'corporate']):
        return {
            "response": "🏢 **Business Cybersecurity:**\n\n• Implement employee security training\n• Use endpoint protection on all devices\n• Regular security audits and assessments\n• Backup data regularly and test recovery\n• Implement access controls and monitoring\n• Have an incident response plan\n• Consider cyber insurance\n\n**Business security requires professional consultation for proper implementation.**",
            "confidence": "high",
            "source": "rule_based",
            "show_guardian": True
        }
    
    # General help or greeting
    if any(keyword in lowerMessage for keyword in ['help', 'hello', 'hi', 'start']) or len(message.strip()) < 10:
        return {
            "response": "👋 **Welcome to Remaleh Cybersecurity Support!**\n\nI'm here to help with:\n• Password security and management\n• Phishing and scam identification\n• Malware protection and response\n• Data breach guidance\n• Social media security\n• Network and WiFi security\n• Mobile device protection\n• Business cybersecurity advice\n\n**What cybersecurity topic can I help you with today?**",
            "confidence": "high",
            "source": "rule_based",
            "show_guardian": False
        }
    
    # No rule-based match found
    return None

def get_llm_response(message, conversation_history):
    """
    Get response from OpenAI LLM for complex cybersecurity questions
    """
    try:
        # Build conversation context
        messages = [
            {
                "role": "system",
                "content": """You are a cybersecurity expert assistant for Remaleh Protect. 

IMPORTANT GUIDELINES:
- Provide accurate, helpful cybersecurity advice
- Keep responses concise but informative (2-3 paragraphs max)
- Use bullet points for actionable steps
- Always prioritize user safety
- If the question involves immediate threats, active malware, or business security incidents, recommend connecting with a Remaleh Guardian
- For complex technical issues beyond basic advice, suggest expert consultation
- Never provide advice that could compromise security
- Stay focused on cybersecurity topics

RESPONSE FORMAT:
- Use clear, professional language
- Include relevant emojis for visual appeal
- End with a question or offer for further help when appropriate

If the user needs expert human assistance, indicate this in your response."""
            }
        ]
        
        # Add conversation history (last 3 exchanges)
        for msg in conversation_history[-6:]:  # Last 3 user + 3 assistant messages
            if msg.get('type') == 'user':
                messages.append({"role": "user", "content": msg.get('content', '')})
            elif msg.get('type') in ['ai', 'llm']:
                messages.append({"role": "assistant", "content": msg.get('content', '')})
        
        # Add current message
        messages.append({"role": "user", "content": message})
        
        # Call OpenAI API
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=messages,
            max_tokens=500,
            temperature=0.3,  # Lower temperature for more consistent responses
            top_p=0.9
        )
        
        llm_response = response.choices[0].message.content.strip()
        
        # Determine if Guardian assistance should be offered
        show_guardian = any(keyword in llm_response.lower() for keyword in [
            'expert', 'professional', 'guardian', 'immediate', 'urgent', 
            'complex', 'business', 'enterprise', 'incident', 'breach',
            'malware infection', 'ransomware', 'hacked'
        ])
        
        return {
            "response": llm_response,
            "confidence": "medium",
            "source": "llm",
            "show_guardian": show_guardian
        }
        
    except Exception as e:
        print(f"LLM Error: {str(e)}")
        return {
            "response": "I'm having trouble processing your question right now. For immediate cybersecurity assistance, please connect with a Remaleh Guardian who can help you directly.",
            "confidence": "low",
            "source": "error",
            "show_guardian": True
        }

@chat_bp.route('/message', methods=['POST'])
def chat_message():
    """
    Hybrid chat endpoint that uses rule-based responses first, then LLM fallback
    """
    try:
        data = request.get_json()
        message = data.get('message', '').strip()
        conversation_history = data.get('conversation_history', [])
        
        if not message:
            return jsonify({
                "response": "Please ask me a cybersecurity question and I'll be happy to help!",
                "source": "validation",
                "show_guardian": False
            }), 200
        
        # First, try rule-based response
        rule_response = get_rule_based_response(message)
        
        if rule_response:
            # Rule-based match found
            return jsonify({
                "response": rule_response["response"],
                "source": rule_response["source"],
                "confidence": rule_response["confidence"],
                "show_guardian": rule_response["show_guardian"],
                "escalated": False
            }), 200
        
        # No rule-based match, use LLM
        llm_response = get_llm_response(message, conversation_history)
        
        return jsonify({
            "response": llm_response["response"],
            "source": llm_response["source"],
            "confidence": llm_response["confidence"],
            "show_guardian": llm_response["show_guardian"],
            "escalated": False
        }), 200
        
    except Exception as e:
        print(f"Chat error: {str(e)}")
        return jsonify({
            "response": "I'm experiencing technical difficulties. Please connect with a Remaleh Guardian for immediate assistance.",
            "source": "error",
            "show_guardian": True,
            "escalated": True
        }), 500

