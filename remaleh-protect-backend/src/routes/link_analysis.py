"""
Cost-effective local link analysis module for ScamGuard
Provides comprehensive URL analysis without expensive third-party APIs
NOW WITH FLASK BLUEPRINT INTEGRATION
"""

import re
import urllib.parse
import socket
import ssl
import requests
from datetime import datetime, timedelta
import hashlib
import json
from flask import Blueprint, request, jsonify
import logging

# Create Flask Blueprint
link_analysis_bp = Blueprint('link_analysis', __name__)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Known malicious domains and patterns (can be expanded)
KNOWN_MALICIOUS_DOMAINS = {
    'phishing-sites.com', 'fake-bank.net', 'scam-lottery.org',
    'malware-download.com', 'phish-paypal.net', 'fake-amazon.co'
}

# Suspicious TLDs commonly used in scams
SUSPICIOUS_TLDS = {
    '.tk', '.ml', '.ga', '.cf', '.pw', '.top', '.click', '.download',
    '.work', '.party', '.trade', '.date', '.racing', '.review', '.buzz',
    '.xyz', '.site', '.online', '.web', '.app', '.tech', '.space'
}

# URL shorteners (often used to hide malicious links)
URL_SHORTENERS = {
    'bit.ly', 'tinyurl.com', 'short.link', 't.co', 'goo.gl',
    'ow.ly', 'is.gd', 'buff.ly', 'adf.ly', 'tiny.cc'
}

# Suspicious keywords in URLs
SUSPICIOUS_URL_KEYWORDS = [
    'login', 'verify', 'account', 'secure', 'update', 'confirm',
    'suspended', 'limited', 'urgent', 'immediate', 'click',
    'free', 'prize', 'winner', 'lottery', 'inheritance',
    'track', 'parcel', 'delivery', 'postal', 'held', 'customs',
    'warehouse', 'courier', 'activate', 'reopen', 'exit'
]

