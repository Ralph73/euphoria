// ============================================
// TIPOS PARA MEDIA
// ============================================

export type MediaType = 'image' | 'video' | 'pdf';

export interface HostMedia {
  id: string;
  host_id: string;
  url: string;
  type: MediaType;
  is_cover: boolean;
  filename: string | null;
  filesize: number | null;
  descripcion: string | null;
  created_at: string;
}

export interface MediaUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export type CreateMediaDTO = Omit<HostMedia, 'id' | 'created_at'>;
export type UpdateMediaDTO = Partial<Omit<HostMedia, 'id' | 'host_id' | 'created_at'>>;