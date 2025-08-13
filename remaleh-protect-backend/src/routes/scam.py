from flask import Blueprint, request, jsonify
import re

scam_bp = Blueprint('scam', __name__ )

def analyze_text_patterns(text):
    """Analyze text for scam patterns"""
    threats = []
    risk_score = 0
    
    text_lower = text.lower()
    
    # Urgency indicators
    urgency_words = ['urgent', 'immediate', 'expires', 'limited time', 'act now', 'hurry']
    if any(word in text_lower for word in urgency_words):
        threats.append('Urgency pressure')
        risk_score += 25
    
    # Financial fraud indicators
    money_words = ['won', 'winner', 'prize', 'million', 'thousand', 'lottery', 'inheritance']
    if any(word in text_lower for word in money_words):
        threats.append('Financial fraud')
        risk_score += 30
    
    # Personal information requests
    personal_info = ['ssn', 'social security', 'bank account', 'credit card', 'password']
    if any(word in text_lower for word in personal_info):
        threats.append('Personal information request')
        risk_score += 35
    
    # Suspicious contact methods
    contact_words = ['click here', 'call now', 'text back', 'reply immediately']
    if any(word in text_lower for word in contact_words):
        threats.append('Suspicious contact request')
        risk_score += 20
    
    return threats, min(risk_score, 100)

def extract_urls(text):
    """Extract URLs from text"""
    url_pattern = r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\ ),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'
    urls = re.findall(url_pattern, text)
    return urls

def get_risk_level(score):
    """Convert risk score to risk level"""
    if score >= 70:
        return 'HIGH'
    elif score >= 40:
        return 'MEDIUM'
    elif score >= 20:
        return 'LOW'
    else:
        return 'SAFE'

@scam_bp.route('/comprehensive', methods=['POST'])
def comprehensive_analysis():
    """Comprehensive scam analysis endpoint"""
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({'error': 'No text provided'}), 400
        
        text = data['text']
        check_links = data.get('check_links', True)
        
        # Analyze text patterns
        threats, risk_score = analyze_text_patterns(text)
        
        # Extract URLs if requested
        urls_found = []
        if check_links:
            urls_found = extract_urls(text)
        
        # Determine risk level
        risk_level = get_risk_level(risk_score)
        
        # Create response
        response = {
            'overall_assessment': {
                'risk_level': risk_level,
                'risk_score': risk_score,
                'message': f'Analysis complete. Risk level: {risk_level}'
            },
            'threats_detected': threats,
            'text_analysis': {
                'length': len(text),
                'word_count': len(text.split()),
                'suspicious_patterns': len(threats)
            },
            'link_analysis': {
                'urls_found': urls_found,
                'url_count': len(urls_found)
            }
        }
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({'error': f'Analysis failed: {str(e)}'}), 500

@scam_bp.route('/health', methods=['GET'])
def scam_health():
    """Health check for scam detection service"""
    return jsonify({
        'status': 'healthy',
        'service': 'scam_detection',
        'endpoints': ['/comprehensive']
    })
