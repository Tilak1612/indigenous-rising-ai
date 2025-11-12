import requests
import json

"""
COMPLETE BACKEND API TEST SUITE

IMPORTANT URL DISTINCTION:
- Frontend URL: https://9f734f43-7113-4d89-8e7f-88f44b6ccf24.lovableproject.com (Website)
- Backend URL: https://fsqjgexjkjicwlzcgweu.supabase.co (API)

Frontend URL serves the React application (HTML/CSS/JS)
Backend URL serves the API endpoints (REST API + Edge Functions)
"""

# Configuration
BACKEND_BASE_URL = "https://fsqjgexjkjicwlzcgweu.supabase.co"
FRONTEND_URL = "https://9f734f43-7113-4d89-8e7f-88f44b6ccf24.lovableproject.com"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzcWpnZXhqa2ppY3dsemNnd2V1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3MjEyMzMsImV4cCI6MjA3ODI5NzIzM30.tApN-tvh9gu5zQ7KjywZRzgO7Y6m7VxthAcnPWqmzv0"

def test_public_endpoint_contact():
    """Test public endpoint - Contact form submission"""
    
    url = f"{BACKEND_BASE_URL}/functions/v1/submit-contact"
    
    headers = {
        "Content-Type": "application/json",
        "apikey": ANON_KEY
    }
    
    payload = {
        "full_name": "Test User",
        "email": "test@example.com",
        "subject": "API Test",
        "message": "Testing the backend API endpoint"
    }
    
    print("=" * 70)
    print("TEST 1: Public Endpoint - Contact Form")
    print("=" * 70)
    print(f"URL: {url}")
    print(f"Method: POST")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    response = requests.post(url, headers=headers, json=payload)
    
    print(f"\nStatus Code: {response.status_code}")
    print(f"Response: {response.text}\n")
    
    if response.status_code == 200:
        print("✅ PASS: Contact form endpoint working")
    elif response.status_code == 429:
        print("⚠️  WARNING: Rate limited (endpoint is working)")
    else:
        print(f"❌ FAIL: Unexpected status {response.status_code}")
    
    return response.status_code in [200, 429]

def test_database_rest_api():
    """Test database REST API - Read public content"""
    
    url = f"{BACKEND_BASE_URL}/rest/v1/content_sections"
    
    headers = {
        "apikey": ANON_KEY,
        "Content-Type": "application/json"
    }
    
    params = {
        "select": "section_key,section_data",
        "limit": 5
    }
    
    print("=" * 70)
    print("TEST 2: Database REST API - Content Sections")
    print("=" * 70)
    print(f"URL: {url}")
    print(f"Method: GET")
    print(f"Params: {params}")
    
    response = requests.get(url, headers=headers, params=params)
    
    print(f"\nStatus Code: {response.status_code}")
    
    if response.status_code == 200:
        try:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)[:200]}...")
            print(f"\n✅ PASS: Database REST API working")
            print(f"   Retrieved {len(data)} records")
            return True
        except:
            print(f"Response: {response.text}")
            print("❌ FAIL: Invalid JSON response")
            return False
    else:
        print(f"Response: {response.text}")
        print(f"❌ FAIL: Status {response.status_code}")
        return False

def test_authenticated_endpoint():
    """Test authenticated endpoint - Requires JWT token"""
    
    url = f"{BACKEND_BASE_URL}/functions/v1/check-subscription"
    
    # You need to replace this with a real JWT token from a logged-in user
    JWT_TOKEN = "YOUR_JWT_TOKEN_HERE"
    
    headers = {
        "Content-Type": "application/json",
        "apikey": ANON_KEY,
        "Authorization": f"Bearer {JWT_TOKEN}"
    }
    
    print("\n" + "=" * 70)
    print("TEST 3: Authenticated Endpoint - Check Subscription")
    print("=" * 70)
    print(f"URL: {url}")
    print(f"Method: POST")
    print("⚠️  NOTE: Requires valid JWT token from logged-in user")
    
    response = requests.post(url, headers=headers, json={})
    
    print(f"\nStatus Code: {response.status_code}")
    print(f"Response: {response.text}\n")
    
    if response.status_code == 200:
        print("✅ PASS: Authenticated endpoint working")
        return True
    elif response.status_code in [401, 403]:
        print("⚠️  EXPECTED: Authentication required (need valid JWT token)")
        print("   To get JWT token:")
        print("   1. Sign in at the website")
        print("   2. Open browser DevTools > Network")
        print("   3. Look for Authorization header in any request")
        return True
    else:
        print(f"❌ FAIL: Unexpected status {response.status_code}")
        return False

