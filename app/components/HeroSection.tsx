'use client';

import { ArrowRight, Shield, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="py-8 lg:py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column - Content */}
          <div className="space-y-8 text-left">
            {/* Main Heading */}
            <div>
              <h1 className="text-3xl lg:text-4xl font-semibold text-neutral-900 dark:text-white mb-4">
                Sertifika Yönetiminde
                <span className="text-red-500 dark:text-red-400"> Dijital </span>
                Dönüşüm
              </h1>
              <p className="text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl">
                MyUNI Certificates ile kurumların sertifika süreçlerini dijitalleştiriyor, güvenli ve şeffaf bir platform sunuyoruz. Modern teknolojiler ile sertifika yönetimini kolaylaştırın.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3 text-sm text-neutral-600 dark:text-neutral-400">
                <Shield className="w-5 h-5 text-red-500" />
                <span>Güvenli Altyapı</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-neutral-600 dark:text-neutral-400">
                <Clock className="w-5 h-5 text-red-500" />
                <span>7/24 Erişim</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-neutral-600 dark:text-neutral-400">
                <CheckCircle className="w-5 h-5 text-red-500" />
                <span>Kolay Entegrasyon</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/demo-talep">
                <button className="bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-100 text-white dark:text-neutral-900 px-8 py-4 rounded-lg font-medium transition-colors flex items-center space-x-2 shadow-lg hover:shadow-xl">
                  <span>Demo Talep Et</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <Link href="/iletisim">
                <button className="border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 px-8 py-4 rounded-lg font-medium transition-colors">
                  İletişime Geç
                </button>
              </Link>
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative group">
              <div className="w-full max-w-lg overflow-hidden rounded-lg shadow-lg dark:shadow-gray-800/50">
                <img
                  src="/myuni-hero1.webp"
                  alt="Sertifika Yönetim Platformu"
                  className="w-full h-auto transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                />
                
                {/* Hover Overlay with Red-Tinted Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-900/70 via-red-800/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out rounded-lg"></div>
                
                {/* Hover Text */}
                <div className="absolute inset-0 flex items-start justify-start opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out transform translate-y-4 group-hover:translate-y-0">
                  <div className="text-left text-white px-6 pt-6">
                    <h3 className="text-2xl font-light tracking-wide mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-200">
                      Dijital Sertifika
                    </h3>
                    <p className="text-sm font-light opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-300 text-neutral-200">
                      Güvenli ve şeffaf platform
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}