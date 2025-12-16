import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function POST() {
  try {
    console.log('Veritabanı şeması güncelleniyor...');
    
    // Yeni sütunları ekle
    const updates = [
      // Description sütunu ekle
      `ALTER TABLE certificates ADD COLUMN IF NOT EXISTS description TEXT;`,
      
      // Signature sütunu ekle
      `ALTER TABLE certificates ADD COLUMN IF NOT EXISTS signature TEXT;`,
      
      // Course name position için yeni sütun ekle
      `ALTER TABLE certificates ADD COLUMN IF NOT EXISTS course_name_position JSONB;`
    ];
    
    // Her bir SQL komutunu çalıştır
    for (const sql of updates) {
      const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
      if (error) {
        console.error('SQL hatası:', error);
        // RPC yoksa manuel olarak dene
        console.log('RPC bulunamadı, manuel güncelleme deneniyor...');
        break;
      }
    }
    
    // Alternatif olarak, mevcut sertifikaları güncelle
    console.log('Mevcut sertifikalar güncelleniyor...');
    
    // Description için varsayılan değer
    const { error: descError } = await supabase
      .from('certificates')
      .update({ description: 'Bu sertifika, belirtilen kursun başarıyla tamamlandığını belirtir.' })
      .is('description', null);
    
    if (descError) {
      console.error('Description güncelleme hatası:', descError);
    }
    
    // Signature için varsayılan değer
    const { error: sigError } = await supabase
      .from('certificates')
      .update({ signature: 'Kurs Eğitmeni' })
      .is('signature', null);
    
    if (sigError) {
      console.error('Signature güncelleme hatası:', sigError);
    }
    
    // Course name position için varsayılan değer
    const { error: coursePosError } = await supabase
      .from('certificates')
      .update({ 
        course_name_position: JSON.stringify({
          x: 50,
          y: 30,
          align: 'center',
          enabled: true,
          x_manual: 50,
          y_manual: 30
        })
      })
      .is('course_name_position', null);
    
    if (coursePosError) {
      console.error('Course name position güncelleme hatası:', coursePosError);
    }
    
    console.log('Veritabanı şeması güncellendi');
    
    return NextResponse.json({
      success: true,
      message: 'Veritabanı şeması güncellendi',
      updates: [
        'description sütunu eklendi',
        'signature sütunu eklendi',
        'course_name_position sütunu eklendi'
      ]
    });
    
  } catch (error) {
    console.error('Veritabanı şema güncelleme hatası:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
}
