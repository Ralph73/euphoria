// ============================================
// TIPOS PARA HOSTS
// ============================================

import { HostMedia } from './media.types';
import { HostSkill } from './skill.types';
import { Feedback } from './feedback.types';

export type HostStatus = 'active' | 'inactive' | 'busy' | string;

export interface Host {
  id: string;
  nickname: string;
  nombre?: string | null;
  schedule: string | null;
  status: HostStatus;
  likes: number;
  is_new: boolean;
  created_at: string;
  updated_at: string;
  
  // Relaciones (opcionales)
  host_media?: HostMedia[];
}

export interface HostWithDetails extends Host {
  host_media: HostMedia[];
  skills: HostSkill[];
  feedback: Feedback[];
  is_available: boolean;
}

export interface HostFilters {
  status?: HostStatus;
  skill_ids?: string[];
  min_rating?: number;
  search?: string;
}

export type CreateHostDTO = Omit<Host, 'id' | 'created_at' | 'updated_at' | 'likes'>;
export type UpdateHostDTO = Partial<Omit<Host, 'id' | 'created_at' | 'updated_at'>>;