// ============================================
// EXPORTACIONES PRINCIPALES
// ============================================

export * from './host.types';
export * from './skill.types';
export * from './feedback.types';
export * from './media.types';
export * from './settings.types';
export * from './promotion.types';

// Tipos de utilería comunes
export type Status = 'active' | 'inactive' | 'pending';
export type ApiResponse<T> = {
  data?: T;
  error?: string;
  success: boolean;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};