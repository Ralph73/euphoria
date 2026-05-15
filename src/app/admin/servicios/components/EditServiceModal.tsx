'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, Save, Loader2, AlertCircle, DollarSign } from 'lucide-react';
import { updateService, type Service } from '@/lib/actions';
import Swal from 'sweetalert2';

interface EditServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    service: Service | null;
}

export default function EditServiceModal({ isOpen, onClose, onSuccess, service }: EditServiceModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState<number>(0);
    const [status, setStatus] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (service) {
            setName(service.name);
            setDescription(service.description || '');
            setPrice(service.price);
            setStatus(service.status);
        }
    }, [service]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            setError('El nombre es obligatorio');
            return;
        }
        if (price < 0) {
            setError('El precio debe ser un valor válido');
            return;
        }

        if (!service) return;

        setIsSaving(true);
        setError(null);

        const result = await updateService(service.id, {
            name: name.trim(),
            description: description.trim() || null,
            price,
            status
        });

        if (result.success) {
            Swal.fire({
                icon: 'success',
                title: '¡Servicio actualizado!',
                text: 'El servicio se ha actualizado correctamente',
                timer: 2000,
                showConfirmButton: false,
                background: '#1f2937',
                color: '#ffffff',
                customClass: { popup: 'rounded-2xl' }
            });
            onSuccess();
            onClose();
        } else {
            setError(result.error || 'Error al actualizar el servicio');
        }

        setIsSaving(false);
    };

    return (
        <AnimatePresence>
            {isOpen && service && (
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
                                        <Package className="text-white" size={22} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-velvet-orchid-900 dark:text-white">
                                            Editar Servicio
                                        </h2>
                                        <p className="text-xs text-velvet-orchid-500 mt-0.5">
                                            Modifica los campos del servicio
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Columna Izquierda */}
                                <div className="space-y-4">
                                    {/* Nombre */}
                                    <div>
                                        <label className="text-sm font-bold text-velvet-orchid-700 dark:text-velvet-orchid-300 block mb-2">
                                            Nombre del servicio <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full bg-velvet-orchid-50 dark:bg-velvet-orchid-800/50 border-2 border-velvet-orchid-200 dark:border-velvet-orchid-700 rounded-xl px-5 py-3.5 outline-none focus:border-velvet-orchid-500 focus:ring-4 focus:ring-velvet-orchid-500/20 font-medium text-velvet-orchid-900 dark:text-white transition-all"
                                            disabled={isSaving}
                                            autoFocus
                                        />
                                    </div>

                                    {/* Precio */}
                                    <div>
                                        <label className="text-sm font-bold text-velvet-orchid-700 dark:text-velvet-orchid-300 block mb-2">
                                            Precio <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-velvet-orchid-400" size={18} />
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={price}
                                                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                                                className="w-full bg-velvet-orchid-50 dark:bg-velvet-orchid-800/50 border-2 border-velvet-orchid-200 dark:border-velvet-orchid-700 rounded-xl pl-10 pr-5 py-3.5 outline-none focus:border-velvet-orchid-500 focus:ring-4 focus:ring-velvet-orchid-500/20 font-medium text-velvet-orchid-900 dark:text-white transition-all"
                                                disabled={isSaving}
                                            />
                                        </div>
                                    </div>

                                    {/* Estado */}
                                    <div>
                                        <label className="text-sm font-bold text-velvet-orchid-700 dark:text-velvet-orchid-300 block mb-2">
                                            Estado
                                        </label>
                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setStatus(true)}
                                                className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${status
                                                        ? 'bg-green-600 text-white shadow-lg shadow-green-600/30'
                                                        : 'bg-velvet-orchid-100 dark:bg-velvet-orchid-800 text-velvet-orchid-600 dark:text-velvet-orchid-400'
                                                    }`}
                                            >
                                                🟢 Activo
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setStatus(false)}
                                                className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${!status
                                                        ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                                                        : 'bg-velvet-orchid-100 dark:bg-velvet-orchid-800 text-velvet-orchid-600 dark:text-velvet-orchid-400'
                                                    }`}
                                            >
                                                🔴 Inactivo
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Columna Derecha */}
                                <div className="space-y-4">
                                    {/* Descripción */}
                                    <div>
                                        <label className="text-sm font-bold text-velvet-orchid-700 dark:text-velvet-orchid-300 block mb-2">
                                            Descripción <span className="text-velvet-orchid-400 text-xs font-normal">(opcional)</span>
                                        </label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            rows={6}
                                            className="w-full bg-velvet-orchid-50 dark:bg-velvet-orchid-800/50 border-2 border-velvet-orchid-200 dark:border-velvet-orchid-700 rounded-xl px-5 py-3.5 outline-none focus:border-velvet-orchid-500 focus:ring-4 focus:ring-velvet-orchid-500/20 font-medium text-velvet-orchid-900 dark:text-white resize-none transition-all"
                                            disabled={isSaving}
                                        />
                                        <p className="text-xs text-velvet-orchid-400 mt-1.5">
                                            Una breve descripción del servicio
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-2 text-red-500 text-sm bg-red-50 dark:bg-red-950/30 px-4 py-3 rounded-xl mt-6"
                                >
                                    <AlertCircle size={16} />
                                    <span className="font-medium">{error}</span>
                                </motion.div>
                            )}

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