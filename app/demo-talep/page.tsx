'use client';

import { useState } from 'react';
import { ArrowLeft, Mail, Phone, User, Building, Users, Share2, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import PageLayout from '../components/layout/PageLayout';

export default function DemoRequestPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    country: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      console.log('Sending form data:', formData);
      
      const response = await fetch('/api/demo-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Sunucu geçersiz yanıt döndürdü');
      }

      const result = await response.json();
      console.log('Response result:', result);

      if (result.success) {
        setIsSubmitted(true);
        setSubmissionId(result.submissionId || '');
      } else {
        console.error('Form submission error:', result.error);
        alert(`Form gönderilirken bir hata oluştu: ${result.error || 'Bilinmeyen hata'}`);
      }
    } catch (error) {
      console.error('Network error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
      alert(`Bağlantı hatası: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };


  return (
    <PageLayout
      title="Demo Talep Et"
      description="Platformumuzu deneyimlemek için demo talep edin. Uzman ekibimiz size özel bir sunum hazırlayacak."
      locale="tr"
      breadcrumbs={[
        { name: 'Demo Talep', href: '/demo-talep' }
      ]}
      variant="minimal"
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            {/* Main Contact Info */}
            <div className="dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg border border-red-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-gray-600 transition-all duration-300 p-6 shadow-sm hover:shadow-md">
              <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-5">
                İletişim Bilgileri
              </h2>
              
              <div className="space-y-5">
                {/* Phone */}
                <div>
                  <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <div className="w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center mr-3">
                      <Phone className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                    </div>
                    Telefon
                  </h3>
                  <a 
                    href="tel:+905419444634"
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors pl-9 block"
                  >
                    +90 (541) 944 46 34
                  </a>
                </div>
                
                {/* Email */}
                <div>
                  <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <div className="w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center mr-3">
                      <Mail className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                    </div>
                    E-posta
                  </h3>
                  <a 
                    href="mailto:info@myunilab.net"
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors pl-9 block"
                  >
                    info@myunilab.net
                  </a>
                </div>
              </div>
            </div>

            {/* Demo Process Section */}
            <div className="dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-3 flex items-center">
                <div className="w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center mr-3">
                  <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </div>
                Demo Süreci
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-[#990000] text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">1</div>
                  <p className="text-gray-600 dark:text-gray-400">Form doldurma</p>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-[#990000] text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">2</div>
                  <p className="text-gray-600 dark:text-gray-400">24 saat içinde iletişim</p>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-[#990000] text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">3</div>
                  <p className="text-gray-600 dark:text-gray-400">Demo planlama</p>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-[#990000] text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">4</div>
                  <p className="text-gray-600 dark:text-gray-400">Demo oturumu</p>
                </div>
              </div>
            </div>

            {/* Social Media Section */}
            <div className="dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg border border-red-200 dark:border-gray-700 p-6 shadow-sm">
              <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-3 flex items-center">
                <div className="w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center mr-3">
                  <Share2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </div>
                Sosyal Medya
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed">
                Bizi takip edin ve güncel haberleri kaçırmayın
              </p>
              <div className="flex space-x-3">
                {/* X (Twitter) */}
                <a 
                  href="https://twitter.com/myuniturkiye"
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                
                {/* Instagram */}
                <a 
                  href="https://instagram.com/myuniturkiye"
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                
                {/* LinkedIn */}
                <a 
                  href="https://linkedin.com/company/myuniturkiye"
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          {/* Right Column - Demo Request Form */}
          <div className="lg:col-span-2">
            <div className="dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-6 shadow-sm">
              <div className="mb-6">
                <Link
                  href="/"
                  className="inline-flex items-center text-[#990000] hover:text-[#770000] mb-4 transition-colors duration-200"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Ana Sayfaya Dön
                </Link>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  Demo Talep Et
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                 Platformumuzu deneyimlemek için demo talep edin. Uzman ekibimiz size özel bir sunum hazırlayacak.
                </p>
              </div>

              {/* Success Message */}
              {isSubmitted && (
                <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                        Demo Talebiniz Başarıyla Alındı! 🎉
                      </h3>
                      <p className="text-green-700 dark:text-green-300 mb-3">
                        İlginiz için teşekkür ederiz. Uzman ekibimiz 24 saat içinde sizinle iletişime geçecek ve 
                        size özel bir demo sunumu planlayacak.
                      </p>
                      {submissionId && (
                        <div className="bg-white dark:bg-gray-800 rounded-md p-3 border border-green-200 dark:border-green-600">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Talep No:</span> {submissionId}
                          </p>
                        </div>
                      )}
                      <div className="mt-4">
                        <button
                          onClick={() => {
                            setIsSubmitted(false);
                            setFormData({
                              name: '',
                              email: '',
                              phone: '',
                              company: '',
                              country: '',
                              message: ''
                            });
                          }}
                          className="inline-flex items-center px-4 py-2 bg-[#990000] hover:bg-[#770000] text-white text-sm font-medium rounded-lg transition-colors duration-200"
                        >
                          Yeni Talep Gönder
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {!isSubmitted && (
                <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ad Soyad *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#990000] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Adınız ve soyadınız"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      E-posta *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#990000] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="ornek@email.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Telefon
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#990000] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="(5XX) XXX XX XX"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Şirket / Kurum
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#990000] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Şirket veya kurum adı"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ülke
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#990000] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Örn: Türkiye, Amerika, Almanya, Fransa, İngiltere..."
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mesaj
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#990000] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                    placeholder="Demo hakkında eklemek istediğiniz bilgiler..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#990000] hover:bg-[#770000] disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Gönderiliyor...
                    </>
                  ) : (
                    'Demo Talep Et'
                  )}
                </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom spacing */}
      <div className="py-16"></div>
    </PageLayout>
  );
}