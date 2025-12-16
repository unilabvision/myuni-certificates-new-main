'use client';

import { usePathname } from 'next/navigation';
import Header from "./header/Header";
import Footer from "./Footer";
import BackToTop from "./BackToTop";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

// System routes that should show header and footer
const systemRoutes = [
  'hakkimizda', 'about', 'kurs', 'course', 'watch', 'kariyer', 'career',
  'iletisim', 'contact', 'blog', 'soon', 'projelerimiz', 'projects',
  'egitmen-ol', 'search', 'gizlilik', 'privacy', 'bultenimiz', 'newsletter',
  'sartlar-ve-kosullar', 'terms', 'dashboard', 'profile', 'member',
  'temsilcilik', 'checkout', 'payment-success', 'payment-failed',
  'sign-in', 'sign-up', 'login', 'forgot-password', 'verify-email',
  'sso-callback', 'complete-profile', 'auth', '404', 'deneme',
  'representative', 'demo-talep', 'fiyatlandirma'
];

// Function to check if a route could be a profile slug
function isProfileSlug(pathname: string): boolean {
  // Check if it's a slug pattern
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length !== 1) return false;
  
  const slug = parts[0];
  
  // Must be a reasonable slug format (alphanumeric, hyphens, underscores, 3-50 chars)
  if (!/^[a-zA-Z0-9-_]{3,50}$/.test(slug)) return false;
  
  return !systemRoutes.includes(slug.toLowerCase());
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  
  const isAdminPage = 
    pathname?.includes('/dashboard') ||
    pathname?.includes('/admin')
    
  const isWatchPage = pathname?.includes('/watch/');
  
  // Check if current page is a profile page (like john-doe)
  const isProfilePage = pathname ? isProfileSlug(pathname) : false;

  // Check if current page is an organization page (like /organization or /organization/certificate)
  const pathSegments = pathname?.split('/').filter(Boolean) || [];
  const isOrganizationPage = pathSegments.length >= 1 && 
    pathSegments.length <= 2 && 
    !systemRoutes.includes(pathSegments[0]?.toLowerCase());

  // Don't show header/footer on admin, watch, profile, or organization pages
  const shouldShowHeader = !isAdminPage && !isWatchPage && !isProfilePage && !isOrganizationPage;
  const shouldShowFooter = !isAdminPage && !isWatchPage && !isProfilePage && !isOrganizationPage;
  const shouldShowBackToTop = !isAdminPage && !isProfilePage;

  return (
    <div className="flex flex-col min-h-screen">
      {shouldShowHeader && <Header />}
      <div className={`flex-grow ${shouldShowHeader ? 'mt-[75px]' : ''}`}>
        {children}
      </div>
      {shouldShowFooter && <Footer />}
      {shouldShowBackToTop && <BackToTop />}
    </div>
  );
}