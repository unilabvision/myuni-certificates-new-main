'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Mail, Linkedin, Instagram, Globe, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Organization {
  slug: string;
  name: string;
  description?: string;
  logo?: string;
  primary_color?: string;
  secondary_color?: string;
  website?: string;
}

export default function OrganizationFooter() {
  const params = useParams();
  const organization = params.organization as string;
  const [orgData, setOrgData] = useState<Organization | null>(null);
  const [orgColor, setOrgColor] = useState('#990000');

  useEffect(() => {
    async function fetchOrganizationData() {
      if (!organization) return;

      try {
        const { data } = await supabase
          .from('organizations')
          .select('slug, name, description, logo, primary_color, secondary_color, website')
          .eq('slug', organization.trim())
          .single();

        if (data) {
          setOrgData(data);
          if (data.primary_color) {
            setOrgColor(data.primary_color);
          }
        }
      } catch (err) {
        console.error('Error fetching organization data:', err);
      }
    }

    fetchOrganizationData();
  }, [organization]);

  if (!orgData) {
    return null; // Loading state
  }

  return (
    <footer className="bg-neutral-900 dark:bg-neutral-950 text-neutral-300 py-16 px-6">
      <div className="container mx-auto max-w-7xl px-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Organization Info */}
          <div className="md:col-span-2">
            <div className="flex items-center mb-6">
              {orgData.logo ? (
                <img 
                  alt={orgData.name} 
                  width="80" 
                  height="80" 
                  className="h-20 w-20 rounded-md object-contain brightness-0 invert"
                  src={orgData.logo}
                />
              ) : (
                <div 
                  className="h-20 w-20 rounded-md flex items-center justify-center text-white font-bold text-2xl"
                  style={{ backgroundColor: orgColor }}
                >
                  {orgData.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            {orgData.description && (
              <p className="mt-4 text-sm leading-relaxed text-neutral-400 max-w-md">
                {orgData.description}
              </p>
            )}
            
            <p className="mt-4 text-sm text-neutral-500 max-w-md">
              Sertifika doğrulama platformu üzerinden verilen tüm sertifikalarımız güvenli ve doğrulanabilir.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-medium text-neutral-100 mb-4">Hızlı Erişim</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href={`/${organization}`}
                  className="text-sm text-neutral-400 hover:text-white transition-colors duration-200"
                >
                  Ana Sayfa
                </Link>
              </li>
              <li>
                <Link 
                  href={`/${organization}/search`}
                  className="text-sm text-neutral-400 hover:text-white transition-colors duration-200"
                >
                  Sertifika Ara
                </Link>
              </li>
              <li>
                <Link 
                  href="/"
                  className="text-sm text-neutral-400 hover:text-white transition-colors duration-200"
                >
                  MyUNI Ana Site
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className="text-sm font-medium text-neutral-100 mb-4">İletişim</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="mailto:info@myunilab.net"
                  className="text-sm text-neutral-400 hover:text-white transition-colors duration-200 flex items-center"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  info@myunilab.net
                </a>
              </li>
              {orgData.website && (
                <li>
                  <a 
                    href={orgData.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-neutral-400 hover:text-white transition-colors duration-200 flex items-center"
                >
                    <Globe className="w-4 h-4 mr-2" />
                    Website
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </li>
              )}
              <li>
                <a 
                  href="https://linkedin.com/company/myuniturkiye"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-neutral-400 hover:text-white transition-colors duration-200 flex items-center"
                >
                  <Linkedin className="w-4 h-4 mr-2" />
                  LinkedIn
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </li>
              <li>
                <a 
                  href="https://instagram.com/myuniturkiye"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-neutral-400 hover:text-white transition-colors duration-200 flex items-center"
                >
                  <Instagram className="w-4 h-4 mr-2" />
                  Instagram
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-16 pt-6 border-t border-neutral-800">
          <div className="flex flex-col lg:flex-row justify-between items-center">
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
              <p className="text-neutral-500 text-sm text-center md:text-left">
                © 2025 {orgData.name}. Tüm hakları saklıdır.
              </p>
              <p className="text-neutral-500 text-sm text-center md:text-left">
                MyUNI Sertifika Doğrulama Platformu
              </p>
            </div>
            
            <div className="flex space-x-6 mt-4 lg:mt-0">
              <Link 
                href="/gizlilik"
                className="text-neutral-500 hover:text-white transition-colors duration-200 text-sm"
              >
                Gizlilik Politikası
              </Link>
              <Link 
                href="/sartlar-ve-kosullar"
                className="text-neutral-500 hover:text-white transition-colors duration-200 text-sm"
              >
                Kullanım Koşulları
              </Link>
              <Link 
                href="/"
                className="text-neutral-500 hover:text-white transition-colors duration-200 text-sm"
              >
                MyUNI Ana Site
              </Link>
            </div>
          </div>
        </div>


      </div>
    </footer>
  );
}