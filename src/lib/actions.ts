import { supabase } from '@/lib/supabase';
import type { 
  Host as HostType,
  HostWithDetails,
  Skill as SkillType,
  HostSkillWithSkill,
  Feedback as FeedbackType,
  Settings as SettingsType,
  CreateHostDTO,
  CreateFeedbackDTO,
  UpdateSettingsDTO,
  ApiResponse 
} from '@/types';

// ============================================
// TIPOS EXISTENTES Y NUEVOS
// ============================================

export interface HostMedia {
  url: string;
  is_cover: boolean;
}

export interface Host {
  id: string;
  nickname: string;
  nombre?: string | null;
  schedule: string;
  status: string | boolean;
  is_available: boolean;
  likes?: number;
  is_new: boolean;
  created_at: string;
  updated_at?: string;
  host_media: HostMedia[];
}

// ============================================
// TIPOS PARA SETTINGS
// ============================================

export interface Settings {
  id: string;
  hero_background_url: string | null;
  hero_logo_url: string | null;
  hero_title: string;
  hero_subtitle: string | null;
  direccion: string | null;
  telefono: string | null;
  email: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  twitter_url: string | null;
  youtube_url: string | null;
  tiktok_url: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// TIPOS PARA SKILLS
// ============================================

export interface Skill {
  id: string;
  nombre: string;
  descripcion: string | null;
  created_at: string;
}

export interface HostSkill {
  id: string;
  host_id: string;
  skill_id: string;
  personalizacion: string | null;
  skill?: Skill;
}

// ============================================
// TIPOS PARA FEEDBACK
// ============================================

export interface Feedback {
  id: string;
  host_id: string;
  user_id: string | null;
  comentario: string;
  rating: 1 | 2 | 3 | 4 | 5;
  created_at: string;
}

// ============================================
// FETCH HOSTESS
// ============================================

export const fetchHostess = async (): Promise<Host[]> => {
  const { data, error } = await supabase
    .from("hosts")
    .select(`
      id, 
      nickname, 
      nombre,
      schedule, 
      status, 
      likes,
      is_new,
      created_at,
      updated_at,
      host_media (
        id, 
        url, 
        is_cover, 
        type
      )
    `);

  if (error) throw error;

  return (data || []).map(host => ({
    id: host.id,
    nickname: host.nickname,
    nombre: host.nombre,
    schedule: host.schedule,
    status: host.status,
    likes: host.likes,
    is_new: host.is_new || false,
    created_at: host.created_at,
    updated_at: host.updated_at,
    is_available: host.status === 'activo' || host.status === true,
    host_media: host.host_media || []
  }));
};

// ============================================
// FETCH HOSTESS POR ID (CON SKILLS Y FEEDBACK)
// ============================================

export const fetchHostessById = async (id: string): Promise<HostWithDetails> => {
    const { data, error } = await supabase
        .from("hosts")
        .select(`
            *,
            is_new,
            host_media(*),
            host_skills(
                id,
                personalizacion,
                skill:skills(*)
            ),
            feedback(*)
        `)
        .eq('id', id)
        .single();

    if (error) throw error;

    // Asegurar que todas las propiedades de Host existen
    const hostData: HostWithDetails = {
        id: data.id,
        nickname: data.nickname,
        nombre: data.nombre || null,
        schedule: data.schedule || null,
        status: data.status,
        likes: data.likes || 0,
        is_new: data.is_new,
        created_at: data.created_at,
        updated_at: data.updated_at,
        host_media: data.host_media || [],
        skills: data.host_skills || [],
        feedback: data.feedback || [],
        is_available: data.status === 'activo' || data.status === true
    };

    return hostData;
};

// ============================================
// FETCH SETTINGS
// ============================================

export const fetchSettings = async (): Promise<SettingsType | null> => {
  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .single();

  if (error) {
    console.error("Error fetching settings:", error);
    return null;
  }

  return data;
};

// ============================================
// UPDATE SETTINGS (SOLO SUPERADMIN)
// ============================================

export interface UpdateSettingsResult {
  success: boolean;
  error?: string;
  data?: Settings;
}

export async function updateSettings(formData: FormData): Promise<UpdateSettingsResult> {
  try {
    // Verificar autenticación
    const { user } = await getAuthenticatedUser();
    if (!user) {
      return { success: false, error: "No autenticado" };
    }

    // Verificar si es admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "superadmin") {
      return { success: false, error: "No autorizado - Se requiere rol de superadmin" };
    }

    // Obtener ID de settings
    const { data: currentSettings } = await supabase
      .from("settings")
      .select("id")
      .single();

    if (!currentSettings) {
      return { success: false, error: "Configuración no encontrada" };
    }

    // Preparar datos a actualizar
    const updates: Partial<Settings> = {
      hero_title: formData.get("hero_title") as string,
      hero_subtitle: formData.get("hero_subtitle") as string || null,
      hero_background_url: formData.get("hero_background_url") as string || null,
      hero_logo_url: formData.get("hero_logo_url") as string || null,
      direccion: formData.get("direccion") as string || null,
      telefono: formData.get("telefono") as string || null,
      email: formData.get("email") as string || null,
      facebook_url: formData.get("facebook_url") as string || null,
      instagram_url: formData.get("instagram_url") as string || null,
      twitter_url: formData.get("twitter_url") as string || null,
      youtube_url: formData.get("youtube_url") as string || null,
      tiktok_url: formData.get("tiktok_url") as string || null,
      updated_by: user.id
    };

    // Actualizar
    const { data, error } = await supabase
      .from("settings")
      .update(updates)
      .eq("id", currentSettings.id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };

  } catch (err) {
    return { success: false, error: "Error al actualizar configuración" };
  }
}

