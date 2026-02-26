import requests
import json
import sys
import os

def test_create_checkout():
    """Test the create-checkout edge function"""
    
    # Configuration
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    JWT_TOKEN = os.getenv("SUPABASE_JWT_TOKEN")
    if not SUPABASE_URL or not JWT_TOKEN:
        print("❌ Missing SUPABASE_URL or SUPABASE_JWT_TOKEN environment variable")
        sys.exit(1)
    
    url = f"{SUPABASE_URL}/functions/v1/create-checkout"
    
    headers = {
        "Authorization": f"Bearer {JWT_TOKEN}",
        "Content-Type": "application/json"
    }
    
    # Optional: if you want to test with a specific price ID, add it here
    # Otherwise, the function will use the default price configured in the edge function
    payload = {}
    
    print("Testing create-checkout endpoint...")
    print(f"URL: {url}")
    print(f"Method: POST")
    print(f"Payload: {json.dumps(payload)}")
    print("-" * 60)
    
    try:
        # POST request to create a checkout session
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
                assert "url" in response_json, "'url' field missing in response"
                
                checkout_url = response_json['url']
                print(f"✓ Checkout URL received: {checkout_url[:50]}...")
                print(f"✓ Full URL: {checkout_url}")
                
                # Validate URL format
                assert checkout_url.startswith("https://"), "Checkout URL should start with https://"
                assert "checkout.stripe.com" in checkout_url, "Checkout URL should be a Stripe checkout URL"
                
                print("\n✅ Test PASSED - Checkout session created successfully")
                print("\nℹ️  You can open this URL in a browser to complete the checkout:")
                print(f"   {checkout_url}")
                print("\n⚠️  Note: Opening this URL will create a real checkout session in Stripe")
                
            else:
                print(f"\n❌ Test FAILED - HTTP {response.status_code}")
                if "error" in response_json:
                    print(f"Error: {response_json['error']}")
                    
                    # Common errors
                    if "authentication" in response_json['error'].lower():
                        print("\n⚠️  Authentication error - JWT token may be expired.")
                        print("   Get a fresh token from /test-subscription page or browser Network tab")
        
        except json.JSONDecodeError:
            print("❌ Response is not valid JSON")
            print(f"Raw response: {response.text}")
            sys.exit(1)
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {str(e)}")
        sys.exit(1)
    
    print("-" * 60)

if __name__ == "__main__":
    test_create_checkout()
