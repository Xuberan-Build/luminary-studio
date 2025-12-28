/**
 * Generate SQL seed file from TypeScript product definition
 *
 * Usage: npm run generate-product-sql <product-file-name>
 * Example: npm run generate-product-sql quantum-pricing
 */

import * as fs from 'fs';
import * as path from 'path';

const productFileName = process.argv[2];

if (!productFileName) {
  console.error('❌ Error: Product file name required\n');
  console.log('Usage: npm run generate-product-sql <product-file-name>');
  console.log('Example: npm run generate-product-sql quantum-pricing\n');
  process.exit(1);
}

async function generateSQL() {
  console.log(`🔧 Generating SQL for product: ${productFileName}\n`);

  try {
    // Import the product definition
    const productDefPath = path.join(
      process.cwd(),
      'src/lib/product-definitions',
      `${productFileName}.ts`
    );

    if (!fs.existsSync(productDefPath)) {
      console.error(`❌ Product definition not found: ${productDefPath}\n`);
      console.log('Available products:');
      const productsDir = path.join(process.cwd(), 'src/lib/product-definitions');
      const files = fs.readdirSync(productsDir).filter(f => f.endsWith('.ts') && f !== 'types.ts');
      files.forEach(f => console.log(`  - ${f.replace('.ts', '')}`));
      console.log();
      process.exit(1);
    }

    // Dynamic import
    const { productDefinition } = await import(productDefPath);

    console.log('✓ Loaded product definition');
    console.log(`  Slug: ${productDefinition.product_slug}`);
    console.log(`  Name: ${productDefinition.name}`);
    console.log(`  Steps: ${productDefinition.steps.length}\n`);

    // Escape single quotes for SQL
    const escape = (str: string) => str.replace(/'/g, "''");

    // Generate SQL
    const sql = `-- =====================================================
-- ${productDefinition.name} - Product Definition
-- Generated from: src/lib/product-definitions/${productFileName}.ts
-- =====================================================

INSERT INTO product_definitions (
  product_slug,
  name,
  description,
  price,
  total_steps,
  estimated_duration,
  model,
  system_prompt,
  final_deliverable_prompt,
  steps
) VALUES (
  '${productDefinition.product_slug}',
  '${escape(productDefinition.name)}',
  '${escape(productDefinition.description)}',
  ${productDefinition.price},
  ${productDefinition.total_steps},
  '${productDefinition.estimated_duration}',
  '${productDefinition.model || 'gpt-4'}',
  '${escape(productDefinition.system_prompt)}',
  '${escape(productDefinition.final_deliverable_prompt)}',
  '${escape(JSON.stringify(productDefinition.steps, null, 2))}'::jsonb
) ON CONFLICT (product_slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  total_steps = EXCLUDED.total_steps,
  estimated_duration = EXCLUDED.estimated_duration,
  model = EXCLUDED.model,
  system_prompt = EXCLUDED.system_prompt,
  final_deliverable_prompt = EXCLUDED.final_deliverable_prompt,
  steps = EXCLUDED.steps,
  updated_at = NOW();

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ ${escape(productDefinition.name)} product seeded successfully!';
END $$;
`;

    // Write SQL file
    const outputPath = path.join(
      process.cwd(),
      'database',
      `seed-${productDefinition.product_slug}.sql`
    );

    fs.writeFileSync(outputPath, sql);

    console.log('✅ SQL file generated successfully!\n');
    console.log(`📄 File: ${outputPath}\n`);

    console.log('📖 NEXT STEPS:');
    console.log(`   1. Review the SQL file: ${outputPath}`);
    console.log(`   2. Run in Supabase SQL Editor or via CLI`);
    console.log(`   3. Create Stripe product and payment link`);
    console.log(`   4. Add to src/lib/constants/products.ts:`);
    console.log(`
  '${productDefinition.product_slug}': {
    slug: '${productDefinition.product_slug}',
    name: '${productDefinition.name}',
    price: ${productDefinition.price},
    estimatedDuration: '${productDefinition.estimated_duration}',
    sheetId: '${productDefinition.sheet_id}',
    fromEmail: '${productDefinition.from_email}',
    fromName: '${productDefinition.from_name}',
  },
`);
    console.log(`   5. Test: https://your-domain.com/products/${productDefinition.product_slug}/interact\n`);

  } catch (error: any) {
    console.error('❌ Failed to generate SQL:', error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

generateSQL();
