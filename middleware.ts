// middleware.ts (root dizinde)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Middleware için Supabase client (service key kullanılıyor)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Function to check if a string looks like a certificate number
function looksLikeCertificateNumber(slug: string): boolean {
  // Certificate numbers typically have patterns like:
  // - BCOM2024-697493-6EBE-F52-684C
  // - Contains letters, numbers, and hyphens
  // - Usually longer than typical organization slugs
  // - Often contains year patterns (like 2024)
  
  if (slug.length < 10) return false; // Too short to be a certificate number
  
  // Check for common certificate patterns
  const hasYearPattern = /\d{4}/.test(slug); // Contains 4-digit year
  const hasHyphens = slug.includes('-');
  const hasMixedChars = /[a-zA-Z]/.test(slug) && /\d/.test(slug);
  
  // If it has year pattern and hyphens, likely a certificate number
  if (hasYearPattern && hasHyphens) return true;
  
  // If it's long and has mixed characters, could be a certificate number
  if (slug.length > 15 && hasMixedChars) return true;
  
  return false;
}

// Helper function to check if path matches patterns
function pathMatches(pathname: string, patterns: string[]): boolean {
  return patterns.some(pattern => {
    if (pattern.endsWith('(.*)')) {
      const prefix = pattern.slice(0, -4);
      return pathname.startsWith(prefix);
    }
    return pathname === pattern;
  });
}

// Public routes that are accessible to everyone
const publicRoutes = [
  '/',
  '/hakkimizda(.*)',
  '/deneme(.*)',
  '/kariyer(.*)',
  '/iletisim(.*)',
  '/kurs(.*)',
  '/contact(.*)',
  '/blog(.*)',
  '/gizlilik(.*)',
  '/privacy(.*)',
  '/projelerimiz(.*)',
  '/projects(.*)',
  '/bultenimiz(.*)',
  '/newsletter(.*)',
  '/sartlar-ve-kosullar(.*)',
  '/terms(.*)',
  '/search(.*)',
  '/soon(.*)',
  '/temsilcilik(.*)',
  '/representative(.*)',
  '/egitmen-ol(.*)',
  '/demo-talep(.*)',
  '/fiyatlandirma(.*)',
  // API routes
  '/api/public(.*)',
  '/api/sitemap.xml',
  '/api/robots.txt',
  '/api/search',
  '/api/contact',
  '/api/demo-request',
  '/api/newsletter',
  '/api/content',
  // Static files
  '/sitemap.xml',
  '/404',
  '/robots.txt',
];

// Auth routes - these are for authentication flows
const authRoutes = [
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/login(.*)',
  '/forgot-password',
  '/verify-email',
  '/sso-callback',
  '/complete-profile',
];

// Payment-related routes
const paymentRoutes = [
  '/checkout(.*)',
  '/payment-success(.*)',
  '/payment-failed(.*)',
  '/api/shopier-payment',
  '/api/shopier-callback',
  '/api/shopier-return',
];

// Known static/system routes
const knownRoutes = [
  ...publicRoutes,
  ...authRoutes,
  ...paymentRoutes,
  '/watch(.*)',
  '/dashboard(.*)',
  '/profile(.*)',
  '/member(.*)',
  '/api(.*)',
];

