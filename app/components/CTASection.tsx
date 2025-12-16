'use client';

import { ArrowRight, Phone, Mail } from 'lucide-react';
import Link from 'next/link';

export default function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-950/40 dark:to-red-900/50">
              <div className="max-w-7xl mx-auto px-6">
        <div className="text-left">
          <h2 className="text-3xl lg:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
            Sertifika Yönetiminde Dijital Dönüşümü Başlatın
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            Kurumunuzun sertifika süreçlerini dijitalleştirmek için hemen demo talep edin. 
            Uzman ekibimiz size özel çözümler sunacak.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Link href="/demo-talep">
              <button className="bg-white hover:bg-neutral-100 text-neutral-900 px-8 py-4 rounded-lg font-medium transition-colors flex items-center space-x-2 shadow-lg hover:shadow-xl">
                <span>Ücretsiz Demo Talep Et</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <Link href="/iletisim">
              <button className="border border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-neutral-800 px-8 py-4 rounded-lg font-medium transition-colors">
                İletişime Geç
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 p-6 rounded-lg shadow-sm">
              <div className="flex items-center space-x-3 mb-3">
                <Phone className="w-5 h-5 text-gray-500 dark:text-neutral-400" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Telefon ile İletişim</h3>
              </div>
              <p className="text-gray-600 dark:text-neutral-300 text-sm mb-2">
                Hızlı destek için bizi arayın
              </p>
              <a href="tel:+905419444634" className="text-gray-900 dark:text-white font-medium hover:text-red-600 dark:hover:text-red-400 transition-colors">
                +90 541 944 46 34
              </a>
            </div>

            <div className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 p-6 rounded-lg shadow-sm">
              <div className="flex items-center space-x-3 mb-3">
                <Mail className="w-5 h-5 text-gray-500 dark:text-neutral-400" />
                <p className="text-lg font-medium text-gray-900 dark:text-white">E-posta ile İletişim</p>
              </div>
              <p className="text-gray-600 dark:text-neutral-300 text-sm mb-2">
                Detaylı bilgi için yazın
              </p>
              <a href="mailto:info@myunilab.net" className="text-gray-900 dark:text-white font-medium hover:text-red-600 dark:hover:text-red-400 transition-colors">
                info@myunilab.net
              </a>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-neutral-700">
            <p className="text-sm text-gray-500 dark:text-neutral-400">
              Demo sırasında kurumunuzun ihtiyaçlarına özel çözümler sunuyoruz. 
              <span className="text-gray-900 dark:text-white font-medium"> Hemen başlayın!</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
