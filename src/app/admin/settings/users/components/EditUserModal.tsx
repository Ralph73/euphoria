'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Save, Loader2, AlertCircle } from 'lucide-react';
import { updateUserRole } from '@/lib/actions';
import Swal from 'sweetalert2';

interface User {
    id: string;
    email: string;
    role: string | null;
}

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    user: User | null;
}

const roleOptions = [
    { value: 'user', label: 'Usuario', color: 'green' },
    { value: 'admin', label: 'Administrador', color: 'blue' },
    { value: 'superadmin', label: 'Super Administrador', color: 'purple' },
];

export default function EditUserModal({ isOpen, onClose, onSuccess, user }: EditUserModalProps) {
    const [selectedRole, setSelectedRole] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            setSelectedRole(user.role || 'user');
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) return;

        // Si el usuario es superadmin, no permitir cambios
        if (user.role === 'superadmin') {
            setError('No se puede modificar un Super Administrador');
            return;
        }

        setIsSaving(true);
        setError(null);

        const result = await updateUserRole(user.id, { role: selectedRole });

        if (result.success) {
            Swal.fire({
                icon: 'success',
                title: 'Rol actualizado',
                text: 'El rol del usuario se ha actualizado correctamente',
                timer: 2000,
                showConfirmButton: false,
                background: '#1f2937',
                color: '#ffffff',
                customClass: { popup: 'rounded-2xl' }
            });
            onSuccess();
            onClose();
        } else {
            setError(result.error || 'Error al actualizar el rol');
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: result.error || 'Error al actualizar el rol',
                background: '#1f2937',
                color: '#ffffff',
                customClass: { popup: 'rounded-2xl' }
            });
        }

        setIsSaving(false);
    };

    const getRoleColor = (color: string) => {
        switch (color) {
            case 'green':
                return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
            case 'blue':
                return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
            case 'purple':
                return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800';
            default:
                return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    return (
        <AnimatePresence>
            {isOpen && user && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-velvet-orchid-950/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative bg-white dark:bg-velvet-orchid-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-velvet-orchid-200 dark:border-velvet-orchid-700"
                    >
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-velvet-orchid-100 dark:border-velvet-orchid-800 bg-linear-to-r from-velvet-orchid-50 to-white dark:from-velvet-orchid-800 dark:to-velvet-orchid-900 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-velvet-orchid-500 rounded-xl shadow-lg shadow-velvet-orchid-500/30">
                                    <Shield className="text-white" size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-velvet-orchid-900 dark:text-white">
                                        Editar Rol
                                    </h2>
                                    <p className="text-xs text-velvet-orchid-500 truncate max-w-62.5">
                                        {user.email}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-velvet-orchid-200 dark:hover:bg-velvet-orchid-700 rounded-full text-velvet-orchid-400 transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Formulario */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Rol actual (solo informativo) */}
                            <div className="space-y-2">
                                <label className="text-xs font-black text-velvet-orchid-400 uppercase tracking-widest">
                                    Rol actual
                                </label>
                                <div className={`px-4 py-3 rounded-xl border ${getRoleColor(
                                    user.role === 'superadmin' ? 'purple' :
                                        user.role === 'admin' ? 'blue' : 'green'
                                )}`}>
                                    <span className="font-medium">
                                        {user.role === 'superadmin' ? 'Super Administrador' :
                                            user.role === 'admin' ? 'Administrador' :
                                                user.role === 'user' ? 'Usuario' : 'Sin rol'}
                                    </span>
                                </div>
                            </div>

                            {/* Nuevo rol */}
                            <div className="space-y-2">
                                <label className="text-xs font-black text-velvet-orchid-400 uppercase tracking-widest">
                                    Nuevo rol <span className="text-red-400">*</span>
                                </label>
                                <div className="grid grid-cols-1 gap-2">
                                    {roleOptions.map((option) => {
                                        const isSelected = selectedRole === option.value;
                                        const isDisabled = user.role === 'superadmin' && option.value !== 'superadmin';

                                        return (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => !isDisabled && setSelectedRole(option.value)}
                                                disabled={isDisabled || user.role === 'superadmin'}
                                                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${isSelected
                                                        ? `border-${option.color}-500 bg-${option.color}-50 dark:bg-${option.color}-900/20`
                                                        : 'border-velvet-orchid-200 dark:border-velvet-orchid-700 hover:border-velvet-orchid-300'
                                                    } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-bold text-velvet-orchid-900 dark:text-white">
                                                            {option.label}
                                                        </p>
                                                    </div>
                                                    {isSelected && (
                                                        <div className={`w-5 h-5 rounded-full bg-${option.color}-500 flex items-center justify-center`}>
                                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
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

                            {/* Botones */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={isSaving}
                                    className="flex-1 py-3 font-bold text-velvet-orchid-500 hover:bg-velvet-orchid-50 dark:hover:bg-velvet-orchid-800 rounded-xl transition-all disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving || user.role === 'superadmin'}
                                    className="flex-1 py-3 bg-velvet-orchid-600 hover:bg-velvet-orchid-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-velvet-orchid-500/30 transition-all disabled:opacity-50"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="animate-spin" size={18} />
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={18} />
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