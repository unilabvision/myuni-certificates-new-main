import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function POST() {
  try {
    console.log('MyUNI template güncelleniyor...');
    
    // Yeni design settings - description_position aktif, course_name_position eklendi
    const newDesignSettings = {
      "fonts": {
        "body": "sans_serif",
        "name": "sans_serif",
        "title": "sans_serif"
      },
      "colors": {
        "name": "#000",
        "text": "#000",
        "primary": "#1A5276",
        "secondary": "#666666",
        "institution": "#8a0000",
        "certificate_no": "#ffffff"
      },
      "layout": {
        "date_position": {
          "x": 7.5,
          "y": 64,
          "align": "left",
          "enabled": true,
          "x_manual": 20,
          "y_manual": 80
        },
        "name_position": {
          "x": 7,
          "y": 35,
          "align": "left",
          "enabled": true,
          "x_manual": 10,
          "y_manual": 43.3
        },
        "title_position": {
          "x": 42,
          "y": 20,
          "align": "center",
          "enabled": false,
          "x_manual": 50,
          "y_manual": 20
        },
        "signature_position": {
          "x": 80,
          "y": 80,
          "align": "center",
          "enabled": true,
          "x_manual": 80,
          "y_manual": 80
        },
        "description_position": {
          "x": 50,
          "y": 55,
          "align": "left",
          "enabled": true,
          "x_manual": 50,
          "y_manual": 55
        },
        "institution_position": {
          "x": 23.5,
          "y": 76.5,
          "align": "left",
          "enabled": true,
          "x_manual": 30,
          "y_manual": 75
        },
        "certificate_no_position": {
          "x": 11,
          "y": 97.5,
          "align": "right",
          "enabled": true,
          "x_manual": 70,
          "y_manual": 75
        },
        "course_name_position": {
          "x": 50,
          "y": 30,
          "align": "center",
          "enabled": true,
          "x_manual": 50,
          "y_manual": 30
        }
      },
      "font_sizes": {
        "date": 30,
        "name": 62,
        "title": 26,
        "signature": 14,
        "institution": 21,
        "certificate_no": 12,
        "description": 18,
        "course_name": 24
      }
    };
    
    // MyUNI template'ini güncelle
    const { data, error } = await supabase
      .from('certificate_templates')
      .update({
        design_settings: JSON.stringify(newDesignSettings),
        updated_at: new Date().toISOString()
      })
      .eq('organization_slug', 'myuni')
      .eq('is_default', true)
      .select()
      .single();
    
    if (error) {
      console.error('MyUNI template güncelleme hatası:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }
    
    console.log('MyUNI template güncellendi:', data);
    
    return NextResponse.json({
      success: true,
      message: 'MyUNI template güncellendi',
      template: {
        id: data.id,
        name: data.name,
        design_settings_length: data.design_settings ? data.design_settings.length : 0,
        changes: [
          'description_position: enabled = true',
          'course_name_position: eklendi',
          'signature_position: enabled = true',
          'institution_position: enabled = true'
        ]
      }
    });
    
  } catch (error) {
    console.error('MyUNI template güncelleme hatası:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
}
