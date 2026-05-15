'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { deleteUser } from '@/lib/actions';
import Swal from 'sweetalert2';

interface User {
    id: string;
    email: string;
    role: string | null;
}

interface DeleteUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    user: User | null;
}

export default function DeleteUserModal({ isOpen, onClose, onSuccess, user }: DeleteUserModalProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        if (!user) return;

        // Confirmación adicional con SweetAlert2
        const result = await Swal.fire({
            title: '¿Eliminar usuario?',
            text: `Esta acción eliminará permanentemente a ${user.email}`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6c2871',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            background: '#1f2937',
            color: '#ffffff',
            customClass: { popup: 'rounded-2xl' }
        });

        if (!result.isConfirmed) return;

        setIsDeleting(true);
        setError(null);

        const deleteResult = await deleteUser(user.id);

        if (deleteResult.success) {
            Swal.fire({
                icon: 'success',
                title: 'Usuario eliminado',
                text: 'El usuario ha sido eliminado correctamente',
                timer: 2000,
                showConfirmButton: false,
                background: '#1f2937',
                color: '#ffffff',
                customClass: { popup: 'rounded-2xl' }
            });
            onSuccess();
            onClose();
        } else {
            setError(deleteResult.error || 'Error al eliminar el usuario');
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: deleteResult.error || 'Error al eliminar el usuario',
                background: '#1f2937',
                color: '#ffffff',
                customClass: { popup: 'rounded-2xl' }
            });
        }

        setIsDeleting(false);
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
                        <div className="px-6 py-4 border-b border-velvet-orchid-100 dark:border-velvet-orchid-800 bg-linear-to-r from-red-50 to-white dark:from-red-950/20 dark:to-velvet-orchid-900 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-500 rounded-xl shadow-lg shadow-red-500/30">
                                    <AlertTriangle className="text-white" size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-velvet-orchid-900 dark:text-white">
                                        Eliminar Usuario
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

                        {/* Contenido */}
                        <div className="p-6">
                            <div className="mb-6">
                                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 dark:bg-amber-950/30 p-4 rounded-xl mb-4">
                                    <AlertTriangle size={20} />
                                    <p className="text-sm font-medium">
                                        Esta acción no se puede deshacer
                                    </p>
                                </div>

                                <p className="text-sm text-velvet-orchid-600 dark:text-velvet-orchid-300">
                                    Estás a punto de eliminar permanentemente al usuario:
                                </p>
                                <p className="font-bold text-velvet-orchid-950 dark:text-white mt-2 p-3 bg-velvet-orchid-50 dark:bg-velvet-orchid-800/50 rounded-lg">
                                    {user.email}
                                </p>

                                {user.role && (
                                    <p className="text-xs text-velvet-orchid-500 mt-2">
                                        Rol actual: <span className="font-medium">{user.role}</span>
                                    </p>
                                )}
                            </div>

                            {/* Error */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-2 text-red-500 text-sm bg-red-50 dark:bg-red-950/30 px-4 py-3 rounded-xl mb-4"
                                >
                                    <AlertCircle size={16} />
                                    <span className="font-medium">{error}</span>
                                </motion.div>
                            )}

                            {/* Botones */}
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={isDeleting}
                                    className="flex-1 py-3 font-bold text-velvet-orchid-500 hover:bg-velvet-orchid-50 dark:hover:bg-velvet-orchid-800 rounded-xl transition-all disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-500/30 transition-all disabled:opacity-50"
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
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}