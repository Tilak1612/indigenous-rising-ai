import requests
import json
import sys
import os

def test_check_subscription():
    """Test the check-subscription edge function"""
    
    # Configuration
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    JWT_TOKEN = os.getenv("SUPABASE_JWT_TOKEN")
    if not SUPABASE_URL or not JWT_TOKEN:
        print("❌ Missing SUPABASE_URL or SUPABASE_JWT_TOKEN environment variable")
        sys.exit(1)
    
    url = f"{SUPABASE_URL}/functions/v1/check-subscription"
    
    headers = {
        "Authorization": f"Bearer {JWT_TOKEN}",
        "Content-Type": "application/json"
    }
    
    print("Testing check-subscription endpoint...")
    print(f"URL: {url}")
    print(f"Method: GET (no payload needed)")
    print("-" * 60)
    
    try:
        # IMPORTANT: Use GET, not POST. The endpoint doesn't accept a body.
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
