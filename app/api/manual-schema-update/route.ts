import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function POST() {
  try {
    console.log('Manuel veritabanı şema güncellemesi başlatılıyor...');
    
    // Supabase'de yeni sütunları eklemek için SQL komutları
    const sqlCommands = [
      // Description sütunu ekle
      'ALTER TABLE certificates ADD COLUMN IF NOT EXISTS description TEXT;',
      
      // Signature sütunu ekle  
      'ALTER TABLE certificates ADD COLUMN IF NOT EXISTS signature TEXT;'
    ];
    
    // Her bir SQL komutunu çalıştır
    for (const sql of sqlCommands) {
      console.log('SQL komutu çalıştırılıyor:', sql);
      
      // Supabase'de raw SQL çalıştırma
      const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
      
      if (error) {
        console.error('SQL hatası:', error);
        console.log('RPC bulunamadı, alternatif yöntem deneniyor...');
        
        // Alternatif: Sütunları kontrol et ve varsa güncelle
        try {
          const { data: columns } = await supabase
            .from('information_schema.columns')
            .select('column_name')
            .eq('table_name', 'certificates')
            .eq('table_schema', 'public');
          
          console.log('Mevcut sütunlar:', columns);
        } catch (colError) {
          console.error('Sütun bilgisi alınamadı:', colError);
        }
      } else {
        console.log('SQL komutu başarıyla çalıştırıldı');
      }
    }
    
    // Mevcut sertifikaları güncelle
    console.log('Mevcut sertifikalar güncelleniyor...');
    
    // Description için varsayılan değer
    try {
      const { error: descError } = await supabase
        .from('certificates')
        .update({ 
          description: 'Bu sertifika, belirtilen kursun başarıyla tamamlandığını belirtir.' 
        })
        .is('description', null);
      
      if (descError) {
        console.error('Description güncelleme hatası:', descError);
      } else {
        console.log('Description alanları güncellendi');
      }
    } catch {
      console.log('Description güncellemesi atlandı (sütun henüz yok)');
    }
    
    // Signature için varsayılan değer
    try {
      const { error: sigError } = await supabase
        .from('certificates')
        .update({ 
          signature: 'Kurs Eğitmeni' 
        })
        .is('signature', null);
      
      if (sigError) {
        console.error('Signature güncelleme hatası:', sigError);
      } else {
        console.log('Signature alanları güncellendi');
      }
    } catch {
      console.log('Signature güncellemesi atlandı (sütun henüz yok)');
    }
    
    console.log('Manuel şema güncellemesi tamamlandı');
    
    return NextResponse.json({
      success: true,
      message: 'Manuel şema güncellemesi tamamlandı',
      note: 'Supabase Dashboard\'da manuel olarak sütunları eklemeniz gerekebilir',
      sql_commands: sqlCommands
    });
    
  } catch (error) {
    console.error('Manuel şema güncelleme hatası:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
}
