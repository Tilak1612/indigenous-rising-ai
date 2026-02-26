import requests
import json
import sys
import os

def test_customer_portal():
    """Test the customer-portal edge function"""
    
    # Configuration
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    JWT_TOKEN = os.getenv("SUPABASE_JWT_TOKEN")
    if not SUPABASE_URL or not JWT_TOKEN:
        print("❌ Missing SUPABASE_URL or SUPABASE_JWT_TOKEN environment variable")
        sys.exit(1)
    
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
