import type { Metadata } from "next";
import { Arimo, Syne } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import ConditionalLayout from "./components/ConditionalLayout";
import "./globals.css";
import Script from "next/script";

// Font definitions
const arimo = Arimo({
  variable: "--font-arimo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

// Helper function to get page type from URL
function getPageTypeFromUrl(url: string): {
  pageType: string;
  title: string;
  description: string;
  canonical: string;
} {
  const baseUrl = 'https://certificates.myunilab.net';
  const cleanPath = url || '/';
  const fullCanonical = `${baseUrl}${cleanPath === '/' ? '' : cleanPath}`;
  
  // Page type detection
  if (cleanPath === '/') {
    return {
      pageType: 'homepage',
      title: "MyUNI Sertifika Doğrulama | Eğitim Sertifikalarınızı Doğrulayın",
      description: "MyUNI eğitim sertifikalarınızı güvenli bir şekilde doğrulayın. Sertifika numaranızı girerek eğitim tamamlama belgenizi kontrol edin.",
      canonical: fullCanonical
    };
  }
  
  if (cleanPath.startsWith('/kurs')) {
    // Course pages
    if (cleanPath === '/kurs') {
      // Course listing page
      return {
        pageType: 'course-listing',
        title: "Kurs Sertifikaları | MyUNI Sertifika Doğrulama",
        description: "MyUNI kurs sertifikalarınızı doğrulayın. Tamamladığınız eğitimlerin sertifikalarını güvenli bir şekilde kontrol edin.",
        canonical: fullCanonical
      };
    } else {
      // Individual course page
      const courseSlug = cleanPath.split('/').pop() || '';
      return {
        pageType: 'course-detail',
        title: `${courseSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Sertifikası | MyUNI Doğrulama`,
        description: `${courseSlug.replace(/-/g, ' ')} kursu sertifikanızı doğrulayın. MyUNI eğitim tamamlama belgenizi güvenli bir şekilde kontrol edin.`,
        canonical: fullCanonical
      };
    }
  }
  
  if (cleanPath.startsWith('/blog')) {
    if (cleanPath === '/blog') {
      return {
        pageType: 'blog-listing',
        title: "Sertifika Bilgileri | MyUNI Doğrulama",
        description: "MyUNI sertifika doğrulama sistemi hakkında bilgi alın. Eğitim sertifikalarınızı nasıl doğrulayacağınızı öğrenin.",
        canonical: fullCanonical
      };
    } else {
      const blogSlug = cleanPath.split('/').pop() || '';
      return {
        pageType: 'blog-detail',
        title: `${blogSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} | MyUNI Sertifika Doğrulama`,
        description: `${blogSlug.replace(/-/g, ' ')} hakkında bilgi alın. MyUNI sertifika doğrulama sistemi ile ilgili detayları öğrenin.`,
        canonical: fullCanonical
      };
    }
  }
  
  if (cleanPath.startsWith('/hakkimizda')) {
    return {
      pageType: 'about',
      title: "Hakkımızda | MyUNI Sertifika Doğrulama Sistemi",
      description: "MyUNI sertifika doğrulama sistemi hakkında bilgi alın. Eğitim sertifikalarınızı güvenli bir şekilde doğrulayın.",
      canonical: fullCanonical
    };
  }
  
  if (cleanPath.startsWith('/iletisim')) {
    return {
      pageType: 'contact',
      title: "İletişim | MyUNI Sertifika Doğrulama",
      description: "MyUNI sertifika doğrulama sistemi ile ilgili sorularınız için bizimle iletişime geçin. Destek alın.",
      canonical: fullCanonical
    };
  }
  
  // Default case for other pages
  return {
    pageType: 'general',
    title: "MyUNI Sertifika Doğrulama | Eğitim Sertifikalarınızı Doğrulayın",
    description: "MyUNI eğitim sertifikalarınızı güvenli bir şekilde doğrulayın. Sertifika numaranızı girerek kontrol edin.",
    canonical: fullCanonical
  };
}

// Generate metadata function
export async function generateMetadata({
  params,
}: {
  params: Promise<{ [key: string]: string | string[] }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  
  // Construct current URL from params
  const pathSegments = Object.entries(resolvedParams)
    .map(([, value]) => Array.isArray(value) ? value.join('/') : value)
    .filter(Boolean);
  
  const currentPath = pathSegments.length > 0 ? `/${pathSegments.join('/')}` : '/';
  
  const pageInfo = getPageTypeFromUrl(currentPath);

  return {
    title: pageInfo.title,
    description: pageInfo.description,
    keywords: [
      "MyUNI",
      "sertifika doğrulama",
      "eğitim sertifikası",
      "sertifika kontrol",
      "eğitim belgesi",
      "sertifika numarası",
      "eğitim tamamlama",
      "sertifika sorgulama",
      ...(pageInfo.pageType === 'course-listing' || pageInfo.pageType === 'course-detail' 
        ? ["kurs sertifikası", "eğitim belgesi", "sertifika doğrulama", "kurs tamamlama"] 
        : []),
      ...(pageInfo.pageType === 'blog-listing' || pageInfo.pageType === 'blog-detail' 
        ? ["sertifika bilgileri", "doğrulama sistemi", "eğitim belgesi", "sertifika sorgulama"] 
        : [])
    ],
    authors: [{ name: "MyUNI Sertifika Doğrulama Sistemi" }],
    robots: "index, follow",
    alternates: {
      canonical: pageInfo.canonical,
    },
    openGraph: {
      title: pageInfo.title,
      description: pageInfo.description,
      url: pageInfo.canonical,
      siteName: "MyUNI Certificates",
      images: [
        {
          url: "https://certificates.myunilab.net/og-image.jpg",
          width: 1200,
          height: 630,
          alt: "MyUNI Sertifika Doğrulama Sistemi",
        },
      ],
      locale: "tr_TR",
      type: pageInfo.pageType === 'blog-detail' ? "article" : "website",
    },
    twitter: {
      card: "summary_large_image",
      title: pageInfo.title,
      description: pageInfo.description,
      images: ["https://myunilab.net/twitter-image.jpg"],
    },
    other: {
      "script:ld+json": JSON.stringify({
        "@context": "https://schema.org",
        "@type": pageInfo.pageType === 'course-listing' || pageInfo.pageType === 'course-detail' 
          ? "Course" 
          : pageInfo.pageType === 'blog-detail' 
            ? "Article" 
            : "EducationalOrganization",
        name: pageInfo.pageType === 'course-detail' 
          ? pageInfo.title.split(' | ')[0] 
          : "MyUNI Sertifika Doğrulama Sistemi",
        alternateName: "MyUNI",
        url: pageInfo.canonical,
        logo: "https://myunilab.net/logo.png",
        description: pageInfo.description,
        ...(pageInfo.pageType === 'course-listing' || pageInfo.pageType === 'course-detail' ? {
          provider: {
            "@type": "EducationalOrganization",
            name: "MyUNI",
            url: "https://myunilab.net"
          },
          educationalLevel: "all-levels",
          teaches: "Sertifika Doğrulama ve Eğitim Belgesi Kontrolü"
        } : {
          sameAs: [
            "https://x.com/myuniturkiye",
            "https://linkedin.com/company/myuniturkiye",
            "https://instagram.com/myuniturkiye",
            "https://youtube.com/@myuniturkiye"
          ],
          educationalCredentialAwarded: "Eğitim Sertifikası",
          hasCredential: {
            "@type": "EducationalOccupationalCredential",
            name: "MyUNI Eğitim Tamamlama Sertifikası"
          }
        }),
        ...(pageInfo.pageType === 'blog-detail' ? {
          author: {
            "@type": "Organization",
            name: "MyUNI"
          },
          publisher: {
            "@type": "Organization",
            name: "MyUNI",
            logo: {
              "@type": "ImageObject",
              url: "https://myunilab.net/logo.png"
            }
          },
          datePublished: new Date().toISOString(),
          dateModified: new Date().toISOString()
        } : {})
      }),
    },
  };
}

// Viewport export
export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

// Layout component
export default async function RootLayout({ 
  children
}: { 
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" dir="ltr" className={`${arimo.variable} ${syne.variable} ${geistMono.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        
        {/* Google Tag Manager */}
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-W94586N6');
          `}
        </Script>
        
        {/* Microsoft Clarity */}
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "olp6bbrkve");
          `}
        </Script>

        {/* Additional meta tags for education platform */}
        <meta name="theme-color" content="#1f2937" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* Certificate verification specific tags */}
        <meta property="educational:type" content="certificate-verification" />
        <meta property="educational:level" content="all-levels" />
        <meta property="educational:subject" content="certificate-validation,education-verification" />
      </head>
      <body className="min-h-screen bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
        <noscript>
          <iframe 
            src="https://www.googletagmanager.com/ns.html?id=GTM-W94586N6"
            height="0" 
            width="0" 
            style={{display: 'none', visibility: 'hidden'}}
          ></iframe>
        </noscript>
        
        <ConditionalLayout>
          {children}
        </ConditionalLayout>
      </body>
    </html>
  );
}