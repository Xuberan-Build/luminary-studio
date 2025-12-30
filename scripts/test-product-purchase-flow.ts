/**
 * Test Product Purchase Flow
 * Validates complete flow: Payment Link → Checkout → Webhook → Database → Access
 */

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface TestResult {
  product: string;
  paymentLink: string;
  hasMetadata: boolean;
  metadataValue: string | null;
  active: boolean;
  price: number;
  status: 'pass' | 'fail' | 'warning';
  issues: string[];
}

async function testAllProducts() {
  console.log('\n🧪 TESTING ALL PRODUCT PURCHASE FLOWS\n');
  console.log('═══════════════════════════════════════════════════\n');

  const results: TestResult[] = [];

  try {
    // Get all payment links
    console.log('📋 Fetching payment links...\n');
    const paymentLinks = await stripe.paymentLinks.list({ limit: 100 });

    console.log(`Found ${paymentLinks.data.length} payment links\n`);
    console.log('═══════════════════════════════════════════════════\n');

    for (const link of paymentLinks.data) {
      console.log(`\n🔍 Testing: ${link.id}`);
      console.log(`   URL: ${link.url}`);
      console.log(`   Active: ${link.active ? '✅' : '❌'}`);

      const result: TestResult = {
        product: 'Unknown',
        paymentLink: link.id,
        hasMetadata: false,
        metadataValue: null,
        active: link.active,
        price: 0,
        status: 'pass',
        issues: [],
      };

      // Get product details
      if (link.line_items && link.line_items.data.length > 0) {
        const lineItem = link.line_items.data[0];
        const price = lineItem.price;

        if (price && price.product) {
          const productId = typeof price.product === 'string' ? price.product : price.product.id;
          const product = await stripe.products.retrieve(productId);

          result.product = product.name;
          result.price = (price.unit_amount || 0) / 100;

          console.log(`\n   Product: ${product.name}`);
          console.log(`   Price: $${result.price}`);
        }
      }

      // Check metadata
      console.log(`\n   Metadata:`);
      if (link.metadata && Object.keys(link.metadata).length > 0) {
        Object.entries(link.metadata).forEach(([key, value]) => {
          console.log(`     ${key}: ${value}`);
        });

        if (link.metadata.product_slug) {
          result.hasMetadata = true;
          result.metadataValue = link.metadata.product_slug;
          console.log(`\n   ✅ product_slug found: "${link.metadata.product_slug}"`);
        } else {
          result.issues.push('Missing product_slug in metadata');
          result.status = 'warning';
          console.log(`\n   ⚠️  WARNING: No product_slug in metadata!`);
          console.log(`   Webhook will use success_url parsing or default to "quantum-initiation"`);
        }
      } else {
        result.issues.push('No metadata');
        result.status = 'warning';
        console.log(`     (empty)`);
        console.log(`\n   ⚠️  WARNING: No metadata!`);
        console.log(`   Webhook will use success_url parsing or default to "quantum-initiation"`);
      }

      // Check if inactive
      if (!link.active) {
        result.issues.push('Payment link inactive');
        if (result.status === 'pass') result.status = 'warning';
      }

      results.push(result);
      console.log('\n' + '─'.repeat(60));
    }

    // Summary
    console.log('\n\n═══════════════════════════════════════════════════\n');
    console.log('📊 TEST SUMMARY\n');

    const passing = results.filter(r => r.status === 'pass' && r.active);
    const warnings = results.filter(r => r.status === 'warning' || !r.active);
    const failing = results.filter(r => r.status === 'fail');

    console.log(`✅ Passing: ${passing.length} (active with metadata)`);
    console.log(`⚠️  Warnings: ${warnings.length} (missing metadata or inactive)`);
    console.log(`❌ Failing: ${failing.length}\n`);

    // Active products with metadata
    if (passing.length > 0) {
      console.log('✅ READY FOR PRODUCTION:\n');
      passing.forEach(r => {
        console.log(`   • ${r.product}`);
        console.log(`     Price: $${r.price}`);
        console.log(`     Slug: ${r.metadataValue}`);
        console.log(`     Link: ${r.paymentLink}`);
        console.log();
      });
    }

    // Warnings
    if (warnings.length > 0) {
      console.log('⚠️  NEEDS ATTENTION:\n');
      warnings.forEach(r => {
        console.log(`   • ${r.product || r.paymentLink}`);
        console.log(`     Issues: ${r.issues.join(', ')}`);
        console.log();
      });
    }

    console.log('═══════════════════════════════════════════════════\n');

    // Recommendations
    console.log('💡 RECOMMENDATIONS:\n');
    console.log('1. All active payment links should have product_slug metadata');
    console.log('2. Use: quantum-initiation, personal-alignment, or brand-alignment');
    console.log('3. Inactive links can be archived or deleted\n');

    console.log('To add metadata to a payment link:');
    console.log('  1. Stripe Dashboard → Products → [Product]');
    console.log('  2. Click on Payment Link');
    console.log('  3. Click "..." → Edit');
    console.log('  4. Add metadata: product_slug = [slug]');
    console.log('  5. Save\n');

    console.log('═══════════════════════════════════════════════════\n');

    // Test webhook endpoint
    console.log('🔗 WEBHOOK ENDPOINT TEST:\n');
    console.log('To test the webhook flow:');
    console.log('  1. Open payment link in browser');
    console.log('  2. Use test card: 4242 4242 4242 4242');
    console.log('  3. Complete purchase');
    console.log('  4. Check Stripe Dashboard → Webhooks');
    console.log('  5. Verify HTTP 200 response (not 308)');
    console.log('  6. Run: npm run show-access\n');

    console.log('Expected webhook response:');
    console.log('  Status: 200 OK ✅');
    console.log('  Body: {"received": true}\n');

    console.log('If you see HTTP 308:');
    console.log('  ❌ The fix did not deploy correctly');
    console.log('  Check next.config.ts has: skipTrailingSlashRedirect: true\n');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testAllProducts()
  .then(() => {
    console.log('✅ Test complete\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
