"""
Enhanced scam detection module with local ML/AI features
Provides advanced text analysis without expensive third-party APIs
"""

import re
import string
import math
from collections import Counter
from datetime import datetime
from flask import Blueprint, request, jsonify, current_app
import secrets
import base64

# Create the blueprint
enhanced_scam_bp = Blueprint('enhanced_scam', __name__)
try:
    from ..models import db, User, UserScan
except Exception:
    from models import db, User, UserScan
try:
    from ..auth import token_required
except Exception:
    from auth import token_required


# Enhanced scam indicators with weights
SCAM_INDICATORS = {
    'financial_fraud': {
        'keywords': [
            'inheritance', 'lottery', 'prize', 'winner', 'million', 'dollars',
            'beneficiary', 'transfer', 'fund', 'deposit', 'wire', 'bank account',
            'atm card', 'check', 'payment', 'compensation', 'refund'
        ],
        'weight': 15
    },
    'urgency_pressure': {
        'keywords': [
            'urgent', 'immediate', 'asap', 'quickly', 'hurry', 'expires',
            'deadline', 'limited time', 'act now', 'don\'t delay', 'time sensitive',
            'expires today', 'last chance', 'final notice'
        ],
        'weight': 12
    },
    'authority_impersonation': {
        'keywords': [
            'irs', 'fbi', 'police', 'government', 'tax', 'social security',
            'medicare', 'court', 'legal', 'attorney', 'lawyer', 'judge',
            'federal', 'department', 'agency', 'official', 'ato', 'centrelink',
            'auspost', 'australia post', 'telstra', 'optus'
        ],
        'weight': 18
    },
    'tech_support_scam': {
        'keywords': [
            'virus', 'malware', 'infected', 'security alert', 'microsoft',
            'windows', 'computer', 'tech support', 'remote access',
            'error', 'warning', 'compromised', 'hacked'
        ],
        'weight': 16
    },
    'romance_scam': {
        'keywords': [
            'love', 'lonely', 'relationship', 'marriage', 'meet',
            'dating', 'romance', 'heart', 'soul mate', 'destiny'
        ],
        'weight': 14
    },
    'delivery_scam': {
        'keywords': [
            'parcel', 'package', 'delivery', 'shipped', 'tracking', 'postal code',
            'held', 'suspended', 'customs', 'warehouse', 'courier', 'fedex', 'dhl',
            'ups', 'auspost', 'australia post', 'postage', 'shipment', 'processed',
            'invalid', 'cannot be delivered', 'temporarily held', 'verify', '24 hours',
            'reply with', 'exit the message', 'reopen', 'activate the link', 'copy and paste',
            'safari browser', 'best regards', 'team'
        ],
        'weight': 25  # Increased weight for delivery scams
    },
    'urgent_action_scam': {
        'keywords': [
            'reply with', 'exit the message', 'reopen', 'activate', 'copy and paste',
            'safari browser', 'chrome', 'firefox', 'browser', 'click here', 'verify now',
            'confirm immediately', 'act now', 'don\'t delay', 'time sensitive'
        ],
        'weight': 30  # High weight for urgent action scams
    }
}

def calculate_text_entropy(text):
    """Calculate entropy of text to detect randomness"""
    if not text:
        return 0
    
    # Count character frequencies
    char_counts = Counter(text.lower())
    text_length = len(text)
    
    # Calculate entropy
    entropy = 0
    for count in char_counts.values():
        probability = count / text_length
        if probability > 0:
            entropy -= probability * math.log2(probability)
    
    return entropy

def analyze_grammar_quality(text):
    """Analyze grammar and spelling quality"""
    issues = 0
    
    # Check for common grammar issues
    grammar_issues = [
        r'\b(recieve|recieved)\b',  # receive/received
        r'\b(seperate|seperated)\b',  # separate/separated
        r'\b(definately)\b',  # definitely
        r'\b(occured)\b',  # occurred
        r'\b(begining)\b',  # beginning
    ]
    
    for pattern in grammar_issues:
        if re.search(pattern, text, re.IGNORECASE):
            issues += 1
    
    # Check for excessive punctuation
    if re.search(r'[!]{2,}|[?]{2,}', text):
        issues += 1
    
    # Check for inconsistent capitalization
    sentences = re.split(r'[.!?]+', text)
    for sentence in sentences:
        sentence = sentence.strip()
        if sentence and not sentence[0].isupper():
            issues += 1
            break
    
    return issues

