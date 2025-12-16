'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, MessageCircle, Globe, User } from 'lucide-react';
import { usePathname } from 'next/navigation';
import DesktopNav from './DesktopNav';
import MobileNav from './MobileNav';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  primary?: string;
}

export default function Header({ primary = '#a90013' }: HeaderProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [logoSrc, setLogoSrc] = useState('/myuni-logo.png'); // Default logo for SSR

  // Determine if the current path is under /watch/
  const isWatchPage = pathname.startsWith('/watch/');

  // Handle theme detection and logo update
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      const isDark =
        savedTheme === 'dark' ||
        (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
      document.documentElement.classList.toggle('dark', isDark);
      setLogoSrc(isDark ? '/myuni-logo-dark.png' : '/myuni-logo.png');
    }
  }, []);

  // Handle scroll effect with debounce
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => setIsScrolled(window.scrollY > 20), 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeout);
    };
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);

  // Helper function to update theme and logo
  const updateTheme = (isDark: boolean) => {
    setLogoSrc(isDark ? '/myuni-logo-dark.png' : '/myuni-logo.png');
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 backdrop-blur-md z-50 transition-all duration-300
        ${isScrolled ? 'bg-[#fff] dark:bg-neutral-900/95 shadow-sm py-3' : 'bg-[#fff] dark:bg-neutral-900/80 py-5'} 
        border-b border-neutral-200 dark:border-neutral-800`}
      style={{ '--primary': primary } as React.CSSProperties}
    >
      <div
        className={`mx-auto px-6 sm:px-6 md:px-6 lg:px-6 flex justify-between items-center
          ${isWatchPage ? 'max-w-8xl' : 'max-w-8xl'}`} // Conditionally apply wider max-width
      >
        {/* Logo */}
        <Link href="/" prefetch className="transition-all duration-300 flex items-center">
          <h1 className="text-xl text-neutral-900 dark:text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
            <span className="font-normal">My</span><span className="font-extrabold">UNI</span><span className="font-normal"> Certificates</span>
          </h1>
        </Link>

        {/* Desktop Navigation and Actions */}
        <div className="flex items-center space-x-5">
          <DesktopNav />
          <div className="hidden lg:flex items-center space-x-3">
            {/* Right Section: Utility Icons */}
            <div className="flex items-center space-x-6">
              {/* Demo Talep Et Button */}
              <Link
                href="/demo-talep"
                className="bg-[#990000] hover:bg-[#770000] text-white px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-md flex items-center"
              >
                Demo Talep Et
              </Link>
              
              {/* Chat/Message Icon */}
              <Link
                href="/iletisim"
                className="text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100 transition-colors duration-200"
              >
                <MessageCircle className="h-5 w-5" />
              </Link>
              
              {/* Language/Region Icon */}
              <Link
                href="https://myunilab.net"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100 transition-colors duration-200"
              >
                <Globe className="h-5 w-5" />
              </Link>
              
              {/* Theme Toggle */}
              <ThemeToggle
                isDarkMode={logoSrc === '/myuni-logo-dark.png'}
                setIsDarkMode={updateTheme}
              />
              
              {/* User/Login Icon */}
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
          
          {/* Mobile Menu */}
          <div className="lg:hidden flex items-center space-x-4">
            <ThemeToggle
              isDarkMode={logoSrc === '/myuni-logo-dark.png'}
              setIsDarkMode={updateTheme}
            />
            
            <button
              className="text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100 transition-colors duration-200 flex items-center justify-center"
              onClick={toggleMobileMenu}
              aria-label="Menüyü aç/kapat"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
      {isMobileMenuOpen && (
        <MobileNav 
          toggleMobileMenu={toggleMobileMenu} 
        />
      )}
    </header>
  );
}