'use client';

import { Users, Shield, Award, Clock } from 'lucide-react';

export default function StatsSection() {
  const stats = [
    {
      icon: Users,
      number: "5+",
      label: "Aktif Kurum",
      description: "Platformumuzu kullanan kurum sayısı"
    },
    {
      icon: Shield,
      number: "700+",
      label: "Sertifika",
      description: "Dijital olarak yönetilen sertifika"
    },
    {
      icon: Award,
      number: "100%",
      label: "Güvenli",
      description: "Veri güvenliği garantisi"
    },
    {
      icon: Clock,
      number: "24/7",
      label: "Destek",
      description: "Sürekli teknik destek"
    }
  ];

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-left mb-16">
          <h2 className="text-3xl lg:text-4xl font-semibold text-neutral-900 dark:text-white mb-4">
            Platform İstatistikleri
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl">
            MyUNI Certificates platformumuzun güçlü altyapısını ve başarılarını gösteren önemli veriler
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="group">
                <div className="bg-white dark:bg-neutral-800 p-8 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 h-full text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#990000]/10 to-[#990000]/20 dark:from-[#990000]/20 dark:to-[#990000]/30 rounded-lg flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="w-6 h-6 text-[#990000] dark:text-[#ff4444]" />
                  </div>
                  
                  <div className="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                    {stat.number}
                  </div>
                  
                  <h3 className="text-xl font-medium text-neutral-900 dark:text-neutral-100 mb-4">
                    {stat.label}
                  </h3>
                  
                  <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {stat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