// ============================================
// ASIGNAR SKILL A HOST
// ============================================

export async function assignSkillToHost(
  hostId: string, 
  skillId: string, 
  personalizacion?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { user } = await getAuthenticatedUser();
    if (!user) {
      return { success: false, error: "No autenticado" };
    }

    // Verificar que el host pertenece al usuario o es superadmin
    const { data: host } = await supabase
      .from("hosts")
      .select("id")
      .eq("id", hostId)
      .single();

    if (!host) {
      return { success: false, error: "Host no encontrado" };
    }

    const { error } = await supabase
      .from("host_skills")
      .insert({
        host_id: hostId,
        skill_id: skillId,
        personalizacion: personalizacion || null
      });

    if (error) {
      if (error.code === '23505') { // Código de unique violation
        return { success: false, error: "Este skill ya está asignado" };
      }
      return { success: false, error: error.message };
    }

    return { success: true };

  } catch (err) {
    return { success: false, error: "Error al asignar skill" };
  }
}

// ============================================
// CREAR FEEDBACK
// ============================================

export async function createFeedback(
  hostId: string,
  comentario: string,
  rating: number
): Promise<{ success: boolean; error?: string; data?: Feedback }> {
  try {
    const { user } = await getAuthenticatedUser();
    if (!user) {
      return { success: false, error: "Debes iniciar sesión para dejar feedback" };
    }

    if (rating < 1 || rating > 5) {
      return { success: false, error: "Rating debe ser entre 1 y 5" };
    }

    const { data, error } = await supabase
      .from("feedback")
      .insert({
        host_id: hostId,
        user_id: user.id,
        comentario,
        rating
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };

  } catch (err) {
    return { success: false, error: "Error al crear feedback" };
  }
}

// ============================================
// DAR LIKE A HOST
// ============================================

export async function likeHost(hostId: string): Promise<{ success: boolean; error?: string; likes?: number }> {
  try {
    // Incrementar likes usando RPC (función en Supabase)
    const { data, error } = await supabase
      .rpc('increment_host_likes', { host_id: hostId });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, likes: data };

  } catch (err) {
    return { success: false, error: "Error al dar like" };
  }
}

// ============================================
// FUNCIONES EXISTENTES DE AUTENTICACIÓN
// ============================================

export type LoginResult = 
    | { success: true; redirectTo: string }
    | { success: false; error: string };

