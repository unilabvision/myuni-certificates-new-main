// app/hooks/useAuth.ts
import { useRouter } from 'next/navigation';

export function useAuthUser() {
  const router = useRouter();

  // Since we removed Clerk, we'll return default values
  // You can later implement your own auth logic here
  const isSignedIn = false;
  const isLoaded = true;
  const userId = null;

  const redirectToSignup = (locale: string) => {
    router.push(`/${locale}/member/signup`);
  };

  const redirectToLogin = (locale: string) => {
    router.push(`/${locale}/member/login`);
  };

  return { 
    isSignedIn, 
    isLoaded, 
    userId,
    loading: !isLoaded,
    redirectToSignup,
    redirectToLogin
  };
}