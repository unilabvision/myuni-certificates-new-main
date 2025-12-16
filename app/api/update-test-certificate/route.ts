import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function POST() {
  try {
    console.log('Test sertifikası güncelleniyor...');
    
    // Test sertifikasını bul ve güncelle
    const { data: certificates, error: fetchError } = await supabase
      .from('certificates')
      .select('*')
      .limit(1);
    
    if (fetchError || !certificates || certificates.length === 0) {
      console.error('Sertifika bulunamadı:', fetchError);
      return NextResponse.json({
        success: false,
        error: 'Sertifika bulunamadı'
      }, { status: 404 });
    }
    
    const certificate = certificates[0];
    console.log('Güncellenecek sertifika:', certificate.id);
    
    // Yeni alanları güncelle
    const { data, error } = await supabase
      .from('certificates')
      .update({
        description: 'Bu sertifika, belirtilen kursun başarıyla tamamlandığını belirtir. Kurs süresince gösterilen performans ve elde edilen başarılar değerlendirilerek bu belge verilmiştir.',
        signature: 'Dr. Ahmet Yılmaz - Kurs Eğitmeni'
      })
      .eq('id', certificate.id)
      .select()
      .single();
    
    if (error) {
      console.error('Sertifika güncelleme hatası:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }
    
    console.log('Test sertifikası güncellendi:', data);
    
    return NextResponse.json({
      success: true,
      message: 'Test sertifikası güncellendi',
      certificate: {
        id: data.id,
        certificatenumber: data.certificatenumber,
        description_length: data.description ? data.description.length : 0,
        signature: data.signature,
        has_course_name_position: !!data.course_name_position
      }
    });
    
  } catch (error) {
    console.error('Test sertifika güncelleme hatası:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
}
