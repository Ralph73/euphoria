'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Award, Save, Loader2, AlertCircle } from 'lucide-react';
import { updateSkill, type Skill } from '@/lib/actions';
import Swal from 'sweetalert2';

interface EditSkillModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    skill: Skill | null;
}

export default function EditSkillModal({ isOpen, onClose, onSuccess, skill }: EditSkillModalProps) {
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (skill) {
            setNombre(skill.nombre);
            setDescripcion(skill.descripcion || '');
        }
    }, [skill]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!nombre.trim()) {
            setError('El nombre es obligatorio');
            return;
        }

        if (!skill) return;

        setIsSaving(true);
        setError(null);

        const result = await updateSkill(skill.id, {
            nombre: nombre.trim(),
            descripcion: descripcion.trim() || null
        });

        if (result.success) {
            Swal.fire({
                icon: 'success',
                title: '¡Skill actualizada!',
                text: 'La habilidad se ha actualizado correctamente',
                timer: 2000,
                showConfirmButton: false,
                background: '#1f2937',
                color: '#ffffff',
                customClass: { popup: 'rounded-2xl' }
            });
            onSuccess();
            onClose();
        } else {
            setError(result.error || 'Error al actualizar la skill');
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: result.error || 'Error al actualizar la skill',
                background: '#1f2937',
                color: '#ffffff',
                customClass: { popup: 'rounded-2xl' }
            });
        }

        setIsSaving(false);
    };

    return (
        <AnimatePresence>
            {isOpen && skill && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-velvet-orchid-950/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative bg-white dark:bg-velvet-orchid-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-velvet-orchid-200 dark:border-velvet-orchid-700"
                    >
                        {/* Header */}
                        <div className="px-8 py-5 border-b border-velvet-orchid-100 dark:border-velvet-orchid-800 bg-linear-to-r from-velvet-orchid-50 to-white dark:from-velvet-orchid-800 dark:to-velvet-orchid-900">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-velvet-orchid-500 rounded-xl shadow-lg shadow-velvet-orchid-500/30">
                                        <Award className="text-white" size={22} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-velvet-orchid-900 dark:text-white">
                                            Editar Skill
                                        </h2>
                                        <p className="text-xs text-velvet-orchid-500 mt-0.5">
                                            Modifica los campos de la habilidad
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-velvet-orchid-200 dark:hover:bg-velvet-orchid-700 rounded-full text-velvet-orchid-400 transition-all"
                                >
                                    <X size={22} />
                                </button>
                            </div>
                        </div>

                        {/* Formulario */}
                        <form onSubmit={handleSubmit} className="p-8">
                            <div className="space-y-6">
                                {/* Campo Nombre */}
                                <div>
                                    <label className="text-sm font-bold text-velvet-orchid-700 dark:text-velvet-orchid-300 block mb-2">
                                        Nombre de la skill <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={nombre}
                                        onChange={(e) => setNombre(e.target.value)}
                                        className="w-full bg-velvet-orchid-50 dark:bg-velvet-orchid-800/50 border-2 border-velvet-orchid-200 dark:border-velvet-orchid-700 rounded-xl px-5 py-3.5 outline-none focus:border-velvet-orchid-500 focus:ring-4 focus:ring-velvet-orchid-500/20 font-medium text-velvet-orchid-900 dark:text-white transition-all"
                                        disabled={isSaving}
                                        autoFocus
                                    />
                                    <p className="text-xs text-velvet-orchid-400 mt-1.5">
                                        Nombre identificativo de la habilidad
                                    </p>
                                </div>

                                {/* Campo Descripción */}
                                <div>
                                    <label className="text-sm font-bold text-velvet-orchid-700 dark:text-velvet-orchid-300 block mb-2">
                                        Descripción <span className="text-velvet-orchid-400 text-xs font-normal">(opcional)</span>
                                    </label>
                                    <textarea
                                        value={descripcion}
                                        onChange={(e) => setDescripcion(e.target.value)}
                                        rows={4}
                                        className="w-full bg-velvet-orchid-50 dark:bg-velvet-orchid-800/50 border-2 border-velvet-orchid-200 dark:border-velvet-orchid-700 rounded-xl px-5 py-3.5 outline-none focus:border-velvet-orchid-500 focus:ring-4 focus:ring-velvet-orchid-500/20 font-medium text-velvet-orchid-900 dark:text-white resize-none transition-all"
                                        disabled={isSaving}
                                    />
                                    <p className="text-xs text-velvet-orchid-400 mt-1.5">
                                        Una breve descripción que ayude a entender la habilidad
                                    </p>
                                </div>

                                {/* Error */}
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center gap-2 text-red-500 text-sm bg-red-50 dark:bg-red-950/30 px-4 py-3 rounded-xl"
                                    >
                                        <AlertCircle size={16} />
                                        <span className="font-medium">{error}</span>
                                    </motion.div>
                                )}
                            </div>

                            {/* Botones */}
                            <div className="flex gap-3 mt-8 pt-4 border-t border-velvet-orchid-100 dark:border-velvet-orchid-800">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={isSaving}
                                    className="flex-1 py-3 font-bold text-velvet-orchid-600 hover:bg-velvet-orchid-50 dark:hover:bg-velvet-orchid-800 rounded-xl transition-all disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-1 py-3 bg-velvet-orchid-600 hover:bg-velvet-orchid-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-velvet-orchid-500/30 transition-all disabled:opacity-50"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="animate-spin" size={20} />
                                            Guardando cambios...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={20} />
                                            Guardar Cambios
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}