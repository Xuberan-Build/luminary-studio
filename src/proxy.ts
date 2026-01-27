import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { APP_URL, MARKETING_URL } from '@/lib/config/urls';

const appHost = new URL(APP_URL).hostname;
const marketingHost = new URL(MARKETING_URL).hostname;

const appAuthPaths = ['/login', '/signup', '/forgot-password', '/reset-password'];
const appPrefixes = ['/dashboard'];
const appExactPaths = ['/products/personal-alignment/interact'];

function isAppPath(pathname: string): boolean {
  if (appAuthPaths.includes(pathname)) return true;
  if (appExactPaths.includes(pathname)) return true;
  if (appPrefixes.some((prefix) => pathname.startsWith(prefix))) return true;
  if (/^\/products\/[^/]+\/experience\/?$/.test(pathname)) return true;
  return false;
}

export async function proxy(req: NextRequest) {
  const hostname = req.nextUrl.hostname;
  const { pathname, search } = req.nextUrl;

  if (hostname === appHost) {
    if (pathname === '/') {
      return NextResponse.redirect(new URL(`${APP_URL}/login`), 308);
    }

    if (!isAppPath(pathname)) {
      return NextResponse.redirect(new URL(`${MARKETING_URL}${pathname}${search}`), 308);
    }
  }

  if (hostname === marketingHost) {
    if (isAppPath(pathname)) {
      return NextResponse.redirect(new URL(`${APP_URL}${pathname}${search}`), 308);
    }
  }

  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Capture referral code from URL (?ref=ABC123)
  const referralCode = req.nextUrl.searchParams.get('ref');
  if (referralCode) {
    // Validate referral code exists in database
    const { data: referralExists } = await supabase
      .from('referral_hierarchy')
      .select('id')
      .eq('referral_code', referralCode)
      .single();

    if (referralExists) {
      // Store in cookie (30-day expiry)
      res.cookies.set('referral_code', referralCode, {
        maxAge: 30 * 24 * 60 * 60, // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
      console.log('Referral code captured:', referralCode);
    } else {
      console.log('Invalid referral code:', referralCode);
    }
  }

  // Protected routes that require authentication
  const protectedPaths = ['/dashboard', '/products/*/experience', '/products/*/interact'];
  const isProtectedPath = protectedPaths.some(path => {
    // Convert wildcard pattern to regex for matching
    const pattern = path.replace(/\*/g, '[^/]+');
    return new RegExp(`^${pattern}`).test(req.nextUrl.pathname);
  });

  // Redirect to login if not authenticated
  if (hostname === appHost && isProtectedPath && !session) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirect', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect to dashboard if already logged in and trying to access auth pages
  if (
    hostname === appHost &&
    session &&
    (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/signup')
  ) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/dashboard';
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
