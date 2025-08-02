"""
Enhanced scam detection module with local ML/AI features
Provides advanced text analysis without expensive third-party APIs
"""

import re
import string
import math
from collections import Counter
from datetime import datetime
from .link_analysis import analyze_links_in_text

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
            'federal', 'department', 'agency', 'official'
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
            'dating', 'romance', 'heart', 'soul mate', 'destiny',
            'military', 'deployed', 'overseas', 'widow'
        ],
        'weight': 10
    },
    'cryptocurrency_scam': {
        'keywords': [
            'bitcoin', 'cryptocurrency', 'crypto', 'blockchain', 'mining',
            'investment', 'trading', 'profit', 'returns', 'guaranteed',
            'double', 'multiply', 'ethereum', 'dogecoin'
        ],
        'weight': 14
    }
}

# Suspicious patterns with enhanced detection
ENHANCED_PATTERNS = {
    'credit_card': {
        'pattern': r'\b(?:\d{4}[-\s]?){3}\d{4}\b',
        'weight': 25,
        'description': 'Credit card number pattern'
    },
    'ssn': {
        'pattern': r'\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b',
        'weight': 30,
        'description': 'Social Security Number pattern'
    },
    'phone': {
        'pattern': r'\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b',
        'weight': 8,
        'description': 'Phone number (potential contact for scam)'
    },
    'email': {
        'pattern': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
        'weight': 5,
        'description': 'Email address'
    },
    'money_amount': {
        'pattern': r'\$[\d,]+(?:\.\d{2})?|\b\d+(?:,\d{3})*(?:\.\d{2})?\s*(?:dollars?|usd|€|euros?|£|pounds?)\b',
        'weight': 10,
        'description': 'Large money amounts mentioned'
    }
}

