'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Partner {
  id: string;
  name: string;
  website_url: string | null;
  logo_url: string | null;
}

export default function PartnersSection() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const { data, error } = await supabase
          .from('partners')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error fetching partners:', error);
          return;
        }

        setPartners(data || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  if (loading) {
    return (
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-left mb-16">
            <h2 className="text-3xl lg:text-4xl font-semibold text-neutral-900 dark:text-white mb-4">
              Güvenilir İş Ortaklarımız
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl">
              MyUNI Certificates ile çalışan sektör lideri kurumlar ve başarı hikayeleri
            </p>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-left mb-16">
          <h2 className="text-3xl lg:text-4xl font-semibold text-neutral-900 dark:text-white mb-4">
            Güvenilir İş Ortaklarımız
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl">
            MyUNI Certificates ile çalışan sektör lideri kurumlar ve başarı hikayeleri
          </p>
        </div>

        <div className="relative overflow-hidden">
          <div className="flex animate-smooth-scroll whitespace-nowrap">
            {/* Renderlamanın 3 kopyasını yaratıyoruz daha smooth geçiş için */}
            {[...Array(3)].map((_, setIndex) => 
              partners.map((partner, partnerIndex) => (
                <div 
                  key={`set${setIndex}-${partner.id}-${partnerIndex}`}
                  className="flex-shrink-0 mx-8 group cursor-pointer inline-block"
                  onClick={() => {
                    if (partner.website_url) {
                      window.open(partner.website_url, '_blank', 'noopener,noreferrer');
                    }
                  }}
                >
                  <div className="w-32 h-20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    {partner.logo_url ? (
                      <img 
                        src={partner.logo_url} 
                        alt={`${partner.name} logo`}
                        className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 dark:invert dark:brightness-0 dark:contrast-200 group-hover:dark:invert group-hover:dark:brightness-0 group-hover:dark:contrast-200 transition-all duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `
                              <div class="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                                <span class="text-lg font-semibold text-red-600 dark:text-red-400">
                                  ${partner.name.charAt(0)}
                                </span>
                              </div>
                            `;
                          }
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                        <span className="text-lg font-semibold text-red-600 dark:text-red-400">
                          {partner.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
