import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Award, Search, AlertCircle, ArrowLeft } from 'lucide-react';

interface SearchParams {
  name?: string;
  [key: string]: string | string[] | undefined;
}

interface Certificate {
  id: number;
  fullname: string;
  coursename: string;
  certificatenumber: string;
  issuedate: string;
  organization?: string;
  organization_slug?: string;
  instructor?: string;
}

export default async function SearchResultsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const resolvedSearchParams = await searchParams; // Await the searchParams
  const searchName = resolvedSearchParams?.name || '';

  if (!searchName || searchName.length < 3) {
    return (
      <div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <h1 className="text-2xl font-bold mb-3 text-red-700">Arama Sonuçları</h1>
          <p className="text-red-600 mb-6">İsim aratabilmek için en az 3 karakter girmelisiniz. Lütfen tekrar deneyin.</p>
          <Link href="/" className="inline-flex items-center gap-2 bg-red-900 hover:bg-red-800 text-white px-6 py-3 rounded-md transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  // Fetch certificates from Supabase
  const { data: certificates, error } = await supabase
    .from('certificates')
    .select('id, fullname, coursename, certificatenumber, issuedate, organization')
    .ilike('fullname', `%${searchName}%`)
    .order('issuedate', { ascending: false });

  if (error) {
    console.error('Error fetching certificates:', error);
    return (
      <div className="container">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <h1 className="text-2xl font-bold mb-3 text-red-700">Arama Sonuçları</h1>
          <p className="text-red-600 mb-6">Bir hata oluştu. Lütfen daha sonra tekrar deneyin.</p>
          <Link href="/" className="inline-flex items-center gap-2 bg-red-900 hover:bg-red-800 text-white px-6 py-3 rounded-md transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  // Function to mask names for display
  const maskName = (name: string): string => {
    if (!name || name.length <= 5) return name;
    const firstPart = name.substring(0, 3);
    const asterisks = '*'.repeat(Math.min(name.length - 3, 5));
    return `${firstPart}${asterisks}`;
  };

  return (
    <div className="mx-auto">
      <div className="mb-8 border-b pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Arama Sonuçları</h1>
          </div>
          <Link href="/" className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Ana Sayfa
          </Link>
        </div>
      </div>

      {certificates.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <Search className="h-16 w-16 text-gray-400 mx-auto mb-3" />
          <h2 className="text-xl font-semibold mb-3">Sonuç Bulunamadı</h2>
          <p className="text-gray-600 mb-6">Aranan isimle eşleşen herhangi bir sertifika kaydı bulunamadı.</p>
          <Link href="/" className="inline-flex items-center gap-2 bg-red-900 hover:bg-red-800 text-white px-6 py-3 rounded-md transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Ana Sayfaya Dön
          </Link>
        </div>
      ) : (
        <div>
          <div className="border border-gray-200 rounded-lg px-5 py-3 mb-6 flex items-center">
            <Award className="h-5 w-5 text-red-500 mr-2" />
            <p>{certificates.length} sertifika kaydı bulundu</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert: Certificate) => (
              <div
                key={cert.id}
                className="rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-all hover:translate-y-px"
              >
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-lg font-semibold">{maskName(cert.fullname)}</h2>
                  <div className="bg-red-50 text-red-800 text-xs px-2 py-1 rounded-full">
                    {new Date(cert.issuedate).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'short',
                    })}
                  </div>
                </div>

                <div className="rounded-md p-3 mb-4 border-l-4 border-red-700">
                  <p className="font-medium">{cert.coursename}</p>
                </div>

                <div className="text-sm mb-4 flex items-center">
                  <span className="mr-2">Sertifika No:</span>
                  <span className="font-mono">
                    {cert.certificatenumber.substring(0, 6)}
                    {'*'.repeat(cert.certificatenumber.length - 9)}***
                  </span>
                </div>

                <div className="mt-4">
                  {/* TODO: Fix VerificationModal props mismatch */}
                  {/* <VerificationModal
                    certificateNumber={cert.certificatenumber}
                    fullName={cert.fullname}
                    organizationSlug={getOrganizationSlug(cert.organization)}
                  /> */}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}