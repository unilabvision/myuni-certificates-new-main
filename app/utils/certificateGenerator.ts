import { createClient } from '@supabase/supabase-js';

// Supabase istemcisi
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Template design settings interface
interface TemplateDesignSettings {
  fonts: {
    body: string;
    name: string;
    title: string;
  };
  colors: {
    name: string;
    text: string;
    primary: string;
    secondary: string;
    institution: string;
    certificate_no: string;
  };
  layout: {
    date_position: PositionConfig;
    name_position: PositionConfig;
    title_position: PositionConfig;
    signature_position: PositionConfig;
    description_position: PositionConfig;
    institution_position: PositionConfig;
    certificate_no_position: PositionConfig;
    course_name_position: PositionConfig;
  };
  font_sizes: {
    date: number;
    name: number;
    title: number;
    signature: number;
    institution: number;
    certificate_no: number;
    description: number;
    course_name: number;
  };
}

interface PositionConfig {
  x: number;
  y: number;
  align: 'left' | 'center' | 'right';
  enabled: boolean;
  x_manual: number;
  y_manual: number;
}

interface CertificateTemplate {
  id: number;
  name: string;
  description: string | null;
  background_image: string;
  organization_slug: string;
  is_default: boolean;
  design_settings: string; // JSON string
  created_at: string;
  updated_at: string;
}

interface Certificate {
  id: number;
  fullname: string;
  coursename: string;
  certificatenumber: string;
  issuedate: string;
  organization?: string;
  instructor?: string;
  duration?: string;
  instructor_bio?: string;
  organization_description?: string;
  skills?: string[];
  grade?: string;
  totalHours?: string;
  course_logo?: string;
  language?: string;
  certificate_title?: string;
  provider_text?: string;
  completion_text?: string;
  instructor_label?: string;
  date_label?: string;
  certificate_number_label?: string;
  qr_scan_text?: string;
  skills_label?: string;
  total_hours_label?: string;
  grade_label?: string;
  organization_slug?: string;
  template_id?: number;
  description?: string;
  signature?: string;
  course_name_position?: { x: number; y: number; align?: string };
}

// Varsayılan dil metinleri
const getDefaultTexts = (language: string = 'tr') => {
  const texts = {
    tr: {
      certificate_title: 'Başarı Sertifikası',
      provider_text: 'tarafından sunulan',
      completion_text: 'Eğitimi videolarını tamamlayarak ve sınavdan geçerli notu alarak bu sertifikayı almaya hak kazanmıştır.',
      instructor_label: 'EĞİTMEN/KURUM',
      date_label: 'VERİLİŞ TARİHİ',
      certificate_number_label: 'SERTİFİKA NO',
      qr_scan_text: 'Doğrulama için tarayın',
      skills_label: 'Kazanılan Yetenekler',
      total_hours_label: 'Toplam',
      grade_label: 'Başarı Notu'
    },
    en: {
      certificate_title: 'Certificate of Achievement',
      provider_text: 'provided by',
      completion_text: 'Successfully completed the course requirements and achieved a passing grade, thereby earning this certificate of completion.',
      instructor_label: 'INSTRUCTOR/ORGANIZATION',
      date_label: 'ISSUE DATE',
      certificate_number_label: 'CERTIFICATE NO',
      qr_scan_text: 'Scan to verify',
      skills_label: 'Skills Acquired',
      total_hours_label: 'Total',
      grade_label: 'Grade'
    },
    global: {
      certificate_title: 'Certificate of Completion',
      provider_text: 'issued by',
      completion_text: 'Has successfully completed all course modules and assessments and is hereby awarded this certificate.',
      instructor_label: 'INSTRUCTOR',
      date_label: 'DATE ISSUED',
      certificate_number_label: 'CERTIFICATE ID',
      qr_scan_text: 'Scan to authenticate',
      skills_label: 'Competencies Gained',
      total_hours_label: 'Duration',
      grade_label: 'Final Score'
    }
  };

  return texts[language as keyof typeof texts] || texts.tr;
};

