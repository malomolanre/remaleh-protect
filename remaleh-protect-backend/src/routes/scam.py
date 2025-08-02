from flask import Blueprint, jsonify, request
import re
import string
from collections import Counter
from .enhanced_scam import EnhancedScamDetector
from .link_analysis import analyze_links_in_text

scam_bp = Blueprint('scam', __name__)

# Initialize enhanced detector
enhanced_detector = EnhancedScamDetector()

# Legacy scam keywords for backward compatibility
SCAM_KEYWORDS = [
    'urgent', 'immediate', 'act now', 'limited time', 'congratulations', 'winner',
    'free money', 'cash prize', 'lottery', 'inheritance', 'prince', 'nigeria',
    'click here', 'verify account', 'suspended', 'confirm identity', 'update payment',
    'tax refund', 'irs', 'government', 'social security', 'medicare',
    'bitcoin', 'cryptocurrency', 'investment opportunity', 'guaranteed returns',
    'wire transfer', 'western union', 'gift card', 'itunes card', 'amazon card',
    'phishing', 'malware', 'virus', 'security alert', 'account compromised'
]

URGENCY_WORDS = [
    'urgent', 'immediate', 'asap', 'quickly', 'hurry', 'expires', 'deadline',
    'limited time', 'act now', 'don\'t delay', 'time sensitive'
]

FINANCIAL_WORDS = [
    'money', 'cash', 'payment', 'transfer', 'bank', 'account', 'credit card',
    'debit card', 'paypal', 'venmo', 'zelle', 'wire', 'deposit', 'withdraw'
]

SUSPICIOUS_PATTERNS = [
    r'\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b',  # Credit card pattern
    r'\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b',  # SSN pattern
    r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+',  # URLs
    r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'  # Email addresses
]

def analyze_text_for_scam(text):
    """
    Legacy scam analysis function for backward compatibility
    """
    text_lower = text.lower()
    scam_score = 0
    identified_indicators = []
    
    # Check for scam keywords
    keyword_matches = []
    for keyword in SCAM_KEYWORDS:
        if keyword in text_lower:
            keyword_matches.append(keyword)
            scam_score += 10
    
    if keyword_matches:
        identified_indicators.append({
            'type': 'scam_keywords',
            'description': 'Contains common scam keywords',
            'matches': keyword_matches
        })
    
    # Check for urgency indicators
    urgency_matches = []
    for word in URGENCY_WORDS:
        if word in text_lower:
            urgency_matches.append(word)
            scam_score += 15
    
    if urgency_matches:
        identified_indicators.append({
            'type': 'urgency_language',
            'description': 'Uses urgent or time-pressured language',
            'matches': urgency_matches
        })
    
    # Check for financial terms
    financial_matches = []
    for word in FINANCIAL_WORDS:
        if word in text_lower:
            financial_matches.append(word)
            scam_score += 5
    
    if financial_matches:
        identified_indicators.append({
            'type': 'financial_terms',
            'description': 'Contains financial or payment-related terms',
            'matches': financial_matches
        })
    
    # Check for suspicious patterns
    pattern_matches = []
    for pattern in SUSPICIOUS_PATTERNS:
        matches = re.findall(pattern, text, re.IGNORECASE)
        if matches:
            pattern_matches.extend(matches)
            scam_score += 20
    
    if pattern_matches:
        identified_indicators.append({
            'type': 'suspicious_patterns',
            'description': 'Contains suspicious patterns (URLs, emails, card numbers, etc.)',
            'matches': pattern_matches
        })
    
    # Check for excessive capitalization
    if text.isupper() and len(text) > 20:
        scam_score += 10
        identified_indicators.append({
            'type': 'excessive_caps',
            'description': 'Uses excessive capitalization',
            'matches': ['ALL CAPS TEXT']
        })
    
    # Check for excessive punctuation
    punctuation_count = sum(1 for char in text if char in string.punctuation)
    if punctuation_count > len(text) * 0.1:  # More than 10% punctuation
        scam_score += 8
        identified_indicators.append({
            'type': 'excessive_punctuation',
            'description': 'Uses excessive punctuation marks',
            'matches': ['Multiple punctuation marks']
        })
    
    # Check for poor grammar/spelling (simplified check)
    words = text_lower.split()
    if len(words) > 5:
        # Check for repeated words
        word_counts = Counter(words)
        repeated_words = [word for word, count in word_counts.items() if count > 2 and len(word) > 3]
        if repeated_words:
            scam_score += 5
            identified_indicators.append({
                'type': 'repeated_words',
                'description': 'Contains repeated words (possible poor quality)',
                'matches': repeated_words
            })
    
    # Determine risk level
    if scam_score >= 50:
        risk_level = 'HIGH'
        is_scam = True
    elif scam_score >= 25:
        risk_level = 'MEDIUM'
        is_scam = True
    elif scam_score >= 10:
        risk_level = 'LOW'
        is_scam = False
    else:
        risk_level = 'VERY_LOW'
        is_scam = False
    
    return {
        'is_scam': is_scam,
        'risk_level': risk_level,
        'scam_score': scam_score,
        'identified_indicators': identified_indicators,
        'total_indicators': len(identified_indicators)
    }