class LocalLinkAnalyzer:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
    
    def extract_urls(self, text):
        """Extract all URLs from text"""
        url_pattern = r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'
        urls = re.findall(url_pattern, text, re.IGNORECASE)
        return list(set(urls))  # Remove duplicates
    
    def analyze_url_structure(self, url):
        """Analyze URL structure for suspicious patterns"""
        try:
            parsed = urllib.parse.urlparse(url)
            domain = parsed.netloc.lower()
            path = parsed.path.lower()
            query = parsed.query.lower()
            
            risk_score = 0
            indicators = []
            
            # Check domain length (very long domains are suspicious)
            if len(domain) > 50:
                risk_score += 15
                indicators.append("Unusually long domain name")
            
            # Check for suspicious TLD
            for tld in SUSPICIOUS_TLDS:
                if domain.endswith(tld):
                    risk_score += 20
                    indicators.append(f"Suspicious top-level domain: {tld}")
                    break
            
            # Check for URL shorteners
            for shortener in URL_SHORTENERS:
                if shortener in domain:
                    risk_score += 10
                    indicators.append("Uses URL shortener (may hide destination)")
                    break
            
            # Check for suspicious keywords in URL
            full_url = url.lower()
            for keyword in SUSPICIOUS_URL_KEYWORDS:
                if keyword in full_url:
                    risk_score += 8
                    indicators.append(f"Contains suspicious keyword: {keyword}")
            
            # Check for excessive subdomains
            subdomain_count = domain.count('.')
            if subdomain_count > 3:
                risk_score += 12
                indicators.append("Excessive subdomains")
            
            # Check for IP address instead of domain
            ip_pattern = r'\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b'
            if re.match(ip_pattern, domain):
                risk_score += 25
                indicators.append("Uses IP address instead of domain name")
            
            # Check for homograph attacks (similar looking characters)
            suspicious_chars = ['а', 'е', 'о', 'р', 'с', 'х', 'у']  # Cyrillic that look like Latin
            for char in suspicious_chars:
                if char in domain:
                    risk_score += 20
                    indicators.append("Potential homograph attack (suspicious characters)")
                    break
            
            # Check for known malicious domains
            if domain in KNOWN_MALICIOUS_DOMAINS:
                risk_score += 50
                indicators.append("Known malicious domain")
            
            return {
                'domain': domain,
                'risk_score': risk_score,
                'indicators': indicators,
                'is_suspicious': risk_score > 15
            }
            
        except Exception as e:
            return {
                'domain': 'unknown',
                'risk_score': 30,
                'indicators': [f"URL parsing error: {str(e)}"],
                'is_suspicious': True
            }
    
    def get_domain_info(self, url):
        """Get domain information and reputation"""
        try:
            parsed = urllib.parse.urlparse(url)
            domain = parsed.netloc.lower()
            
            # Basic domain info
            domain_info = {
                'domain': domain,
                'subdomain_count': domain.count('.'),
                'length': len(domain),
                'is_ip': bool(re.match(r'\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b', domain))
            }
            
            # Check domain age (simplified - in real implementation you'd use WHOIS)
            if len(domain) < 10:
                domain_info['suspicion'] = 'Very short domain name'
            elif domain_info['subdomain_count'] > 3:
                domain_info['suspicion'] = 'Excessive subdomains'
            elif domain_info['is_ip']:
                domain_info['suspicion'] = 'Uses IP address instead of domain'
            else:
                domain_info['suspicion'] = 'Normal domain structure'
            
            return domain_info
            
        except Exception as e:
            return {
                'domain': 'unknown',
                'error': str(e),
                'suspicion': 'Unable to analyze domain'
            }

    def check_ssl_certificate(self, url):
        """Check SSL certificate validity"""
        try:
            parsed = urllib.parse.urlparse(url)
            if parsed.scheme != 'https':
                return {
                    'has_ssl': False,
                    'risk_score': 15,
                    'indicators': ['No SSL encryption (HTTP instead of HTTPS)']
                }
            
            hostname = parsed.netloc
            context = ssl.create_default_context()
            
            with socket.create_connection((hostname, 443), timeout=5) as sock:
                with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                    cert = ssock.getpeercert()
                    
                    # Check certificate expiration
                    not_after = datetime.strptime(cert['notAfter'], '%b %d %H:%M:%S %Y %Z')
                    days_until_expiry = (not_after - datetime.now()).days
                    
                    risk_score = 0
                    indicators = []
                    
                    if days_until_expiry < 30:
                        risk_score += 10
                        indicators.append("SSL certificate expires soon")
                    
                    # Check if certificate is self-signed or has issues
                    issuer = dict(x[0] for x in cert['issuer'])
                    subject = dict(x[0] for x in cert['subject'])
                    
                    if issuer == subject:
                        risk_score += 20
                        indicators.append("Self-signed SSL certificate")
                    
                    return {
                        'has_ssl': True,
                        'risk_score': risk_score,
                        'indicators': indicators,
                        'expires_in_days': days_until_expiry
                    }
                    
        except Exception as e:
            return {
                'has_ssl': False,
                'risk_score': 20,
                'indicators': [f"SSL check failed: {str(e)}"]
            }
    
    def analyze_page_content(self, url):
        """Analyze webpage content for suspicious patterns"""
        try:
            response = self.session.get(url, timeout=10, allow_redirects=True)
            content = response.text.lower()
            
            risk_score = 0
            indicators = []
            
            # Check for suspicious content patterns
            suspicious_patterns = [
                (r'enter.*password', 10, "Requests password entry"),
                (r'verify.*account', 15, "Requests account verification"),
                (r'click.*here.*now', 12, "Uses urgent call-to-action"),
                (r'limited.*time.*offer', 10, "Uses time pressure tactics"),
                (r'congratulations.*won', 20, "Claims user has won something"),
                (r'urgent.*action.*required', 15, "Uses urgent language"),
                (r'suspend.*account', 18, "Threatens account suspension"),
                (r'update.*payment.*method', 16, "Requests payment information"),
            ]
            
            for pattern, score, description in suspicious_patterns:
                if re.search(pattern, content):
                    risk_score += score
                    indicators.append(description)
            
            # Check for excessive redirects
            if len(response.history) > 3:
                risk_score += 15
                indicators.append("Multiple redirects detected")
            
            # Check for missing or suspicious title
            title_match = re.search(r'<title>(.*?)</title>', content)
            if not title_match:
                risk_score += 8
                indicators.append("Missing page title")
            elif title_match and len(title_match.group(1)) < 5:
                risk_score += 5
                indicators.append("Very short page title")
            
            return {
                'risk_score': risk_score,
                'indicators': indicators,
                'redirects': len(response.history),
                'final_url': response.url
            }
            
        except Exception as e:
            return {
                'risk_score': 25,
                'indicators': [f"Content analysis failed: {str(e)}"],
                'redirects': 0,
                'final_url': url
            }
    
    def comprehensive_url_analysis(self, url):
        """Perform comprehensive analysis of a URL"""
        analysis_start = datetime.now()
        
        # Structure analysis
        structure_analysis = self.analyze_url_structure(url)
        
        # SSL analysis
        ssl_analysis = self.check_ssl_certificate(url)
        
        # Content analysis (only for HTTP/HTTPS URLs)
        content_analysis = None
        if url.startswith(('http://', 'https://')):
            content_analysis = self.analyze_page_content(url)
        
        # Calculate total risk score
        total_risk_score = structure_analysis['risk_score'] + ssl_analysis['risk_score']
        if content_analysis:
            total_risk_score += content_analysis['risk_score']
        
        # Combine all indicators
        all_indicators = (
            structure_analysis['indicators'] + 
            ssl_analysis['indicators'] + 
            (content_analysis['indicators'] if content_analysis else [])
        )
        
        # Determine risk level
        if total_risk_score >= 50:
            risk_level = 'SCAM'
            is_malicious = True
        elif total_risk_score >= 25:
            risk_level = 'SUSPICIOUS'
            is_malicious = True
        elif total_risk_score >= 10:
            risk_level = 'SUSPICIOUS'
            is_malicious = False
        else:
            risk_level = 'SAFE'
            is_malicious = False
        
        analysis_time = (datetime.now() - analysis_start).total_seconds()
        
        return {
            'url': url,
            'domain': structure_analysis['domain'],
            'is_malicious': is_malicious,
            'risk_level': risk_level,
            'total_risk_score': total_risk_score,
            'indicators': all_indicators,
            'analysis_details': {
                'structure': structure_analysis,
                'ssl': ssl_analysis,
                'content': content_analysis
            },
            'analysis_time_seconds': round(analysis_time, 2)
        }