// Template'i veritabanından getir
export const getCertificateTemplate = async (organizationSlug: string, templateId?: number): Promise<CertificateTemplate | null> => {
  try {
    console.log('Template aranıyor:', { organizationSlug, templateId });
    
    let query = supabase
      .from('certificate_templates')
      .select('*')
      .eq('organization_slug', organizationSlug);

    if (templateId) {
      query = query.eq('id', templateId);
    } else {
      query = query.eq('is_default', true);
    }

    const { data, error } = await query.single();

    if (error) {
      console.error('Template bulunamadı:', error);
      return null;
    }

    console.log('Template bulundu:', data ? { 
      id: data.id, 
      name: data.name,
      design_settings_type: typeof data.design_settings,
      design_settings_length: data.design_settings ? (typeof data.design_settings === 'string' ? data.design_settings.length : 'object') : 'null'
    } : null);
    return data;
  } catch (error) {
    console.error('Template getirme hatası:', error);
    return null;
  }
};

// Supabase'den sertifika verilerini çek
export const getCertificateData = async (certificateNumber: string): Promise<Certificate | null> => {
  try {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('certificatenumber', certificateNumber)
      .single();

    if (error) {
      console.error('Sertifika bulunamadı:', error);
      return null;
    }

    // Dil tabanlı varsayılan metinleri birleştir
    const language = data.language || 'tr';
    const defaultTexts = getDefaultTexts(language);
    
    // Database'den gelen custom metinler varsa onları kullan, yoksa varsayılanları kullan
    const certificateData: Certificate = {
      ...data,
      certificate_title: data.certificate_title || defaultTexts.certificate_title,
      provider_text: data.provider_text || defaultTexts.provider_text,
      completion_text: data.completion_text || defaultTexts.completion_text,
      instructor_label: data.instructor_label || defaultTexts.instructor_label,
      date_label: data.date_label || defaultTexts.date_label,
      certificate_number_label: data.certificate_number_label || defaultTexts.certificate_number_label,
      qr_scan_text: data.qr_scan_text || defaultTexts.qr_scan_text,
      skills_label: data.skills_label || defaultTexts.skills_label,
      total_hours_label: data.total_hours_label || defaultTexts.total_hours_label,
      grade_label: data.grade_label || defaultTexts.grade_label
    };

    return certificateData;
  } catch (error) {
    console.error('Veritabanı hatası:', error);
    return null;
  }
};

// Arka plan resmi yükle
const loadBackgroundImage = async (imageUrl: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    // Browser environment kontrolü
    if (typeof window === 'undefined') {
      reject(new Error('Browser environment gerekli'));
      return;
    }
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      console.log('Arka plan resmi yüklendi:', { width: img.width, height: img.height, src: imageUrl });
      resolve(img);
    };
    
    img.onerror = (error) => {
      console.error('Arka plan resmi yüklenemedi:', { imageUrl, error });
      reject(new Error(`Arka plan resmi yüklenemedi: ${imageUrl}`));
    };
    
    img.src = imageUrl;
  });
};

// Font ailesini belirle
const getFontFamily = (fontType: string): string => {
  const fontMap: { [key: string]: string } = {
    'sans_serif': 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    'serif': 'Georgia, "Times New Roman", serif',
    'monospace': 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
    'cursive': 'cursive',
    'fantasy': 'fantasy'
  };
  
  return fontMap[fontType] || fontMap['sans_serif'];
};

// Pozisyon hesaplama (yüzde bazlı koordinatları piksel'e çevir)
const calculatePosition = (config: PositionConfig, canvasWidth: number, canvasHeight: number) => {
  if (config.enabled) {
    const x = Math.round((config.x / 100) * canvasWidth);
    const y = Math.round((config.y / 100) * canvasHeight);
    
    console.log('Pozisyon hesaplandı:', { 
      original: { x: config.x, y: config.y }, 
      calculated: { x, y }, 
      canvas: { width: canvasWidth, height: canvasHeight },
      align: config.align 
    });
    
    return {
      x,
      y,
      align: config.align
    };
  }
  return null;
};

