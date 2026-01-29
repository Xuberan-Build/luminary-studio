import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Middleware
 * - Handles CORS for cross-subdomain RSC requests (www <-> app)
 * - Protects /admin routes with email whitelist authentication
 *
 * To disable admin in production, set ADMIN_DISABLED=true
 */

// Allowed origins for CORS (cross-subdomain requests)
const ALLOWED_ORIGINS = [
  'https://www.quantumstrategies.online',
  'https://quantumstrategies.online',
  'https://app.quantumstrategies.online',
];

// Admin emails that can access /admin routes
const ADMIN_EMAILS = [
  'santos.93.aus@gmail.com',
  'austin@quantumstrategies.online',
];

// Set ADMIN_DISABLED=true in production .env to completely hide admin
const ADMIN_DISABLED = process.env.ADMIN_DISABLED === 'true';

function addCorsHeaders(response: NextResponse, origin: string | null): NextResponse {
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With, rsc, RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Url, next-router-state-tree, next-router-prefetch, next-url'
    );
  }
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get('origin');

  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 });
    return addCorsHeaders(response, origin);
  }

  // For non-admin routes, just add CORS headers and continue
  if (!pathname.startsWith('/admin')) {
    const response = NextResponse.next();
    return addCorsHeaders(response, origin);
  }

  // If admin is disabled (production), return 404
  if (ADMIN_DISABLED) {
    return NextResponse.rewrite(new URL('/not-found', request.url));
  }

  // Create response to pass to supabase client
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Create Supabase client with cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Get session
  const { data: { session } } = await supabase.auth.getSession();

  // Not logged in - redirect to login
  if (!session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check if admin
  const email = session.user.email?.toLowerCase() || '';
  const isAdmin = ADMIN_EMAILS.includes(email);

  // Not admin - redirect to dashboard
  if (!isAdmin) {
    const dashboardUrl = new URL('/dashboard', request.url);
    dashboardUrl.searchParams.set('error', 'unauthorized');
    return NextResponse.redirect(dashboardUrl);
  }

  return addCorsHeaders(response, origin);
}

export const config = {
  matcher: [
    // Match all paths except static files and API routes
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
