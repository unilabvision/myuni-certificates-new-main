import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { organizationSlug } = await request.json();
    
    if (!organizationSlug) {
      return NextResponse.json({
        success: false,
        error: 'Organization slug gerekli'
      }, { status: 400 });
    }
    
    console.log('Template güncelleniyor:', organizationSlug);
    
    // Massive Bioinformatics için design settings
    const designSettings = {
      "fonts": {
        "body": "sans_serif",
        "name": "sans_serif",
        "title": "sans_serif"
      },
      "colors": {
        "name": "#0A2463",
        "text": "#4B5563",
        "primary": "#1A5276",
        "secondary": "#666666",
        "institution": "#8a0000",
        "certificate_no": "#ffffff"
      },
      "layout": {
        "date_position": {
          "x": 23,
          "y": 82,
          "align": "left",
          "enabled": true,
          "x_manual": 20,
          "y_manual": 80
        },
        "name_position": {
          "x": 44.5,
          "y": 50,
          "align": "left",
          "enabled": true,
          "x_manual": 42,
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
          "enabled": false,
          "x_manual": 80,
          "y_manual": 80
        },
        "description_position": {
          "x": 50,
          "y": 55,
          "align": "center",
          "enabled": false,
          "x_manual": 50,
          "y_manual": 55
        },
        "institution_position": {
          "x": 23.5,
          "y": 76.5,
          "align": "left",
          "enabled": false,
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
        }
      },
      "font_sizes": {
        "date": 32,
        "name": 82,
        "title": 26,
        "signature": 14,
        "institution": 21,
        "certificate_no": 12
      }
    };
    
    // Template'i güncelle
    const { data, error } = await supabase
      .from('certificate_templates')
      .update({
        design_settings: JSON.stringify(designSettings),
        updated_at: new Date().toISOString()
      })
      .eq('organization_slug', organizationSlug)
      .eq('is_default', true)
      .select()
      .single();
    
    if (error) {
      console.error('Template güncelleme hatası:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }
    
    console.log('Template güncellendi:', data);
    
    return NextResponse.json({
      success: true,
      message: 'Template başarıyla güncellendi',
      template: {
        id: data.id,
        name: data.name,
        design_settings_length: data.design_settings ? data.design_settings.length : 0
      }
    });
    
  } catch (error) {
    console.error('Template güncelleme hatası:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
}
