'use client';

import { Star, Quote } from 'lucide-react';

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Ahmet Yılmaz",
      position: "IT Direktörü",
      company: "TechCorp",
      content: "Sertifika yönetim süreçlerimizi %80 oranında hızlandırdık. Platform sayesinde tüm süreçler şeffaf ve takip edilebilir hale geldi.",
      rating: 5
    },
    {
      name: "Fatma Demir",
      position: "İnsan Kaynakları Müdürü",
      company: "EduGroup",
      content: "Çalışanlarımızın sertifika takibini artık çok kolay yapıyoruz. Dijital dönüşüm sürecimizde önemli bir adım attık.",
      rating: 5
    },
    {
      name: "Mehmet Kaya",
      position: "Kalite Müdürü",
      company: "ManufacturingCo",
      content: "ISO sertifikalarımızın yönetiminde büyük kolaylık sağladı. Özellikle denetim süreçlerinde çok faydalı.",
      rating: 5
    }
  ];

  return (
    <section className="py-20 bg-neutral-50 dark:bg-neutral-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-left mb-16">
          <h2 className="text-3xl lg:text-4xl font-semibold text-neutral-900 dark:text-white mb-4">
            Müşterilerimiz Ne Diyor?
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl">
            MyUNI Certificates kullanıcılarının gerçek deneyimleri ve platform hakkındaki görüşleri
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white dark:bg-neutral-700 p-8 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-red-100 dark:border-red-800">
              <div className="flex items-center mb-4">
                <Quote className="w-8 h-8 text-red-300 dark:text-red-500" />
              </div>
              
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>

              <p className="text-neutral-600 dark:text-neutral-300 mb-6 leading-relaxed">
                &ldquo;{testimonial.content}&rdquo;
              </p>

              <div className="border-t border-neutral-100 dark:border-neutral-600 pt-4">
                <div className="font-medium text-neutral-900 dark:text-white">
                  {testimonial.name}
                </div>
                <div className="text-sm text-neutral-500 dark:text-neutral-400">
                  {testimonial.position}, {testimonial.company}
                </div>
              </div>
            </div>
          ))}
        </div>

        
      </div>
    </section>
  );
}
