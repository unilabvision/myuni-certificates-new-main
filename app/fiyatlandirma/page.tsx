'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Check, Star, Users, Building, Award, Clock, Mail, Phone, Share2, Plus, Minus } from 'lucide-react';
import Link from 'next/link';
import PageLayout from '../components/layout/PageLayout';

interface Plan {
  id: string;
  name: string;
  monthlyPrice: number | null;
  yearlyPrice: number | null;
  certificates: number | null;
  users: number | null;
  features: string[];
  popular: boolean;
}

interface PayAsYouGoPlan {
  id: string;
  certificates: number;
  price: number;
}

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState('professional');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [additionalCertificates, setAdditionalCertificates] = useState<{[key: string]: number}>({});
  const [additionalUsers, setAdditionalUsers] = useState<{[key: string]: number}>({});
  const [selectedPayAsYouGo, setSelectedPayAsYouGo] = useState<string | null>(null);
  const [payAsYouGoAdditionalCerts, setPayAsYouGoAdditionalCerts] = useState<{[key: string]: number}>({});
  const [payAsYouGoAdditionalUsers, setPayAsYouGoAdditionalUsers] = useState<{[key: string]: number}>({});
  const [currency, setCurrency] = useState<'USD' | 'TL'>('USD');
  const [exchangeRate, setExchangeRate] = useState(30); // Default fallback rate
  const [isLoadingRate, setIsLoadingRate] = useState(false);

  const subscriptionPlans = [
    {
      id: 'free-starter',
      name: 'Free Starter',
      monthlyPrice: 0,
      yearlyPrice: 0,
      certificates: 20,
      users: 1,
      features: [
        'Sertifika hazırlama',
        'Temel tasarım',
        'Mail ile gönderim'
      ],
      popular: false
    },
    {
      id: 'basic',
      name: 'Basic',
      monthlyPrice: 59,
      yearlyPrice: 599,
      certificates: 500,
      users: 2,
      features: [
        'Yapay zeka ile hızlı sertifika oluşturma',
        'Sertifika tasarımı',
        'Mail sistemi'
      ],
      popular: false
    },
    {
      id: 'professional',
      name: 'Professional',
      monthlyPrice: 99,
      yearlyPrice: 999,
      certificates: 1500,
      users: 5,
      features: [
        'Basic özellikleri +',
        'Gelişmiş tasarım seçenekleri',
        'Çoklu kullanıcı yönetimi',
        'Mail sistemi'
      ],
      popular: true
    },
    {
      id: 'business',
      name: 'Business',
      monthlyPrice: 229,
      yearlyPrice: 2299,
      certificates: 5000,
      users: 10,
      features: [
        'Professional özellikleri +',
        'Premium markalama',
        'Otomatik raporlama & istatistik',
        'Mail sistemi'
      ],
      popular: false
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      monthlyPrice: null,
      yearlyPrice: null,
      certificates: null,
      users: null,
      features: [
        'Sınırsız sertifika ve kullanıcı',
        'Tam özelleştirilebilir platform',
        'Dedicated hesap yöneticisi',
        '7/24 öncelikli destek',
        'Özel entegrasyonlar',
        'Gelişmiş güvenlik özellikleri',
        'Özel eğitim ve onboarding',
        'Özel raporlama ve analitik',
        'Özel tasarım desteği',
        'Öncelikli teknik destek'
      ],
      popular: false
    }
  ];

  const payAsYouGoPlans = [
    {
      id: 'pay-100',
      certificates: 100,
      price: 20
    },
    {
      id: 'pay-200',
      certificates: 200,
      price: 25
    }
  ];

  // Fetch current exchange rate
  const fetchExchangeRate = async () => {
    setIsLoadingRate(true);
    try {
      // Using a free API for USD/TRY exchange rate
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const data = await response.json();
      if (data.rates && data.rates.TRY) {
        setExchangeRate(data.rates.TRY);
      }
    } catch (error) {
      console.error('Failed to fetch exchange rate:', error);
      // Keep the default rate if API fails
    } finally {
      setIsLoadingRate(false);
    }
  };

  // Fetch exchange rate on component mount
  useEffect(() => {
    fetchExchangeRate();
  }, []);
  
  const formatPrice = (price: number) => {
    if (currency === 'TL') {
      return Math.round(price * exchangeRate);
    }
    return price;
  };

  const getCurrencySymbol = () => currency === 'TL' ? '₺' : '$';

  const calculateTotalPrice = (plan: Plan) => {
    if (plan.id === 'enterprise') return 'Teklife özel';
    
    const basePrice = billingCycle === 'monthly' ? (plan.monthlyPrice || 0) : (plan.yearlyPrice || 0);
    const additionalCertPrice = ((additionalCertificates[plan.id] || 0) / 10) * 1; // $1 per 10 certificates
    const additionalUserPrice = (additionalUsers[plan.id] || 0) * 5; // $5 per user
    
    return formatPrice(basePrice + additionalCertPrice + additionalUserPrice);
  };

  const calculatePayAsYouGoPrice = (plan: PayAsYouGoPlan) => {
    const basePrice = plan.price;
    const additionalCertPrice = ((payAsYouGoAdditionalCerts[plan.id] || 0) / 10) * 1; // $1 per 10 certificates
    const additionalUserPrice = (payAsYouGoAdditionalUsers[plan.id] || 0) * 5; // $5 per user
    
    return formatPrice(basePrice + additionalCertPrice + additionalUserPrice);
  };

  const features = [
    {
      icon: <Award className="w-6 h-6" />,
      title: 'Profesyonel Sertifikalar',
      description: 'Yüksek kaliteli, güvenilir sertifika tasarımları'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Sınırsız Kullanıcı',
      description: 'Ekip üyelerinizle sınırsız işbirliği'
    },
    {
      icon: <Building className="w-6 h-6" />,
      title: 'Kurumsal Entegrasyon',
      description: 'Mevcut sistemlerinizle kolay entegrasyon'
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: '7/24 Destek',
      description: 'Her zaman yanınızda olan teknik destek'
    }
  ];

  return (
    <PageLayout
      title="Fiyatlandırma"
      description="Sertifika sisteminiz için en uygun planı seçin. İhtiyaçlarınıza göre esnek fiyatlandırma seçenekleri."
      locale="tr"
      breadcrumbs={[
        { name: 'Fiyatlandırma', href: '/fiyatlandirma' }
      ]}
      variant="minimal"
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Mobile: Pricing Plans First, Desktop: Pricing Plans First */}
          <div className="lg:col-span-2 order-1">
            <div className="mb-6">
              <Link
                href="/"
                className="inline-flex items-center text-[#990000] hover:text-[#770000] mb-4 transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Ana Sayfaya Dön
              </Link>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                MyUNI Certificate Fiyatlandırması
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                İhtiyaçlarınıza en uygun planı seçin ve sertifika sisteminizi hemen kullanmaya başlayın.
              </p>
            </div>

            {/* Billing Cycle Toggle and Currency Switcher */}
            <div className="space-y-4 mb-6">
              {/* Billing Cycle Toggle */}
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                      billingCycle === 'monthly'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    Aylık
                  </button>
                  <button
                    onClick={() => setBillingCycle('yearly')}
                    className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                      billingCycle === 'yearly'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    Yıllık
                    <span className="ml-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-1 py-0.5 rounded">
                      %17 tasarruf
                    </span>
                  </button>
                </div>
              </div>

              {/* Currency Switcher and Exchange Rate Info */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    <button
                      onClick={() => setCurrency('USD')}
                      className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                        currency === 'USD'
                          ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      USD
                    </button>
                    <button
                      onClick={() => setCurrency('TL')}
                      className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                        currency === 'TL'
                          ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      TL
                    </button>
                  </div>
                </div>
                
                {/* Exchange Rate Info */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-left">
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    1 USD = {isLoadingRate ? '...' : exchangeRate.toFixed(2)} TL
                  </span>
                  <button
                    onClick={fetchExchangeRate}
                    disabled={isLoadingRate}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoadingRate ? 'Güncelleniyor...' : 'Güncelle'}
                  </button>
                </div>
              </div>
            </div>



            {/* Subscription Plans */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Abonelik Paketleri</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {subscriptionPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative rounded-lg border-2 p-4 shadow-sm transition-all duration-200 ${
                      plan.popular
                        ? 'border-[#990000] bg-[#990000]/5 dark:bg-[#990000]/10'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    } ${selectedPlan === plan.id ? 'ring-2 ring-[#990000] ring-opacity-50' : ''}`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    {plan.popular && (
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                        <span className="bg-[#990000] text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                          <Star className="w-3 h-3 mr-1" />
                          En Popüler
                        </span>
                      </div>
                    )}
                    
                    <div className="text-center mb-3">
                      <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {plan.name}
                      </h4>
                      {plan.id !== 'enterprise' ? (
                        <div>
                          {billingCycle === 'yearly' && plan.yearlyPrice && plan.monthlyPrice ? (
                            <div className="text-center">
                              <div className="text-2xl sm:text-3xl font-bold text-[#990000] mb-1">
                                {getCurrencySymbol()}{formatPrice(Math.round(plan.yearlyPrice / 12))}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                /ay (yıllık ödeme)
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 line-through">
                                Normal fiyat: {getCurrencySymbol()}{formatPrice(plan.monthlyPrice)}/ay
                              </div>
                              <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                                {getCurrencySymbol()}{formatPrice(plan.monthlyPrice - Math.round(plan.yearlyPrice / 12))} tasarruf/ay
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Yıllık: {getCurrencySymbol()}{formatPrice(plan.yearlyPrice)}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-baseline justify-center">
                              <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                                {getCurrencySymbol()}{formatPrice(plan.monthlyPrice || 0)}
                              </span>
                              <span className="text-gray-600 dark:text-gray-400 ml-1 text-sm">
                                /ay
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          Teklife özel
                        </div>
                      )}
                    </div>

                    {plan.id !== 'enterprise' && (
                      <div className="text-center mb-3 text-sm text-gray-600 dark:text-gray-400">
                        <div>{plan.certificates} sertifika/yıl</div>
                        <div>{plan.users === 1 ? 'Tek kullanıcı' : `${plan.users} kullanıcı`}</div>
                        {selectedPlan === plan.id && plan.certificates && (
                          <div className="mt-1 text-xs text-[#990000] font-medium">
                            {(additionalCertificates[plan.id] || 0) > 0 
                              ? `+${additionalCertificates[plan.id] || 0} ek sertifika = ${plan.certificates + (additionalCertificates[plan.id] || 0)} toplam`
                              : 'Ek sertifika eklenmedi'
                            }
                          </div>
                        )}
                      </div>
                    )}

                    <ul className="space-y-2 mb-4">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start text-xs">
                          <Check className="w-3 h-3 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-600 dark:text-gray-300">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <button
                      className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                        plan.popular
                          ? 'bg-[#990000] hover:bg-[#770000] text-white'
                          : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                      }`}
                      onClick={() => {
                        // TODO: Implement payment system
                        // For now, redirect to Calendly for consultation
                        window.open('https://calendly.com/myunilab-info/30min', '_blank');
                      }}
                    >
                      {plan.id === 'enterprise' ? 'İletişime Geç' : 'Planı Seç'}
                    </button>

                    {/* Additional Options for selected plan */}
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out transform ${
                      selectedPlan === plan.id && plan.id !== 'enterprise' 
                        ? 'max-h-96 opacity-100 scale-100' 
                        : 'max-h-0 opacity-0 scale-95'
                    }`}>
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Ek Sertifika (Her 10 sertifika için $1)
                            </label>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setAdditionalCertificates({
                                  ...additionalCertificates,
                                  [plan.id]: Math.max(0, (additionalCertificates[plan.id] || 0) - 10)
                                })}
                                className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-500"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <input
                                type="number"
                                min="0"
                                step="10"
                                value={additionalCertificates[plan.id] || 0}
                                onChange={(e) => setAdditionalCertificates({
                                  ...additionalCertificates,
                                  [plan.id]: Math.max(0, parseInt(e.target.value) || 0)
                                })}
                                onFocus={(e) => e.target.select()}
                                onBlur={(e) => {
                                  if (e.target.value === '' || e.target.value === '0') {
                                    setAdditionalCertificates({
                                      ...additionalCertificates,
                                      [plan.id]: 0
                                    });
                                  }
                                }}
                                className="w-16 text-center text-xs font-medium border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                              <button
                                onClick={() => setAdditionalCertificates({
                                  ...additionalCertificates,
                                  [plan.id]: (additionalCertificates[plan.id] || 0) + 10
                                })}
                                className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-500"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Ek Kullanıcı (Her kullanıcı için $5)
                            </label>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setAdditionalUsers({
                                  ...additionalUsers,
                                  [plan.id]: Math.max(0, (additionalUsers[plan.id] || 0) - 1)
                                })}
                                className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-500"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <input
                                type="number"
                                min="0"
                                step="1"
                                value={additionalUsers[plan.id] || 0}
                                onChange={(e) => setAdditionalUsers({
                                  ...additionalUsers,
                                  [plan.id]: Math.max(0, parseInt(e.target.value) || 0)
                                })}
                                onFocus={(e) => e.target.select()}
                                onBlur={(e) => {
                                  if (e.target.value === '' || e.target.value === '0') {
                                    setAdditionalUsers({
                                      ...additionalUsers,
                                      [plan.id]: 0
                                    });
                                  }
                                }}
                                className="w-16 text-center text-xs font-medium border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                              <button
                                onClick={() => setAdditionalUsers({
                                  ...additionalUsers,
                                  [plan.id]: (additionalUsers[plan.id] || 0) + 1
                                })}
                                className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-500"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                            <div className="text-center mb-3">
                              <div className="text-sm font-semibold text-[#990000]">
                                Toplam: {getCurrencySymbol()}{calculateTotalPrice(plan)}
                                /{billingCycle === 'monthly' ? 'ay' : 'yıl'}
                              </div>
                              {billingCycle === 'yearly' && plan.monthlyPrice && typeof calculateTotalPrice(plan) === 'number' && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  Aylık karşılığı: {getCurrencySymbol()}{Math.round(Number(calculateTotalPrice(plan)) / 12)}/ay
                                </div>
                              )}
                            </div>
                            
                            <button
                              className="w-full py-2 px-3 bg-[#990000] hover:bg-[#770000] text-white text-sm font-medium rounded-lg transition-colors duration-200"
                              onClick={() => {
                                // TODO: Implement payment system
                                // For now, redirect to Calendly for consultation
                                window.open('https://calendly.com/myunilab-info/30min', '_blank');
                              }}
                            >
                              Ödemeye Geç
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>


            {/* Pay-as-You-Go Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pay-as-You-Go (Tek Seferlik Alım)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {payAsYouGoPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`border rounded-lg p-4 transition-all duration-200 ${
                      selectedPayAsYouGo === plan.id
                        ? 'border-[#990000] bg-[#990000]/5 dark:bg-[#990000]/10'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    onClick={() => setSelectedPayAsYouGo(plan.id)}
                  >
                    <div className="text-center">
                      <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {plan.certificates} Sertifika
                      </h4>
                      <div className="text-xl sm:text-2xl font-bold text-[#990000] mb-2">
                        {getCurrencySymbol()}{formatPrice(plan.price)}
                      </div>
                      {selectedPayAsYouGo === plan.id && (
                        <div className="text-xs text-[#990000] font-medium mb-3">
                          {(payAsYouGoAdditionalCerts[plan.id] || 0) > 0 
                            ? `+${payAsYouGoAdditionalCerts[plan.id] || 0} ek sertifika = ${plan.certificates + (payAsYouGoAdditionalCerts[plan.id] || 0)} toplam`
                            : 'Ek sertifika eklenmedi'
                          }
                        </div>
                      )}
                      <button 
                        className="w-full py-2 px-3 bg-[#990000] hover:bg-[#770000] text-white rounded-lg text-sm font-medium transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Implement payment system
                          // For now, redirect to Calendly for consultation
                          window.open('https://calendly.com/myunilab-info/30min', '_blank');
                        }}
                      >
                        Satın Al
                      </button>

                      {/* Additional Options for selected Pay-as-You-Go plan */}
                      <div className={`overflow-hidden transition-all duration-300 ease-in-out transform ${
                        selectedPayAsYouGo === plan.id 
                          ? 'max-h-96 opacity-100 scale-100' 
                          : 'max-h-0 opacity-0 scale-95'
                      }`}>
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Ek Sertifika (Her 10 sertifika için $1)
                              </label>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPayAsYouGoAdditionalCerts({
                                      ...payAsYouGoAdditionalCerts,
                                      [plan.id]: Math.max(0, (payAsYouGoAdditionalCerts[plan.id] || 0) - 10)
                                    });
                                  }}
                                  className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-500"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <input
                                  type="number"
                                  min="0"
                                  step="10"
                                  value={payAsYouGoAdditionalCerts[plan.id] || 0}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    setPayAsYouGoAdditionalCerts({
                                      ...payAsYouGoAdditionalCerts,
                                      [plan.id]: Math.max(0, parseInt(e.target.value) || 0)
                                    });
                                  }}
                                  onFocus={(e) => {
                                    e.stopPropagation();
                                    e.target.select();
                                  }}
                                  onBlur={(e) => {
                                    e.stopPropagation();
                                    if (e.target.value === '' || e.target.value === '0') {
                                      setPayAsYouGoAdditionalCerts({
                                        ...payAsYouGoAdditionalCerts,
                                        [plan.id]: 0
                                      });
                                    }
                                  }}
                                  className="w-16 text-center text-xs font-medium border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPayAsYouGoAdditionalCerts({
                                      ...payAsYouGoAdditionalCerts,
                                      [plan.id]: (payAsYouGoAdditionalCerts[plan.id] || 0) + 10
                                    });
                                  }}
                                  className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-500"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Ek Kullanıcı (Her kullanıcı için $5)
                              </label>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPayAsYouGoAdditionalUsers({
                                      ...payAsYouGoAdditionalUsers,
                                      [plan.id]: Math.max(0, (payAsYouGoAdditionalUsers[plan.id] || 0) - 1)
                                    });
                                  }}
                                  className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-500"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <input
                                  type="number"
                                  min="0"
                                  step="1"
                                  value={payAsYouGoAdditionalUsers[plan.id] || 0}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    setPayAsYouGoAdditionalUsers({
                                      ...payAsYouGoAdditionalUsers,
                                      [plan.id]: Math.max(0, parseInt(e.target.value) || 0)
                                    });
                                  }}
                                  onFocus={(e) => {
                                    e.stopPropagation();
                                    e.target.select();
                                  }}
                                  onBlur={(e) => {
                                    e.stopPropagation();
                                    if (e.target.value === '' || e.target.value === '0') {
                                      setPayAsYouGoAdditionalUsers({
                                        ...payAsYouGoAdditionalUsers,
                                        [plan.id]: 0
                                      });
                                    }
                                  }}
                                  className="w-16 text-center text-xs font-medium border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPayAsYouGoAdditionalUsers({
                                      ...payAsYouGoAdditionalUsers,
                                      [plan.id]: (payAsYouGoAdditionalUsers[plan.id] || 0) + 1
                                    });
                                  }}
                                  className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-500"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                              <div className="text-center mb-3">
                                <div className="text-sm font-semibold text-[#990000]">
                                  Toplam: {getCurrencySymbol()}{calculatePayAsYouGoPrice(plan)}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  Tek seferlik ödeme
                                </div>
                              </div>
                              
                              <button
                                className="w-full py-2 px-3 bg-[#990000] hover:bg-[#770000] text-white text-sm font-medium rounded-lg transition-colors duration-200"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // TODO: Implement payment system
                                  // For now, redirect to Calendly for consultation
                                  window.open('https://calendly.com/myunilab-info/30min', '_blank');
                                }}
                              >
                                Satın Al
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Tüm Planlarda Dahil
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Güvenli veri saklama
                  </span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Otomatik yedekleme
                  </span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Mobil uyumlu tasarım
                  </span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Kolay kullanım
                  </span>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="mt-8 text-left">
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4">
                Hangi planın size uygun olduğundan emin değil misiniz?
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-start">
                <Link
                  href="/demo-talep"
                  className="inline-flex items-center px-6 py-3 bg-[#990000] hover:bg-[#770000] text-white font-medium rounded-lg transition-colors duration-200"
                >
                  Demo Talep Et
                </Link>
                <Link
                  href="/iletisim"
                  className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium rounded-lg transition-colors duration-200"
                >
                  İletişime Geç
                </Link>
              </div>
            </div>
          </div>
          
          {/* Mobile: Features & Contact Second, Desktop: Features & Contact */}
          <div className="lg:col-span-1 order-2 space-y-6">
            {/* Features Section */}
            <div className="dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 sm:p-6 shadow-sm">
              <h2 className="text-base sm:text-lg font-medium text-gray-800 dark:text-gray-200 mb-4 sm:mb-5">
                Neden MyUni Sertifika?
              </h2>
              
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-[#990000] text-white rounded-lg flex items-center justify-center flex-shrink-0">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-700 dark:text-gray-300 text-sm">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Information */}
            <div className="dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 sm:p-6 shadow-sm">
              <h2 className="text-base sm:text-lg font-medium text-gray-800 dark:text-gray-200 mb-4 sm:mb-5">
                İletişim Bilgileri
              </h2>
              
              <div className="space-y-4">
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

            {/* Social Media Section */}
            <div className="dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 sm:p-6 shadow-sm">
              <h3 className="text-sm sm:text-base font-medium text-gray-800 dark:text-gray-200 mb-3 flex items-center">
                <div className="w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center mr-3">
                  <Share2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </div>
                Sosyal Medya
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed">
                Bizi takip edin ve güncel haberleri kaçırmayın
              </p>
              <div className="flex space-x-3">
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
        </div>
      </div>
      
      {/* Bottom spacing */}
      <div className="py-16"></div>
    </PageLayout>
  );
}
