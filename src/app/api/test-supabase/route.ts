import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET() {
  const results = {
    connection: '❌',
    tables: '❌',
    productDefinitions: '❌',
    auth: '❌',
    errors: [] as string[],
  };

  try {
    // Test 1: Basic connection
    const { data: tables, error: tablesError } = await supabaseAdmin
      .from('users')
      .select('count')
      .limit(0);

    if (tablesError) {
      results.errors.push(`Tables test failed: ${tablesError.message}`);
    } else {
      results.connection = '✅';
      results.tables = '✅';
    }

    // Test 2: Check product_definitions
    const { data: products, error: productsError } = await supabaseAdmin
      .from('product_definitions')
      .select('product_slug, name')
      .eq('product_slug', 'quantum-initiation');

    if (productsError) {
      results.errors.push(`Products test failed: ${productsError.message}`);
    } else if (products && products.length > 0) {
      results.productDefinitions = `✅ Found: ${products[0].name}`;
    } else {
      results.productDefinitions = '⚠️ No products found (run schema.sql)';
    }

    // Test 3: Auth configuration
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (!authError) {
      results.auth = '✅ Auth configured';
    } else {
      results.errors.push(`Auth test failed: ${authError.message}`);
    }

  } catch (error: any) {
    results.errors.push(`Unexpected error: ${error.message}`);
  }

  return NextResponse.json({
    status: results.errors.length === 0 ? 'success' : 'partial',
    results,
    message: results.errors.length === 0
      ? '🎉 Supabase is fully configured and working!'
      : '⚠️ Some tests failed. Check errors below.',
  });
}
