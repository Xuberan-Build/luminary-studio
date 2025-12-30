/**
 * Check Stripe Payment Link Configuration
 * Verifies that payment links have proper metadata for webhook
 */

import Stripe from 'stripe';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.error('❌ STRIPE_SECRET_KEY not found in environment variables');
  process.exit(1);
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-12-15.clover',
});

async function checkStripeConfig() {
  console.log('\n🔍 Checking Stripe Payment Link Configuration...\n');

  try {
    // Get all payment links
    const paymentLinks = await stripe.paymentLinks.list({ limit: 100 });

    console.log(`Found ${paymentLinks.data.length} payment links\n`);

    for (const link of paymentLinks.data) {
      console.log('─'.repeat(60));
      console.log(`\n📝 Payment Link: ${link.id}`);
      console.log(`   URL: ${link.url}`);
      console.log(`   Active: ${link.active ? '✅' : '❌'}`);

      // Get associated product
      if (link.line_items && link.line_items.data.length > 0) {
        const lineItem = link.line_items.data[0];
        const price = lineItem.price;

        if (price && price.product) {
          const productId = typeof price.product === 'string' ? price.product : price.product.id;
          const product = await stripe.products.retrieve(productId);

          console.log(`\n   Product: ${product.name}`);
          console.log(`   Product ID: ${product.id}`);
          console.log(`   Price: $${(price.unit_amount || 0) / 100}`);
        }
      }

      // Check metadata
      console.log(`\n   Metadata:`);
      if (link.metadata && Object.keys(link.metadata).length > 0) {
        Object.entries(link.metadata).forEach(([key, value]) => {
          console.log(`     ${key}: ${value}`);
        });

        // Validate product_slug exists
        if (link.metadata.product_slug) {
          console.log(`\n   ✅ product_slug found: "${link.metadata.product_slug}"`);
        } else {
          console.log(`\n   ⚠️  WARNING: No product_slug in metadata!`);
          console.log(`   Webhook will use success_url parsing or default to "quantum-initiation"`);
        }
      } else {
        console.log(`     (empty)`);
        console.log(`\n   ⚠️  WARNING: No metadata!`);
        console.log(`   Webhook will use success_url parsing or default to "quantum-initiation"`);
      }

      console.log('');
    }

    console.log('─'.repeat(60));
    console.log('\n📋 RECOMMENDATIONS:\n');
    console.log('For each payment link, ensure metadata includes:');
    console.log('  • product_slug: "quantum-initiation" | "personal-alignment" | "brand-alignment"');
    console.log('\nTo add metadata via Stripe Dashboard:');
    console.log('  1. Go to Stripe Dashboard → Products → [Product]');
    console.log('  2. Click on Payment Link');
    console.log('  3. Click "..." → Edit');
    console.log('  4. Scroll to "Add metadata"');
    console.log('  5. Add key: product_slug, value: [slug]');
    console.log('  6. Save\n');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run check
checkStripeConfig()
  .then(() => {
    console.log('✅ Check complete\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
