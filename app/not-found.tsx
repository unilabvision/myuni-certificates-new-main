import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">404</div>
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
          Sayfa Bulunamadı
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
          Aradığınız sayfa mevcut değil veya taşınmış olabilir.
        </p>
        <Link 
          href="/"
          className="inline-block px-6 py-3 bg-[#990000] text-white rounded-md hover:bg-[#800000] transition-colors"
        >
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
}
