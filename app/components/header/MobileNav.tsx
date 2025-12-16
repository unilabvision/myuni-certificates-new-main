'use client';

import Link from "next/link";
import { useState } from 'react';
import { ChevronDown, Search, MessageCircle, Globe, User } from 'lucide-react';

interface MobileNavProps {
  toggleMobileMenu: () => void;
}

interface MenuItem {
  href: string;
  label: string;
  children?: MenuItem[];
}

export default function MobileNav({ toggleMobileMenu }: MobileNavProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const menuItems: MenuItem[] = [
    { href: "/#", label: "Ana Sayfa" },
    { href: "/fiyatlandirma", label: "Fiyatlandırma" },
    { 
      href: "/hakkimizda", 
      label: "Hakkımızda",
      children: [
        { href: "https://myunilab.net/tr/hakkimizda", label: "Biz Kimiz" },
        { href: "https://myunilab.net/tr/bultenimiz", label: "Bültenimiz" },
        { href: "https://myunilab.net/tr/sartlar-ve-kosullar", label: "Şartlar ve Koşullar" },
        { href: "http://myunilab.net/tr/gizlilik", label: "Gizlilik Politikası" },
      ]
    },
    { href: "/iletisim", label: "İletişim" },
  ];

  const handleDropdownToggle = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  return (
    <div className="lg:hidden bg-[#fff] min-h-screen dark:bg-neutral-900 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 absolute top-full left-0 right-0 z-40 animate-slideDown shadow-lg">
      <nav className="max-w-6xl mx-auto px-6 py-6 flex flex-col space-y-4">
        {/* Menu Items */}
        {menuItems.map((item, index) => (
          <div key={index} className="relative">
            {item.children ? (
              <div>
                <button
                  onClick={() => handleDropdownToggle(item.label)}
                  className="flex items-center justify-between w-full text-base font-medium text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary transition-colors duration-200"
                >
                  <span>{item.label}</span>
                  <ChevronDown 
                    className={`h-4 w-4 transition-transform duration-200 ${
                      openDropdown === item.label ? 'rotate-180' : ''
                    }`} 
                  />
                </button>
                
                {/* Dropdown Menu */}
                {openDropdown === item.label && (
                  <div className="mt-3 ml-4 space-y-3 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                    {item.children.map((child, childIndex) => {
                      const isExternal = child.href.startsWith('http');
                      const LinkComponent = isExternal ? 'a' : Link;
                      const linkProps = isExternal 
                        ? { 
                            href: child.href, 
                            target: "_blank", 
                            rel: "noopener noreferrer" 
                          } 
                        : { href: child.href };
                      
                      return (
                        <LinkComponent
                          key={childIndex}
                          {...linkProps}
                          className="block text-sm text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors duration-200"
                          onClick={toggleMobileMenu}
                        >
                          {child.label}
                        </LinkComponent>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <Link
                href={item.href}
                className="text-base font-medium text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary transition-colors duration-200"
                onClick={toggleMobileMenu}
              >
                {item.label}
              </Link>
            )}
          </div>
        ))}

        {/* New Action Buttons */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
          <Link
            href="/demo-talep"
            className="block w-full bg-black dark:bg-white text-white dark:text-black px-4 py-3 text-center text-base font-medium transition-colors duration-200 hover:bg-gray-800 dark:hover:bg-gray-200 border-0 rounded-md"
            onClick={toggleMobileMenu}
          >
            Demo Talep Et
          </Link>
        </div>

        {/* Mobile Utility Icons */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center space-x-8">
            <button className="text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100 transition-colors duration-200">
              <Search className="h-5 w-5" />
            </button>
            
            <button className="text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100 transition-colors duration-200">
              <MessageCircle className="h-5 w-5" />
            </button>
            
            <button className="text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100 transition-colors duration-200">
              <Globe className="h-5 w-5" />
            </button>
            
            <Link
              href="https://dashboard.myunilab.net"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100 transition-colors duration-200"
            >
              <User className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}