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
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant. Respond with 'Hello from OpenAI API v1.0+'"
                },
                {
                    "role": "user",
                    "content": "Hello"
                }
            ],
            max_tokens=50,
            temperature=0.7
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