class EnhancedScamDetector:
    def __init__(self):
        self.min_text_length = 10
        
    def calculate_text_entropy(self, text):
        """Calculate text entropy to detect random/generated content"""
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
    
    def analyze_language_patterns(self, text):
        """Analyze language patterns for suspicious characteristics"""
        indicators = []
        risk_score = 0
        
        # Check for excessive capitalization
        caps_ratio = sum(1 for c in text if c.isupper()) / len(text) if text else 0
        if caps_ratio > 0.3:
            risk_score += 15
            indicators.append("Excessive capitalization")
        
        # Check for excessive punctuation
        punct_ratio = sum(1 for c in text if c in string.punctuation) / len(text) if text else 0
        if punct_ratio > 0.15:
            risk_score += 12
            indicators.append("Excessive punctuation")
        
        # Check for repeated words/phrases
        words = text.lower().split()
        if len(words) > 5:
            word_counts = Counter(words)
            repeated_words = [word for word, count in word_counts.items() 
                            if count > 2 and len(word) > 3]
            if repeated_words:
                risk_score += 8
                indicators.append(f"Repeated words: {', '.join(repeated_words[:3])}")
        
        # Check text entropy (very low entropy suggests generated/template text)
        entropy = self.calculate_text_entropy(text)
        if entropy < 3.0 and len(text) > 50:
            risk_score += 10
            indicators.append("Low text entropy (possibly generated)")
        
        # Check for grammar issues (simplified)
        sentences = re.split(r'[.!?]+', text)
        if len(sentences) > 2:
            avg_sentence_length = sum(len(s.split()) for s in sentences) / len(sentences)
            if avg_sentence_length < 3:
                risk_score += 8
                indicators.append("Very short sentences (poor grammar)")
        
        return risk_score, indicators
    
    def detect_scam_categories(self, text):
        """Detect specific scam categories"""
        text_lower = text.lower()
        detected_categories = []
        total_score = 0
        
        for category, data in SCAM_INDICATORS.items():
            matches = []
            category_score = 0
            
            for keyword in data['keywords']:
                if keyword in text_lower:
                    matches.append(keyword)
                    category_score += data['weight']
            
            if matches:
                detected_categories.append({
                    'category': category,
                    'matches': matches,
                    'score': category_score,
                    'description': f"{category.replace('_', ' ').title()} indicators"
                })
                total_score += category_score
        
        return detected_categories, total_score
    
    def detect_enhanced_patterns(self, text):
        """Detect enhanced suspicious patterns"""
        detected_patterns = []
        total_score = 0
        
        for pattern_name, pattern_data in ENHANCED_PATTERNS.items():
            matches = re.findall(pattern_data['pattern'], text, re.IGNORECASE)
            if matches:
                detected_patterns.append({
                    'type': pattern_name,
                    'matches': matches[:5],  # Limit to first 5 matches
                    'count': len(matches),
                    'score': pattern_data['weight'],
                    'description': pattern_data['description']
                })
                total_score += pattern_data['weight']
        
        return detected_patterns, total_score
    
    def analyze_contact_information(self, text):
        """Analyze contact information patterns"""
        risk_score = 0
        indicators = []
        
        # Check for multiple contact methods (suspicious)
        contact_patterns = {
            'email': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
            'phone': r'\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b',
            'whatsapp': r'whatsapp|what\'s app|wa\.me',
            'telegram': r'telegram|@\w+|t\.me'
        }
        
        contact_count = 0
        for contact_type, pattern in contact_patterns.items():
            if re.search(pattern, text, re.IGNORECASE):
                contact_count += 1
        
        if contact_count > 2:
            risk_score += 15
            indicators.append("Multiple contact methods provided")
        
        # Check for foreign phone numbers
        foreign_phone = r'\+(?!1)[0-9]{1,3}[-.\s]?[0-9]+'
        if re.search(foreign_phone, text):
            risk_score += 12
            indicators.append("Foreign phone number detected")
        
        return risk_score, indicators
    
    def comprehensive_analysis(self, text):
        """Perform comprehensive scam analysis"""
        if not text or len(text) < self.min_text_length:
            return {
                'error': 'Text too short for analysis',
                'risk_level': 'UNKNOWN',
                'scam_score': 0
            }
        
        analysis_start = datetime.now()
        
        # Initialize results
        total_score = 0
        all_indicators = []
        
        # 1. Scam category detection
        scam_categories, category_score = self.detect_scam_categories(text)
        total_score += category_score
        all_indicators.extend(scam_categories)
        
        # 2. Enhanced pattern detection
        patterns, pattern_score = self.detect_enhanced_patterns(text)
        total_score += pattern_score
        all_indicators.extend(patterns)
        
        # 3. Language pattern analysis
        language_score, language_indicators = self.analyze_language_patterns(text)
        total_score += language_score
        for indicator in language_indicators:
            all_indicators.append({
                'type': 'language_pattern',
                'description': indicator,
                'score': language_score // len(language_indicators) if language_indicators else 0
            })
        
        # 4. Contact information analysis
        contact_score, contact_indicators = self.analyze_contact_information(text)
        total_score += contact_score
        for indicator in contact_indicators:
            all_indicators.append({
                'type': 'contact_pattern',
                'description': indicator,
                'score': contact_score // len(contact_indicators) if contact_indicators else 0
            })
        
        # 5. Link analysis
        link_analysis = analyze_links_in_text(text)
        if link_analysis['urls_found'] > 0:
            # Add link risk to total score
            link_risk_multiplier = {
                'HIGH': 30,
                'MEDIUM': 20,
                'LOW': 10,
                'VERY_LOW': 5,
                'NONE': 0
            }
            link_score = link_risk_multiplier.get(link_analysis['overall_risk'], 0)
            total_score += link_score
            
            all_indicators.append({
                'type': 'link_analysis',
                'description': f"Link analysis: {link_analysis['summary']}",
                'score': link_score,
                'details': link_analysis
            })
        
        # Determine final risk level
        if total_score >= 60:
            risk_level = 'HIGH'
            is_scam = True
        elif total_score >= 35:
            risk_level = 'MEDIUM'
            is_scam = True
        elif total_score >= 15:
            risk_level = 'LOW'
            is_scam = False
        else:
            risk_level = 'VERY_LOW'
            is_scam = False
        
        analysis_time = (datetime.now() - analysis_start).total_seconds()
        
        return {
            'is_scam': is_scam,
            'risk_level': risk_level,
            'scam_score': min(total_score, 100),  # Cap at 100
            'identified_indicators': all_indicators,
            'total_indicators': len(all_indicators),
            'analysis_details': {
                'scam_categories': scam_categories,
                'patterns': patterns,
                'link_analysis': link_analysis,
                'text_entropy': self.calculate_text_entropy(text),
                'analysis_time_seconds': round(analysis_time, 2)
            }
        }

