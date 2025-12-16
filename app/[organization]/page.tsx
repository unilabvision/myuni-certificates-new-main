//app/[organization]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowRight, Globe } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import OrganizationHeader from '../components/header/OrganizationHeader';
import OrganizationFooter from '../components/header/OrganizationFooter';

interface Organization {
  slug: string;
  name: string;
  description?: string;
  logo?: string;
  primary_color?: string;
  secondary_color?: string;
  website?: string;
}

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

export default function OrganizationSearchPage() {
  const params = useParams();
  const router = useRouter();
  const organization = params.organization as string;
  const [orgData, setOrgData] = useState<Organization | null>(null);
  const [certificatenumber, setCertificatenumber] = useState('');
  const [searchName, setSearchName] = useState('');
  const [activeTab, setActiveTab] = useState<'number' | 'name'>('number');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [orgColor, setOrgColor] = useState('#990000');
  const [isLoaded, setIsLoaded] = useState(false);

  // Animation için delay
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    async function fetchOrganizationData() {
      if (!organization) {
        setError('Organizasyon bilgisi eksik.');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching organization data for:', organization);
        
        // Debug: Tüm organizasyonları listele
        const { data: allOrgs, error: listError } = await supabase
          .from('organizations')
          .select('slug, name');
        
        if (!listError) {
          console.log('Available organizations in database:', allOrgs);
        }
        
        const { data, error: orgError } = await supabase
          .from('organizations')
          .select('slug, name, description, logo, primary_color, secondary_color, website')
          .eq('slug', organization.trim())
          .single();

        console.log('Organization query result:', { data, error: orgError });
        console.log('Organization slug being searched:', organization.trim());
        console.log('Supabase query details:', {
          table: 'organizations',
          select: 'slug, name, description, logo, primary_color, secondary_color, website',
          where: `slug = '${organization.trim()}'`
        });

        if (orgError || !data) {
          console.error('Organization not found:', orgError);
          console.error('Organization slug not found in database:', organization.trim());
          
          // Check if this might be a certificate number instead of organization slug
          if (looksLikeCertificateNumber(organization.trim())) {
            console.log('🔍 Organization not found, but looks like certificate number. Checking...');
            
            try {
              // Try to find the organization for this certificate
              const { data: certData, error: certError } = await supabase
                .from('certificates')
                .select('organization_slug')
                .eq('certificatenumber', organization.trim())
                .single();
              
              if (certData && !certError && certData.organization_slug) {
                console.log('✅ Found organization for certificate, redirecting:', {
                  certificate: organization,
                  organization: certData.organization_slug
                });
                
                // Redirect to the correct URL
                router.replace(`/${certData.organization_slug}/${organization}`);
                return;
              } else {
                console.log('❌ No organization found for certificate:', organization);
              }
            } catch (certErr) {
              console.error('Error checking certificate:', certErr);
            }
          }
          
          setError('Organizasyon bulunamadı.');
          setLoading(false);
          return;
        }

        setOrgData(data);
        
        // Organizasyon rengini ayarla
        if (data.primary_color) {
          setOrgColor(data.primary_color);
          document.documentElement.style.setProperty('--org-primary', data.primary_color);
        }
        if (data.secondary_color) {
          document.documentElement.style.setProperty('--org-secondary', data.secondary_color);
        }
        
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Veri alınırken bir hata oluştu: ' + (err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    fetchOrganizationData();
  }, [organization, router]);

  const handleVerify = async () => {
    if (certificatenumber.trim()) {
      setIsSearching(true);
      try {
        const { data, error } = await supabase
          .from('certificates')
          .select('organization_slug, certificatenumber')
          .eq('certificatenumber', certificatenumber.trim())
          .eq('organization_slug', organization.trim())
          .single();

        if (error || !data) {
          alert('Sertifika bulunamadı.');
          return;
        }

        router.push(`/${organization}/${certificatenumber}`);
      } catch {
        alert('Sertifika sorgulanırken bir hata oluştu.');
      } finally {
        setIsSearching(false);
      }
    }
  };

  const handleNameSearch = () => {
    if (searchName.trim()) {
      router.push(`/${organization}/search?name=${encodeURIComponent(searchName.trim())}`);
    } else {
      router.push(`/${organization}/search`);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      if (activeTab === 'number') {
        handleVerify();
      } else {
        handleNameSearch();
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-neutral-900">
        <div className="max-w-8xl mx-auto py-16">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="relative text-center">
              <div className="w-8 h-8 border-2 border-gray-200 dark:border-gray-700 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: orgColor, borderTopColor: 'transparent' }}></div>
              <p className="text-gray-500 dark:text-gray-400">Organizasyon bilgileri yükleniyor...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !orgData) {
    return (
      <div className="bg-white dark:bg-neutral-900 flex items-center justify-center">
        <div className="max-w-lg mx-auto text-center bg-white dark:bg-neutral-800 shadow-sm border border-neutral-200 dark:border-neutral-700 p-8">
          <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" style={{ color: orgColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-medium text-neutral-900 dark:text-neutral-100 mb-3">Organizasyon Bulunamadı</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed">
            {error || 'Aradığınız organizasyon mevcut değil. Lütfen URL\'yi kontrol edin.'}
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-8 py-3 text-white font-medium hover:opacity-90 transition-colors"
            style={{ backgroundColor: orgColor }}
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Soft Organization Color Background */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-white via-neutral-50 to-white dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900"
        style={{
          background: `linear-gradient(135deg, 
            ${orgColor}02 0%, 
            transparent 20%, 
            ${orgColor}03 40%, 
            transparent 60%, 
            ${orgColor}02 80%, 
            transparent 100%
          )`
        }}
      ></div>
      
      {/* Subtle Moving Gradient */}
      <div 
        className="absolute inset-0 opacity-60 dark:opacity-30 animate-gradient-flow"
        style={{
          background: `linear-gradient(45deg, 
            ${orgColor}05 0%, 
            transparent 30%, 
            ${orgColor}08 50%, 
            transparent 70%, 
            ${orgColor}05 100%
          )`
        }}
      ></div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <OrganizationHeader />
        
        {/* Main Content - Soft & Minimal */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 pt-48 sm:pt-80 lg:pt-96 pb-16 sm:pb-20">
          <div className="w-full max-w-sm sm:max-w-2xl lg:max-w-3xl mx-auto">
            
            {/* Main Heading */}
            <div className={`text-center mb-8 sm:mb-12 lg:mb-16 transition-all duration-1200 ease-out ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light text-neutral-800 dark:text-neutral-200 mb-2 sm:mb-3 tracking-wide px-4 sm:px-0">
                Sertifikanızı nasıl doğrulayabilirim?
              </h2>
            </div>

            {/* Search Input - Soft Style */}
            <div className={`max-w-full sm:max-w-2xl mx-auto mb-8 sm:mb-12 transition-all duration-1200 ease-out delay-300 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              <div className="relative">
                <input
                  type="text"
                  value={activeTab === 'number' ? certificatenumber : searchName}
                  onChange={(e) => activeTab === 'number' ? setCertificatenumber(e.target.value) : setSearchName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={activeTab === 'number' ? "Sertifika numaranızı giriniz..." : "Ad veya soyad giriniz..."}
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base border border-neutral-200 dark:border-neutral-700 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-1 focus:border-transparent transition-all duration-500 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm text-neutral-700 dark:text-neutral-300 placeholder-neutral-400 dark:placeholder-neutral-500 pr-12 sm:pr-16 shadow-sm hover:shadow-md focus:shadow-lg"
                  style={{ 
                    '--tw-ring-color': `${orgColor}30`
                  } as React.CSSProperties}
                />
                <button
                  onClick={activeTab === 'number' ? handleVerify : handleNameSearch}
                  disabled={!((activeTab === 'number' ? certificatenumber : searchName).trim()) || isSearching}
                  className="absolute right-2 sm:right-2 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 rounded-lg sm:rounded-xl font-medium transition-all duration-500 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                  style={{ backgroundColor: orgColor + 'E6' }}
                >
                  {isSearching ? (
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Quick Action Buttons - Soft Pills */}
            <div className={`flex flex-col sm:flex-row flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-12 transition-all duration-1200 ease-out delay-600 px-4 sm:px-0 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              <button
                onClick={() => setActiveTab('number')}
                className={`w-full sm:w-auto px-4 sm:px-5 py-2.5 rounded-full text-sm font-normal transition-all duration-400 ${
                  activeTab === 'number'
                    ? 'text-white shadow-md'
                    : 'text-neutral-600 dark:text-neutral-400 bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm border border-neutral-200 dark:border-neutral-700 hover:bg-white/80 dark:hover:bg-neutral-800/80 hover:shadow-sm'
                }`}
                style={activeTab === 'number' ? { backgroundColor: orgColor + 'E6' } : {}}
              >
                Sertifika Numarası
              </button>
              <button
                onClick={() => setActiveTab('name')}
                className={`w-full sm:w-auto px-4 sm:px-5 py-2.5 rounded-full text-sm font-normal transition-all duration-400 ${
                  activeTab === 'name'
                    ? 'text-white shadow-md'
                    : 'text-neutral-600 dark:text-neutral-400 bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm border border-neutral-200 dark:border-neutral-700 hover:bg-white/80 dark:hover:bg-neutral-800/80 hover:shadow-sm'
                }`}
                style={activeTab === 'name' ? { backgroundColor: orgColor + 'E6' } : {}}
              >
                İsim ile Arama
              </button>
              {orgData.website && (
                <a
                  href={orgData.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-4 sm:px-5 py-2.5 rounded-full text-sm font-normal transition-all duration-400 text-neutral-600 dark:text-neutral-400 bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm border border-neutral-200 dark:border-neutral-700 hover:bg-white/80 dark:hover:bg-neutral-800/80 hover:shadow-sm inline-flex items-center justify-center gap-2"
                >
                  <Globe className="w-4 h-4" />
                  Web Sitesi
                </a>
              )}
            </div>

            {/* Info Text */}
            <div className={`text-center max-w-xs sm:max-w-xl mx-auto mb-16 sm:mb-20 transition-all duration-1200 ease-out delay-900 px-4 sm:px-0 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              <p className="text-neutral-500 dark:text-neutral-400 text-xs sm:text-sm leading-relaxed">
                {activeTab === 'name'
                  ? 'İsim ile arama sonucunda doğrulama için ek bilgi gerekebilir'
                  : 'Sertifika numaranızı girerek anında doğrulama yapabilirsiniz'}
              </p>
            </div>

          </div>
        </div>

        <OrganizationFooter />
      </div>

      {/* Minimal CSS Animations */}
      <style jsx>{`
        @keyframes gradient-flow {
          0%, 100% {
            transform: translateX(-10%) translateY(-10%) rotate(0deg);
          }
          25% {
            transform: translateX(10%) translateY(-5%) rotate(1deg);
          }
          50% {
            transform: translateX(5%) translateY(10%) rotate(-1deg);
          }
          75% {
            transform: translateX(-5%) translateY(5%) rotate(0.5deg);
          }
        }
        
        .animate-gradient-flow {
          animation: gradient-flow 25s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}