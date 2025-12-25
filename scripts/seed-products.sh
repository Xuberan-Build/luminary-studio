#!/bin/bash

# =====================================================
# Seed Product Definitions to Supabase
# =====================================================
#
# Usage: ./scripts/seed-products.sh
#
# This script seeds product definitions from database/seed-products.sql
# into your Supabase database.
#
# Prerequisites:
# - Supabase CLI installed (npm install -g supabase)
# - Supabase project linked (supabase link)
# =====================================================

set -e  # Exit on error

echo "🌱 Seeding product definitions to Supabase..."
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Error: Supabase CLI not found"
    echo "Install it with: npm install -g supabase"
    exit 1
fi

# Check if seed file exists
if [ ! -f "database/seed-products.sql" ]; then
    echo "❌ Error: database/seed-products.sql not found"
    exit 1
fi

# Check if project is linked
if [ ! -f ".supabase/config.toml" ]; then
    echo "⚠️  Supabase project not linked"
    echo ""
    echo "Option 1: Link project with:"
    echo "  supabase link --project-ref YOUR_PROJECT_REF"
    echo ""
    echo "Option 2: Run SQL manually in Supabase Dashboard:"
    echo "  1. Go to https://supabase.com/dashboard"
    echo "  2. Navigate to SQL Editor"
    echo "  3. Copy/paste contents of database/seed-products.sql"
    echo "  4. Click 'Run'"
    echo ""
    exit 1
fi

# Run the seed file
echo "📝 Executing seed-products.sql..."
cat database/seed-products.sql | supabase db execute

echo ""
echo "✅ Product definitions seeded successfully!"
echo ""
echo "Next steps:"
echo "1. Verify in Supabase dashboard: https://supabase.com/dashboard"
echo "2. Test product experience: /products/quantum-structure-profit-scale/experience"