def analyze_links_in_text(text):
    """Main function to analyze all links found in text"""
    analyzer = LocalLinkAnalyzer()
    urls = analyzer.extract_urls(text)
    
    if not urls:
        return {
            'urls_found': 0,
            'urls': [],
            'overall_risk': 'NONE',
            'summary': 'No URLs detected in the text'
        }
    
    url_analyses = []
    total_risk_score = 0
    
    for url in urls:
        analysis = analyzer.comprehensive_url_analysis(url)
        url_analyses.append(analysis)
        total_risk_score += analysis['total_risk_score']
    
    # Determine overall risk
    avg_risk_score = total_risk_score / len(urls)
    if avg_risk_score >= 40:
        overall_risk = 'SCAM'
    elif avg_risk_score >= 20:
        overall_risk = 'SUSPICIOUS'
    elif avg_risk_score >= 10:
        overall_risk = 'SUSPICIOUS'
    else:
        overall_risk = 'SAFE'
    
    malicious_count = sum(1 for analysis in url_analyses if analysis['is_malicious'])
    
    return {
        'urls_found': len(urls),
        'urls': url_analyses,
        'overall_risk': overall_risk,
        'malicious_urls': malicious_count,
        'total_risk_score': total_risk_score,
        'average_risk_score': round(avg_risk_score, 2),
        'summary': f"Found {len(urls)} URL(s), {malicious_count} potentially malicious"
    }