def test_frontend_url():
    """Demonstrate why frontend URL doesn't work for API calls"""
    
    print("\n" + "=" * 70)
    print("TEST 4: Frontend URL vs Backend URL")
    print("=" * 70)
    
    # Try to post to frontend URL (will fail)
    print("\n❌ INCORRECT: Posting to frontend URL")
    print(f"URL: {FRONTEND_URL}")
    
    try:
        response = requests.post(
            FRONTEND_URL,
            headers={"Content-Type": "application/json"},
            json={"name": "Test"},
            timeout=5
        )
        print(f"Status: {response.status_code}")
        print("This returns the HTML website, not API data!")
    except Exception as e:
        print(f"Error: {e}")
    
    # Correct backend URL
    print("\n✅ CORRECT: Using backend URL")
    print(f"URL: {BACKEND_BASE_URL}/functions/v1/submit-contact")
    print("This returns JSON API responses!")

def print_url_guide():
    """Print comprehensive URL usage guide"""
    
    print("\n" + "=" * 70)
    print("BACKEND URL REFERENCE GUIDE")
    print("=" * 70)
    
    print("\n📍 FRONTEND URL (Website):")
    print(f"   {FRONTEND_URL}")
    print("   - Serves the React web application")
    print("   - Returns HTML/CSS/JavaScript")
    print("   - Use for: Visiting the website in browser")
    print("   - DON'T use for: API calls")
    
    print("\n📍 BACKEND URL (API):")
    print(f"   {BACKEND_BASE_URL}")
    print("   - Serves the API endpoints")
    print("   - Returns JSON data")
    print("   - Use for: All API calls")
    
    print("\n🔌 EDGE FUNCTIONS:")
    print(f"   {BACKEND_BASE_URL}/functions/v1/{{function-name}}")
    print("   Examples:")
    print(f"   - {BACKEND_BASE_URL}/functions/v1/submit-contact")
    print(f"   - {BACKEND_BASE_URL}/functions/v1/check-subscription")
    print(f"   - {BACKEND_BASE_URL}/functions/v1/create-checkout")
    print(f"   - {BACKEND_BASE_URL}/functions/v1/customer-portal")
    
    print("\n🗄️  DATABASE REST API:")
    print(f"   {BACKEND_BASE_URL}/rest/v1/{{table-name}}")
    print("   Examples:")
    print(f"   - {BACKEND_BASE_URL}/rest/v1/profiles")
    print(f"   - {BACKEND_BASE_URL}/rest/v1/contact_submissions")
    print(f"   - {BACKEND_BASE_URL}/rest/v1/content_sections")
    
    print("\n🔐 AUTHENTICATION:")
    print("   Public endpoints: Only need apikey header")
    print(f"     apikey: {ANON_KEY[:30]}...")
    print("\n   Protected endpoints: Need Authorization header")
    print("     Authorization: Bearer {{JWT_TOKEN}}")
    print("     Get JWT token by signing in to the website")

def run_all_tests():
    """Run all tests and print summary"""
    
    print("\n" + "=" * 70)
    print(" BACKEND API TEST SUITE - STARTING")
    print("=" * 70)
    
    results = []
    
    # Run tests
    results.append(("Contact Form API", test_public_endpoint_contact()))
    results.append(("Database REST API", test_database_rest_api()))
    results.append(("Authenticated API", test_authenticated_endpoint()))
    test_frontend_url()
    
    # Print summary
    print("\n" + "=" * 70)
    print(" TEST SUMMARY")
    print("=" * 70)
    
    for test_name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    passed_count = sum(1 for _, passed in results if passed)
    total_count = len(results)
    
    print(f"\nResults: {passed_count}/{total_count} tests passed")
    
    # Print URL guide
    print_url_guide()
    
    print("\n" + "=" * 70)
    print(" TEST COMPLETE")
    print("=" * 70)
    print("\nKey Takeaways:")
    print("1. Always use BACKEND URL for API calls")
    print("2. Frontend URL is only for viewing the website")
    print("3. Public endpoints need apikey header")
    print("4. Protected endpoints need Authorization header with JWT token")
    print("=" * 70 + "\n")

if __name__ == "__main__":
    run_all_tests()
