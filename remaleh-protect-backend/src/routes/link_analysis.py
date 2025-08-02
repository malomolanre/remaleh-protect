"""
Cost-effective local link analysis module for ScamGuard
Provides comprehensive URL analysis without expensive third-party APIs
"""

import re
import urllib.parse
import socket
import ssl
import requests
from datetime import datetime, timedelta
import hashlib
import json

# Known malicious domains and patterns (can be expanded)
KNOWN_MALICIOUS_DOMAINS = {
    'phishing-sites.com', 'fake-bank.net', 'scam-lottery.org',
    'malware-download.com', 'phish-paypal.net', 'fake-amazon.co'
}

# Suspicious TLDs commonly used in scams
SUSPICIOUS_TLDS = {
    '.tk', '.ml', '.ga', '.cf', '.pw', '.top', '.click', '.download',
    '.work', '.party', '.trade', '.date', '.racing', '.review'
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
    'free', 'prize', 'winner', 'lottery', 'inheritance'
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
            risk_level = 'HIGH'
            is_malicious = True
        elif total_risk_score >= 25:
            risk_level = 'MEDIUM'
            is_malicious = True
        elif total_risk_score >= 10:
            risk_level = 'LOW'
            is_malicious = False
        else:
            risk_level = 'VERY_LOW'
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
        overall_risk = 'HIGH'
    elif avg_risk_score >= 20:
        overall_risk = 'MEDIUM'
    elif avg_risk_score >= 10:
        overall_risk = 'LOW'
    else:
        overall_risk = 'VERY_LOW'
    
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

