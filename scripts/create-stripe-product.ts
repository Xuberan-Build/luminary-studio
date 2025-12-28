#!/usr/bin/env tsx

/**
 * Create Stripe Product and Payment Link
 *
 * Usage: npm run create-stripe-product <product-slug>
 * Example: npm run create-stripe-product personal-alignment
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import Stripe from 'stripe';
import { PRODUCTS } from '../src/lib/constants/products';
import * as fs from 'fs';

const productSlug = process.argv[2];

if (!productSlug) {
  console.error('❌ Error: Please provide a product slug');
  console.error('Usage: npm run create-stripe-product <product-slug>');
  console.error('Example: npm run create-stripe-product personal-alignment');
  process.exit(1);
}

const productConfig = PRODUCTS[productSlug];

if (!productConfig) {
  console.error(`❌ Error: Product "${productSlug}" not found in products.ts`);
  console.error('Available products:', Object.keys(PRODUCTS).join(', '));
  process.exit(1);
}

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.error('❌ Error: STRIPE_SECRET_KEY not found in environment');
  console.error('Please set STRIPE_SECRET_KEY in your .env.local file');
  process.exit(1);
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-12-15.clover',
});

async function createStripeProduct() {
  console.log('\n🚀 Creating Stripe Product...\n');
  console.log(`Product: ${productConfig.name}`);
  console.log(`Price: $${productConfig.price}`);
  console.log(`Slug: ${productConfig.slug}`);
  console.log('\n---\n');

  try {
    // 1. Create Stripe Product
    console.log('📦 Creating product in Stripe...');
    const product = await stripe.products.create({
      name: productConfig.name,
      description: `Get instant access to ${productConfig.name}`,
      metadata: {
        product_slug: productConfig.slug,
      },
    });
    console.log(`✅ Product created: ${product.id}`);

    // 2. Create Price
    console.log('\n💰 Creating price...');
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: productConfig.price * 100, // Convert to cents
      currency: 'usd',
      metadata: {
        product_slug: productConfig.slug,
      },
    });
    console.log(`✅ Price created: ${price.id} ($${productConfig.price})`);

    // 3. Create Payment Link
    console.log('\n🔗 Creating payment link...');
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      after_completion: {
        type: 'redirect',
        redirect: {
          url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://quantumstrategies.com'}/products/${productConfig.slug}/interact`,
        },
      },
      metadata: {
        product_slug: productConfig.slug,
      },
    });
    console.log(`✅ Payment link created: ${paymentLink.url}`);

    // 4. Update .env.local
    console.log('\n📝 Updating .env.local...');
    const envPath = path.join(process.cwd(), '.env.local');
    const envVarName = `NEXT_PUBLIC_STRIPE_PAYMENT_LINK_${productConfig.slug.toUpperCase().replace(/-/g, '_')}`;

    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf-8');
    }

    // Check if variable already exists
    const varRegex = new RegExp(`^${envVarName}=.*$`, 'm');
    if (varRegex.test(envContent)) {
      // Update existing variable
      envContent = envContent.replace(varRegex, `${envVarName}=${paymentLink.url}`);
      console.log(`✅ Updated ${envVarName} in .env.local`);
    } else {
      // Add new variable
      if (!envContent.endsWith('\n')) {
        envContent += '\n';
      }
      envContent += `${envVarName}=${paymentLink.url}\n`;
      console.log(`✅ Added ${envVarName} to .env.local`);
    }

    fs.writeFileSync(envPath, envContent);

    // 5. Summary
    console.log('\n✨ Success! Product created in Stripe\n');
    console.log('---\n');
    console.log('📋 Summary:');
    console.log(`Product ID: ${product.id}`);
    console.log(`Price ID: ${price.id}`);
    console.log(`Payment Link: ${paymentLink.url}`);
    console.log(`Env Variable: ${envVarName}`);
    console.log('\n---\n');
    console.log('⚠️  Next Steps:');
    console.log('1. ✅ .env.local has been updated');
    console.log('2. 🔄 Restart your dev server to load the new env variable');
    console.log('3. ☁️  Add this env variable to Vercel:');
    console.log(`   Variable: ${envVarName}`);
    console.log(`   Value: ${paymentLink.url}`);
    console.log('\n');

  } catch (error) {
    console.error('\n❌ Error creating Stripe product:', error);
    process.exit(1);
  }
}

createStripeProduct();
