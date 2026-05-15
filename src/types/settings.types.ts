// ============================================
// TIPOS PARA SETTINGS (CONFIGURACIÓN GLOBAL)
// ============================================

export interface Settings {
  id: string;
  // Hero section
  hero_background_url: string | null;
  hero_logo_url: string | null;
  hero_title: string;
  hero_subtitle: string | null;
  
  // Contacto
  direccion: string | null;
  telefono: string | null;
  email: string | null;
  
  // Redes sociales
  facebook_url: string | null;
  instagram_url: string | null;
  twitter_url: string | null;
  youtube_url: string | null;
  tiktok_url: string | null;
  
  // Metadatos
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export type UpdateSettingsDTO = Partial<Omit<Settings, 'id' | 'created_at' | 'updated_at'>>;

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
}