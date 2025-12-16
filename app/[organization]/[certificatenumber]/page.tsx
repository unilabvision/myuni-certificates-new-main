'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Download, Share2, Mail, Linkedin, FileImage, FileText, Image as ImageIcon, User, Award, ArrowRight, GraduationCap, Shield } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { generateCertificateCanvas } from '../../utils/certificateGenerator';
import SpecialCertificatePage from '../../components/SpecialCertificatePage';
import OrganizationHeader from '../../components/header/OrganizationHeader';
import OrganizationFooter from '../../components/header/OrganizationFooter';
import QRCode from 'qrcode';

interface Certificate {
  id: number;
  fullname: string;
  coursename: string;
  certificatenumber: string;
  issuedate: string;
  certificateurl?: string;
  organization?: string;
  organization_slug?: string;
  instructor?: string;
  duration?: string;
  instructor_bio?: string;
  organization_description?: string;
  language?: string;
  certificate_title?: string;
  provider_text?: string;
  instructor_label?: string;
  date_label?: string;
  certificate_number_label?: string;
  qr_scan_text?: string;
  skills_label?: string;
  total_hours_label?: string;
  grade_label?: string;
  completion_text?: string;
  course_logo?: string;
  course_images?: string[];
  organizations?: {
    name: string;
    primary_color?: string;
    secondary_color?: string;
    logo?: string;
    website?: string;
  };
}