// Dinamik sertifika oluşturma
export const generateDynamicCertificateCanvas = async (
  data: Certificate,
  template: CertificateTemplate
): Promise<HTMLCanvasElement> => {
  // Browser environment kontrolü
  if (typeof window === 'undefined') {
    throw new Error('Browser environment gerekli');
  }
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas bağlamı kullanılamıyor');

  try {
    console.log('Dinamik sertifika oluşturuluyor:', {
      template_name: template.name,
      background_image: template.background_image,
      design_settings: template.design_settings
    });
    
    // Template design settings'i parse et
    let designSettings: TemplateDesignSettings;
    
    // design_settings zaten obje ise kullan, string ise parse et
    if (typeof template.design_settings === 'object' && template.design_settings !== null) {
      designSettings = template.design_settings as TemplateDesignSettings;
      console.log('Design settings zaten obje olarak geldi:', designSettings);
    } else if (typeof template.design_settings === 'string') {
      try {
        designSettings = JSON.parse(template.design_settings);
        console.log('Design settings string olarak parse edildi:', designSettings);
      } catch (parseError) {
        console.error('Design settings parse hatası:', parseError);
        throw new Error('Template design settings parse edilemedi');
      }
    } else {
      throw new Error('Template design settings bulunamadı veya geçersiz format');
    }
    
    // Arka plan resmini yükle
    console.log('Arka plan resmi yükleniyor:', template.background_image);
    const backgroundImg = await loadBackgroundImage(template.background_image);
    
    // Arka plan görselinin oranını hesapla
    const imageAspectRatio = backgroundImg.naturalWidth / backgroundImg.naturalHeight;
    console.log('Arka plan görsel oranı:', imageAspectRatio, `(${backgroundImg.naturalWidth}x${backgroundImg.naturalHeight})`);
    
    // Standart çözünürlük ama oranı koruyarak boyut hesapla
    const STANDARD_HEIGHT = 1200;
    const calculatedWidth = Math.round(STANDARD_HEIGHT * imageAspectRatio);
    
    // Canvas boyutlarını hesaplanan boyutlara göre ayarla
    canvas.width = calculatedWidth;
    canvas.height = STANDARD_HEIGHT;
    console.log('Canvas boyutları oran korunarak ayarlandı:', { width: canvas.width, height: canvas.height });
    
    // Arka plan resmini hesaplanan boyuta çiz
    ctx.drawImage(backgroundImg, 0, 0, calculatedWidth, STANDARD_HEIGHT);
    console.log('Arka plan resmi oran korunarak çizildi');
    
    // Font ailelerini ayarla
    const nameFont = getFontFamily(designSettings.fonts.name);
    const titleFont = getFontFamily(designSettings.fonts.title);
    const bodyFont = getFontFamily(designSettings.fonts.body);
    
    // Renkleri ayarla
    const colors = designSettings.colors;
    const fontSizes = designSettings.font_sizes;
    
    // İsim pozisyonu
    const namePos = calculatePosition(designSettings.layout.name_position, canvas.width, canvas.height);
    if (namePos && designSettings.layout.name_position.enabled) {
      ctx.fillStyle = colors.name;
      ctx.font = `600 ${fontSizes.name}px ${nameFont}`;
      ctx.textAlign = namePos.align as CanvasTextAlign;
      ctx.textBaseline = 'middle';
      
      // İsmi çiz - pozisyon zaten piksel cinsinden hesaplandı
      ctx.fillText(data.fullname, namePos.x, namePos.y);
      console.log('İsim çizildi:', { text: data.fullname, x: namePos.x, y: namePos.y, align: namePos.align });
    }
    
    // Tarih pozisyonu
    const datePos = calculatePosition(designSettings.layout.date_position, canvas.width, canvas.height);
    if (datePos && designSettings.layout.date_position.enabled) {
      ctx.fillStyle = colors.text;
      ctx.font = `500 ${fontSizes.date}px ${bodyFont}`;
      ctx.textAlign = datePos.align as CanvasTextAlign;
      ctx.textBaseline = 'middle';
      
      // Tarihi formatla
      let formattedDate;
      const dateObj = new Date(data.issuedate);
      if (data.language === 'en' || data.language === 'global') {
        formattedDate = dateObj.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });
      } else {
        formattedDate = dateObj.toLocaleDateString('tr-TR', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });
      }
      
      // Tarihi çiz - pozisyon zaten piksel cinsinden hesaplandı
      ctx.fillText(formattedDate, datePos.x, datePos.y);
      console.log('Tarih çizildi:', { text: formattedDate, x: datePos.x, y: datePos.y, align: datePos.align });
    }
    
    // Başlık pozisyonu
    const titlePos = calculatePosition(designSettings.layout.title_position, canvas.width, canvas.height);
    if (titlePos && designSettings.layout.title_position.enabled) {
      ctx.fillStyle = colors.primary;
      ctx.font = `600 ${fontSizes.title}px ${titleFont}`;
      ctx.textAlign = titlePos.align as CanvasTextAlign;
      ctx.textBaseline = 'middle';
      
      ctx.fillText(data.certificate_title || '', titlePos.x, titlePos.y);
      console.log('Başlık çizildi:', { text: data.certificate_title, x: titlePos.x, y: titlePos.y, align: titlePos.align });
    }
    
    // Kurum pozisyonu
    const institutionPos = calculatePosition(designSettings.layout.institution_position, canvas.width, canvas.height);
    if (institutionPos && designSettings.layout.institution_position.enabled) {
      ctx.fillStyle = colors.institution;
      ctx.font = `500 ${fontSizes.institution}px ${bodyFont}`;
      ctx.textAlign = institutionPos.align as CanvasTextAlign;
      ctx.textBaseline = 'middle';
      
      ctx.fillText(data.organization || '', institutionPos.x, institutionPos.y);
      console.log('Kurum çizildi:', { text: data.organization, x: institutionPos.x, y: institutionPos.y, align: institutionPos.align });
    }
    
    // Sertifika numarası pozisyonu
    const certNoPos = calculatePosition(designSettings.layout.certificate_no_position, canvas.width, canvas.height);
    if (certNoPos && designSettings.layout.certificate_no_position.enabled) {
      ctx.fillStyle = colors.certificate_no;
      ctx.font = `500 ${fontSizes.certificate_no}px ${bodyFont}`;
      ctx.textAlign = certNoPos.align as CanvasTextAlign;
      ctx.textBaseline = 'middle';
      
      ctx.fillText(data.certificatenumber, certNoPos.x, certNoPos.y);
      console.log('Sertifika numarası çizildi:', { text: data.certificatenumber, x: certNoPos.x, y: certNoPos.y, align: certNoPos.align });
    }
    

    
    // Açıklama pozisyonu (opsiyonel) - description sütunu kullan
    const descriptionPos = calculatePosition(designSettings.layout.description_position, canvas.width, canvas.height);
    if (descriptionPos && designSettings.layout.description_position.enabled) {
      ctx.fillStyle = colors.text;
      ctx.font = `400 ${fontSizes.description || fontSizes.institution}px ${bodyFont}`;
      ctx.textAlign = descriptionPos.align as CanvasTextAlign;
      ctx.textBaseline = 'middle';
      
      // Description alanından metni al, yoksa completion_text'i kullan
      const descriptionText = data.description || data.completion_text || 'Bu sertifika, belirtilen kursun başarıyla tamamlandığını belirtir.';
      
      // Açıklama metnini çok satırlı olarak çiz
      const maxWidth = canvas.width * 0.6; // Maksimum genişlik
      const words = descriptionText.split(' ');
      const lines: string[] = [];
      let currentLine = words[0] || '';
      
      for (let i = 1; i < words.length; i++) {
        const testLine = currentLine + ' ' + words[i];
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth) {
          lines.push(currentLine);
          currentLine = words[i];
        } else {
          currentLine = testLine;
        }
      }
      lines.push(currentLine);
      
      // Satırları çiz
      const lineHeight = (fontSizes.description || fontSizes.institution) * 1.2;
      lines.forEach((line, index) => {
        const y = descriptionPos.y + (index * lineHeight);
        ctx.fillText(line, descriptionPos.x, y);
      });
      
      console.log('Açıklama çizildi:', { text: descriptionText, x: descriptionPos.x, y: descriptionPos.y, align: descriptionPos.align, lines: lines.length });
    }
    
    // Kurs adı pozisyonu (opsiyonel) - coursename kullan
    const courseNamePos = calculatePosition(designSettings.layout.course_name_position, canvas.width, canvas.height);
    if (courseNamePos && designSettings.layout.course_name_position.enabled && data.coursename) {
      ctx.fillStyle = colors.text;
      ctx.font = `600 ${fontSizes.course_name || fontSizes.title}px ${titleFont}`;
      ctx.textAlign = courseNamePos.align as CanvasTextAlign;
      ctx.textBaseline = 'middle';
      
      ctx.fillText(data.coursename, courseNamePos.x, courseNamePos.y);
      console.log('Kurs adı çizildi:', { text: data.coursename, x: courseNamePos.x, y: courseNamePos.y, align: courseNamePos.align });
    }
    
    // İmza pozisyonu (opsiyonel) - instructor kullan
    const signaturePos = calculatePosition(designSettings.layout.signature_position, canvas.width, canvas.height);
    if (signaturePos && designSettings.layout.signature_position.enabled) {
      ctx.fillStyle = colors.secondary;
      ctx.font = `500 ${fontSizes.signature}px ${bodyFont}`;
      ctx.textAlign = signaturePos.align as CanvasTextAlign;
      ctx.textBaseline = 'middle';
      
      // Instructor alanını kullan
      const signatureText = data.instructor || '';
      if (signatureText) {
        ctx.fillText(signatureText, signaturePos.x, signaturePos.y);
        console.log('İmza çizildi:', { text: signatureText, x: signaturePos.x, y: signaturePos.y, align: signaturePos.align });
      }
    }
    
  } catch (error) {
    console.error('Dinamik sertifika oluşturma hatası:', error);
    
    // Hata durumunda basit bir fallback
    canvas.width = 1700;
    canvas.height = 1200;
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = '#990000';
    ctx.lineWidth = 5;
    ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);
    
    ctx.fillStyle = '#990000';
    ctx.font = '600 48px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Sertifika Şablonu Yüklenemedi', canvas.width / 2, canvas.height / 2);
  }
  
  return canvas;
};

