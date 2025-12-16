import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function POST() {
  try {
    console.log('Description sütunu ekleniyor...');
    
    // Supabase SQL Editor'da çalıştırılacak komut
    const sqlCommand = 'ALTER TABLE certificates ADD COLUMN IF NOT EXISTS description TEXT;';
    
    console.log('SQL komutu:', sqlCommand);
    console.log('Bu komutu Supabase Dashboard > SQL Editor\'da çalıştırın');
    
    // Alternatif: RPC ile dene
    try {
      const { error } = await supabase.rpc('exec_sql', { sql_query: sqlCommand });
      if (error) {
        console.log('RPC bulunamadı, manuel ekleme gerekli');
      } else {
        console.log('Description sütunu başarıyla eklendi');
      }
    } catch {
      console.log('RPC hatası, manuel ekleme gerekli');
    }
    
    // Mevcut sertifikalara varsayılan description ekle
    try {
      const { error: updateError } = await supabase
        .from('certificates')
        .update({ 
          description: 'Bu sertifika, belirtilen kursun başarıyla tamamlandığını belirtir.' 
        })
        .is('description', null);
      
      if (updateError) {
        console.log('Description güncellemesi atlandı (sütun henüz yok)');
      } else {
        console.log('Mevcut sertifikalara description eklendi');
      }
    } catch {
      console.log('Description güncellemesi atlandı');
    }
    
    return NextResponse.json({
      success: true,
      message: 'Description sütunu ekleme talimatları',
      sql_command: sqlCommand,
      instructions: [
        '1. Supabase Dashboard\'a gidin',
        '2. SQL Editor\'ı açın',
        '3. Yukarıdaki SQL komutunu çalıştırın',
        '4. Sonra bu endpoint\'i tekrar çağırın'
      ]
    });
    
  } catch (error) {
    console.error('Description sütunu ekleme hatası:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
}
