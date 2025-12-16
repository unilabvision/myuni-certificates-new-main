// hooks/useUserModules.ts
import { useState, useEffect } from 'react';

interface UserModule {
  key: string;
  name_tr: string;
  name_en: string;
  description_tr: string;
  description_en: string;
  icon: string;
  category: string;
  sort_order: number;
  accessGrantedAt?: string;
  expiresAt?: string;
}

export function useUserModules() {
  const [modules, setModules] = useState<UserModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Since we removed Clerk, we'll simulate no user/modules
  const isLoaded = true;
  const userId = null;

  useEffect(() => {
    async function fetchUserModules() {
      if (!isLoaded || !userId) {
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching user modules...');
        
        const response = await fetch('/api/auth/user-modules');
        
        if (!response.ok) {
          const errorData = await response.text();
          console.error('API response error:', response.status, errorData);
          throw new Error(`Failed to fetch user modules: ${response.status}`);
        }

        const data = await response.json();
        console.log('User modules response:', data);
        
        setModules(data.modules || []);
      } catch (err) {
        console.error('useUserModules error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchUserModules();
  }, [isLoaded, userId]);

  const hasModule = (moduleKey: string) => {
    return modules.some(module => module.key === moduleKey);
  };

  const getModulesByCategory = (category: string) => {
    return modules.filter(module => module.category === category);
  };

  return {
    modules,
    loading,
    error,
    hasModule,
    getModulesByCategory,
    totalModules: modules.length
  };
}