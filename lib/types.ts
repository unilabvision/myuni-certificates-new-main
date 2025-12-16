// lib/types.ts
export interface Profile {
  id: string
  slug: string
  title: string
  description?: string
  logo_url?: string
  created_at?: string
  updated_at?: string
}

export interface Link {
  id: string
  profile_id: string
  title: string
  url: string
  icon?: string
  order?: number
  created_at?: string
  updated_at?: string
}

export interface Module {
  id: string
  type: 'pdf_viewer' | 'gallery' | 'video_player' | 'text_content' | 'contact_form'
  title: string
  description?: string
  order: number
  enabled: boolean
  settings: Record<string, unknown>
  data: ModuleData
}

export type ModuleData = 
  | PDFViewerData 
  | GalleryData 
  | VideoPlayerData 
  | TextContentData 
  | ContactFormData
  | { rawData: unknown }

export interface PDFViewerData {
  pdfUrl: string | null
  fileName: string | null
  fileSize: number | null
  allowDownload: boolean
  showToolbar: boolean
}

export interface GalleryData {
  images: Array<{
    url: string
    title: string
    thumbnail: string
    order: number
  }>
  columns: number
  lightbox: boolean
}

export interface VideoPlayerData {
  videos: Array<{
    url: string
    title: string
    thumbnail?: string
    type: string
    order: number
  }>
  autoplay: boolean
  controls: boolean
  loop: boolean
}

export interface TextContentData {
  content: string
  contentType: 'html' | 'markdown' | 'plain_text'
  allowHtml: boolean
  maxHeight: string | null
}

export interface ContactFormData {
  fields: string[]
  emailTo: string | null
  showPhone: boolean
  showCompany: boolean
}

// lib/visitRecorder.ts - Updated with modules
import { supabase } from '@/lib/supabase-client'

export async function recordVisit(
  profileId: string,
  ipAddress?: string,
  userAgent?: string,
  referrer?: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('postozen_visits')
      .insert({
        profile_id: profileId,
        ip_address: ipAddress,
        user_agent: userAgent,
        referrer: referrer,
        visited_at: new Date().toISOString()
      })

    if (error) {
      console.error('Visit recording error:', error)
    }
  } catch (error) {
    console.error('Error recording visit:', error)
  }
}

export async function recordLinkClick(
  linkId: string,
  profileId: string,
  ipAddress?: string,
  userAgent?: string,
  referrer?: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('postozen_link_clicks')
      .insert({
        link_id: linkId,
        profile_id: profileId,
        ip_address: ipAddress,
        user_agent: userAgent,
        referrer: referrer,
        clicked_at: new Date().toISOString()
      })

    if (error) {
      console.error('Link click recording error:', error)
    }
  } catch (error) {
    console.error('Error recording link click:', error)
  }
}

export async function recordModuleClick(
  moduleId: string,
  profileId: string,
  ipAddress?: string,
  userAgent?: string,
  referrer?: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('postozen_module_clicks')
      .insert({
        module_id: moduleId,
        profile_id: profileId,
        ip_address: ipAddress,
        user_agent: userAgent,
        referrer: referrer,
        clicked_at: new Date().toISOString()
      })

    if (error) {
      console.error('Module click recording error:', error)
    }
  } catch (error) {
    console.error('Error recording module click:', error)
  }
}
