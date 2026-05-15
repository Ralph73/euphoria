'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Award, AlertTriangle, Loader2 } from 'lucide-react';
import { fetchSkills, deleteSkill, type Skill } from '@/lib/actions';
import CreateSkillModal from './components/CreateSkillModal';
import EditSkillModal from './components/EditSkillModal';
import { toast } from 'react-hot-toast';

export default function SkillsPage() {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [skillToDelete, setSkillToDelete] = useState<Skill | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Cargar skills
    useEffect(() => {
        loadSkills();
    }, []);

    const loadSkills = async () => {
        setLoading(true);
        try {
            const data = await fetchSkills();
            setSkills(data);
        } catch (error) {
            toast.error('Error al cargar skills');
        }
        setLoading(false);
    };

    const handleDelete = async () => {
        if (!skillToDelete) return;
        setIsDeleting(true);
        const result = await deleteSkill(skillToDelete.id);
        if (result.success) {
            toast.success('Skill eliminada');
            setSkills(prev => prev.filter(s => s.id !== skillToDelete.id));
            setShowDeleteModal(false);
        } else {
            toast.error(result.error || 'Error al eliminar');
        }
        setIsDeleting(false);
        setSkillToDelete(null);
    };

    const filteredSkills = skills.filter(skill =>
        skill.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        skill.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Skeleton para carga
    const SkeletonCard = () => (
        <div className="bg-white dark:bg-velvet-orchid-900 rounded-2xl border border-velvet-orchid-100 dark:border-velvet-orchid-800 overflow-hidden shadow-sm animate-pulse">
            <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-velvet-orchid-200/50 dark:bg-velvet-orchid-800/50"></div>
                        <div className="h-6 w-32 bg-velvet-orchid-200/50 dark:bg-velvet-orchid-800/50 rounded"></div>
                    </div>
                    <div className="flex gap-2">
                        <div className="w-8 h-8 bg-velvet-orchid-200/50 dark:bg-velvet-orchid-800/50 rounded"></div>
                        <div className="w-8 h-8 bg-velvet-orchid-200/50 dark:bg-velvet-orchid-800/50 rounded"></div>
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="h-4 w-full bg-velvet-orchid-200/50 dark:bg-velvet-orchid-800/50 rounded"></div>
                    <div className="h-4 w-3/4 bg-velvet-orchid-200/50 dark:bg-velvet-orchid-800/50 rounded"></div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="w-full p-4 md:p-8 mx-auto space-y-6 md:space-y-8 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-velvet-orchid-950 dark:text-white">
                        Gestión de Habilidades
                    </h1>
                    <p className="text-velvet-orchid-600/70 dark:text-velvet-orchid-300 text-xs md:text-sm">
                        Administra las habilidades disponibles. {filteredSkills.length} registros
                    </p>
                </div>

                <button
                    onClick={() => setShowCreateModal(true)}
                    className="w-full md:w-auto bg-velvet-orchid-600 hover:bg-velvet-orchid-700 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-velvet-orchid-200 active:scale-95"
                >
                    <Plus size={18} /> Nueva Skill
                </button>
            </div>

            {/* Buscador */}
            <div className="relative w-full md:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-velvet-orchid-400" size={18} />
                <input
                    type="text"
                    placeholder="Buscar por nombre o descripción..."
                    className="w-full pl-10 pr-10 py-3 bg-white dark:bg-velvet-orchid-900 border border-velvet-orchid-100 dark:border-velvet-orchid-800 rounded-xl outline-none focus:ring-2 focus:ring-velvet-orchid-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                    <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-velvet-orchid-400 hover:text-velvet-orchid-600"
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Grid de Skills */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>
            ) : filteredSkills.length === 0 ? (
                <div className="bg-white dark:bg-velvet-orchid-900 rounded-2xl border border-velvet-orchid-100 dark:border-velvet-orchid-800 p-12 text-center">
                    <div className="w-20 h-20 mx-auto bg-velvet-orchid-100 dark:bg-velvet-orchid-800 rounded-full flex items-center justify-center mb-4">
                        <Award size={32} className="text-velvet-orchid-400" />
                    </div>
                    <p className="text-velvet-orchid-950 dark:text-white font-bold text-lg mb-2">
                        {searchTerm ? 'No se encontraron resultados' : 'No hay skills creadas'}
                    </p>
                    <p className="text-velvet-orchid-500 dark:text-velvet-orchid-400 text-sm mb-6">
                        {searchTerm
                            ? 'Intenta con otro término de búsqueda'
                            : 'Comienza creando tu primera skill'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredSkills.map((skill) => (
                        <div
                            key={skill.id}
                            className="group bg-white dark:bg-velvet-orchid-900 rounded-2xl border border-velvet-orchid-100 dark:border-velvet-orchid-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className="p-6">
                                {/* Header de la tarjeta */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-velvet-orchid-100 dark:bg-velvet-orchid-800 flex items-center justify-center">
                                            <Award size={20} className="text-velvet-orchid-500" />
                                        </div>
                                        <h3 className="font-bold text-lg text-velvet-orchid-950 dark:text-white">
                                            {skill.nombre}
                                        </h3>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => {
                                                setSelectedSkill(skill);
                                                setShowEditModal(true);
                                            }}
                                            className="p-2 text-velvet-orchid-600 hover:text-velvet-orchid-700 hover:bg-velvet-orchid-50 dark:hover:bg-velvet-orchid-800 rounded-lg transition-all"
                                            title="Editar"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSkillToDelete(skill);
                                                setShowDeleteModal(true);
                                            }}
                                            className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all"
                                            title="Eliminar"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Descripción */}
                                {skill.descripcion ? (
                                    <p className="text-sm text-velvet-orchid-600 dark:text-velvet-orchid-400 line-clamp-3">
                                        {skill.descripcion}
                                    </p>
                                ) : (
                                    <p className="text-sm text-velvet-orchid-400 dark:text-velvet-orchid-500 italic">
                                        Sin descripción
                                    </p>
                                )}

                                {/* Fecha de creación */}
                                <p className="text-xs text-velvet-orchid-400 dark:text-velvet-orchid-500 mt-4">
                                    Creada {new Date(skill.created_at).toLocaleDateString('es-MX', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modales */}
            <CreateSkillModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={loadSkills}
            />

            <EditSkillModal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedSkill(null);
                }}
                onSuccess={loadSkills}
                skill={selectedSkill}
            />

            {/* Modal de confirmación de eliminación */}
            {showDeleteModal && skillToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-velvet-orchid-950/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-velvet-orchid-900 w-full max-w-md rounded-2xl p-6 shadow-2xl">
                        <div className="flex items-center gap-3 text-red-600 mb-4">
                            <AlertTriangle size={24} />
                            <h3 className="text-lg font-bold">¿Confirmar eliminación?</h3>
                        </div>
                        <p className="text-sm text-velvet-orchid-600 dark:text-velvet-orchid-300 mb-6">
                            Estás borrando la skill <span className="font-bold">{skillToDelete.nombre}</span>.
                            Esta acción no se puede deshacer.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setSkillToDelete(null);
                                }}
                                className="flex-1 py-3 font-semibold text-velvet-orchid-600 hover:bg-velvet-orchid-50 dark:hover:bg-velvet-orchid-800 rounded-xl transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} />
                                        Eliminando...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={18} />
                                        Eliminar
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}