
// components/OrganizationHeader.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Menu, X, Globe, Moon, Sun } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import ThemeToggle from './ThemeToggle';
import OrganizationMobileNav from './OrganizationMobileNav';

interface Organization {
  slug: string;
  name: string;
  description?: string;
  logo?: string;
  primary_color?: string;
  secondary_color?: string;
  website?: string;
}

export default function OrganizationHeader() {
  const params = useParams();
  const organization = params.organization as string;
  const [orgData, setOrgData] = useState<Organization | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [orgColor, setOrgColor] = useState('#990000');

  useEffect(() => {
    async function fetchOrganizationData() {
      if (!organization) return;

      try {
        // Debug: Tüm organizasyonları listele
        const { data: allOrgs, error: listError } = await supabase
          .from('organizations')
          .select('slug, name');
        
        if (!listError) {
          console.log('Available organizations in database:', allOrgs);
        }
        
        const { data } = await supabase
          .from('organizations')
          .select('slug, name, description, logo, primary_color, secondary_color, website')
          .eq('slug', organization.trim())
          .single();

        if (data) {
          console.log('Organization data found:', data);
          setOrgData(data);
          if (data.primary_color) {
            setOrgColor(data.primary_color);
          }
        } else {
          console.log('No organization data found for slug:', organization.trim());
        }
      } catch (err) {
        console.error('Error fetching organization data:', err);
      }
    }

    fetchOrganizationData();
  }, [organization]);

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
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

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  };

  if (!orgData) {
    return null; // Loading state
  }

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200
        ${isScrolled ? 'bg-white dark:bg-neutral-900/95 shadow-sm py-3' : 'bg-white dark:bg-neutral-900 py-4'} 
        border-b border-gray-200 dark:border-gray-700`}
      style={{ '--org-primary': orgColor } as React.CSSProperties}
    >
      <div className="mx-auto px-6 sm:px-6 md:px-6 lg:px-6 flex justify-between items-center max-w-8xl">
        {/* Logo and Organization Name */}
        <Link href={`/${organization}`} className="transition-all duration-200 flex items-center group">
          {orgData.logo ? (
            <img 
              alt={orgData.name} 
              width="40" 
              height="40" 
              className="h-10 w-10 rounded-md mr-3 group-hover:scale-105 transition-transform duration-200 object-contain dark:brightness-0 dark:invert"
              src={orgData.logo}
            />
          ) : (
            <div 
              className="h-10 w-10 rounded-md mr-3 flex items-center justify-center text-white font-bold text-lg group-hover:scale-105 transition-transform duration-200"
              style={{ backgroundColor: orgColor }}
            >
              {orgData.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-900 dark:text-white group-hover:opacity-80 transition-opacity duration-200">
              {orgData.name}
            </span>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Sertifika Doğrulama
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-8">
          <Link 
            href={`/${organization}`}
            className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
          >
            Ana Sayfa
          </Link>
          <Link 
            href={`/${organization}/search`}
            className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
          >
            Sertifika Ara
          </Link>
          {orgData.website && (
            <a 
              href={orgData.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 flex items-center"
            >
              <Globe className="w-4 h-4 mr-1" />
              Website
            </a>
          )}
        </nav>

        {/* Right Side Actions */}
        <div className="hidden lg:flex items-center space-x-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Back to Main Site */}
          <Link
            href="/"
            className="px-4 py-2 text-sm font-medium text-white rounded-md transition-all duration-200 hover:opacity-90"
            style={{ backgroundColor: orgColor }}
          >
            Ana Siteye Dön
          </Link>
        </div>

        {/* Mobile Menu */}
        <div className="lg:hidden flex items-center space-x-4">
          <ThemeToggle
            isDarkMode={isDarkMode}
            setIsDarkMode={toggleTheme}
          />
          
          <button
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 flex items-center justify-center"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menüyü aç/kapat"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <OrganizationMobileNav 
          toggleMobileMenu={() => setIsMobileMenuOpen(false)}
          organization={organization}
          orgData={orgData}
          orgColor={orgColor}
        />
      )}
    </header>
  );
}