// Ana sertifika oluşturma fonksiyonu
export const generateCertificateCanvas = async (
  data: Certificate
): Promise<HTMLCanvasElement> => {
  try {
    // Browser environment kontrolü
    if (typeof window === 'undefined') {
      throw new Error('Browser environment gerekli - Server-side rendering desteklenmiyor');
    }
    
    console.log('Sertifika oluşturuluyor:', {
      organization_slug: data.organization_slug,
      template_id: data.template_id,
      certificate_number: data.certificatenumber
    });

    // Template'i getir
    const template = await getCertificateTemplate(
      data.organization_slug || 'default',
      data.template_id
    );
    
    console.log('Template bulundu:', template ? 'Evet' : 'Hayır');
    
    if (template) {
      console.log('Dinamik template kullanılıyor:', template.name);
      // Dinamik template kullan
      return await generateDynamicCertificateCanvas(data, template);
    } else {
      console.log('Template bulunamadı, fallback kullanılıyor');
      // Fallback: Basit sertifika
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas bağlamı kullanılamıyor');
      
      canvas.width = 1700;
      canvas.height = 1200;
      
      // Gradient arka plan
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#f8fafc');
      gradient.addColorStop(1, '#e2e8f0');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Dekoratif çerçeve
      ctx.strokeStyle = '#990000';
      ctx.lineWidth = 8;
      ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);
      
      // İç çerçeve
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.strokeRect(60, 60, canvas.width - 120, canvas.height - 120);
      
      // Logo alanı (üstte)
      ctx.fillStyle = '#990000';
      ctx.fillRect(canvas.width / 2 - 100, 80, 200, 80);
      ctx.fillStyle = '#ffffff';
      ctx.font = '600 24px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('LOGO', canvas.width / 2, 125);
      
      // Başlık
      ctx.fillStyle = '#990000';
      ctx.font = '600 56px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(data.certificate_title || 'Başarı Sertifikası', canvas.width / 2, 250);
      
      // Alt başlık
      ctx.fillStyle = '#64748b';
      ctx.font = '400 24px system-ui, sans-serif';
      ctx.fillText('Bu sertifika aşağıdaki kişiye verilmiştir', canvas.width / 2, 300);
      
      // İsim (ana odak)
      ctx.fillStyle = '#1e293b';
      ctx.font = '700 72px system-ui, sans-serif';
      ctx.fillText(data.fullname, canvas.width / 2, 420);
      
      // İsim altı çizgi
      ctx.strokeStyle = '#990000';
      ctx.lineWidth = 3;
      const nameWidth = ctx.measureText(data.fullname).width;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2 - nameWidth / 2 - 20, 450);
      ctx.lineTo(canvas.width / 2 + nameWidth / 2 + 20, 450);
      ctx.stroke();
      
      // Kurs adı
      ctx.fillStyle = '#475569';
      ctx.font = '600 32px system-ui, sans-serif';
      ctx.fillText(data.coursename, canvas.width / 2, 520);
      
      // Tarih
      const dateObj = new Date(data.issuedate);
      const formattedDate = dateObj.toLocaleDateString('tr-TR', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
      ctx.fillStyle = '#64748b';
      ctx.font = '500 28px system-ui, sans-serif';
      ctx.fillText(`Veriliş Tarihi: ${formattedDate}`, canvas.width / 2, 600);
      
      // Sertifika numarası
      ctx.fillStyle = '#94a3b8';
      ctx.font = '500 20px system-ui, sans-serif';
      ctx.fillText(`Sertifika No: ${data.certificatenumber}`, canvas.width / 2, 680);
      
      // Alt bilgi
      ctx.fillStyle = '#64748b';
      ctx.font = '400 18px system-ui, sans-serif';
      ctx.fillText('Bu sertifika elektronik olarak oluşturulmuştur', canvas.width / 2, 750);
      
      // Sağ alt köşe dekoratif element
      ctx.fillStyle = '#f1f5f9';
      ctx.beginPath();
      ctx.arc(canvas.width - 100, canvas.height - 100, 60, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      console.log('Fallback sertifika oluşturuldu');
      return canvas;
    }
  } catch (error) {
    console.error('Sertifika oluşturma hatası:', error);
    
    // Hata durumunda basit bir fallback sertifika oluştur
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = 800;
        canvas.height = 600;
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#ff0000';
        ctx.font = '24px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Sertifika Oluşturulamadı', canvas.width / 2, 200);
        ctx.fillText('Hata: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'), canvas.width / 2, 250);
        ctx.fillText('Lütfen sayfayı yenileyin', canvas.width / 2, 300);
        
        return canvas;
      }
    } catch (fallbackError) {
      console.error('Fallback sertifika da oluşturulamadı:', fallbackError);
    }
    
    throw error;
  }
};

