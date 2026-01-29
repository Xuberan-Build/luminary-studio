import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Inline URL config to avoid dependency tracing overhead
function normalizeUrl(url: string | undefined, fallback: string): string {
  if (!url) return fallback;
  const trimmed = url.trim().replace(/\/+$/, '');
  return trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
}
const APP_URL = normalizeUrl(process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL, 'http://localhost:3000');
const MARKETING_URL = normalizeUrl(process.env.NEXT_PUBLIC_MARKETING_URL || process.env.NEXT_PUBLIC_SITE_URL, 'http://localhost:3000');

/**
 * Unified Middleware
 *
 * 1. CORS - Cross-subdomain RSC requests (www <-> app)
 * 2. Subdomain Routing - Direct traffic between marketing/app sites
 * 3. Referral Tracking - Capture ?ref= codes
 * 4. Admin Protection - Email whitelist for /admin routes
 * 5. Auth Guards - Protected routes & auth page redirects
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

// CORS: Allowed origins for cross-subdomain requests
const ALLOWED_ORIGINS = [
  'https://www.quantumstrategies.online',
  'https://quantumstrategies.online',
  'https://app.quantumstrategies.online',
];

// Admin: Emails that can access /admin routes
const ADMIN_EMAILS = [
  'santos.93.aus@gmail.com',
  'austin@quantumstrategies.online',
];

// Admin: Set ADMIN_DISABLED=true in production to hide admin entirely
const ADMIN_DISABLED = process.env.ADMIN_DISABLED === 'true';

// Subdomain routing configuration
function getHostname(url: string): string {
  const withScheme = url.startsWith('http') ? url : `https://${url}`;
  try {
    return new URL(withScheme).hostname;
  } catch {
    return 'localhost';
  }
}
const appHost = getHostname(APP_URL);
const marketingHost = getHostname(MARKETING_URL);
const hasSubdomainSplit = appHost !== marketingHost;

// Paths that belong to the app subdomain
const appAuthPaths = ['/login', '/signup', '/forgot-password', '/reset-password'];
const appPrefixes = ['/dashboard', '/admin'];
const appExactPaths = ['/products/personal-alignment/interact'];

// Protected paths requiring authentication
const protectedPathPatterns = ['/dashboard', '/products/*/experience', '/products/*/interact'];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function isMarketingHost(hostname: string): boolean {
  return hostname === marketingHost || hostname === `www.${marketingHost}`;
}

function isAppPath(pathname: string): boolean {
  if (appAuthPaths.includes(pathname)) return true;
  if (appExactPaths.includes(pathname)) return true;
  if (appPrefixes.some((prefix) => pathname.startsWith(prefix))) return true;
  if (/^\/products\/[^/]+\/experience\/?$/.test(pathname)) return true;
  return false;
}

function isProtectedPath(pathname: string): boolean {
  return protectedPathPatterns.some(pattern => {
    const regex = new RegExp(`^${pattern.replace(/\*/g, '[^/]+')}`)
    return regex.test(pathname);
  });
}

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

function createSupabaseClient(request: NextRequest, response: NextResponse) {
  return createServerClient(
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
}

// ============================================================================
// MIDDLEWARE
// ============================================================================

export async function middleware(request: NextRequest) {
  const hostname = request.nextUrl.hostname;
  const { pathname, search } = request.nextUrl;
  const origin = request.headers.get('origin');

  // -------------------------------------------------------------------------
  // 1. CORS PREFLIGHT
  // -------------------------------------------------------------------------
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 });
    return addCorsHeaders(response, origin);
  }

  // -------------------------------------------------------------------------
  // 2. SUBDOMAIN ROUTING
  // -------------------------------------------------------------------------
  if (hasSubdomainSplit) {
    // On app subdomain: redirect non-app paths to marketing
    if (hostname === appHost) {
      if (pathname === '/') {
        return NextResponse.redirect(new URL(`${APP_URL}/login`), 308);
      }
      if (!isAppPath(pathname)) {
        return NextResponse.redirect(new URL(`${MARKETING_URL}${pathname}${search}`), 308);
      }
    }

    // On marketing subdomain: redirect app paths to app subdomain
    if (isMarketingHost(hostname)) {
      if (isAppPath(pathname)) {
        return NextResponse.redirect(new URL(`${APP_URL}${pathname}${search}`), 308);
      }
    }
  }

  // -------------------------------------------------------------------------
  // 3. CREATE RESPONSE & SUPABASE CLIENT
  // -------------------------------------------------------------------------
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createSupabaseClient(request, response);
  const { data: { session } } = await supabase.auth.getSession();

  // -------------------------------------------------------------------------
  // 4. REFERRAL CODE CAPTURE
  // -------------------------------------------------------------------------
  const referralCode = request.nextUrl.searchParams.get('ref');
  if (referralCode) {
    const { data: referralExists } = await supabase
      .from('referral_hierarchy')
      .select('id')
      .eq('referral_code', referralCode)
      .single();

    if (referralExists) {
      response.cookies.set('referral_code', referralCode, {
        maxAge: 30 * 24 * 60 * 60, // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
    }
  }

  // -------------------------------------------------------------------------
  // 5. ADMIN ROUTE PROTECTION
  // -------------------------------------------------------------------------
  if (pathname.startsWith('/admin')) {
    if (ADMIN_DISABLED) {
      return NextResponse.rewrite(new URL('/not-found', request.url));
    }

    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const email = session.user.email?.toLowerCase() || '';
    if (!ADMIN_EMAILS.includes(email)) {
      const dashboardUrl = new URL('/dashboard', request.url);
      dashboardUrl.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(dashboardUrl);
    }

    return addCorsHeaders(response, origin);
  }

  // -------------------------------------------------------------------------
  // 6. PROTECTED ROUTE AUTHENTICATION
  // -------------------------------------------------------------------------
  if (isProtectedPath(pathname) && !session) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // -------------------------------------------------------------------------
  // 7. AUTH PAGE REDIRECTS (already logged in)
  // -------------------------------------------------------------------------
  if (session && (pathname === '/login' || pathname === '/signup')) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = '/dashboard';
    return NextResponse.redirect(dashboardUrl);
  }

  // -------------------------------------------------------------------------
  // 8. RETURN WITH CORS HEADERS
  // -------------------------------------------------------------------------
  return addCorsHeaders(response, origin);
}

// ============================================================================
// MATCHER CONFIG
// ============================================================================

export const config = {
  matcher: [
    // Match all paths except static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
