import requests
import json
import sys
from datetime import datetime

def test_submit_contact():
    """Test the submit-contact edge function"""
    
    # Configuration
    SUPABASE_URL = "https://fsqjgexjkjicwlzcgweu.supabase.co"
    
    url = f"{SUPABASE_URL}/functions/v1/submit-contact"
    
    headers = {
        "Content-Type": "application/json"
    }
    
    # Valid contact form payload
    payload = {
        "full_name": "Test User",
        "email": "test@example.com",
        "subject": "API Test Submission",
        "phone": "+1234567890",  # Optional
        "message": "This is a test message from the automated test script."
    }
    
    print("Testing submit-contact endpoint...")
    print(f"URL: {url}")
    print(f"Method: POST")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    print("-" * 60)
    
    try:
        # POST request to submit contact form
        response = requests.post(url, headers=headers, json=payload)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        print("-" * 60)
        
        # Parse JSON response
        try:
            response_json = response.json()
            print("Response JSON:")
            print(json.dumps(response_json, indent=2))
            print("-" * 60)
            
            # Validate response
            if response.status_code == 200:
                assert "success" in response_json, "'success' field missing in response"
                assert response_json["success"] == True, "Success should be True"
                
                print("✅ Test PASSED - Contact form submitted successfully")
                print(f"✓ Message: {response_json.get('message', 'N/A')}")
                
            elif response.status_code == 429:
                print("⚠️  Rate limit exceeded - This is expected if you've submitted recently")
                print(f"   Error: {response_json.get('error', 'N/A')}")
                print("\n   Rate limits:")
                print("   - 3 submissions per minute per IP")
                print("   - 10 submissions per hour per IP")
                print("\n   Wait a minute and try again.")
                
            elif response.status_code == 400:
                print("❌ Test FAILED - Bad Request")
                print(f"   Error: {response_json.get('error', 'N/A')}")
                print("\n   Common causes:")
                print("   - Missing required fields (full_name, email, subject, message)")
                print("   - Field length exceeded limits")
                
            else:
                print(f"❌ Test FAILED - HTTP {response.status_code}")
                if "error" in response_json:
                    print(f"Error: {response_json['error']}")
        
        except json.JSONDecodeError:
            print("❌ Response is not valid JSON")
            print(f"Raw response: {response.text}")
            sys.exit(1)
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {str(e)}")
        sys.exit(1)
    
    print("-" * 60)
    print("\nField Requirements:")
    print("- full_name: Required, max 100 characters")
    print("- email: Required, max 255 characters")
    print("- subject: Required, max 200 characters")
    print("- phone: Optional, max 20 characters")
    print("- message: Required, max 2000 characters")
    print("\nRate Limits:")
    print("- 3 submissions per minute per IP address")
    print("- 10 submissions per hour per IP address")

def test_missing_required_fields():
    """Test with missing required fields"""
    
    SUPABASE_URL = "https://fsqjgexjkjicwlzcgweu.supabase.co"
    url = f"{SUPABASE_URL}/functions/v1/submit-contact"
    
    # Missing required fields
    invalid_payload = {
        "full_name": "Test User",
        "email": "test@example.com"
        # Missing subject and message
    }
    
    print("\n" + "=" * 60)
    print("Testing with missing required fields...")
    print("=" * 60)
    
    response = requests.post(url, json=invalid_payload)
    response_json = response.json()
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response_json, indent=2)}")
    
    if response.status_code == 400:
        print("✅ Validation working - Missing fields detected")
    else:
        print(f"⚠️  Expected 400 status but got {response.status_code}")

def test_field_length_validation():
    """Test field length validation"""
    
    SUPABASE_URL = "https://fsqjgexjkjicwlzcgweu.supabase.co"
    url = f"{SUPABASE_URL}/functions/v1/submit-contact"
    
    # Exceed maximum field length
    invalid_payload = {
        "full_name": "A" * 101,  # Max is 100
        "email": "test@example.com",
        "subject": "Test",
        "message": "Test message"
    }
    
    print("\n" + "=" * 60)
    print("Testing field length validation...")
    print("=" * 60)
    
    response = requests.post(url, json=invalid_payload)
    response_json = response.json()
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response_json, indent=2)}")
    
    if response.status_code == 400:
        print("✅ Validation working - Field length exceeded detected")
    else:
        print(f"⚠️  Expected 400 status but got {response.status_code}")

if __name__ == "__main__":
    # Run main test
    test_submit_contact()
    
    # Run validation tests
    test_missing_required_fields()
    test_field_length_validation()
    
    print("\n" + "=" * 60)
    print("All tests completed!")
    print("=" * 60)
