import requests
import json
import hmac
import hashlib
import time
import os

def test_stripe_webhook():
    """
    Test the Stripe webhook endpoint
    
    IMPORTANT: Stripe webhooks require signature verification.
    This test demonstrates the structure but will fail without a valid signature.
    
    For proper testing, use:
    1. Stripe CLI: stripe listen --forward-to your-webhook-url
    2. Stripe Dashboard: Send test webhooks from the webhook settings
    3. Use Stripe test mode to trigger real events
    """
    
    BASE_URL = os.getenv("SUPABASE_URL")
    if not BASE_URL:
        print("❌ Missing SUPABASE_URL environment variable")
        return
    url = f"{BASE_URL}/functions/v1/stripe-webhook"
    
    # Example Stripe checkout.session.completed event payload
    webhook_payload = {
        "id": "evt_test_webhook",
        "object": "event",
        "api_version": "2025-08-27.basil",
        "created": int(time.time()),
        "data": {
            "object": {
                "id": "cs_test_123",
                "object": "checkout.session",
                "amount_total": 4900,
                "currency": "usd",
                "customer": "cus_test_123",
                "customer_email": "test@example.com",
                "mode": "subscription",
                "payment_status": "paid",
                "status": "complete",
                "subscription": "sub_test_123",
                "metadata": {}
            }
        },
        "type": "checkout.session.completed",
        "livemode": False
    }
    
    # Convert payload to JSON string
    payload_string = json.dumps(webhook_payload)
    
    print("=" * 60)
    print("Testing: Stripe Webhook Endpoint")
    print("=" * 60)
    print(f"URL: {url}")
    print(f"\nEvent Type: {webhook_payload['type']}")
    print(f"Event ID: {webhook_payload['id']}")
    print("\n⚠️  WARNING: This test will fail without proper Stripe signature!")
    print("-" * 60)
    
    # Stripe requires these headers
    headers = {
        "Content-Type": "application/json",
        # Stripe-Signature header is required but we don't have the signing secret
        # "Stripe-Signature": "t=timestamp,v1=signature"
    }
    
    try:
        response = requests.post(url, headers=headers, data=payload_string)
        
        print(f"\nResponse Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        print(f"Response Body: {response.text}")
        print("-" * 60)
        
        # Expected responses:
        # 400 - Missing signature or invalid signature
        # 200 - Success (only with valid signature)
        
        if response.status_code == 400:
            print("\n⚠️  Expected: Webhook rejected due to missing/invalid signature")
            print("   This is correct behavior - webhooks require Stripe signatures")
        elif response.status_code == 200:
            print("\n✅ Webhook processed successfully!")
            print("   (This means signature verification is disabled or bypassed)")
        else:
            print(f"\n❌ Unexpected status code: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {str(e)}")

def test_webhook_event_types():
    """Display the webhook events that the endpoint should handle"""
    
    print("\n" + "=" * 60)
    print("SUPPORTED STRIPE WEBHOOK EVENTS")
    print("=" * 60)
    
    events = [
        {
            "event": "checkout.session.completed",
            "description": "Customer completed checkout",
            "action": "Create/update subscription record"
        },
        {
            "event": "customer.subscription.created",
            "description": "New subscription created",
            "action": "Record subscription details"
        },
        {
            "event": "customer.subscription.updated",
            "description": "Subscription modified",
            "action": "Update subscription status"
        },
        {
            "event": "customer.subscription.deleted",
            "description": "Subscription canceled",
            "action": "Mark subscription as canceled"
        },
        {
            "event": "invoice.payment_succeeded",
            "description": "Payment successful",
            "action": "Record successful payment"
        },
        {
            "event": "invoice.payment_failed",
            "description": "Payment failed",
            "action": "Handle payment failure"
        }
    ]
    
    for event in events:
        print(f"\n{event['event']}")
        print(f"  Description: {event['description']}")
        print(f"  Action: {event['action']}")

def print_testing_guide():
    """Print guide for proper webhook testing"""
    
    print("\n" + "=" * 60)
    print("HOW TO PROPERLY TEST STRIPE WEBHOOKS")
    print("=" * 60)
    
    print("\n1. Using Stripe CLI (Recommended for Development):")
    print("   $ stripe login")
    print("   $ stripe listen --forward-to $SUPABASE_URL/functions/v1/stripe-webhook")
    print("   $ stripe trigger checkout.session.completed")
    
    print("\n2. Using Stripe Dashboard:")
    print("   a. Go to: https://dashboard.stripe.com/webhooks")
    print("   b. Click on your webhook endpoint")
    print("   c. Click 'Send test webhook'")
    print("   d. Select event type and send")
    
    print("\n3. Using Real Stripe Test Mode Events:")
    print("   a. Create a test checkout with test card: 4242 4242 4242 4242")
    print("   b. Complete the checkout")
    print("   c. Stripe will automatically call your webhook")
    
    print("\n4. Webhook Endpoint Configuration:")
    print("   URL: $SUPABASE_URL/functions/v1/stripe-webhook")
    print("   Events to listen for:")
    print("   - checkout.session.completed")
    print("   - customer.subscription.created")
    print("   - customer.subscription.updated")
    print("   - customer.subscription.deleted")
    print("   - invoice.payment_succeeded")
    print("   - invoice.payment_failed")
    
    print("\n5. Important: Webhook Signing Secret")
    print("   - After creating webhook in Stripe dashboard")
    print("   - Copy the signing secret (starts with whsec_)")
    print("   - Add it as STRIPE_WEBHOOK_SECRET to your Lovable Cloud secrets")

if __name__ == "__main__":
    # Run the test (will show expected failure)
    test_stripe_webhook()
    
    # Display supported events
    test_webhook_event_types()
    
    # Show proper testing guide
    print_testing_guide()
    
    print("\n" + "=" * 60)
    print("TEST COMPLETE")
    print("=" * 60)
    print("\nNote: Direct webhook testing without Stripe signatures")
    print("will always fail. Use Stripe CLI or Dashboard for real tests.")
    print("=" * 60 + "\n")