# ===== FLASK API ENDPOINTS =====

@link_analysis_bp.route('/analyze', methods=['POST'])
def analyze_links_endpoint():
    """API endpoint to analyze links in text"""
    try:
        logger.info("=== LINK ANALYSIS REQUEST RECEIVED ===")
        
        # Get request data
        data = request.get_json()
        if not data:
            logger.warning("No JSON data received")
            return jsonify({
                'success': False,
                'error': 'No JSON data provided'
            }), 400
        
        # Extract text or URL from request
        text = data.get('text', data.get('url', ''))
        if not text:
            logger.warning("No text or URL provided in request")
            return jsonify({
                'success': False,
                'error': 'No text or URL provided for analysis'
            }), 400
        
        logger.info(f"Analyzing text: {text[:100]}...")
        
        # Perform link analysis
        analysis_result = analyze_links_in_text(text)
        
        logger.info(f"Analysis complete - Found {analysis_result['urls_found']} URLs")
        logger.info(f"Overall risk: {analysis_result['overall_risk']}")
        
        # Return successful response
        return jsonify({
            'success': True,
            'analysis': analysis_result,
            'timestamp': datetime.now().isoformat(),
            'service': 'link_analysis'
        })
        
    except Exception as e:
        logger.error(f"Link analysis error: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Analysis failed: {str(e)}',
            'service': 'link_analysis'
        }), 500

@link_analysis_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'link_analysis',
        'timestamp': datetime.now().isoformat(),
        'capabilities': [
            'URL extraction',
            'Domain analysis', 
            'SSL certificate checking',
            'Content analysis',
            'Risk assessment'
        ]
    })

@link_analysis_bp.route('/analyze-url', methods=['POST'])
def analyze_single_url():
    """API endpoint to analyze a single URL or extract URLs from text"""
    try:
        logger.info("=== SINGLE URL ANALYSIS REQUEST RECEIVED ===")
        
        # Get request data
        data = request.get_json()
        if not data:
            logger.warning("No JSON data received")
            return jsonify({
                'success': False,
                'error': 'No JSON data provided'
            }), 400
        
        # Extract URL or text from request
        content = data.get('url', '')
        if not content:
            logger.warning("No content provided in request")
            return jsonify({
                'success': False,
                'error': 'No content provided for analysis'
            }), 400
        
        logger.info(f"Analyzing content: {content[:100]}...")
        
        # Create analyzer instance
        analyzer = LocalLinkAnalyzer()
        
        # Check if content is a single URL or contains URLs
        url_pattern = r'https?://[^\s]+'
        urls_found = re.findall(url_pattern, content, re.IGNORECASE)
        
        if not urls_found:
            # No URLs found - return informative response
            return jsonify({
                'success': True,
                'result': {
                    'url': content,
                    'risk_level': 'UNKNOWN',
                    'risk_score': 0,
                    'indicators': ['No URLs detected in content'],
                    'domain_info': {'domain': 'N/A', 'suspicion': 'No URLs found'},
                    'ssl_info': {'has_ssl': False, 'risk_score': 0, 'indicators': ['No URLs to analyze']},
                    'recommendations': [
                        'No URLs detected in the provided content',
                        'Consider using the Message analysis tab for text content',
                        'Or paste a specific URL to analyze',
                        'Contact Remaleh Guardians via chat for assistance with text content'
                    ],
                    'content_type': 'text_without_urls',
                    'urls_found': 0
                },
                'timestamp': datetime.now().isoformat(),
                'service': 'link_analysis'
            })
        
        # Analyze the first URL found (or all if multiple)
        if len(urls_found) == 1:
            # Single URL - detailed analysis
            url = urls_found[0]
            url_analysis = analyzer.analyze_url_structure(url)
            domain_info = analyzer.get_domain_info(url)
            ssl_info = analyzer.check_ssl_certificate(url)
            
            risk_score = url_analysis['risk_score']
            if risk_score >= 70:
                risk_level = 'SCAM'
            elif risk_score >= 40:
                risk_level = 'SUSPICIOUS'
            else:
                risk_level = 'SUSPICIOUS'
            
            result = {
                'url': url,
                'risk_level': risk_level,
                'risk_score': risk_score,
                'indicators': url_analysis['indicators'],
                'domain_info': domain_info,
                'ssl_info': ssl_info,
                'recommendations': generate_url_recommendations(risk_score, url_analysis['indicators']),
                'content_type': 'single_url',
                'urls_found': 1
            }
        else:
            # Multiple URLs - analyze first one and note others
            primary_url = urls_found[0]
            url_analysis = analyzer.analyze_url_structure(primary_url)
            domain_info = analyzer.get_domain_info(primary_url)
            ssl_info = analyzer.check_ssl_certificate(primary_url)
            
            risk_score = url_analysis['risk_score']
            if risk_score >= 70:
                risk_level = 'SCAM'
            elif risk_score >= 40:
                risk_level = 'SUSPICIOUS'
            else:
                risk_level = 'SUSPICIOUS'
            
            result = {
                'url': primary_url,
                'risk_level': risk_level,
                'risk_score': risk_score,
                'indicators': url_analysis['indicators'] + [f'Found {len(urls_found)} total URLs in content'],
                'domain_info': domain_info,
                'ssl_info': ssl_info,
                'recommendations': generate_url_recommendations(risk_score, url_analysis['indicators']) + [
                    f'Content contains {len(urls_found)} URLs total',
                    'Consider using Message analysis for comprehensive content review',
                    'Contact Remaleh Guardians via chat for assistance with multiple URLs'
                ],
                'content_type': 'text_with_multiple_urls',
                'urls_found': len(urls_found),
                'all_urls': urls_found[:5]  # Show first 5 URLs
            }
        
        logger.info(f"URL analysis complete - Risk: {result['risk_level']} ({result['risk_score']})")
        
        return jsonify({
            'success': True,
            'result': result,
            'timestamp': datetime.now().isoformat(),
            'service': 'link_analysis'
        })
        
    except Exception as e:
        logger.error(f"Single URL analysis error: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Analysis failed: {str(e)}',
            'service': 'link_analysis'
        }), 500

