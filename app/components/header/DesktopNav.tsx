import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown } from "lucide-react";

interface MenuItem {
  href: string;
  label: string;
  children?: MenuItem[];
}

export default function DesktopNav() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const items = useMemo(() => {
    const menuItems: MenuItem[] = [
      { href: "/", label: "Ana Sayfa" },
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
    
    return menuItems;
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDropdownToggle = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  const handleMouseEnter = (label: string, hasChildren: boolean) => {
    if (hasChildren) {
      setOpenDropdown(label);
    }
  };

  const handleMouseLeave = () => {
    // Small delay to allow moving to dropdown
    setTimeout(() => {
      if (!dropdownRef.current?.matches(':hover')) {
        setOpenDropdown(null);
      }
    }, 100);
  };

  return (
    <div ref={dropdownRef}>
      <nav className="hidden lg:flex items-center space-x-10">
        {items.map((item, index) => (
          <div
            key={index}
            className="relative group"
            onMouseEnter={() => handleMouseEnter(item.label, !!item.children)}
            onMouseLeave={handleMouseLeave}
          >
            {item.children ? (
              <div>
                <button
                  onClick={() => handleDropdownToggle(item.label)}
                  className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors duration-200"
                >
                  {item.label}
                  <ChevronDown 
                    className={`ml-1 h-4 w-4 transition-transform duration-200 ${
                      openDropdown === item.label ? 'rotate-180' : ''
                    }`} 
                  />
                </button>
                
                {/* Dropdown Menu */}
                {openDropdown === item.label && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 py-2 z-50">
                    {item.children.map((child, childIndex) => (
                      <a
                        key={childIndex}
                        href={child.href}
                        className="block px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors duration-200"
                        onClick={() => setOpenDropdown(null)}
                        {...(child.href.startsWith('http') && {
                          target: "_blank",
                          rel: "noopener noreferrer"
                        })}
                      >
                        {child.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <a
                href={item.href}
                className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors duration-200"
              >
                {item.label}
              </a>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}