export default function CertificatePage() {
  const params = useParams();
  const router = useRouter();
  const certificatenumber = params.certificatenumber as string;
  const organizationSlug = params.organization as string;

  // All hooks must be at the top level
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copiedText, setCopiedText] = useState('');
  const [orgColor, setOrgColor] = useState('#990000');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('URL Parametreleri:', params);
    console.log('Certificatenumber:', certificatenumber);
    console.log('Organization Slug:', organizationSlug);
    console.log('Params object:', JSON.stringify(params, null, 2));
    
    async function fetchCertificate() {
      if (!certificatenumber) {
        console.error('Hata: Sertifika numarası eksik', { certificatenumber });
        setLoading(false);
        setError('Sertifika numarası eksik.');
        return;
      }
      if (!organizationSlug) {
        console.error('Hata: Organizasyon slug eksik', { organizationSlug });
        setLoading(false);
        setError('Organizasyon bilgisi eksik. Lütfen URL\'yi kontrol edin.');
        return;
      }
      
      try {
        console.log('Sorgu yapılıyor:', { certificatenumber, organizationSlug });
        
        const { data: certData, error: certError } = await supabase
          .from('certificates')
          .select('*')
          .eq('certificatenumber', certificatenumber.trim())
          .eq('organization_slug', organizationSlug.trim())
          .single();

        if (certError) {
          console.error('Sertifika sorgu hatası:', certError);
          setError(`Sertifika bulunamadı: ${certError.message}`);
          setLoading(false);
          return;
        }

        if (!certData) {
          console.error('Sertifika verisi bulunamadı:', { certificatenumber, organizationSlug });
          setError('Sertifika bulunamadı. Lütfen sertifika numarasını veya organizasyonu kontrol edin.');
          setLoading(false);
          return;
        }

        // Organizasyon bilgilerini al
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('name, primary_color, secondary_color, logo, website')
          .eq('slug', organizationSlug.trim())
          .single();

        if (orgData && !orgError) {
          certData.organizations = orgData;
          
          if (orgData.primary_color) {
            setOrgColor(orgData.primary_color);
            document.documentElement.style.setProperty('--org-primary', orgData.primary_color);
          }
          if (orgData.secondary_color) {
            document.documentElement.style.setProperty('--org-secondary', orgData.secondary_color);
          }
        } else {
          console.warn('Organizasyon bilgileri alınamadı:', orgError);
        }

        console.log('Sertifika bulundu:', certData);
        setCertificate(certData);
        
      } catch (err) {
        console.error('Genel hata:', err);
        setError('Veri alınırken bir hata oluştu: ' + (err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    fetchCertificate();
  }, [certificatenumber, organizationSlug, params]);

  useEffect(() => {
    if (certificate && previewRef.current) {
      const generatePreview = async () => {
        try {
          const canvas = await generateCertificateCanvas(certificate);
          
          if (canvas && canvas.style) {
            canvas.style.maxWidth = '100%';
            canvas.style.width = 'auto';
            canvas.style.height = 'auto';
            canvas.style.borderRadius = '12px';
            canvas.style.boxShadow = '0 10px 25px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)';
            canvas.style.display = 'block';
            if (previewRef.current) {
              previewRef.current.innerHTML = '';
              previewRef.current.appendChild(canvas);
            }
          }
        } catch (error) {
          console.error('Canvas oluşturma hatası:', error);
          // Hata durumunda kullanıcıya bilgi ver
          if (previewRef.current) {
            previewRef.current.innerHTML = `
              <div class="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <div class="text-red-600 font-medium mb-2">Sertifika Önizleme Hatası</div>
                <div class="text-red-500 text-sm">Sertifika oluşturulamadı. Lütfen sayfayı yenileyin.</div>
                <div class="text-red-400 text-xs mt-2">Hata: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}</div>
              </div>
            `;
          }
        }
      };
      generatePreview();
    }
  }, [certificate, organizationSlug]);

  // QR kod oluşturma
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const generateQRCode = async () => {
        try {
          const currentUrl = window.location.href;
          const isDarkMode = document.documentElement.classList.contains('dark');
          const qrCodeDataURL = await QRCode.toDataURL(currentUrl, {
            width: 200,
            margin: 2,
            color: {
              dark: isDarkMode ? '#FFFFFF' : '#000000',
              light: isDarkMode ? '#000000' : '#FFFFFF'
            }
          });
          setQrCodeUrl(qrCodeDataURL);
        } catch (error) {
          console.error('QR kod oluşturma hatası:', error);
        }
      };
      generateQRCode();
    }
  }, []);

  // Dark mode değişikliklerini dinle
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const generateQRCode = async () => {
        try {
          const currentUrl = window.location.href;
          const isDarkMode = document.documentElement.classList.contains('dark');
          const qrCodeDataURL = await QRCode.toDataURL(currentUrl, {
            width: 200,
            margin: 2,
            color: {
              dark: isDarkMode ? '#FFFFFF' : '#000000',
              light: isDarkMode ? '#000000' : '#FFFFFF'
            }
          });
          setQrCodeUrl(qrCodeDataURL);
        } catch (error) {
          console.error('QR kod oluşturma hatası:', error);
        }
      };

      // Dark mode değişikliklerini dinle
      const observer = new MutationObserver(() => {
        generateQRCode();
      });

      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
      });

      return () => observer.disconnect();
    }
  }, []);

  useEffect(() => {
    console.log('URL Parametreleri:', params);
    console.log('Certificatenumber:', certificatenumber);
    console.log('Organization Slug:', organizationSlug);
    console.log('Params object:', JSON.stringify(params, null, 2));
    
    async function fetchCertificate() {
      if (!certificatenumber) {
        console.error('Hata: Sertifika numarası eksik', { certificatenumber });
        setLoading(false);
        setError('Sertifika numarası eksik.');
        return;
      }
      if (!organizationSlug) {
        console.error('Hata: Organizasyon slug eksik', { organizationSlug });
        setLoading(false);
        setError('Organizasyon bilgisi eksik. Lütfen URL\'yi kontrol edin.');
        return;
      }
      
      try {
        console.log('Sorgu yapılıyor:', { certificatenumber, organizationSlug });
        
        const { data: certData, error: certError } = await supabase
          .from('certificates')
          .select('*')
          .eq('certificatenumber', certificatenumber.trim())
          .eq('organization_slug', organizationSlug.trim())
          .single();

        if (certError) {
          console.error('Sertifika sorgu hatası:', certError);
          setError(`Sertifika bulunamadı: ${certError.message}`);
          setLoading(false);
          return;
        }

        if (!certData) {
          console.error('Sertifika verisi bulunamadı:', { certificatenumber, organizationSlug });
          setError('Sertifika bulunamadı. Lütfen sertifika numarasını veya organizasyonu kontrol edin.');
          setLoading(false);
          return;
        }

        // Organizasyon bilgilerini al
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('name, primary_color, secondary_color, logo, website')
          .eq('slug', organizationSlug.trim())
          .single();

        if (orgData && !orgError) {
          certData.organizations = orgData;
          
          if (orgData.primary_color) {
            setOrgColor(orgData.primary_color);
            document.documentElement.style.setProperty('--org-primary', orgData.primary_color);
          }
          if (orgData.secondary_color) {
            document.documentElement.style.setProperty('--org-secondary', orgData.secondary_color);
          }
        } else {
          console.warn('Organizasyon bilgileri alınamadı:', orgError);
        }

        console.log('Sertifika bulundu:', certData);
        setCertificate(certData);
        
      } catch (err) {
        console.error('Genel hata:', err);
        setError('Veri alınırken bir hata oluştu: ' + (err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    fetchCertificate();
  }, [certificatenumber, organizationSlug, params]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const generatePDF = async (canvas: HTMLCanvasElement, filename: string) => {
    const jsPDF = (await import('jspdf')).default;
    
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    // Canvas boyutlarına göre orientation'ı otomatik belirle
    const orientation = canvasWidth > canvasHeight ? 'landscape' : 'portrait';
    
    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'px',
      format: [canvasWidth, canvasHeight],
    });
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    pdf.addImage(imgData, 'JPEG', 0, 0, canvasWidth, canvasHeight);
    pdf.save(filename);
  };

  const handleDownload = async (format: 'png' | 'jpeg' | 'pdf') => {
    if (!certificate) return;
    
    setIsDownloading(true);
    try {
      const canvas = await generateCertificateCanvas(certificate);
      
      const filename = `${certificate.fullname}_Sertifika`;
      if (format === 'png' || format === 'jpeg') {
        const link = document.createElement('a');
        link.download = `${filename}.${format}`;
        link.href = canvas.toDataURL(`image/${format}`, 0.95);
        link.click();
      } else if (format === 'pdf') {
        await generatePDF(canvas, `${filename}.pdf`);
      }
    } catch (error) {
      console.error(`${format.toUpperCase()} indirme hatası:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
      alert(`İndirme başarısız oldu: ${errorMessage}\n\nLütfen sayfayı yenileyin ve tekrar deneyin.`);
    } finally {
      setIsDownloading(false);
    }
  };

  const shareOnLinkedIn = () => {
    if (!certificate) return;
    const shareUrl = window.location.href;
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const shareByEmail = () => {
    if (!certificate) return;
    const subject = `${certificate.coursename} - Sertifika Doğrulama`;
    const body = `Merhaba,\n\n${certificate.fullname} olarak ${certificate.coursename} programını başarıyla tamamladığımı doğrulamak isterim.\n\nSertifikayı görüntülemek ve doğrulamak için aşağıdaki bağlantıyı kullanabilirsiniz:\n${window.location.href}\n\nSertifika Numarası: ${certificate.certificatenumber}\n\nSaygılarımla,`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  useEffect(() => {
    if (certificate && previewRef.current) {
      const generatePreview = async () => {
        try {
          const canvas = await generateCertificateCanvas(certificate);
          
          if (canvas && canvas.style) {
            canvas.style.maxWidth = '100%';
            canvas.style.width = 'auto';
            canvas.style.height = 'auto';
            canvas.style.borderRadius = '12px';
            canvas.style.boxShadow = '0 10px 25px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)';
            canvas.style.display = 'block';
            if (previewRef.current) {
              previewRef.current.innerHTML = '';
              previewRef.current.appendChild(canvas);
            }
          }
        } catch (error) {
          console.error('Canvas oluşturma hatası:', error);
          // Hata durumunda kullanıcıya bilgi ver
          if (previewRef.current) {
            previewRef.current.innerHTML = `
              <div class="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <div class="text-red-600 font-medium mb-2">Sertifika Önizleme Hatası</div>
                <div class="text-red-500 text-sm">Sertifika oluşturulamadı. Lütfen sayfayı yenileyin.</div>
                <div class="text-red-400 text-xs mt-2">Hata: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}</div>
              </div>
            `;
          }
        }
      };
      generatePreview();
    }
  }, [certificate, organizationSlug]);

  // QR kod oluşturma
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const generateQRCode = async () => {
        try {
          const currentUrl = window.location.href;
          const isDarkMode = document.documentElement.classList.contains('dark');
          const qrCodeDataURL = await QRCode.toDataURL(currentUrl, {
            width: 200,
            margin: 2,
            color: {
              dark: isDarkMode ? '#FFFFFF' : '#000000',
              light: isDarkMode ? '#000000' : '#FFFFFF'
            }
          });
          setQrCodeUrl(qrCodeDataURL);
        } catch (error) {
          console.error('QR kod oluşturma hatası:', error);
        }
      };
      generateQRCode();
    }
  }, []);

  // Dark mode değişikliklerini dinle
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const generateQRCode = async () => {
        try {
          const currentUrl = window.location.href;
          const isDarkMode = document.documentElement.classList.contains('dark');
          const qrCodeDataURL = await QRCode.toDataURL(currentUrl, {
            width: 200,
            margin: 2,
            color: {
              dark: isDarkMode ? '#FFFFFF' : '#000000',
              light: isDarkMode ? '#000000' : '#FFFFFF'
            }
          });
          setQrCodeUrl(qrCodeDataURL);
        } catch (error) {
          console.error('QR kod oluşturma hatası:', error);
        }
      };

      // Dark mode değişikliklerini dinle
      const observer = new MutationObserver(() => {
        generateQRCode();
      });

      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
      });

      return () => observer.disconnect();
    }
  }, []);

  // Belirli kurslar için özel sayfa göster
  const specialCourses = [
    'Test Metotları (ISO 14644-3:2019)',
    'Temizoda Tasarım, Yapım ve Devreye Alma (ISO 14644-4:2022)',
    'Temizoda Sınıflandırma, İzleme ve Risk Tabanlı Çevresel İzleme Planı (ISO 14644-1:2015,ISO 14644-2:2015)',
    'Temizoda İşletme, Personel ve Temizlik (ISO 14644-5:2004 / TS EN ISO 14644-5:2006 )',
    'Ulusal ve Uluslararası Konvansiyonel ve Biyoteknolojik İlaç Üretim Stratejileri ve Tedarik Zinciri Sempozyumu',
    'GMP Ek1 Kılavuzu 2022 Revizyonu ve Uygulamadaki Değişiklikler Sempozyumu'
  ];
  
  if (certificate && specialCourses.includes(certificate.coursename)) {
    return <SpecialCertificatePage />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto px-6 py-32">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="relative text-center">
              <div className="animate-spin w-8 h-8 border-2 border-neutral-200 dark:border-neutral-700 border-t-[#990000] rounded-full mx-auto mb-4"></div>
              <p className="text-neutral-600 dark:text-neutral-400">Sertifika bilgileri yükleniyor...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-900 flex items-center justify-center">
        <div className="w-full">
          <div className="max-w-lg mx-auto text-center bg-white dark:bg-neutral-800 shadow-lg border border-neutral-200 dark:border-neutral-700 rounded-lg p-8">
            <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center mx-auto mb-6 rounded-full">
              <svg className="w-8 h-8" style={{ color: orgColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-medium text-neutral-900 dark:text-neutral-100 mb-3">Sertifika Bulunamadı</h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed">
              {error || 'Aradığınız sertifika mevcut değil. Lütfen sertifika numarasını veya organizasyonu kontrol edin.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={`/${organizationSlug}`}
                className="inline-flex items-center justify-center px-8 py-3 text-white font-medium hover:opacity-90 transition-colors rounded-lg"
                style={{ backgroundColor: orgColor }}
              >
                Organizasyon Sayfası
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center px-8 py-3 border text-neutral-700 dark:text-neutral-300 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors rounded-lg"
                style={{ borderColor: orgColor }}
              >
                Ana Sayfa
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const orgName = certificate.organizations?.name || certificate.organization || 'Organizasyon';

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900">
      <OrganizationHeader />
      
      <div className="h-[60px]"></div>
      
      {/* Main Content Section */}
      <section className="py-10 lg:py-14 bg-white dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-2">
          
          {/* Header Section */}
          <div className="mb-16">
            {/* Top Navigation */}
            <div className="mb-12">
              <button
                onClick={() => router.push(`/${organizationSlug}/search`)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-200 rounded-lg"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                Sorgulama Sayfasına Dön
              </button>
            </div>

            {/* Main Content Header */}
            <div className="text-left mb-16">
              <h1 className="text-3xl lg:text-4xl font-light text-neutral-900 dark:text-neutral-100 leading-tight mb-4">
                {certificate.coursename}
              </h1>
              
              <p className="text-base text-neutral-500 dark:text-neutral-400 leading-relaxed">
                {certificate.fullname} tarafından başarıyla tamamlandı
              </p>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
            
            {/* Certificate Preview - Main Column */}
            <div className="lg:col-span-3">
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-4 sm:p-6 border-b border-neutral-100 dark:border-neutral-800">
                  <h3 className="text-lg sm:text-xl font-light text-neutral-900 dark:text-neutral-100 mb-2">
                    Sertifika Önizlemesi
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Sertifikanızı aşağıdaki formatta indirebilir veya paylaşabilirsiniz
                  </p>
                </div>
                
                <div className="relative bg-neutral-50 dark:bg-neutral-800 p-4 sm:p-8 overflow-auto">
                  <div ref={previewRef} className="w-full min-h-0 flex items-center justify-center"></div>
                </div>
              </div>
            </div>

            {/* Action Sidebar - Right Column */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24 space-y-3 lg:space-y-4">
                
                {/* Download Section */}
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 sm:p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: `${orgColor}15` }}>
                      <Download className="w-4 h-4" style={{ color: orgColor }} />
                    </div>
                    <h3 className="text-base font-medium text-neutral-900 dark:text-neutral-100">
                      İndir
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      onClick={() => handleDownload('pdf')}
                      disabled={isDownloading}
                      className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors duration-200 rounded-lg border border-neutral-200 dark:border-neutral-700"
                    >
                      <FileText className="w-4 h-4" />
                      <span>PDF</span>
                      {isDownloading && (
                        <div className="w-4 h-4 border-2 border-neutral-400 border-t-transparent animate-spin rounded-full"></div>
                      )}
                    </button>
                    <button
                      onClick={() => handleDownload('png')}
                      disabled={isDownloading}
                      className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors duration-200 rounded-lg border border-neutral-200 dark:border-neutral-700"
                    >
                      <FileImage className="w-4 h-4" />
                      <span>PNG</span>
                    </button>
                    <button
                      onClick={() => handleDownload('jpeg')}
                      disabled={isDownloading}
                      className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors duration-200 rounded-lg border border-neutral-200 dark:border-neutral-700"
                    >
                      <ImageIcon className="w-4 h-4" />
                      <span>JPG</span>
                    </button>
                  </div>
                </div>

                {/* Share Section */}
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 sm:p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-6 h-6 rounded-md flex items-center justify-center bg-blue-50 dark:bg-blue-900/20">
                      <Share2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-base font-medium text-neutral-900 dark:text-neutral-100">
                      Paylaş
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      onClick={shareOnLinkedIn}
                      className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors duration-200 rounded-lg border border-neutral-200 dark:border-neutral-700"
                    >
                      <Linkedin className="w-4 h-4" />
                      <span>LinkedIn</span>
                    </button>
                    <button
                      onClick={shareByEmail}
                      className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors duration-200 rounded-lg border border-neutral-200 dark:border-neutral-700"
                    >
                      <Mail className="w-4 h-4" />
                      <span>E-posta</span>
                    </button>
                    <button
                      onClick={() => copyToClipboard(window.location.href, 'url')}
                      className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors duration-200 rounded-lg border border-neutral-200 dark:border-neutral-700"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Bağlantı</span>
                      {copiedText === 'url' && (
                        <span className="text-xs font-medium" style={{ color: orgColor }}>✓</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Certificate Details Section */}
          <div className="mt-12">
            {/* Section Header */}
            <div className="text-left mb-8">
              <h2 className="text-3xl lg:text-4xl font-light text-neutral-900 dark:text-neutral-100 leading-tight mb-6 max-w-2xl">
                Sertifika Detayları
              </h2>
              <p className="text-base text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-2xl">
                Sertifikanızla ilgili tüm bilgiler ve doğrulama detayları
              </p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-8 lg:mb-8">
              
              {/* Personal Information */}
              <div className="bg-neutral-50 dark:bg-neutral-800/50 p-6 lg:p-8 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-3 mb-6 lg:mb-8">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${orgColor}15` }}>
                    <User className="w-4 h-4" style={{ color: orgColor }} />
                  </div>
                  <h3 className="text-lg lg:text-xl font-light text-neutral-900 dark:text-neutral-100">
                    Sertifika Sahibi
                  </h3>
                </div>
                
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed mb-6 lg:mb-8 text-base lg:text-lg">
                  {certificate.fullname}
                </p>

                <div className="pt-4 lg:pt-6 border-t border-neutral-200 dark:border-neutral-700">
                  <h4 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2 uppercase tracking-wide">
                    {certificate.date_label || 'Veriliş Tarihi'}
                  </h4>
                  <p className="text-neutral-700 dark:text-neutral-300 text-base lg:text-lg">
                    {formatDate(certificate.issuedate)}
                  </p>
                </div>
              </div>

              {/* Course Information */}
              <div className="bg-neutral-50 dark:bg-neutral-800/50 p-6 lg:p-8 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-3 mb-6 lg:mb-8">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${orgColor}15` }}>
                    <Award className="w-4 h-4" style={{ color: orgColor }} />
                  </div>
                  <h3 className="text-lg lg:text-xl font-light text-neutral-900 dark:text-neutral-100">
                    Eğitim Programı
                  </h3>
                </div>
                
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed mb-6 lg:mb-8 text-base lg:text-lg">
                  {certificate.coursename}
                </p>

                <div className="pt-4 lg:pt-6 border-t border-neutral-200 dark:border-neutral-700">
                  <h4 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2 uppercase tracking-wide">Veren Kurum</h4>
                  <p className="text-neutral-700 dark:text-neutral-300 text-base lg:text-lg">{orgName}</p>
                  {certificate.organization_description && (
                    <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-3 leading-relaxed">
                      {certificate.organization_description}
                    </p>
                  )}
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-neutral-50 dark:bg-neutral-800/50 p-6 lg:p-8 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-3 mb-6 lg:mb-8">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${orgColor}15` }}>
                    <GraduationCap className="w-4 h-4" style={{ color: orgColor }} />
                  </div>
                  <h3 className="text-lg lg:text-xl font-light text-neutral-900 dark:text-neutral-100">
                    Ek Bilgiler
                  </h3>
                </div>
                
                <div className="space-y-4 lg:space-y-6">
                  {certificate.instructor && (
                    <div>
                      <h4 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2 uppercase tracking-wide">
                        {certificate.instructor_label || 'Eğitmen'}
                      </h4>
                      <p className="text-neutral-700 dark:text-neutral-300 text-base lg:text-lg">{certificate.instructor}</p>
                      {certificate.instructor_bio && (
                        <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-2 leading-relaxed">
                          {certificate.instructor_bio}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {certificate.language && (
                    <div>
                      <h4 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2 uppercase tracking-wide">Eğitim Dili</h4>
                      <p className="text-neutral-700 dark:text-neutral-300 text-base lg:text-lg">
                        {certificate.language === 'tr' ? 'Türkçe' : certificate.language === 'en' ? 'İngilizce' : certificate.language?.toUpperCase()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Certificate Number Section */}
            <div className="bg-neutral-50 dark:bg-neutral-800/50 p-6 lg:p-8 rounded-2xl border border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-3 mb-6 lg:mb-8">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${orgColor}15` }}>
                  <Shield className="w-4 h-4" style={{ color: orgColor }} />
                </div>
                <h3 className="text-lg lg:text-xl font-light text-neutral-900 dark:text-neutral-100">
                  {certificate.certificate_number_label || 'Sertifika Numarası'}
                </h3>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <code className="flex-1 font-mono text-neutral-600 dark:text-neutral-400 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 px-4 sm:px-6 py-3 sm:py-4 rounded-xl text-sm sm:text-base lg:text-lg break-all">
                  {certificate.certificatenumber}
                </code>
                <button
                  onClick={() => copyToClipboard(certificate.certificatenumber, 'number')}
                  className="px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-900 transition-colors duration-200 rounded-xl border border-neutral-200 dark:border-neutral-700 whitespace-nowrap"
                >
                  {copiedText === 'number' ? 'Kopyalandı' : 'Kopyala'}
                </button>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="mt-8">
              <div className="bg-neutral-50 dark:bg-neutral-800/50 p-6 lg:p-8 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${orgColor}15` }}>
                    <Shield className="w-4 h-4" style={{ color: orgColor }} />
                  </div>
                  <h3 className="text-lg lg:text-xl font-light text-neutral-900 dark:text-neutral-100">
                    Doğrulama için Tarayın
                  </h3>
                </div>
                
                <div className="flex flex-col lg:flex-row items-center gap-6">
                  <div className="flex-shrink-0">
                    <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm">
                      <div className="w-32 h-32 rounded-lg flex items-center justify-center">
                        {qrCodeUrl ? (
                          <img 
                            src={qrCodeUrl} 
                            alt="QR Code" 
                            className="w-full h-full rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-full bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center">
                            <div className="text-xs text-neutral-400 text-center">
                              QR Kod<br />
                              Yükleniyor...
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 text-center lg:text-left">
                    <p className="text-base text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                      {certificate.qr_scan_text || 'Bu QR kodu mobil cihazınızla okutarak sertifikanızı doğrulayabilirsiniz. QR kod bu sayfanın URL adresini içerir ve güvenli doğrulama sağlar.'}
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                      <Shield className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">Güvenli Doğrulama</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <OrganizationFooter />
    </div>
  );
}