export async function loginAdmin(formData: FormData): Promise<LoginResult> {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: password,
        });

        if (error) {
            const errorMessage = error.message?.toLowerCase() || ""
            
            if (errorMessage.includes("invalid login credentials")) {
                return { success: false, error: "Credenciales incorrectas." }
            } else if (errorMessage.includes("email not confirmed")) {
                return { success: false, error: "Confirma tu email primero." }
            } else if (errorMessage.includes("rate limit")) {
                return { success: false, error: "Demasiados intentos." }
            } else {
                return { success: false, error: error.message || "Error al iniciar sesión." }
            }
        }

        if (data?.user) {
            return { success: true, redirectTo: '/admin/dashboard' }
        }

        return { success: false, error: "Error inesperado." }

    } catch (err) {
        return { success: false, error: "Error de conexión." }
    }
}

export interface AuthResult {
  user: {
    id: string;
    email: string;
  } | null;
  error: string | null;
}

export async function getAuthenticatedUser(): Promise<AuthResult> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      return { user: null, error: error?.message || "No hay sesión" };
    }

    return {
      user: {
        id: session.user.id,
        email: session.user.email || ''
      },
      error: null
    };

  } catch (err) {
    return { user: null, error: "Error de conexión" };
  }
}

export async function requireAuth(): Promise<{ id: string; email: string }> {
  const result = await getAuthenticatedUser();
  
  if (!result.user) {
    const { redirect } = await import('next/navigation');
    redirect('/admin/login');
  }
  
  return {
    id: result.user!.id,
    email: result.user!.email
  };
}


