import React from 'react';
import Link from 'next/link';
import { Linkedin, Instagram, Mail } from 'lucide-react';
import { usePathname } from 'next/navigation';
import XIcon from './XIcon'; // Import the new XIcon component

const Footer = () => {
  const pathname = usePathname();
  
  // Determine if the current path is under /watch/
  const isWatchPage = pathname.startsWith('/watch/');

  // Content in Turkish
  const content = {
    description: "MyUNI Certificates, yapay zeka destekli güvenilir sertifika doğrulama sistemi. Eğitim sertifikalarınızı güvenle doğrulayın ve yönetin.",
    copyright: `© ${new Date().getFullYear()} MyUNI. Tüm hakları saklıdır.`,
    privacyPolicy: "Gizlilik Politikası",
    termsOfService: "Kullanım Koşulları",
    mainLinks: [
      {
        title: 'MyUNI',
        items: [
          { label: 'Ana Sayfa', href: '/' },
          { label: 'Fiyatlandırma', href: '/fiyatlandirma' },
          { label: 'İletişim', href: '/iletisim' },
        ],
      },
      {
        title: 'Hakkımızda',
        items: [
          { label: 'Biz Kimiz', href: 'https://myunilab.net/tr/hakkimizda' },
          { label: 'Bültenimiz', href: 'https://myunilab.net/tr/bultenimiz' },
        ],
      },
      {
        title: 'Hizmetler',
        items: [
          { label: 'Sertifika Doğrulama', href: '/search' },
          { label: 'Demo Talep', href: '/demo-talep' },
          { label: 'Sertifika Arama', href: '/search' },
        ],
      },
      {
        title: 'Yasal',
        items: [
          { label: 'Şartlar ve Koşullar', href: 'https://myunilab.net/tr/sartlar-ve-kosullar' },
          { label: 'Gizlilik Politikası', href: 'http://myunilab.net/tr/gizlilik' },
        ],
      },
    ],
  };

  const t = content;

  // Social media links
  const socialLinks = [
    { icon: Mail, href: 'mailto:info@myunilab.net', label: 'Email' },
    {
      icon: Instagram,
      href: 'https://instagram.com/myuniturkiye',
      label: 'Instagram',
    },
    {
      icon: Linkedin,
      href: 'https://linkedin.com/company/myuniturkiye',
      label: 'LinkedIn',
    },
    {
      icon: XIcon,
      href: 'https://x.com/myuniturkiye',
      label: 'X',
    },
  ];

  return (
    <footer className="bg-neutral-900 dark:bg-neutral-950 text-neutral-300 py-16 px-6">
      <div className={`container mx-auto 
        ${isWatchPage ? 'max-w-none' : 'max-w-7xl px-0 sm:px-0 md:px-6 lg:px-6 xl:px-6 2xl:px-6'}`}> {/* Conditionally apply wider max-width */}
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-12">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <Link href="/" className="block mb-4">
              <h1 className="text-xl text-neutral-100" style={{ fontFamily: 'Syne, sans-serif' }}>
                <span className="font-normal">My</span><span className="font-extrabold">UNI</span><span className="font-normal"> Certificates</span>
              </h1>
            </Link>
            <p className="mt-4 text-md leading-relaxed text-neutral-400">
              {t.description}
            </p>
            <div className="mt-6 flex space-x-5">
              {socialLinks.map((social, index) => (
                <Link
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-500 hover:text-[#a90013] dark:hover:text-[#ffdee2] transition-colors duration-300"
                >
                  <social.icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          {t.mainLinks.map((section, index) => (
            <div key={index}>
              <h3 className="text-md font-medium text-neutral-100 mb-5">{section.title}</h3>
              <ul className="space-y-3">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <Link
                      href={item.href}
                      className="text-sm text-neutral-400 hover:text-[#a90013] dark:hover:text-[#ffdee2] transition-colors duration-200"
                      {...(item.href.startsWith('http') && {
                        target: "_blank",
                        rel: "noopener noreferrer"
                      })}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-6 border-t border-neutral-800">
          <div className="flex flex-col lg:flex-row justify-between items-center">
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
              <p className="text-neutral-500 text-sm text-center md:text-left">
                {t.copyright}
              </p>
            </div>
            <div className="flex space-x-6 mt-4 lg:mt-0">
              <Link 
                href="https://myunilab.net/tr/sartlar-ve-kosullar" 
                className="text-neutral-500 hover:text-[#a90013] dark:hover:text-[#ffdee2] transition-colors duration-200 text-sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t.termsOfService}
              </Link>
              <Link 
                href="http://myunilab.net/tr/gizlilik" 
                className="text-neutral-500 hover:text-[#a90013] dark:hover:text-[#ffdee2] transition-colors duration-200 text-sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t.privacyPolicy}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;