def extract_suspicious_patterns(text):
    """Extract suspicious patterns from text"""
    patterns = []
    
    # Phone numbers
    phone_pattern = r'\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b'
    if re.search(phone_pattern, text):
        patterns.append('phone_number')
    
    # Email addresses
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    if re.search(email_pattern, text):
        patterns.append('email_address')
    
    # URLs - enhanced pattern to catch more malicious URLs
    url_pattern = r'https?://[^\s<>"{}|\\^`\[\]]+'
    if re.search(url_pattern, text):
        patterns.append('url')
        
        # Additional URL analysis for suspicious patterns
        urls = re.findall(url_pattern, text)
        for url in urls:
            url_lower = url.lower()
            # Check for suspicious URL characteristics
            if any(suspicious in url_lower for suspicious in [
                '.buzz', '.tk', '.ml', '.ga', '.cf', '.pw', '.top', '.click', '.download',
                '.work', '.party', '.trade', '.date', '.racing', '.review'
            ]):
                patterns.append('suspicious_domain')
            if len(url) > 100:
                patterns.append('very_long_url')
            if url.count('.') > 3:
                patterns.append('excessive_subdomains')
    
    # Money amounts
    money_pattern = r'\$[\d,]+(?:\.\d{2})?|\b\d+(?:,\d{3})*(?:\.\d{2})?\s*(?:dollars?|USD|AUD)\b'
    if re.search(money_pattern, text, re.IGNORECASE):
        patterns.append('money_amount')
    
    return patterns

def analyze_enhanced_scam(text):
    """Perform enhanced scam analysis"""
    if not text or not text.strip():
        return {
            'risk_score': 0,
            'risk_level': 'LOW',
            'indicators': [],
            'analysis': 'No text provided'
        }
    
    text_lower = text.lower()
    total_score = 0
    indicators = []
    scam_categories = {}
    
    print(f"🔍 Analyzing text: {text[:100]}...")
    
    # Check scam indicators
    for category, data in SCAM_INDICATORS.items():
        category_score = 0
        found_keywords = []
        
        for keyword in data['keywords']:
            if keyword in text_lower:
                category_score += data['weight']
                found_keywords.append(keyword)
                print(f"✅ Found keyword '{keyword}' in category '{category}' (+{data['weight']} points)")
        
        if found_keywords:
            total_score += category_score
            indicators.append(f"{category.replace('_', ' ').title()}: {', '.join(found_keywords[:3])}")
            scam_categories[category] = {
                'score': category_score,
                'keywords_found': found_keywords
            }
            print(f"📊 Category '{category}' total: +{category_score} points")
    
    print(f"💰 Total scam category score: {total_score}")
    
    # Analyze text quality
    entropy = calculate_text_entropy(text)
    grammar_issues = analyze_grammar_quality(text)
    
    # Low entropy might indicate template/automated text
    if entropy < 3.0:
        total_score += 10
        indicators.append("Low text entropy (possible template)")
    
    # Grammar issues
    if grammar_issues > 2:
        total_score += 15
        indicators.append(f"Multiple grammar/spelling issues ({grammar_issues})")
    
    # Suspicious patterns
    patterns = extract_suspicious_patterns(text)
    print(f"🔍 Patterns detected: {patterns}")
    
    if 'url' in patterns:
        total_score += 25
        indicators.append("Contains URLs")
        print(f"🔗 URLs detected: +25 points")
    if 'suspicious_domain' in patterns:
        total_score += 35
        indicators.append("Contains suspicious domain (.buzz, .tk, etc.)")
        print(f"🚨 Suspicious domain: +35 points")
    if 'very_long_url' in patterns:
        total_score += 20
        indicators.append("Contains very long URL")
        print(f"📏 Long URL: +20 points")
    if 'excessive_subdomains' in patterns:
        total_score += 25
        indicators.append("Contains excessive subdomains")
        print(f"🌐 Excessive subdomains: +25 points")
    if 'phone_number' in patterns:
        total_score += 15
        indicators.append("Contains phone numbers")
        print(f"📞 Phone number: +15 points")
    if 'money_amount' in patterns:
        total_score += 25
        indicators.append("Contains money amounts")
        print(f"💵 Money amount: +25 points")
    
    # Determine risk level
    if total_score >= 60:
        risk_level = 'SCAM'
    elif total_score >= 30:
        risk_level = 'SUSPICIOUS'
    elif total_score >= 10:
        risk_level = 'SUSPICIOUS'
    else:
        risk_level = 'SAFE'
    
    print(f"🎯 Final total score: {total_score}")
    print(f"🚨 Risk level determined: {risk_level}")
    
    # Normalize score to 0-1 range
    normalized_score = min(total_score / 100.0, 1.0)
    
    # Add debugging information
    debug_info = {
        'total_score': total_score,
        'risk_level': risk_level,
        'normalized_score': normalized_score,
        'scam_categories_found': list(scam_categories.keys()),
        'patterns_found': patterns
    }
    
    return {
        'risk_score': normalized_score,
        'risk_level': risk_level,
        'indicators': indicators,
        'patterns': patterns,
        'entropy': entropy,
        'grammar_issues': grammar_issues,
        'analysis': 'Enhanced ML-based scam detection',
        'debug_info': debug_info
    }

