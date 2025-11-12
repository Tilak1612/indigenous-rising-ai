import requests
import json

def test_check_subscription():
    """Test the check-subscription edge function"""
    
    # Configuration
    SUPABASE_URL = "https://fsqjgexjkjicwlzcgweu.supabase.co"
    # Replace this token with a fresh one from your browser (check Network tab or /test-subscription page)
    JWT_TOKEN = "eyJhbGciOiJIUzI1NiIsImtpZCI6InljQ2FWVk1jd3lDZHJUdXUiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2ZzcWpnZXhqa2ppY3dsemNnd2V1LnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJmOWE4ODBjNC05ODVjLTRmZDAtYmM1ZC1kNTIxNzMzZTFiYmMiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzYyOTI5NzE5LCJpYXQiOjE3NjI5MjYxMTksImVtYWlsIjoidGlsYWsxMTExQGdtYWlsLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnsiZW1haWwiOiJ0aWxhazExMTFAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImZ1bGxfbmFtZSI6IlRpbGFrIHJhaiIsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwic3ViIjoiZjlhODgwYzQtOTg1Yy00ZmQwLWJjNWQtZDUyMTczM2UxYmJjIn0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3NjI5MjYxMTl9XSwic2Vzc2lvbl9pZCI6Ijk3YTAwNjJkLTliYjktNGM5Zi05YjkxLTRhOGMwMWEwODYxNCIsImlzX2Fub255bW91cyI6ZmFsc2V9.EBVhv3s0ldYbsB4z_iHgZZb6Tz_LbdJybQJgxVQ3Iqo"
    
    url = f"{SUPABASE_URL}/functions/v1/check-subscription"
    
    headers = {
        "Authorization": f"Bearer {JWT_TOKEN}",
        "Content-Type": "application/json"
    }
    
    print("Testing check-subscription endpoint...")
    print(f"URL: {url}")
    print("-" * 60)
    
    try:
        # Make GET request (no body needed)
        response = requests.get(url, headers=headers)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        print("-" * 60)
        
        # Parse JSON response
        try:
            response_json = response.json()
            print("Response JSON:")
            print(json.dumps(response_json, indent=2))
            print("-" * 60)
            
            # Validate response structure
            if response.status_code == 200:
                assert "subscribed" in response_json, "'subscribed' field missing in response"
                
                print(f"✓ Subscription Status: {'ACTIVE' if response_json['subscribed'] else 'INACTIVE'}")
                
                if response_json['subscribed']:
                    print(f"✓ Product ID: {response_json.get('product_id', 'N/A')}")
                    print(f"✓ Subscription End: {response_json.get('subscription_end', 'N/A')}")
                else:
                    print("  No active subscription found")
                
                print("\n✅ Test PASSED - Response is valid")
            else:
                print(f"\n❌ Test FAILED - HTTP {response.status_code}")
                if "error" in response_json:
                    print(f"Error: {response_json['error']}")
        
        except json.JSONDecodeError:
            print("❌ Response is not valid JSON")
            print(f"Raw response: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {str(e)}")
    
    print("-" * 60)

if __name__ == "__main__":
    test_check_subscription()
