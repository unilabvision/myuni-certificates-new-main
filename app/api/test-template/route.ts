import { NextRequest, NextResponse } from 'next/server';
import { getCertificateTemplate, getAllTemplatesForOrganization } from '../../utils/certificateGenerator';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationSlug = searchParams.get('org') || 'massive-bioinformatics';
    
    console.log('Test template API çağrıldı:', { organizationSlug });
    
    // Tüm şablonları getir
    const allTemplates = await getAllTemplatesForOrganization(organizationSlug);
    console.log('Tüm şablonlar:', allTemplates);
    
    // Varsayılan şablonu getir
    const defaultTemplate = await getCertificateTemplate(organizationSlug);
    console.log('Varsayılan şablon:', defaultTemplate);
    
    // Template detaylarını da ekle
    const templateDetails = allTemplates.map(template => ({
      id: template.id,
      name: template.name,
      description: template.description,
      background_image: template.background_image,
      is_default: template.is_default,
      design_settings_length: template.design_settings ? template.design_settings.length : 0,
      created_at: template.created_at,
      updated_at: template.updated_at
    }));
    
    return NextResponse.json({
      success: true,
      organization: organizationSlug,
      allTemplates: allTemplates.length,
      templateDetails,
      defaultTemplate: defaultTemplate ? {
        id: defaultTemplate.id,
        name: defaultTemplate.name,
        description: defaultTemplate.description,
        background_image: defaultTemplate.background_image,
        is_default: defaultTemplate.is_default,
        design_settings_length: defaultTemplate.design_settings ? defaultTemplate.design_settings.length : 0
      } : null,
      message: 'Template sistemi test edildi',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Template test hatası:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Bilinmeyen hata',
      message: 'Template sistemi test edilemedi',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
