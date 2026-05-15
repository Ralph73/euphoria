// src/types/promotion.types.ts
export interface Promotion {
    id: string;
    day_of_week: number;      // 1=Lunes, 2=Martes... 7=Domingo
    theme: string;
    name: string;
    teaser: string | null;
    cta_text: string;
    image_url: string | null;
    active: boolean;
    created_at: string;
}

export interface CreatePromotionDTO {
    day_of_week: number;
    theme: string;
    name: string;
    teaser?: string | null;
    cta_text: string;
    image_url?: string | null;
    active?: boolean;
}

export interface UpdatePromotionDTO {
    day_of_week?: number;
    theme?: string;
    name?: string;
    teaser?: string | null;
    cta_text?: string;
    image_url?: string | null;
    active?: boolean;
}