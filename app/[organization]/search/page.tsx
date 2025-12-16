// app/[organization]/search/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Search, User, Calendar, Award, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import OrganizationHeader from '../../components/header/OrganizationHeader';
import OrganizationFooter from '../../components/header/OrganizationFooter';

interface Certificate {
  id: number;
  fullname: string;
  coursename: string;
  certificatenumber: string;
  issuedate: string;
  organization?: string;
  organization_slug?: string;
  instructor?: string;
}

interface Organization {
  slug: string;
  name: string;
  description?: string;
  logo?: string;
  primary_color?: string;
  secondary_color?: string;
  website?: string;
}

export default function NameSearchPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const organization = params.organization as string;
  const nameQuery = searchParams.get('name') || '';

  const [orgData, setOrgData] = useState<Organization | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [searchName, setSearchName] = useState(nameQuery);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orgColor, setOrgColor] = useState('#990000');
  const [verificationCode, setVerificationCode] = useState('');
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [showVerification, setShowVerification] = useState(false);

  // İsim maskeleme fonksiyonu
  const maskName = (fullname: string) => {
    if (!fullname) return '';
    
    const names = fullname.trim().split(' ');
    const maskedNames = names.map(name => {
      if (name.length <= 3) {
        return name; // 3 karakter veya daha kısa isimleri olduğu gibi göster
      }
      return name.substring(0, 3) + '*'.repeat(name.length - 3);
    });
    
    return maskedNames.join(' ');
  };

  useEffect(() => {
    async function fetchOrganizationData() {
      if (!organization) {
        setError('Organizasyon bilgisi eksik.');
        setLoading(false);
        return;
      }

      try {
        const { data, error: orgError } = await supabase
          .from('organizations')
          .select('slug, name, description, logo, primary_color, secondary_color, website')
          .eq('slug', organization.trim())
          .single();

        if (orgError || !data) {
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
        
        // Eğer URL'de isim varsa otomatik arama yap
        if (nameQuery.trim()) {
          await searchCertificates(nameQuery);
        }
        
      } catch (err) {
        setError('Veri alınırken bir hata oluştu: ' + (err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    fetchOrganizationData();
  }, [organization, nameQuery]);

  const searchCertificates = async (name: string) => {
    if (!name.trim()) return;

    setSearching(true);
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('id, fullname, coursename, certificatenumber, issuedate, organization, organization_slug, instructor')
        .eq('organization_slug', organization.trim())
        .ilike('fullname', `%${name.trim()}%`)
        .order('issuedate', { ascending: false });

      if (error) {
        console.error('Search error:', error);
        setError('Arama sırasında bir hata oluştu.');
        return;
      }

      setCertificates(data || []);
      
      // URL'yi güncelle
      const newUrl = `/${organization}/search?name=${encodeURIComponent(name.trim())}`;
      window.history.replaceState(null, '', newUrl);
      
    } catch (err) {
      console.error('Search error:', err);
      setError('Arama sırasında bir hata oluştu.');
    } finally {
      setSearching(false);
    }
  };

  const handleSearch = async () => {
    await searchCertificates(searchName);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleVerification = (cert: Certificate) => {
    setSelectedCert(cert);
    setShowVerification(true);
    setVerificationCode('');
  };

  const handleVerificationSubmit = () => {
    if (!selectedCert || !verificationCode.trim()) {
      alert('Lütfen doğrulama kodunu giriniz.');
      return;
    }

    // Son 6 haneyi kontrol et
    const certNumber = selectedCert.certificatenumber;
    const lastSix = certNumber.slice(-6);
    
    if (verificationCode.trim().toUpperCase() === lastSix.toUpperCase()) {
      router.push(`/${organization}/${certNumber}`);
    } else {
      alert('Doğrulama kodu hatalı. Lütfen sertifika numarasının son 6 hanesini giriniz.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-900">
        <OrganizationHeader />
        <div className="h-[60px]"></div>
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="relative text-center">
              <div className="animate-spin w-8 h-8 border-2 border-neutral-200 dark:border-neutral-700 rounded-full mx-auto mb-4" style={{ borderTopColor: orgColor }}></div>
              <p className="text-neutral-600 dark:text-neutral-400">Yükleniyor...</p>
            </div>
          </div>
        </div>
        <OrganizationFooter />
      </div>
    );
  }

  if (error || !orgData) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-900">
        <OrganizationHeader />
        <div className="h-[60px]"></div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="max-w-lg mx-auto text-center bg-white dark:bg-neutral-800 shadow-sm border border-neutral-200 dark:border-neutral-700 p-8">
            <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" style={{ color: orgColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-medium text-neutral-900 dark:text-neutral-100 mb-3">Hata</h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed">
              {error || 'Bir hata oluştu.'}
            </p>
            <Link
              href={`/${organization}`}
              className="inline-flex items-center justify-center px-8 py-3 text-white font-medium hover:opacity-90 transition-colors"
              style={{ backgroundColor: orgColor }}
            >
              Geri Dön
            </Link>
          </div>
        </div>
        <OrganizationFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900">
      <OrganizationHeader />
      <div className="h-[60px]"></div>
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Başlık */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4 text-sm">
            <Link
              href={`/${organization}`}
              className="font-medium hover:underline"
              style={{ color: orgColor }}
            >
              {orgData.name}
            </Link>
            <span className="text-neutral-400">/</span>
            <span className="text-neutral-600 dark:text-neutral-400">İsim ile Arama</span>
          </div>
          
          <h1 className="text-2xl font-medium text-neutral-900 dark:text-neutral-100 mb-2">
            {orgData.name} Sertifika Arama
          </h1>
          
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            İsim ile arama yapın ve sertifikalarınızı bulun.
          </p>
        </div>

        {/* Arama Formu */}
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg mb-8">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ad veya soyad giriniz..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-600 focus:border-gray-400 dark:focus:border-gray-500 transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  disabled={searching}
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={searching}
                className="px-6 py-3 text-white font-medium rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                style={{ backgroundColor: orgColor }}
              >
                {searching ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                    Aranıyor...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Ara
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Sonuçlar */}
        {certificates.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
              {certificates.length} sertifika bulundu
            </h2>
            
            <div className="grid gap-4">
              {certificates.map((cert) => (
                <div key={cert.id} className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="flex items-start gap-3">
                          <User className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: orgColor }} />
                          <div>
                            <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1">Sertifika Sahibi</h4>
                            <p className="text-neutral-600 dark:text-neutral-400">{maskName(cert.fullname)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <Award className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: orgColor }} />
                          <div>
                            <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1">Program</h4>
                            <p className="text-neutral-600 dark:text-neutral-400">{cert.coursename}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <Calendar className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: orgColor }} />
                          <div>
                            <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1">Veriliş Tarihi</h4>
                            <p className="text-neutral-600 dark:text-neutral-400">{formatDate(cert.issuedate)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleVerification(cert)}
                        className="flex items-center gap-2 px-4 py-2 text-white font-medium rounded-lg hover:opacity-90 transition-colors"
                        style={{ backgroundColor: orgColor }}
                      >
                        <Eye className="w-4 h-4" />
                        Görüntüle
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : searchName.trim() && !searching ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center mx-auto mb-4 rounded-full">
              <Search className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
              Sertifika bulunamadı
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              &quot;{searchName}&quot; için herhangi bir sertifika bulunamadı.
            </p>
          </div>
        ) : null}

        {/* Doğrulama Modal */}
        {showVerification && selectedCert && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-4">
                Sertifika Doğrulama
              </h3>
              
              <div className="mb-4">
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                  <strong>{maskName(selectedCert.fullname)}</strong> - {selectedCert.coursename}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-500">
                  Güvenlik için sertifika numarasının son 6 hanesini giriniz.
                </p>
              </div>
              
              <div className="mb-6">
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Son 6 hane..."
                  className="w-full px-4 py-3 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:focus:ring-neutral-700 transition-all text-center font-mono"
                  maxLength={6}
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowVerification(false)}
                  className="flex-1 px-4 py-2 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 font-medium rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleVerificationSubmit}
                  className="flex-1 px-4 py-2 text-white font-medium rounded-lg hover:opacity-90 transition-colors"
                  style={{ backgroundColor: orgColor }}
                >
                  Doğrula
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <OrganizationFooter />
    </div>
  );
}