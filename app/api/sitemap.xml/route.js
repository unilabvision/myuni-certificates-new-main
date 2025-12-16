// app/api/sitemap.xml/route.js - Single Language Sitemap
import { NextResponse } from 'next/server';

// Static routes configuration
const STATIC_ROUTES = [
  {
    path: '',
    priority: '1.0',
    changefreq: 'daily'
  },
  {
    path: 'kurs',
    priority: '0.9',
    changefreq: 'weekly'
  },
  {
    path: 'blog',
    priority: '0.8', 
    changefreq: 'daily'
  },
  {
    path: 'hakkimizda',
    priority: '0.7',
    changefreq: 'monthly'
  },
  {
    path: 'iletisim', 
    priority: '0.6',
    changefreq: 'monthly'
  },
  {
    path: 'kariyer',
    priority: '0.6',
    changefreq: 'monthly'
  },
  {
    path: 'gizlilik',
    priority: '0.4',
    changefreq: 'yearly'
  },
  {
    path: 'sartlar-ve-kosullar',
    priority: '0.4', 
    changefreq: 'yearly'
  }
];

// Date formatter for sitemap
function formatSitemapDate(date) {
  return new Date(date).toISOString();
}

// Generate static routes
function generateStaticRoutes(baseUrl) {
  const routes = [];
  
  STATIC_ROUTES.forEach((config) => {
    const url = config.path ? `${baseUrl}/${config.path}` : baseUrl;
    routes.push({
      loc: url,
      lastmod: formatSitemapDate(new Date()),
      changefreq: config.changefreq,
      priority: config.priority
    });
  });
  
  return routes;
}

// Generate XML sitemap
function generateSitemapXML(routes) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(route => `  <url>
    <loc>${route.loc}</loc>
    <lastmod>${route.lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
  
  return xml;
}

// Main sitemap generation function
export async function GET() {
  try {
    // Get base URL from environment or use default
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://myunilab.net';
    
    console.log('🚀 Generating sitemap for:', baseUrl);
    
    // Generate static routes
    const staticRoutes = generateStaticRoutes(baseUrl);
    
    // Combine all routes
    const allRoutes = [
      ...staticRoutes
    ];
    
    // Sort routes by priority (highest first)
    allRoutes.sort((a, b) => parseFloat(b.priority) - parseFloat(a.priority));
    
    console.log(`✅ Generated sitemap with ${allRoutes.length} URLs`);
    
    // Generate XML
    const xml = generateSitemapXML(allRoutes);
    
    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
      },
    });
    
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    
    // Return minimal sitemap on error
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://myunilab.net';
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${formatSitemapDate(new Date())}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/kurs</loc>
    <lastmod>${formatSitemapDate(new Date())}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${formatSitemapDate(new Date())}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;
    
    return new NextResponse(fallbackXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  }
}