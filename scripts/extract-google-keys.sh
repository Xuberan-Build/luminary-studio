#!/bin/bash
# Extract Google API private keys for .env.production

echo "═══════════════════════════════════════════════════════════"
echo "🔑 Google API Credentials Extractor"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "❌ Error: jq is not installed"
    echo "Install with: brew install jq"
    exit 1
fi

echo "📧 Gmail Service Account Private Key:"
echo "─────────────────────────────────────────────────────────"
if [ -f ".secrets/gen-lang-client-0574010323-fa556c163dec.json" ]; then
    GMAIL_KEY=$(cat .secrets/gen-lang-client-0574010323-fa556c163dec.json | jq -r '.private_key')
    echo "GOOGLE_GMAIL_PRIVATE_KEY=\"$GMAIL_KEY\""
    echo ""
else
    echo "❌ File not found: .secrets/gen-lang-client-0574010323-fa556c163dec.json"
    echo ""
fi

echo "📊 Drive/Sheets Service Account Private Key:"
echo "─────────────────────────────────────────────────────────"
if [ -f ".secrets/quantum-gpt-assistant-b176e8b31832.json" ]; then
    DRIVE_KEY=$(cat .secrets/quantum-gpt-assistant-b176e8b31832.json | jq -r '.private_key')
    echo "GOOGLE_DRIVE_PRIVATE_KEY=\"$DRIVE_KEY\""
    echo ""
else
    echo "❌ File not found: .secrets/quantum-gpt-assistant-b176e8b31832.json"
    echo ""
fi

echo "═══════════════════════════════════════════════════════════"
echo "✅ Copy the above variables to your .env.production file"
echo "═══════════════════════════════════════════════════════════"