@scam_bp.route('/analyze', methods=['POST'])
def analyze_scam():
    """
    Analyze text for scam indicators using enhanced ML-based detection
    Expected JSON payload: {"text": "message to analyze", "mode": "enhanced|legacy"}
    """
    try:
        data = request.json
        if not data or 'text' not in data:
            return jsonify({'error': 'Missing text field in request'}), 400
        
        text = data['text']
        if not text or not text.strip():
            return jsonify({'error': 'Text cannot be empty'}), 400
        
        # Check analysis mode (default to enhanced)
        mode = data.get('mode', 'enhanced')
        
        if mode == 'enhanced':
            # Use enhanced ML-based analysis
            analysis_result = enhanced_detector.comprehensive_analysis(text)
        else:
            # Use legacy analysis for backward compatibility
            analysis_result = analyze_text_for_scam(text)
        
        # Add metadata
        response = {
            'success': True,
            'analysis': analysis_result,
            'metadata': {
                'text_length': len(text),
                'word_count': len(text.split()),
                'analysis_mode': mode,
                'analyzed_at': 'now'  # In a real app, you'd use datetime
            }
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        return jsonify({'error': f'Analysis failed: {str(e)}'}), 500

@scam_bp.route('/analyze-links', methods=['POST'])
def analyze_links():
    """
    Analyze links in text for malicious content
    Expected JSON payload: {"text": "message containing links"}
    """
    try:
        data = request.json
        if not data or 'text' not in data:
            return jsonify({'error': 'Missing text field in request'}), 400
        
        text = data['text']
        if not text or not text.strip():
            return jsonify({'error': 'Text cannot be empty'}), 400
        
        # Perform link analysis
        link_analysis = analyze_links_in_text(text)
        
        response = {
            'success': True,
            'link_analysis': link_analysis,
            'metadata': {
                'text_length': len(text),
                'analyzed_at': 'now'
            }
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        return jsonify({'error': f'Link analysis failed: {str(e)}'}), 500

@scam_bp.route('/comprehensive', methods=['POST'])
def comprehensive_analysis():
    """
    Perform comprehensive analysis including text and links
    Expected JSON payload: {"text": "message to analyze"}
    """
    try:
        data = request.json
        if not data or 'text' not in data:
            return jsonify({'error': 'Missing text field in request'}), 400
        
        text = data['text']
        if not text or not text.strip():
            return jsonify({'error': 'Text cannot be empty'}), 400
        
        # Perform enhanced text analysis
        text_analysis = enhanced_detector.comprehensive_analysis(text)
        
        # Perform link analysis
        link_analysis = analyze_links_in_text(text)
        
        # Combine results for overall assessment
        combined_score = text_analysis.get('scam_score', 0)
        
        # Add link risk to overall score
        if link_analysis['urls_found'] > 0:
            link_risk_bonus = {
                'HIGH': 25,
                'MEDIUM': 15,
                'LOW': 8,
                'VERY_LOW': 3,
                'NONE': 0
            }
            combined_score += link_risk_bonus.get(link_analysis['overall_risk'], 0)
        
        # Determine final risk level
        if combined_score >= 70:
            final_risk = 'HIGH'
            is_dangerous = True
        elif combined_score >= 40:
            final_risk = 'MEDIUM'
            is_dangerous = True
        elif combined_score >= 20:
            final_risk = 'LOW'
            is_dangerous = False
        else:
            final_risk = 'VERY_LOW'
            is_dangerous = False
        
        response = {
            'success': True,
            'comprehensive_analysis': {
                'is_dangerous': is_dangerous,
                'final_risk_level': final_risk,
                'combined_score': min(combined_score, 100),
                'text_analysis': text_analysis,
                'link_analysis': link_analysis
            },
            'metadata': {
                'text_length': len(text),
                'word_count': len(text.split()),
                'urls_found': link_analysis['urls_found'],
                'analyzed_at': 'now'
            }
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        return jsonify({'error': f'Comprehensive analysis failed: {str(e)}'}), 500

@scam_bp.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint for the scam detection API.
    """
    return jsonify({
        'status': 'healthy',
        'service': 'scam_detector_api',
        'version': '2.0.0',
        'features': ['enhanced_text_analysis', 'local_link_analysis', 'ml_based_detection']
    }), 200

