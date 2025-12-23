// app/components/SpecialCertificatePage.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  Award, 
  FileText, 
  ExternalLink, 
  Info,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Building,
  GraduationCap,
  Clock,
  Share2,
  Scroll,
  CheckCircle,
  Mail,
  Linkedin
} from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import Link from 'next/link';
import OrganizationHeader from './header/OrganizationHeader';
import OrganizationFooter from './header/OrganizationFooter';

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

interface OtherCertificate {
  certificatenumber: string;
  coursename: string;
  issuedate: string;
  organization_slug: string;
}

// Accordion component for reusability with animation
const Accordion = ({ 
  title, 
  icon, 
  children, 
  defaultOpen = false,
  orgColor = '#990000'
}: { 
  title: string; 
  icon: React.ReactNode; 
  children: React.ReactNode; 
  defaultOpen?: boolean;
  orgColor?: string;
}) => {
  return (
    <div className="mt-6 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <details className="group" open={defaultOpen}>
        <summary className="border-b border-gray-200 dark:border-gray-700 p-4 cursor-pointer list-none flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center">
            <span style={{ color: orgColor }}>
              {icon}
            </span>
            {title}
          </h2>
          <div className="text-gray-500 dark:text-gray-400">
            <ChevronDown className="h-5 w-5 group-open:hidden block transition-transform duration-300" />
            <ChevronUp className="h-5 w-5 group-open:block hidden transition-transform duration-300" />
          </div>
        </summary>
        <div className="p-6 overflow-hidden transition-all duration-300 ease-in-out">
          {children}
        </div>
      </details>
    </div>
  );
};

