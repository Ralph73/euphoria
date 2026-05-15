// ============================================
// TIPOS PARA FEEDBACK
// ============================================

export type Rating = 1 | 2 | 3 | 4 | 5;

export interface Feedback {
  id: string;
  host_id: string;
  user_id: string | null;
  comentario: string;
  rating: Rating;
  created_at: string;
  
  // Relaciones (opcionales)
  user?: {
    id: string;
    email: string;
  };
}

export interface FeedbackStats {
  total: number;
  average: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export type CreateFeedbackDTO = {
  host_id: string;
  comentario: string;
  rating: Rating;
};

export type UpdateFeedbackDTO = Partial<Omit<CreateFeedbackDTO, 'host_id'>>;