// ============================================
// SUBIR IMAGEN A SETTINGS STORAGE SUPABASE
// ============================================

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export async function uploadSettingsImage(file: File, type: 'logo' | 'background'): Promise<UploadResult> {
  try {
    // Verificar autenticación
    const { user } = await getAuthenticatedUser();
    if (!user) {
      return { success: false, error: "No autenticado" };
    }

    // Verificar si es superadmin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "superadmin") {
      return { success: false, error: "No autorizado" };
    }

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      return { success: false, error: "El archivo debe ser una imagen" };
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: "La imagen no debe superar 5MB" };
    }

    // Generar nombre único
    const fileExt = file.name.split('.').pop();
    const fileName = `${type}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Subir a Supabase Storage
    const { data, error } = await supabase.storage
      .from('settings_media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error("Error uploading:", error);
      return { success: false, error: error.message };
    }

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('settings_media')
      .getPublicUrl(filePath);

    return { success: true, url: publicUrl };

  } catch (err) {
    return { success: false, error: "Error al subir la imagen" };
  }
}

// ============================================
// OBTENER PERFIL DE USUARIO
// ============================================

export interface Profile {
    id: string;
    email: string;
    role: string;
}

export async function getProfile(userId: string): Promise<Profile | null> {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error("Error fetching profile:", error);
            return null;
        }

        return data;
    } catch (error) {
        console.error("Error in getProfile:", error);
        return null;
    }
}


// ============================================
// SKILLS - TYPES & FUNCTIONS
// ============================================

export interface Skill {
    id: string;
    nombre: string;
    descripcion: string | null;
    created_at: string;
}

export interface CreateSkillDTO {
    nombre: string;
    descripcion?: string | null;
}

export interface UpdateSkillDTO {
    nombre?: string;
    descripcion?: string | null;
}


/* TO GET SKILLS */
export const fetchSkills = async (): Promise<Skill[]> => {
  const { data, error } = await supabase
    .from("skills")
    .select("*")
    .order("nombre");

  if (error) throw error;
  return data || [];
};

/* TO CREATE SKILLS */
export async function createSkill(input: CreateSkillDTO): Promise<{ success: boolean; error?: string }> {
    try {
        if (!input.nombre?.trim()) {
            return { success: false, error: "El nombre es obligatorio" };
        }

        const { error } = await supabase
            .from('skills')
            .insert({
                nombre: input.nombre.trim(),
                descripcion: input.descripcion?.trim() || null
            });

        if (error) throw error;

        return { success: true };
    } catch (error: any) {
        console.error('Error creating skill:', error);
        return { success: false, error: error.message };
    }
}

/* TO UPDATE SKILLS */
export async function updateSkill(id: string, input: UpdateSkillDTO): Promise<{ success: boolean; error?: string }> {
    try {
        if (input.nombre !== undefined && !input.nombre.trim()) {
            return { success: false, error: "El nombre no puede estar vacío" };
        }

        const updates: Partial<Skill> = {};
        if (input.nombre !== undefined) updates.nombre = input.nombre.trim();
        if (input.descripcion !== undefined) updates.descripcion = input.descripcion?.trim() || null;

        const { error } = await supabase
            .from('skills')
            .update(updates)
            .eq('id', id);

        if (error) throw error;

        return { success: true };
    } catch (error: any) {
        console.error('Error updating skill:', error);
        return { success: false, error: error.message };
    }
}

/* TO DELETE SKILLS */
export async function deleteSkill(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        // Verificar que no esté siendo usada por algún host
        const { data: usedSkills, error: checkError } = await supabase
            .from('host_skills')
            .select('id')
            .eq('skill_id', id)
            .limit(1);

        if (checkError) throw checkError;

        if (usedSkills && usedSkills.length > 0) {
            return { 
                success: false, 
                error: "No se puede eliminar porque hay hostess usando esta habilidad" 
            };
        }

        const { error } = await supabase
            .from('skills')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return { success: true };
    } catch (error: any) {
        console.error('Error deleting skill:', error);
        return { success: false, error: error.message };
    }
}



// ====================================
//
// ====================================

// ============================================
// USERS - TYPES & FUNCTIONS
// ============================================

export interface UserProfile {
    id: string;
    email: string;
    role: string | null;
}

export interface UpdateUserRoleDTO {
    role: string;
}

/* TO GET ALL USERS (from profiles table) */
export const fetchUsers = async (): Promise<UserProfile[]> => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, email, role')
            .order('email');

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

/* TO UPDATE USER ROLE */
export async function updateUserRole(userId: string, input: UpdateUserRoleDTO): Promise<{ success: boolean; error?: string }> {
    try {
        // Verificar que el usuario autenticado es admin (opcional, pero recomendado)
        const { user } = await getAuthenticatedUser();
        if (!user) {
            return { success: false, error: "No autenticado" };
        }

        // Verificar que no se está intentando modificar un superadmin
        const { data: targetUser } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single();

        if (targetUser?.role === 'superadmin') {
            return { success: false, error: "No se puede modificar un superadmin" };
        }

        if (!input.role?.trim()) {
            return { success: false, error: "El rol es obligatorio" };
        }

        const { error } = await supabase
            .from('profiles')
            .update({ role: input.role.trim() })
            .eq('id', userId);

        if (error) throw error;

        return { success: true };
    } catch (error: any) {
        console.error('Error updating user role:', error);
        return { success: false, error: error.message };
    }
}

/* TO DELETE USER (with superadmin protection) */
export async function deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
        // Verificar que el usuario autenticado es superadmin
        const { user } = await getAuthenticatedUser();
        if (!user) {
            return { success: false, error: "No autenticado" };
        }

        // Verificar que el usuario a eliminar no es superadmin
        const { data: targetUser } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single();

        if (targetUser?.role === 'superadmin') {
            return { success: false, error: "No se puede eliminar un superadmin" };
        }

        // Eliminar el perfil (la tabla profiles tiene ON DELETE CASCADE desde auth.users)
        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', userId);

        if (error) throw error;

        return { success: true };
    } catch (error: any) {
        console.error('Error deleting user:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// PROMOTIONS - TYPES & FUNCTIONS
// ============================================

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

/* TO GET ALL PROMOTIONS (para dashboard) */
export const fetchPromotions = async (): Promise<Promotion[]> => {
    try {
        const { data, error } = await supabase
            .from('promotions')
            .select('*')
            .order('day_of_week');

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching promotions:', error);
        throw error;
    }
};

/* TO GET PROMOTION BY DAY OF WEEK (para website) */
export const fetchPromotionByDay = async (dayOfWeek: number): Promise<Promotion | null> => {
    try {
        const { data, error } = await supabase
            .from('promotions')
            .select('*')
            .eq('day_of_week', dayOfWeek)
            .eq('active', true)
            .maybeSingle();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching promotion by day:', error);
        return null;
    }
};

/* TO CREATE PROMOTION */
export async function createPromotion(input: CreatePromotionDTO): Promise<{ success: boolean; error?: string }> {
    try {
        // Validaciones
        if (!input.day_of_week || input.day_of_week < 1 || input.day_of_week > 7) {
            return { success: false, error: "El día debe ser entre 1 y 7" };
        }
        if (!input.theme?.trim()) {
            return { success: false, error: "El tema es obligatorio" };
        }
        if (!input.name?.trim()) {
            return { success: false, error: "El nombre es obligatorio" };
        }
        if (!input.cta_text?.trim()) {
            return { success: false, error: "El texto del botón es obligatorio" };
        }

        const { error } = await supabase
            .from('promotions')
            .insert({
                day_of_week: input.day_of_week,
                theme: input.theme.trim(),
                name: input.name.trim(),
                teaser: input.teaser?.trim() || null,
                cta_text: input.cta_text.trim(),
                image_url: input.image_url?.trim() || null,
                active: input.active ?? true
            });

        if (error) throw error;

        return { success: true };
    } catch (error: any) {
        console.error('Error creating promotion:', error);
        return { success: false, error: error.message };
    }
}

/* TO UPDATE PROMOTION */
export async function updatePromotion(id: string, input: UpdatePromotionDTO): Promise<{ success: boolean; error?: string }> {
    try {
        // Validar día si se envía
        if (input.day_of_week !== undefined && (input.day_of_week < 1 || input.day_of_week > 7)) {
            return { success: false, error: "El día debe ser entre 1 y 7" };
        }

        const updates: Partial<Promotion> = {};
        if (input.day_of_week !== undefined) updates.day_of_week = input.day_of_week;
        if (input.theme !== undefined) updates.theme = input.theme.trim();
        if (input.name !== undefined) updates.name = input.name.trim();
        if (input.teaser !== undefined) updates.teaser = input.teaser?.trim() || null;
        if (input.cta_text !== undefined) updates.cta_text = input.cta_text.trim();
        if (input.image_url !== undefined) updates.image_url = input.image_url?.trim() || null;
        if (input.active !== undefined) updates.active = input.active;

        const { error } = await supabase
            .from('promotions')
            .update(updates)
            .eq('id', id);

        if (error) throw error;

        return { success: true };
    } catch (error: any) {
        console.error('Error updating promotion:', error);
        return { success: false, error: error.message };
    }
}

/* TO DELETE PROMOTION */
export async function deletePromotion(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase
            .from('promotions')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return { success: true };
    } catch (error: any) {
        console.error('Error deleting promotion:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// SUBIR IMAGEN PARA OUTFITS
// ============================================

export async function uploadOutfitImage(file: File): Promise<UploadResult> {
    try {
        const { user } = await getAuthenticatedUser();
        if (!user) {
            return { success: false, error: "No autenticado" };
        }

        if (!file.type.startsWith('image/')) {
            return { success: false, error: "El archivo debe ser una imagen" };
        }

        if (file.size > 5 * 1024 * 1024) {
            return { success: false, error: "La imagen no debe superar 5MB" };
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `outfit_${Date.now()}.${fileExt}`;
        const filePath = `outfits/${fileName}`;

        const { data, error } = await supabase.storage
            .from('outfits')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true
            });

        if (error) {
            console.error("Error uploading:", error);
            return { success: false, error: error.message };
        }

        const { data: { publicUrl } } = supabase.storage
            .from('outfits')
            .getPublicUrl(filePath);

        return { success: true, url: publicUrl };
    } catch (err) {
        return { success: false, error: "Error al subir la imagen" };
    }
}


// ============================================
// SERVICES - TYPES & FUNCTIONS
// ============================================

export interface Service {
    id: string;
    name: string;
    description: string | null;
    price: number;
    status: boolean;
    created_at: string;
}

export interface CreateServiceDTO {
    name: string;
    description?: string | null;
    price: number;
    status?: boolean;
}

export interface UpdateServiceDTO {
    name?: string;
    description?: string | null;
    price?: number;
    status?: boolean;
}

/* TO GET ALL SERVICES */
export const fetchServices = async (): Promise<Service[]> => {
    try {
        const { data, error } = await supabase
            .from('services')
            .select('*')
            .order('name');

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching services:', error);
        throw error;
    }
};

/* TO CREATE SERVICE */
export async function createService(input: CreateServiceDTO): Promise<{ success: boolean; error?: string }> {
    try {
        if (!input.name?.trim()) {
            return { success: false, error: "El nombre es obligatorio" };
        }
        if (input.price === undefined || input.price < 0) {
            return { success: false, error: "El precio debe ser válido" };
        }

        const { error } = await supabase
            .from('services')
            .insert({
                name: input.name.trim(),
                description: input.description?.trim() || null,
                price: input.price,
                status: input.status ?? true
            });

        if (error) throw error;

        return { success: true };
    } catch (error: any) {
        console.error('Error creating service:', error);
        return { success: false, error: error.message };
    }
}

/* TO UPDATE SERVICE */
export async function updateService(id: string, input: UpdateServiceDTO): Promise<{ success: boolean; error?: string }> {
    try {
        if (input.name !== undefined && !input.name.trim()) {
            return { success: false, error: "El nombre no puede estar vacío" };
        }
        if (input.price !== undefined && input.price < 0) {
            return { success: false, error: "El precio debe ser válido" };
        }

        const updates: Partial<Service> = {};
        if (input.name !== undefined) updates.name = input.name.trim();
        if (input.description !== undefined) updates.description = input.description?.trim() || null;
        if (input.price !== undefined) updates.price = input.price;
        if (input.status !== undefined) updates.status = input.status;

        const { error } = await supabase
            .from('services')
            .update(updates)
            .eq('id', id);

        if (error) throw error;

        return { success: true };
    } catch (error: any) {
        console.error('Error updating service:', error);
        return { success: false, error: error.message };
    }
}

/* TO DELETE SERVICE */
export async function deleteService(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        // Verificar que no esté siendo usada por algún host (opcional)
        // Si tienes relación con host_services, agregar verificación aquí
        
        const { error } = await supabase
            .from('services')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return { success: true };
    } catch (error: any) {
        console.error('Error deleting service:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// APPOINTMENTS - TYPES & FUNCTIONS
// ============================================

export interface Appointment {
    id: string;
    host_id: string;
    name: string;
    email: string;
    phone: string;
    appointment_date: string;
    appointment_time: string;
    message: string | null;
    confirmation_token: string | null;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    created_at: string;
}

export interface CreateAppointmentDTO {
    host_id: string;
    name: string;
    email: string;
    phone: string;
    appointment_date: string;
    appointment_time: string;
    message?: string | null;
}

export async function createAppointment(data: CreateAppointmentDTO): Promise<{ success: boolean; error?: string; token?: string }> {
    try {
        const token = crypto.randomUUID();
        
        const { error } = await supabase
            .from('appointments')
            .insert({
                host_id: data.host_id,
                name: data.name,
                email: data.email,
                phone: data.phone,
                appointment_date: data.appointment_date,
                appointment_time: data.appointment_time,
                message: data.message || null,
                confirmation_token: token,
                status: 'pending'
            });

        if (error) throw error;

        return { success: true, token };
    } catch (error: any) {
        console.error('Error creating appointment:', error);
        return { success: false, error: error.message };
    }
}

export async function confirmAppointment(token: string): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase
            .from('appointments')
            .update({ status: 'confirmed' })
            .eq('confirmation_token', token);

        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        console.error('Error confirming appointment:', error);
        return { success: false, error: error.message };
    }
}

export async function getAppointmentByToken(token: string): Promise<Appointment | null> {
    try {
        const { data, error } = await supabase
            .from('appointments')
            .select('*')
            .eq('confirmation_token', token)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching appointment:', error);
        return null;
    }
}
