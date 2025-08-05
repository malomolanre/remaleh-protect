"""
Link analysis module for URL security assessment
Provides URL analysis without expensive third-party APIs
"""

import re
import urllib.parse
from datetime import datetime
from flask import Blueprint, request, jsonify

# Create the blueprint
link_analysis_bp = Blueprint('link_analysis', __name__)

# Suspicious domains and TLDs
SUSPICIOUS_TLDS = [
    '.tk', '.ml', '.ga', '.cf', '.buzz', '.click', '.download', '.loan',
    '.racing', '.review', '.science', '.work', '.party', '.trade'
]

SUSPICIOUS_DOMAINS = [
    'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'short.link',
    'tiny.cc', 'is.gd', 'buff.ly', 'rebrand.ly'
]

LEGITIMATE_DOMAINS = [
    'google.com', 'microsoft.com', 'apple.com', 'amazon.com', 'facebook.com',
    'twitter.com', 'linkedin.com', 'youtube.com', 'github.com', 'stackoverflow.com',
    'wikipedia.org', 'reddit.com', 'paypal.com', 'ebay.com', 'netflix.com',
    'gov.au', 'edu.au', 'com.au', 'org.au'
]

def extract_urls_from_text(text):
    """Extract all URLs from text"""
    url_pattern = r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'
    urls = re.findall(url_pattern, text)
    return urls

def analyze_url_structure(url):
    """Analyze URL structure for suspicious patterns"""
    try:
        parsed = urllib.parse.urlparse(url)
        domain = parsed.netloc.lower()
        path = parsed.path.lower()
        query = parsed.query.lower()
        
        risk_factors = []
        risk_score = 0
        
        # Check domain length
        if len(domain) > 50:
            risk_factors.append("Extremely long domain name")
            risk_score += 25
        elif len(domain) > 30:
            risk_factors.append("Very long domain name")
            risk_score += 15
        
        # Check for suspicious TLDs
        for tld in SUSPICIOUS_TLDS:
            if domain.endswith(tld):
                risk_factors.append(f"Suspicious TLD: {tld}")
                risk_score += 30
                break
        
        # Check for URL shorteners
        for shortener in SUSPICIOUS_DOMAINS:
            if shortener in domain:
                risk_factors.append(f"URL shortener: {shortener}")
                risk_score += 20
                break
        
        # Check for legitimate domains
        is_legitimate = False
        for legit_domain in LEGITIMATE_DOMAINS:
            if legit_domain in domain:
                is_legitimate = True
                risk_score = max(0, risk_score - 20)
                break
        
        # Check for suspicious characters in domain
        if re.search(r'[0-9]{4,}', domain):
            risk_factors.append("Domain contains many numbers")
            risk_score += 15
        
        # Check for homograph attacks (similar looking characters)
        suspicious_chars = ['xn--', '0', '1', 'l', 'o']
        if any(char in domain for char in suspicious_chars[:1]):  # Just check for punycode
            risk_factors.append("Possible internationalized domain (punycode)")
            risk_score += 10
        
        # Check path for suspicious patterns
        suspicious_path_patterns = [
            'download', 'install', 'update', 'security', 'verify', 'confirm',
            'login', 'signin', 'account', 'banking', 'paypal', 'amazon'
        ]
        
        for pattern in suspicious_path_patterns:
            if pattern in path:
                risk_factors.append(f"Suspicious path keyword: {pattern}")
                risk_score += 10
                break
        
        # Check for excessive subdomain levels
        subdomain_count = domain.count('.')
        if subdomain_count > 3:
            risk_factors.append("Multiple subdomain levels")
            risk_score += 15
        
        # Check query parameters for suspicious content
        if 'redirect' in query or 'url=' in query:
            risk_factors.append("Contains redirect parameters")
            risk_score += 20
        
        return {
            'domain': domain,
            'risk_score': min(risk_score, 100),
            'risk_factors': risk_factors,
            'is_legitimate': is_legitimate,
            'url_structure': {
                'scheme': parsed.scheme,
                'domain': domain,
                'path': path,
                'query': query,
                'subdomain_levels': subdomain_count
            }
        }
        
    except Exception as e:
        return {
            'domain': 'unknown',
            'risk_score': 50,
            'risk_factors': [f"URL parsing error: {str(e)}"],
            'is_legitimate': False,
            'url_structure': {}
        }

def analyze_links_in_text(text):
    """Analyze all links found in text"""
    urls = extract_urls_from_text(text)
    
    if not urls:
        return {
            'urls_found': 0,
            'urls': [],
            'overall_risk': 'LOW',
            'analysis': 'No URLs detected in text'
        }
    
    url_analyses = []
    total_risk = 0
    
    for url in urls:
        analysis = analyze_url_structure(url)
        url_analyses.append({
            'url': url,
            'analysis': analysis
        })
        total_risk += analysis['risk_score']
    
    # Calculate overall risk
    avg_risk = total_risk / len(urls) if urls else 0
    
    if avg_risk >= 70:
        overall_risk = 'CRITICAL'
    elif avg_risk >= 50:
        overall_risk = 'HIGH'
    elif avg_risk >= 30:
        overall_risk = 'MEDIUM'
    elif avg_risk >= 15:
        overall_risk = 'LOW-MEDIUM'
    else:
        overall_risk = 'LOW'
    
    return {
        'urls_found': len(urls),
        'urls': url_analyses,
        'overall_risk': overall_risk,
        'average_risk_score': avg_risk,
        'analysis': f'Analyzed {len(urls)} URL(s) for security risks'
    }

@link_analysis_bp.route('/analyze', methods=['POST'])
def analyze_links():
    """Analyze links in provided text"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        # Handle both 'text' and 'urls' input formats
        if 'text' in data:
            text = data['text']
            result = analyze_links_in_text(text)
        elif 'urls' in data:
            urls = data['urls'] if isinstance(data['urls'], list) else [data['urls']]
            url_analyses = []
            total_risk = 0
            
            for url in urls:
                analysis = analyze_url_structure(url)
                url_analyses.append({
                    'url': url,
                    'analysis': analysis
                })
                total_risk += analysis['risk_score']
            
            avg_risk = total_risk / len(urls) if urls else 0
            
            if avg_risk >= 70:
                overall_risk = 'CRITICAL'
            elif avg_risk >= 50:
                overall_risk = 'HIGH'
            elif avg_risk >= 30:
                overall_risk = 'MEDIUM'
            elif avg_risk >= 15:
                overall_risk = 'LOW-MEDIUM'
            else:
                overall_risk = 'LOW'
            
            result = {
                'urls_found': len(urls),
                'urls': url_analyses,
                'overall_risk': overall_risk,
                'average_risk_score': avg_risk,
                'analysis': f'Analyzed {len(urls)} URL(s) for security risks'
            }
        else:
            return jsonify({
                'success': False,
                'error': 'Either "text" or "urls" must be provided'
            }), 400
        
        return jsonify({
            'success': True,
            'result': result,
            'timestamp': datetime.now().isoformat(),
            'service': 'link_analysis'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@link_analysis_bp.route('/health', methods=['GET'])
def link_analysis_health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'link_analysis',
        'version': '2.0'
    })

