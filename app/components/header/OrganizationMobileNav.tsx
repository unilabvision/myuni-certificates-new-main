'use client';

import Link from "next/link";
import { Globe, User, Search } from 'lucide-react';

interface Organization {
  name: string;
  primary_color?: string;
  secondary_color?: string;
  logo?: string;
  website?: string;
}

interface OrganizationMobileNavProps {
  toggleMobileMenu: () => void;
  organization: string;
  orgData: Organization | null;
  orgColor: string;
}

export default function OrganizationMobileNav({ 
  toggleMobileMenu, 
  organization, 
  orgData, 
  orgColor 
}: OrganizationMobileNavProps) {
  return (
    <div className="lg:hidden bg-white min-h-screen dark:bg-neutral-900 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 absolute top-full left-0 right-0 z-40 animate-slideDown shadow-lg">
      <nav className="max-w-6xl mx-auto px-6 py-6 flex flex-col space-y-4">
        {/* Menu Items */}
        <Link
          href={`/${organization}`}
          className="text-base font-medium text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary transition-colors duration-200"
          onClick={toggleMobileMenu}
        >
          Ana Sayfa
        </Link>
        
        <Link
          href={`/${organization}/search`}
          className="text-base font-medium text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary transition-colors duration-200"
          onClick={toggleMobileMenu}
        >
          Sertifika Ara
        </Link>
        
        {orgData?.website && (
          <a 
            href={orgData?.website || ''}
            target="_blank"
            rel="noopener noreferrer"
            className="text-base font-medium text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary transition-colors duration-200 flex items-center"
            onClick={toggleMobileMenu}
          >
            <Globe className="h-4 w-4 mr-2" />
            Website
          </a>
        )}

        {/* Action Buttons */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
          <Link
            href="/"
            className="block w-full text-white px-4 py-3 text-center text-base font-medium transition-colors duration-200 border-0 rounded-md"
            style={{ backgroundColor: orgColor }}
            onClick={toggleMobileMenu}
          >
            Ana Siteye Dön
          </Link>
          
          <Link
            href="/dashboard"
            className="block w-full bg-black dark:bg-white text-white dark:text-black px-4 py-3 text-center text-base font-medium transition-colors duration-200 hover:bg-gray-800 dark:hover:bg-gray-200 border-0 rounded-md"
            onClick={toggleMobileMenu}
          >
            Dashboard
          </Link>
        </div>

        {/* Mobile Utility Icons */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center space-x-8">
            <button className="text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100 transition-colors duration-200">
              <Search className="h-5 w-5" />
            </button>
            
            <Link
              href="/dashboard"
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