// Function to check if a route could be a profile slug or certificate route
function couldBeProfileSlug(pathname: string): boolean {
  const parts = pathname.split('/').filter(Boolean);
  
  // Single segment - could be profile slug
  if (parts.length === 1) {
    const slug = parts[0];
    
    // Must be a reasonable slug format
    if (!/^[a-zA-Z0-9-_]+$/.test(slug)) return false;
    
    // Exclude known system routes
    const systemRoutes = [
      'hakkimizda', 'about', 'kurs', 'course', 'watch', 'kariyer', 'career',
      'iletisim', 'contact', 'blog', 'soon', 'projelerimiz', 'projects',
      'egitmen-ol', 'search', 'gizlilik', 'privacy', 'bultenimiz', 'newsletter',
      'sartlar-ve-kosullar', 'terms', 'dashboard', 'profile', 'member',
      'temsilcilik', 'checkout', 'payment-success', 'payment-failed',
      'sign-in', 'sign-up', 'login', 'forgot-password', 'verify-email',
      'sso-callback', 'complete-profile', 'auth', '404', 'deneme',
      'demo-talep', 'fiyatlandirma'
    ];
    
    return !systemRoutes.includes(slug);
  }
  
  // Two segments - could be organization/certificate route
  if (parts.length === 2) {
    const [orgSlug, certNumber] = parts;
    
    // Organization slug must be valid
    if (!/^[a-zA-Z0-9-_]+$/.test(orgSlug)) return false;
    
    // Certificate number must be valid format
    if (!/^[a-zA-Z0-9-_]+$/.test(certNumber)) return false;
    
    // Exclude known system routes for organization slug
    const systemRoutes = [
      'hakkimizda', 'about', 'kurs', 'course', 'watch', 'kariyer', 'career',
      'iletisim', 'contact', 'blog', 'soon', 'projelerimiz', 'projects',
      'egitmen-ol', 'search', 'gizlilik', 'privacy', 'bultenimiz', 'newsletter',
      'sartlar-ve-kosullar', 'terms', 'dashboard', 'profile', 'member',
      'temsilcilik', 'checkout', 'payment-success', 'payment-failed',
      'sign-in', 'sign-up', 'login', 'forgot-password', 'verify-email',
      'sso-callback', 'complete-profile', 'auth', '404', 'deneme',
      'demo-talep', 'fiyatlandirma'
    ];
    
    return !systemRoutes.includes(orgSlug);
  }
  
  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ana sayfa için /en yönlendirmesini engelle
  if (pathname === '/') {
    return NextResponse.next();
  }

  // /en yönlendirmesini engelle - ana sayfaya yönlendir
  if (pathname === '/en') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Course-preview route'larını özel olarak handle et
  if (pathname.startsWith('/course-preview/')) {
    console.log('🔄 Course preview route detected, allowing through for rewrite');
    return NextResponse.next();
  }

  // Allow certificate number patterns to pass through
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 1) {
    const slug = parts[0];
    
    // Check if this looks like a certificate number
    if (looksLikeCertificateNumber(slug)) {
      console.log('🔍 Potential certificate number detected, finding organization:', slug);
      
      // Return immediately but trigger async redirect search
      return handleCertificateRedirect(request, slug);
    }
  }

  const response = NextResponse.next();

  // Debug logging for development
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Middleware Debug:', {
      pathname,
      isKnownRoute: pathMatches(pathname, knownRoutes),
      isPublicRoute: pathMatches(pathname, publicRoutes),
      isAuthRoute: pathMatches(pathname, authRoutes),
      isPaymentRoute: pathMatches(pathname, paymentRoutes),
      couldBeProfileSlug: couldBeProfileSlug(pathname),
    });
  }

  // Handle robots.txt
  if (pathname === '/robots.txt') {
    const robotsTxt = process.env.NODE_ENV === 'production' 
      ? `User-agent: *\nAllow: /\nSitemap: ${process.env.NEXT_PUBLIC_SITE_URL}/sitemap.xml`
      : `User-agent: *\nDisallow: /`;
    
    return new NextResponse(robotsTxt, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }

  // Check if it's a known route first
  if (!pathMatches(pathname, knownRoutes)) {
    // If not a known route, check if it could be a profile slug
    if (couldBeProfileSlug(pathname)) {
      console.log('✅ Allowing access to potential profile slug:', pathname);
      return response;
    } else {
      console.log('❌ Invalid route detected:', pathname);
      return NextResponse.redirect(new URL('/404', request.url));
    }
  }

  // Special handling for payment routes
  if (pathMatches(pathname, paymentRoutes)) {
    // Shopier API endpoints should always be accessible (webhooks)
    if (pathname.startsWith('/api/shopier-')) {
      console.log('✅ Allowing access to Shopier API endpoint');
      return response;
    }
    
    // Payment success/failed pages should be accessible
    if (pathname.includes('/payment-success') || pathname.includes('/payment-failed')) {
      console.log('✅ Allowing access to payment result page');
      return response;
    }
  }

  // Public routes are always allowed
  if (pathMatches(pathname, publicRoutes)) {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Allowing access to public route');
    }
    return response;
  }

  // For any other routes, continue without auth requirement
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Allowing access to other route');
  }
  return response;
}

// Handle certificate number redirect
async function handleCertificateRedirect(request: NextRequest, certificateNumber: string) {
  try {
    console.log('🔎 Searching for organization for certificate:', certificateNumber);
    
    // Veritabanından sertifika numarasına ait organizasyonu bul
    const { data, error } = await supabaseAdmin
      .from('certificates')
      .select('organization_slug')
      .eq('certificatenumber', certificateNumber)
      .single();

    if (error || !data?.organization_slug) {
      console.log('⚠️ Certificate not found, allowing through for normal handling:', certificateNumber);
      // Eğer sertifika bulunamazsa, normal işleme devam et (sayfa kendisi hata gösterecek)
      return NextResponse.next();
    }

    const organizationSlug = data.organization_slug;
    const redirectUrl = new URL(`/${organizationSlug}/${certificateNumber}`, request.url);
    
    console.log('🎯 Redirecting to:', redirectUrl.pathname);
    return NextResponse.redirect(redirectUrl);
    
  } catch (error) {
    console.error('❌ Error in certificate redirect:', error);
    // Hata durumunda normal işleme devam et
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    // - public folder files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};