// Kullanım örneği
export const generateCertificateFromDB = async (certificateNumber: string): Promise<HTMLCanvasElement | null> => {
  const certificateData = await getCertificateData(certificateNumber);
  
  if (!certificateData) {
    console.error('Sertifika bulunamadı');
    return null;
  }
  
  return await generateCertificateCanvas(certificateData);
};

// Dil bazlı sertifika oluşturma fonksiyonu
export const generateCertificateByLanguage = async (
  certificateNumber: string, 
  preferredLanguage?: string
): Promise<HTMLCanvasElement | null> => {
  const certificateData = await getCertificateData(certificateNumber);
  
  if (!certificateData) {
    console.error('Sertifika bulunamadı');
    return null;
  }
  
  // Eğer tercih edilen dil belirtilmişse, o dil için varsayılan metinleri kullan
  if (preferredLanguage && preferredLanguage !== certificateData.language) {
    const defaultTexts = getDefaultTexts(preferredLanguage);
    certificateData.language = preferredLanguage;
    certificateData.certificate_title = defaultTexts.certificate_title;
    certificateData.provider_text = defaultTexts.provider_text;
    certificateData.completion_text = defaultTexts.completion_text;
    certificateData.instructor_label = defaultTexts.instructor_label;
    certificateData.date_label = defaultTexts.date_label;
    certificateData.certificate_number_label = defaultTexts.certificate_number_label;
    certificateData.qr_scan_text = defaultTexts.qr_scan_text;
    certificateData.skills_label = defaultTexts.skills_label;
    certificateData.total_hours_label = defaultTexts.total_hours_label;
    certificateData.grade_label = defaultTexts.grade_label;
  }
  
  return await generateCertificateCanvas(certificateData);
};

// Template yönetimi için yardımcı fonksiyonlar
export const getAllTemplatesForOrganization = async (organizationSlug: string): Promise<CertificateTemplate[]> => {
  try {
    const { data, error } = await supabase
      .from('certificate_templates')
      .select('*')
      .eq('organization_slug', organizationSlug)
      .order('is_default', { ascending: false })
      .order('name');

    if (error) {
      console.error('Template\'ler getirilemedi:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Template getirme hatası:', error);
    return [];
  }
};

export const createTemplate = async (templateData: Omit<CertificateTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<CertificateTemplate | null> => {
  try {
    const { data, error } = await supabase
      .from('certificate_templates')
      .insert([templateData])
      .select()
      .single();

    if (error) {
      console.error('Template oluşturulamadı:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Template oluşturma hatası:', error);
    return null;
  }
};

export const updateTemplate = async (id: number, templateData: Partial<CertificateTemplate>): Promise<CertificateTemplate | null> => {
  try {
    const { data, error } = await supabase
      .from('certificate_templates')
      .update(templateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Template güncellenemedi:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Template güncelleme hatası:', error);
    return null;
  }
};

export const deleteTemplate = async (id: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('certificate_templates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Template silinemedi:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Template silme hatası:', error);
    return false;
  }
};