export default function SpecialCertificatePage() {
  const params = useParams();
  const certificatenumber = params.certificatenumber as string;
  const organizationSlug = (params.organizationSlug || params.organization) as string;

  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [otherCertificates, setOtherCertificates] = useState<OtherCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orgColor, setOrgColor] = useState('#990000');
  const [copiedText, setCopiedText] = useState('');

  useEffect(() => {
    async function fetchCertificate() {
      if (!certificatenumber || !organizationSlug) {
        setError('Sertifika numarası veya organizasyon bilgisi eksik.');
        setLoading(false);
        return;
      }

      try {
        // Sertifika bilgilerini al
        const { data: certData, error: certError } = await supabase
          .from('certificates')
          .select('*')
          .eq('certificatenumber', certificatenumber.trim())
          .eq('organization_slug', organizationSlug.trim())
          .maybeSingle();

        if (certError) {
          console.error('Sertifika sorgu hatası:', certError);
          // Eğer birden fazla satır varsa özel mesaj göster
          if (certError.code === 'PGRST116' || certError.message?.includes('multiple')) {
            setError('Bu sertifika numarası için birden fazla kayıt bulundu. Lütfen yönetici ile iletişime geçin.');
          } else {
            setError('Sertifika bulunamadı. Lütfen sertifika numarasını ve organizasyonu kontrol edin.');
          }
          setLoading(false);
          return;
        }

        if (!certData) {
          setError('Sertifika bulunamadı. Lütfen sertifika numarasını ve organizasyonu kontrol edin.');
          setLoading(false);
          return;
        }

        // Organizasyon bilgilerini al
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('name, primary_color, secondary_color, logo, website')
          .eq('slug', organizationSlug.trim())
          .maybeSingle();

        if (orgData && !orgError) {
          certData.organizations = orgData;
          if (orgData.primary_color) {
            setOrgColor(orgData.primary_color);
            document.documentElement.style.setProperty('--org-primary', orgData.primary_color);
          }
        }

        setCertificate(certData);

        // Aynı kişinin diğer sertifikalarını al
        const { data: otherCerts, error: otherError } = await supabase
          .from('certificates')
          .select('certificatenumber, coursename, issuedate, organization_slug')
          .eq('organization_slug', organizationSlug.trim())
          .eq('fullname', certData.fullname)
          .neq('certificatenumber', certificatenumber)
          .order('issuedate', { ascending: false });

        if (otherCerts && !otherError) {
          setOtherCertificates(otherCerts);
        }

      } catch (err) {
        console.error('Genel hata:', err);
        setError('Veri alınırken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    }

    fetchCertificate();
  }, [certificatenumber, organizationSlug]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const getDataField = (field: string, defaultValue: string = '-'): string => {
    const value = certificate?.[field as keyof Certificate];
    if (typeof value === 'string' || typeof value === 'number') {
      return value.toString();
    }
    return defaultValue;
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(''), 2000);
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

  // Course images array
  let courseImages: string[] = [];
  try {
    if (certificate?.course_images) {
      courseImages = typeof certificate.course_images === 'string' 
        ? JSON.parse(certificate.course_images) 
        : certificate.course_images;
    }
  } catch (e) {
    console.error('Error parsing course images:', e);
    courseImages = [];
  }

  // QR Code URL
  const certificateUrl = typeof window !== 'undefined' ? window.location.href : '';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(certificateUrl)}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="relative text-center">
              <div className="animate-spin w-8 h-8 border-2 border-neutral-200 dark:border-neutral-700 rounded-full mx-auto mb-4" style={{ borderTopColor: orgColor }}></div>
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
        <div className="max-w-lg mx-auto text-center bg-white dark:bg-neutral-800 shadow-sm border border-neutral-200 dark:border-neutral-700 p-8">
          <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" style={{ color: orgColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-medium text-neutral-900 dark:text-neutral-100 mb-3">Sertifika Bulunamadı</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed">
            {error || 'Aradığınız sertifika mevcut değil.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`/${organizationSlug}/search`}
              className="inline-flex items-center justify-center px-8 py-3 text-white font-medium hover:opacity-90 transition-colors"
              style={{ backgroundColor: orgColor }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Sorgulama Sayfasına Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const orgName = certificate.organizations?.name || certificate.organization || 'Organizasyon';
  const orgWebsite = certificate.organizations?.website || '#';

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900">
      <OrganizationHeader />
      
      <div className="h-[60px]"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header and Navigation */}
        <div className="mb-8">
          <Link 
            href={`/${organizationSlug}/search`}
            className="inline-flex items-center hover:underline mb-2 transition duration-200"
            style={{ color: orgColor }}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Sorgulama Sayfasına Dön</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sertifika Doğrulama Sonucu</h1>
          <p className="text-gray-500 dark:text-gray-400">{orgName} tarafından verilen sertifika bilgileri</p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Side - Certificate Details */}
          <div className="w-full lg:w-3/5">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="border-b border-gray-200 dark:border-gray-700 p-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                  <Award className="h-5 w-5 mr-2" style={{ color: orgColor }} />
                  Sertifika Bilgileri
                </h2>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-1 flex items-center">
                      <User className="h-4 w-4 mr-1 text-gray-400 dark:text-gray-500" />
                      İsim - Soyisim
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{certificate.fullname}</p>
                  </div>
                  
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-1 flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-gray-400 dark:text-gray-500" />
                      {certificate.date_label || 'Veriliş Tarihi'}
                    </p>
                    <p className="text-lg text-gray-900 dark:text-white">{formatDate(certificate.issuedate)}</p>
                  </div>
                  
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-1 flex items-center">
                      <FileText className="h-4 w-4 mr-1 text-gray-400 dark:text-gray-500" />
                      Eğitim/Kurs Adı
                    </p>
                    <p className="text-lg text-gray-900 dark:text-white">{certificate.coursename}</p>
                  </div>
                  
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-1 flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-gray-400 dark:text-gray-500" />
                      Eğitim Süresi
                    </p>
                    <p className="text-lg text-gray-900 dark:text-white">
                      {getDataField('duration', '8 Saat')}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-1 flex items-center">
                      <Info className="h-4 w-4 mr-1 text-gray-400 dark:text-gray-500" />
                      {certificate.certificate_number_label || 'Sertifika Numarası'}
                    </p>
                    <p className="text-lg text-gray-900 dark:text-white">{certificate.certificatenumber}</p>
                  </div>
                  
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-1 flex items-center">
                      <GraduationCap className="h-4 w-4 mr-1 text-gray-400 dark:text-gray-500" />
                      {certificate.instructor_label || 'Eğitmen'}
                    </p>
                    <p className="text-lg text-gray-900 dark:text-white">
                      {getDataField('instructor', `${orgName} Eğitmeni`)}
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3">Eğitim Hakkında</h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {certificate.organization_description || 
                      `Bu eğitim, ${orgName} tarafından düzenlenen "${certificate.coursename}" programını başarıyla tamamladığınızı belgelemektedir.`
                    }
                  </p>
                </div>
                
                <div className="mt-6 flex flex-wrap gap-3">
                  {certificate.certificateurl && (
                    <a 
                      href={certificate.certificateurl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center text-white px-5 py-2.5 rounded-md font-medium hover:opacity-90 transition duration-200"
                      style={{ backgroundColor: orgColor }}
                    >
                      <Award className="h-5 w-5 mr-2" />
                      Sertifikayı Görüntüle
                    </a>
                  )}
                  <a 
                    href={orgWebsite} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center bg-gray-800 dark:bg-gray-700 text-white px-5 py-2.5 rounded-md font-medium hover:bg-gray-900 dark:hover:bg-gray-600 transition duration-200"
                  >
                    <ExternalLink className="h-5 w-5 mr-2" />
                    {orgName} Web Sitesi
                  </a>
                </div>
              </div>
            </div>
            
            {/* Other Certificates Section */}
            {otherCertificates && otherCertificates.length > 0 && (
              <Accordion 
                title="Diğer Sertifikalar" 
                icon={<Scroll className="h-5 w-5 mr-2" />}
                defaultOpen={true}
                orgColor={orgColor}
              >
                <div className="space-y-4">
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    {certificate.fullname} kişisine ait diğer sertifikalar:
                  </p>
                  <div className="grid grid-cols-1 gap-4">
                    {otherCertificates.map((cert, index) => (
                      <div 
                        key={index} 
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{cert.coursename}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              Veriliş: {formatDate(cert.issuedate)}
                            </p>
                          </div>
                          <Link
                            href={`/${cert.organization_slug}/${cert.certificatenumber}`}
                            className="px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center"
                            style={{ backgroundColor: orgColor + '20', color: orgColor }}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Görüntüle
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Accordion>
            )}
            
            {/* Instructor Information */}
            <Accordion 
              title="Eğitmen Hakkında" 
              icon={<GraduationCap className="h-5 w-5 mr-2" />}
              orgColor={orgColor}
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {getDataField('instructor', `${orgName} Eğitmeni`)}
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {certificate.instructor_bio || 
                  `${orgName} tarafından yetkilendirilmiş uzman eğitmenler, alanlarında deneyimli ve bilgili profesyonellerdir.`
                }
              </p>
            </Accordion>
            
            {/* Course Images */}
            {courseImages && courseImages.length > 0 && (
              <Accordion 
                title="Eğitim/Kurs Görselleri" 
                icon={<ImageIcon className="h-5 w-5 mr-2" />}
                orgColor={orgColor}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {courseImages.map((image: string, index: number) => (
                    <div key={index} className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                      <img 
                        src={image} 
                        alt={`${certificate.coursename} - Görsel ${index + 1}`}
                        className="w-full h-48 object-cover hover:opacity-90 transition-opacity"
                      />
                    </div>
                  ))}
                </div>
              </Accordion>
            )}
          </div>
          
          {/* Right Side - Organization Info and QR Code */}
          <div className="w-full lg:w-2/5">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="border-b border-gray-200 dark:border-gray-700 p-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Eğitim/Kurs Görseli</h2>
              </div>
              
              <div className="p-6">
                {/* Course Image or Organization Logo */}
                {courseImages && courseImages.length > 0 ? (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <img 
                      src={courseImages[0]} 
                      alt={orgName}
                      className="w-full rounded-md object-cover"
                    />
                  </div>
                ) : certificate.organizations?.logo ? (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden p-8 bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                    <img 
                      src={certificate.organizations.logo} 
                      alt={orgName}
                      className="max-w-full max-h-32 object-contain"
                    />
                  </div>
                ) : (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden p-8 bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                    <div className="text-center">
                      <GraduationCap className="w-16 h-16 mx-auto mb-2 text-gray-400" />
                      <p className="text-gray-500 dark:text-gray-400">{orgName}</p>
                    </div>
                  </div>
                )}
                
                <div className="mt-6 bg-green-50 dark:bg-green-900/20 p-4 rounded-md border border-green-100 dark:border-green-800 flex items-center">
                  <div className="bg-green-100 dark:bg-green-800 rounded-full p-2 mr-3">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-800 dark:text-green-400">Doğrulanmış Sertifika</h3>
                    <p className="text-green-700 dark:text-green-500 text-sm">Bu sertifika {orgName} veritabanında kayıtlıdır.</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* QR Code Section */}
            <Accordion 
              title="Sertifika Paylaşım" 
              icon={<Share2 className="h-5 w-5 mr-2" />}
              defaultOpen={true}
              orgColor={orgColor}
            >
              <div className="text-center">
                <div className="bg-white p-4 rounded-lg border border-gray-200 dark:border-gray-700 inline-block mb-4">
                  <img 
                    src={qrCodeUrl} 
                    alt="QR Code"
                    className="w-32 h-32"
                  />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Bu QR kodu tarayarak sertifikayı doğrulayabilirsiniz.
                </p>
                
                <div className="flex flex-col gap-3">
                  <button
                    onClick={shareOnLinkedIn}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Linkedin className="w-4 h-4" />
                    LinkedIn&apos;de Paylaş
                  </button>
                  
                  <button
                    onClick={shareByEmail}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    E-posta ile Gönder
                  </button>
                  
                  <button
                    onClick={() => copyToClipboard(window.location.href, 'url')}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 border text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    style={{ borderColor: orgColor }}
                  >
                    <Share2 className="w-4 h-4" />
                    {copiedText === 'url' ? 'Kopyalandı!' : 'Bağlantıyı Kopyala'}
                  </button>
                </div>
              </div>
            </Accordion>
            
            {/* Organization Information */}
            <Accordion 
              title="Eğitimi/Kursu Veren Kurum Hakkında" 
              icon={<Building className="h-5 w-5 mr-2" />}
              defaultOpen={true}
              orgColor={orgColor}
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{orgName}</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {certificate.organization_description || 
                  `${orgName}, eğitim ve sertifikasyon alanında faaliyet gösteren bir kuruluştur.`
                }
              </p>
              <div className="flex space-x-3 mt-2">
                <a 
                  href={orgWebsite} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline flex items-center transition duration-200"
                  style={{ color: orgColor }}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Web Sitesi
                </a>
              </div>
            </Accordion>
          </div>
        </div>
      </div>

      <OrganizationFooter />
    </div>
  );
}