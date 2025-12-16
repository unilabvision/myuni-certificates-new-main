// lib/visitRecorder.ts

import { supabase } from '@/lib/supabase-client'

// Visit recording function - uses client-side supabase
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
  } catch (error: unknown) {
    console.error('Error recording visit:', error)
  }
}

// Link click recording function - uses client-side supabase
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
  } catch (error: unknown) {
    console.error('Error recording link click:', error)
  }
}

// Module click recording function - uses client-side supabase
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
  } catch (error: unknown) {
    console.error('Error recording module click:', error)
  }
}