@enhanced_scam_bp.route('/analyze', methods=['POST'])
def enhanced_scam_analysis():
    """Enhanced scam detection endpoint"""
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({
                'success': False,
                'error': 'No text provided'
            }), 400
        
        text = data['text']
        
        # Perform enhanced analysis
        result = analyze_enhanced_scam(text)
        
        return jsonify({
            'success': True,
            'result': result,
            'timestamp': datetime.now().isoformat(),
            'service': 'enhanced_scam_detection'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@enhanced_scam_bp.route('/health', methods=['GET'])
def enhanced_scam_health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'enhanced_scam_detection',
        'version': '2.0'
    })

@enhanced_scam_bp.route('/recent-scans', methods=['GET'])
@token_required
def recent_scans(current_user):
    """Return the most recent forwarded email scans for the current user."""
    try:
        limit = int(request.args.get('limit', 20))
    except Exception:
        limit = 20
    q = UserScan.query.filter_by(user_id=current_user.id).order_by(UserScan.scanned_at.desc()).limit(limit)
    items = []
    for s in q.all():
        items.append({
            'id': s.id,
            'subject': (s.analysis_result or {}).get('debug_info', {}).get('subject') if isinstance(s.analysis_result, dict) else None,
            'risk_level': s.risk_level,
            'risk_score': s.risk_score,
            'scanned_at': s.scanned_at.isoformat() if s.scanned_at else None
        })
    return jsonify({'items': items})

@enhanced_scam_bp.route('/forwarding-address', methods=['GET'])
@token_required
def get_forwarding_address(current_user):
    """Return a per-user email forwarding address like forward+<token>@remalehprotect.mail"""
    # Ensure user has a token
    if not getattr(current_user, 'email_forward_token', None):
        current_user.email_forward_token = secrets.token_urlsafe(24).replace('-', '').replace('_', '')[:48]
        db.session.commit()
    local_part = f"forward+{current_user.email_forward_token}"
    domain = current_app.config.get('EMAIL_FORWARD_DOMAIN', 'mail.remalehprotect.remaleh.com.au')
    return jsonify({
        'forwarding_address': f"{local_part}@{domain}",
        'token': current_user.email_forward_token
    })

@enhanced_scam_bp.route('/inbound-email', methods=['POST'])
def inbound_email_webhook():
    """
    Minimal inbound email webhook.
    Expect JSON with: token, subject, text, html (optional), attachments (array of {filename, content_base64})
    This endpoint should be wired to your email provider webhook to parse incoming forwards.
    """
    data = request.get_json(silent=True) or {}
    token = data.get('token')
    if not token:
        return jsonify({'success': False, 'error': 'Missing token'}), 400
    user = User.query.filter_by(email_forward_token=token).first()
    if not user:
        return jsonify({'success': False, 'error': 'Invalid token'}), 404

    # Build text to analyze: subject + text or html stripped
    subject = (data.get('subject') or '').strip()
    text_body = (data.get('text') or '').strip()
    if not text_body and data.get('html'):
        # naive strip tags
        import re as _re
        text_body = _re.sub('<[^<]+?>', ' ', data['html'])
    combined = (subject + "\n\n" + text_body).strip()
    result = analyze_enhanced_scam(combined)

    # Save a UserScan record
    scan = UserScan(
        user_id=user.id,
        message=combined[:10000],
        risk_level=result.get('risk_level') or 'SAFE',
        risk_score=int(result.get('risk_score', 0) * 100),
        threat_type='EMAIL_FORWARD',
        analysis_result=result
    )
    db.session.add(scan)
    db.session.commit()

    # TODO: attachments could be uploaded to Cloudinary if needed
    return jsonify({'success': True, 'scan_id': scan.id, 'result': result})

@enhanced_scam_bp.route('/test', methods=['POST'])
def test_analysis():
    """Test endpoint for debugging analysis"""
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({'error': 'No text provided'}), 400
        
        text = data['text']
        print(f"🧪 TEST ANALYSIS REQUEST: {text[:100]}...")
        
        # Test the analysis function
        result = analyze_enhanced_scam(text)
        
        print(f"🧪 TEST ANALYSIS RESULT: {result}")
        
        return jsonify({
            'success': True,
            'test_result': result,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        print(f"🧪 TEST ANALYSIS ERROR: {str(e)}")
        return jsonify({'error': str(e)}), 500

