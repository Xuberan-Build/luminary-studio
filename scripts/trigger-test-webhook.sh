#!/bin/bash
# Trigger a test webhook with proper metadata

echo "🧪 Triggering test webhook with product_slug metadata..."
echo ""

# Create a test checkout session with metadata using Stripe API
curl https://api.stripe.com/v1/checkout/sessions \
  -u "${STRIPE_SECRET_KEY}:" \
  -d "success_url=https://quantumstrategies.online/products/personal-alignment/interact" \
  -d "cancel_url=https://quantumstrategies.online/products/personal-alignment" \
  -d "line_items[0][price_data][currency]=usd" \
  -d "line_items[0][price_data][product_data][name]=Personal Alignment Orientation (Test)" \
  -d "line_items[0][price_data][unit_amount]=700" \
  -d "line_items[0][quantity]=1" \
  -d "mode=payment" \
  -d "customer_email=webhook-test@example.com" \
  -d "metadata[product_slug]=personal-alignment" \
  | jq -r '.url'

echo ""
echo "✅ Checkout session created!"
echo "Open the URL above and use test card to trigger webhook"
echo ""
echo "Test Card: 4242 4242 4242 4242"
echo "Exp: 12/34"
echo "CVC: 123"
echo "ZIP: 10001"
