'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function CertificateSearch() {
  const [certificatenumber, setCertificatenumber] = useState('');
  const [searchName, setSearchName] = useState('');
  const [activeTab, setActiveTab] = useState('number');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleVerify = async () => {
    if (certificatenumber.trim()) {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('certificates')
          .select('organization_slug')
          .eq('certificatenumber', certificatenumber)
          .maybeSingle();

        if (error) {
          console.error('Sertifika sorgu hatası:', error);
          if (error.code === 'PGRST116' || error.message?.includes('multiple')) {
            alert('Bu sertifika numarası için birden fazla kayıt bulundu. Lütfen yönetici ile iletişime geçin.');
          } else {
            alert('Sertifika bulunamadı. Lütfen sertifika numarasını kontrol edin.');
          }
          return;
        }

        if (!data || !data.organization_slug) {
          alert('Sertifika bulunamadı veya organizasyon bilgisi eksik.');
          return;
        }

        const orgSlug = data.organization_slug;
        router.push(`/${orgSlug}/${certificatenumber}`);
      } catch {
        alert('Sertifika sorgulanırken bir hata oluştu.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleNameSearch = () => {
    if (searchName.trim()) {
      router.push(`/search?name=${encodeURIComponent(searchName.trim())}`);
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

  return (
    <div className="space-y-6">
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('number')}
          className={`pb-3 px-6 text-sm font-medium transition-colors ${
            activeTab === 'number'
              ? 'border-b-2 border-gray-900 dark:border-white text-gray-900 dark:text-white'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          Sertifika Numarası ile
        </button>
        <button
          onClick={() => setActiveTab('name')}
          className={`pb-3 px-6 text-sm font-medium transition-colors ${
            activeTab === 'name'
              ? 'border-b-2 border-gray-900 dark:border-white text-gray-900 dark:text-white'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          İsim ile
        </button>
      </div>

      {activeTab === 'number' ? (
        <div className="relative max-w-md">
          <input
            type="text"
            value={certificatenumber}
            onChange={(e) => setCertificatenumber(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Sertifika numaranızı giriniz..."
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-600 focus:border-gray-400 dark:focus:border-gray-500 transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          <button
            onClick={handleVerify}
            disabled={isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white dark:text-gray-900 p-2 rounded-md transition-colors"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white dark:border-gray-900 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </button>
        </div>
      ) : (
        <div className="relative max-w-md">
          <input
            type="text"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ad veya soyad giriniz..."
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-600 focus:border-gray-400 dark:focus:border-gray-500 transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          <button
            onClick={handleNameSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 p-2 rounded-md transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      )}

      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
        {activeTab === 'name'
          ? 'İsim ile arama yaptığınızda, sertifika erişimi için son 6 haneyi doğrulamanız gerekecektir.'
          : 'Sertifika numaranızı belgenin alt kısmında bulabilirsiniz.'}
      </p>
    </div>
  );
}
