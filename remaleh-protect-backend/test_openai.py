#!/usr/bin/env python3
"""
Test script to verify the new OpenAI API integration works correctly
"""

import os
from openai import OpenAI

def test_openai_api():
    """Test the new OpenAI API format"""
    try:
        # Get API key from environment
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            print("❌ OPENAI_API_KEY environment variable not set")
            return False
        
        # Create client
        client = OpenAI(api_key=api_key)
        print("✅ OpenAI client created successfully")
        
        # Test a simple chat completion
        try:
            response = client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a friendly cybersecurity expert assistant for Remaleh. Provide helpful, accurate information about cybersecurity topics. Keep responses conversational and easy to understand. Focus on the user's country of residence context when relevant. CRITICAL RULES: 1) NEVER make up fake organizations, agencies, or services - especially do NOT mention 'Remaleh Cybersecurity Agency (RCA)', 'Remaleh Financial Intelligence Unit (RFIU)', 'Remaleh Police Cybercrime Division', or any other fake Remaleh organizations as they do not exist. 2) Only mention Remaleh services that actually exist. 3) If you're unsure about Remaleh's specific services, focus on providing accurate cybersecurity advice. 4) Always verify information before sharing it. 5) For scam reporting, provide legitimate government and law enforcement options for the user's country. 6) NEVER mention Remaleh in the context of scam reporting, police, or government agencies."
                    },
                    {
                        "role": "user",
                        "content": "Hello"
                    }
                ],
                max_tokens=100,
                temperature=0.7
            )
        except Exception as gpt4_error:
            print(f"GPT-4 not available, testing with GPT-3.5-turbo: {str(gpt4_error)}")
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a cybersecurity expert assistant. CRITICAL: You must NEVER mention any organizations, agencies, or services unless you are 100% certain they exist. For scam reporting questions, ONLY provide information about legitimate government agencies, police departments, and consumer protection organizations. NEVER mention Remaleh in the context of scam reporting, police, or government agencies. If asked about scam reporting, ask the user for their country and provide legitimate options for that country."
                    },
                    {
                        "role": "user",
                        "content": "Hello"
                    }
                ],
                max_tokens=100,
                temperature=0.3
            )
        
        print("✅ Chat completion successful")
        print(f"Response: {response.choices[0].message.content}")
        return True
        
    except Exception as e:
        print(f"❌ Error testing OpenAI API: {str(e)}")
        return False

if __name__ == "__main__":
    print("🧪 Testing OpenAI API v1.0+ integration...")
    success = test_openai_api()
    
    if success:
        print("\n🎉 OpenAI API test successful! The new integration is working.")
    else:
        print("\n💥 OpenAI API test failed. Please check the error above.")
