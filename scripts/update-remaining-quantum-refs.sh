#!/bin/bash

# Update all remaining quantum-initiation fallback references to business-alignment

echo "🔄 Updating remaining quantum-initiation references to business-alignment..."

# API routes - fallback defaults
sed -i '' "s/productSlug = 'quantum-initiation'/productSlug = 'business-alignment'/g" \
  src/app/api/products/final-briefing/route.ts \
  src/app/api/products/step-insight/route.ts \
  src/app/api/products/followup-response/route.ts

sed -i '' "s/productSlug || 'quantum-initiation'/productSlug || 'business-alignment'/g" \
  src/app/api/products/final-briefing/route.ts \
  src/app/api/products/followup-response/route.ts

sed -i '' "s/productName = 'Quantum Initiation'/productName = 'Business Alignment Orientation'/g" \
  src/app/api/products/final-briefing/route.ts

sed -i '' "s/productName || 'Quantum Initiation'/productName || 'Business Alignment Orientation'/g" \
  src/app/api/products/step-insight/route.ts \
  src/app/api/products/final-briefing/route.ts

# Services
sed -i '' "s/let productSlug = 'quantum-initiation'/let productSlug = 'business-alignment'/g" \
  src/lib/google-sheets/sheet-manager.ts

sed -i '' "s/'quantum-initiation': {/'business-alignment': {/g" \
  src/lib/email/sequence-manager.ts

sed -i '' "s/'quantum-initiation': 'Business Alignment Orientation'/'business-alignment': 'Business Alignment Orientation'/g" \
  src/lib/services/PromptService.ts

echo "✅ All references updated successfully!"
