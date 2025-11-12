import requests
import json
import sys

def test_customer_portal():
    """Test the customer-portal edge function"""
    
    # Configuration
    SUPABASE_URL = "https://fsqjgexjkjicwlzcgweu.supabase.co"
    # Replace this token with a fresh one from your browser (check Network tab or /test-subscription page)
    JWT_TOKEN = "eyJhbGciOiJIUzI1NiIsImtpZCI6InljQ2FWVk1jd3lDZHJUdXUiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2ZzcWpnZXhqa2ppY3dsemNnd2V1LnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJmOWE4ODBjNC05ODVjLTRmZDAtYmM1ZC1kNTIxNzMzZTFiYmMiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzYyOTI5NzE5LCJpYXQiOjE3NjI5MjYxMTksImVtYWlsIjoidGlsYWsxMTExQGdtYWlsLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnsiZW1haWwiOiJ0aWxhazExMTFAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImZ1bGxfbmFtZSI6IlRpbGFrIHJhaiIsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwic3ViIjoiZjlhODgwYzQtOTg1Yy00ZmQwLWJjNWQtZDUyMTczM2UxYmJjIn0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3NjI5MjYxMTl9XSwic2Vzc2lvbl9pZCI6Ijk3YTAwNjJkLTliYjktNGM5Zi05YjkxLTRhOGMwMWEwODYxNCIsImlzX2Fub255bW91cyI6ZmFsc2V9.EBVhv3s0ldYbsB4z_iHgZZb6Tz_LbdJybQJgxVQ3Iqo"
    
    url = f"{SUPABASE_URL}/functions/v1/customer-portal"
    
    headers = {
        "Authorization": f"Bearer {JWT_TOKEN}",
        "Content-Type": "application/json"
    }
    
    print("Testing customer-portal endpoint...")
    print(f"URL: {url}")
    print(f"Method: POST (no payload needed)")
    print("-" * 60)
    
    try:
        # IMPORTANT: POST request, but no payload needed (user authenticated via JWT)
        response = requests.post(url, headers=headers, json={})
        
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
                assert "url" in response_json, "'url' field missing in response"
                
                portal_url = response_json['url']
                print(f"✓ Portal URL received: {portal_url[:50]}...")
                print(f"✓ Full URL: {portal_url}")
                
                # Validate URL format
                assert portal_url.startswith("https://"), "Portal URL should start with https://"
                assert "billing.stripe.com" in portal_url, "Portal URL should be a Stripe billing URL"
                
                print("\n✅ Test PASSED - Customer portal URL is valid")
                print("\nℹ️  You can open this URL in a browser to access the Stripe Customer Portal")
                
            else:
                print(f"\n❌ Test FAILED - HTTP {response.status_code}")
                if "error" in response_json:
                    print(f"Error: {response_json['error']}")
                    
                    # Common errors
                    if "No Stripe customer found" in response_json['error']:
                        print("\n⚠️  This user doesn't have a Stripe customer yet.")
                        print("   They need to complete a checkout first.")
        
        except json.JSONDecodeError:
            print("❌ Response is not valid JSON")
            print(f"Raw response: {response.text}")
            sys.exit(1)
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {str(e)}")
        sys.exit(1)
    
    print("-" * 60)

if __name__ == "__main__":
    test_customer_portal()