def generate_url_recommendations(risk_score, indicators):
    """Generate recommendations based on URL analysis"""
    recommendations = []
    
    if risk_score >= 70:
        recommendations.append("Do not click this link - scam detected")
        recommendations.append("Contact Remaleh Guardians immediately")
        recommendations.append("If you clicked this link, reach out to Remaleh Guardians via chat")
    elif risk_score >= 40:
        recommendations.append("Exercise caution before clicking this link")
        recommendations.append("Verify the destination domain")
    
    if any('suspicious' in indicator.lower() for indicator in indicators):
        recommendations.append("Contains suspicious patterns - verify authenticity")
    
    if any('shortener' in indicator.lower() for indicator in indicators):
        recommendations.append("Uses URL shortener - hover to see actual destination")
    
    if not recommendations:
        recommendations.append("Link appears safe, but always verify before clicking")
    
    # Add Remaleh Guardians contact info only once
    if not any("Remaleh Guardians" in rec for rec in recommendations):
        recommendations.append("Contact Remaleh Guardians via chat for immediate assistance")
    
    # Remove duplicates
    unique_recommendations = list(dict.fromkeys(recommendations))
    
    return unique_recommendations

@link_analysis_bp.route('/debug', methods=['GET'])
def debug_info():
    """Debug information endpoint"""
    return jsonify({
        'service': 'link_analysis',
        'status': 'operational',
        'features': {
            'known_malicious_domains': len(KNOWN_MALICIOUS_DOMAINS),
            'suspicious_tlds': len(SUSPICIOUS_TLDS),
            'url_shorteners': len(URL_SHORTENERS),
            'suspicious_keywords': len(SUSPICIOUS_URL_KEYWORDS)
        },
        'endpoints': [
            '/analyze - POST - Analyze links in text',
            '/health - GET - Service health check',
            '/debug - GET - Debug information'
        ],
        'timestamp': datetime.now().isoformat()
    })

