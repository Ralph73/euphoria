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
  created_at: string;
  
  // Relación (opcional)
  skill?: Skill;
}

export interface HostSkillWithSkill extends HostSkill {
  skill: Skill;
}

export type CreateSkillDTO = Omit<Skill, 'id' | 'created_at'>;
export type UpdateSkillDTO = Partial<CreateSkillDTO>;

export type AssignSkillDTO = {
  host_id: string;
  skill_id: string;
  personalizacion?: string;
};