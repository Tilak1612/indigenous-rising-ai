import requests
import json

# Base configuration
BASE_URL = "https://fsqjgexjkjicwlzcgweu.supabase.co"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzcWpnZXhqa2ppY3dsemNnd2V1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3MjEyMzMsImV4cCI6MjA3ODI5NzIzM30.tApN-tvh9gu5zQ7KjywZRzgO7Y6m7VxthAcnPWqmzv0"

def test_contact_form():
    """Test the contact form submission endpoint"""
    url = f"{BASE_URL}/functions/v1/submit-contact"
    
    payload = {
        "full_name": "API Test User",
        "email": "apitest@example.com",
        "subject": "API Endpoint Test",
        "message": "Testing the backend API endpoint"
    }
    
    headers = {
        "Content-Type": "application/json",
        "apikey": ANON_KEY
    }
    
    print("=" * 60)
    print("Testing: Contact Form Endpoint")
    print("=" * 60)
    print(f"URL: {url}")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    response = requests.post(url, json=payload, headers=headers)
    
    print(f"\nResponse Status Code: {response.status_code}")
    print(f"Response Content: {response.text}\n")
    
    if response.status_code == 200:
        print("✅ Contact form endpoint working!")
    elif response.status_code == 429:
        print("⚠️  Rate limited - endpoint is working but too many requests")
    else:
        print(f"❌ Unexpected status code: {response.status_code}")

def test_newsletter_subscription():
    """Test the newsletter subscription endpoint"""
    url = f"{BASE_URL}/functions/v1/newsletter-subscribe"
    
    payload = {
        "email": "apitest@example.com"
    }
    
    headers = {
        "Content-Type": "application/json",
        "apikey": ANON_KEY
    }
    
    print("=" * 60)
    print("Testing: Newsletter Subscription Endpoint")
    print("=" * 60)
    print(f"URL: {url}")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    response = requests.post(url, json=payload, headers=headers)
    
    print(f"\nResponse Status Code: {response.status_code}")
    print(f"Response Content: {response.text}\n")
    
    if response.status_code in [200, 201]:
        print("✅ Newsletter endpoint working!")
    else:
        print(f"❌ Unexpected status code: {response.status_code}")

def test_database_rest_api():
    """Test the database REST API (read public data)"""
    url = f"{BASE_URL}/rest/v1/content_sections"
    
    headers = {
        "apikey": ANON_KEY,
        "Content-Type": "application/json"
    }
    
    params = {
        "select": "section_key,section_data",
        "limit": 1
    }
    
    print("=" * 60)
    print("Testing: Database REST API")
    print("=" * 60)
    print(f"URL: {url}")
    print(f"Params: {params}")
    
    response = requests.get(url, headers=headers, params=params)
    
    print(f"\nResponse Status Code: {response.status_code}")
    print(f"Response Content: {response.text}\n")
    
    if response.status_code == 200:
        print("✅ Database REST API working!")
    else:
        print(f"❌ Unexpected status code: {response.status_code}")

def test_authenticated_endpoint():
    """Test an authenticated endpoint (requires JWT token)"""
    # Note: This will fail without a valid JWT token
    url = f"{BASE_URL}/functions/v1/check-subscription"
    
    headers = {
        "Content-Type": "application/json",
        "apikey": ANON_KEY,
        "Authorization": "Bearer YOUR_JWT_TOKEN_HERE"
    }
    
    print("=" * 60)
    print("Testing: Authenticated Endpoint (Check Subscription)")
    print("=" * 60)
    print(f"URL: {url}")
    print("Note: This requires a valid JWT token to succeed")
    
    response = requests.post(url, headers=headers, json={})
    
    print(f"\nResponse Status Code: {response.status_code}")
    print(f"Response Content: {response.text}\n")
    
    if response.status_code == 200:
        print("✅ Check subscription endpoint working!")
    elif response.status_code in [401, 403]:
        print("⚠️  Authentication required (expected without valid token)")
    else:
        print(f"❌ Unexpected status code: {response.status_code}")

if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("BACKEND API ENDPOINT TESTS")
    print("=" * 60 + "\n")
    
    # Test public endpoints
    test_contact_form()
    print("\n")
    
    test_newsletter_subscription()
    print("\n")
    
    test_database_rest_api()
    print("\n")
    
    # Test authenticated endpoint (will show auth required)
    test_authenticated_endpoint()
    
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print("Base URL:", BASE_URL)
    print("\nEndpoint Types:")
    print("1. Edge Functions: /functions/v1/{function-name}")
    print("2. Database REST API: /rest/v1/{table-name}")
    print("3. Authentication: /auth/v1/...")
    print("\nAuthentication:")
    print("- Public endpoints: Only need apikey header")
    print("- Protected endpoints: Need Authorization: Bearer {JWT_TOKEN}")
    print("=" * 60 + "\n")
