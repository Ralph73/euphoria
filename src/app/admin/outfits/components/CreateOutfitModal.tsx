'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Save, Loader2, AlertCircle, UploadCloud, Trash2 } from 'lucide-react';
import { createPromotion, uploadOutfitImage } from '@/lib/actions';
import Swal from 'sweetalert2';
import Image from 'next/image';

const daysOfWeek = [
    { value: 1, label: 'Lunes' },
    { value: 2, label: 'Martes' },
    { value: 3, label: 'Miércoles' },
    { value: 4, label: 'Jueves' },
    { value: 5, label: 'Viernes' },
    { value: 6, label: 'Sábado' },
    { value: 7, label: 'Domingo' },
];

interface CreateOutfitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateOutfitModal({ isOpen, onClose, onSuccess }: CreateOutfitModalProps) {
    const [dayOfWeek, setDayOfWeek] = useState(1);
    const [theme, setTheme] = useState('');
    const [name, setName] = useState('');
    const [teaser, setTeaser] = useState('');
    const [ctaText, setCtaText] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [active, setActive] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0]) return;
        const file = e.target.files[0];
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleRemoveImage = () => {
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!theme.trim()) {
            setError('El tema es obligatorio');
            return;
        }
        if (!name.trim()) {
            setError('El nombre es obligatorio');
            return;
        }
        if (!ctaText.trim()) {
            setError('El texto del botón es obligatorio');
            return;
        }

        setIsSaving(true);
        setError(null);

        let finalImageUrl = null;

        if (imageFile) {
            setUploading(true);
            const result = await uploadOutfitImage(imageFile);
            setUploading(false);
            if (result.success && result.url) {
                finalImageUrl = result.url;
            } else {
                setError(result.error || 'Error al subir la imagen');
                setIsSaving(false);
                return;
            }
        }

        const result = await createPromotion({
            day_of_week: dayOfWeek,
            theme: theme.trim(),
            name: name.trim(),
            teaser: teaser.trim() || null,
            cta_text: ctaText.trim(),
            image_url: finalImageUrl,
            active
        });

        if (result.success) {
            await Swal.fire({
                icon: 'success',
                title: '¡Outfit creado!',
                text: 'El outfit se ha creado correctamente',
                timer: 2000,
                showConfirmButton: false,
                background: '#1f2937',
                color: '#ffffff',
                customClass: { popup: 'rounded-2xl' }
            });
            setDayOfWeek(1);
            setTheme('');
            setName('');
            setTeaser('');
            setCtaText('');
            handleRemoveImage();
            setActive(true);
            onSuccess();
            onClose();
        } else {
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: result.error || 'Error al crear el outfit',
                background: '#1f2937',
                color: '#ffffff',
                customClass: { popup: 'rounded-2xl' }
            });
        }

        setIsSaving(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
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
                        {/* Header más compacto */}
                        <div className="px-8 py-4 border-b border-velvet-orchid-100 dark:border-velvet-orchid-800 bg-linear-to-r from-velvet-orchid-50 to-white dark:from-velvet-orchid-800 dark:to-velvet-orchid-900">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-velvet-orchid-500 rounded-xl shadow-lg shadow-velvet-orchid-500/30">
                                        <Calendar className="text-white" size={20} />
                                    </div>
                                    <h2 className="text-xl font-black text-velvet-orchid-900 dark:text-white">
                                        Nuevo Outfit
                                    </h2>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-velvet-orchid-200 dark:hover:bg-velvet-orchid-700 rounded-full text-velvet-orchid-400 transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Formulario con grid de 2 columnas en desktop */}
                        <form onSubmit={handleSubmit} className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Columna Izquierda */}
                                <div className="space-y-4">
                                    {/* Día de la semana */}
                                    <div>
                                        <label className="text-xs font-black text-velvet-orchid-400 uppercase tracking-widest block mb-2">
                                            Día de la semana <span className="text-red-400">*</span>
                                        </label>
                                        <select
                                            value={dayOfWeek}
                                            onChange={(e) => setDayOfWeek(Number(e.target.value))}
                                            className="w-full bg-velvet-orchid-50 dark:bg-velvet-orchid-800/50 border-2 border-velvet-orchid-200 dark:border-velvet-orchid-700 rounded-xl p-3 outline-none focus:border-velvet-orchid-500 focus:ring-4 focus:ring-velvet-orchid-500/20 font-medium text-velvet-orchid-900 dark:text-white"
                                            disabled={isSaving}
                                        >
                                            {daysOfWeek.map(day => (
                                                <option key={day.value} value={day.value}>{day.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Tema */}
                                    <div>
                                        <label className="text-xs font-black text-velvet-orchid-400 uppercase tracking-widest block mb-2">
                                            Tema <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={theme}
                                            onChange={(e) => setTheme(e.target.value)}
                                            placeholder="Ej: Enfermeras"
                                            className="w-full bg-velvet-orchid-50 dark:bg-velvet-orchid-800/50 border-2 border-velvet-orchid-200 dark:border-velvet-orchid-700 rounded-xl p-3 outline-none focus:border-velvet-orchid-500 focus:ring-4 focus:ring-velvet-orchid-500/20 font-medium text-velvet-orchid-900 dark:text-white"
                                            disabled={isSaving}
                                            autoFocus
                                        />
                                    </div>

                                    {/* Nombre comercial */}
                                    <div>
                                        <label className="text-xs font-black text-velvet-orchid-400 uppercase tracking-widest block mb-2">
                                            Nombre comercial <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Ej: Martes de Enfermeras"
                                            className="w-full bg-velvet-orchid-50 dark:bg-velvet-orchid-800/50 border-2 border-velvet-orchid-200 dark:border-velvet-orchid-700 rounded-xl p-3 outline-none focus:border-velvet-orchid-500 focus:ring-4 focus:ring-velvet-orchid-500/20 font-medium text-velvet-orchid-900 dark:text-white"
                                            disabled={isSaving}
                                        />
                                    </div>
                                </div>

                                {/* Columna Derecha */}
                                <div className="space-y-4">
                                    {/* Texto del botón */}
                                    <div>
                                        <label className="text-xs font-black text-velvet-orchid-400 uppercase tracking-widest block mb-2">
                                            Texto del botón (CTA) <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={ctaText}
                                            onChange={(e) => setCtaText(e.target.value)}
                                            placeholder="Ej: Solicitar mi consulta"
                                            className="w-full bg-velvet-orchid-50 dark:bg-velvet-orchid-800/50 border-2 border-velvet-orchid-200 dark:border-velvet-orchid-700 rounded-xl p-3 outline-none focus:border-velvet-orchid-500 focus:ring-4 focus:ring-velvet-orchid-500/20 font-medium text-velvet-orchid-900 dark:text-white"
                                            disabled={isSaving}
                                        />
                                    </div>

                                    {/* Estado */}
                                    <div>
                                        <label className="text-xs font-black text-velvet-orchid-400 uppercase tracking-widest block mb-2">
                                            Estado
                                        </label>
                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setActive(true)}
                                                className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${active
                                                        ? 'bg-green-600 text-white shadow-lg shadow-green-600/30'
                                                        : 'bg-velvet-orchid-100 dark:bg-velvet-orchid-800 text-velvet-orchid-600 dark:text-velvet-orchid-400'
                                                    }`}
                                            >
                                                🟢 Activo
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setActive(false)}
                                                className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${!active
                                                        ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                                                        : 'bg-velvet-orchid-100 dark:bg-velvet-orchid-800 text-velvet-orchid-600 dark:text-velvet-orchid-400'
                                                    }`}
                                            >
                                                🔴 Inactivo
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Frase de venta - ancho completo */}
                            <div className="mt-6">
                                <label className="text-xs font-black text-velvet-orchid-400 uppercase tracking-widest block mb-2">
                                    Frase de venta <span className="text-velvet-orchid-300 text-[10px]">(opcional)</span>
                                </label>
                                <textarea
                                    value={teaser}
                                    onChange={(e) => setTeaser(e.target.value)}
                                    placeholder="Describe brevemente esta experiencia..."
                                    rows={2}
                                    className="w-full bg-velvet-orchid-50 dark:bg-velvet-orchid-800/50 border-2 border-velvet-orchid-200 dark:border-velvet-orchid-700 rounded-xl p-3 outline-none focus:border-velvet-orchid-500 focus:ring-4 focus:ring-velvet-orchid-500/20 font-medium text-velvet-orchid-900 dark:text-white resize-none"
                                    disabled={isSaving}
                                />
                            </div>

                            {/* Uploader de imagen - ancho completo */}
                            <div className="mt-6">
                                <label className="text-xs font-black text-velvet-orchid-400 uppercase tracking-widest block mb-2">
                                    Imagen del Outfit <span className="text-velvet-orchid-300 text-[10px]">(opcional)</span>
                                </label>

                                {imagePreview ? (
                                    <div className="relative group">
                                        <div className="relative w-full h-48 rounded-xl overflow-hidden border-2 border-velvet-orchid-200 dark:border-velvet-orchid-700 bg-velvet-orchid-50 dark:bg-velvet-orchid-800/50">
                                            <Image
                                                src={imagePreview}
                                                alt="Preview"
                                                fill
                                                className="object-contain"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${dragActive
                                                ? 'border-velvet-orchid-500 bg-velvet-orchid-50 dark:bg-velvet-orchid-800/50'
                                                : 'border-velvet-orchid-200 dark:border-velvet-orchid-700 hover:border-velvet-orchid-400'
                                            }`}
                                        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                                        onDragLeave={() => setDragActive(false)}
                                        onDrop={handleDrop}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            accept="image/*"
                                            onChange={handleImageSelect}
                                            className="hidden"
                                        />
                                        <UploadCloud className="mx-auto h-10 w-10 text-velvet-orchid-400 mb-2" />
                                        <p className="text-sm text-velvet-orchid-600 dark:text-velvet-orchid-400 font-medium">
                                            Haz clic o arrastra una imagen
                                        </p>
                                        <p className="text-xs text-velvet-orchid-400 mt-1">
                                            PNG, JPG, GIF hasta 5MB
                                        </p>
                                    </div>
                                )}
                                {uploading && (
                                    <div className="flex items-center justify-center gap-2 text-velvet-orchid-500 text-sm mt-2">
                                        <Loader2 className="animate-spin" size={16} />
                                        Subiendo imagen...
                                    </div>
                                )}
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-2 text-red-500 text-sm bg-red-50 dark:bg-red-950/30 px-4 py-2 rounded-xl mt-6"
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
                                    className="flex-1 py-3 font-bold text-velvet-orchid-500 hover:bg-velvet-orchid-50 dark:hover:bg-velvet-orchid-800 rounded-xl transition-all disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving || uploading}
                                    className="flex-1 py-3 bg-velvet-orchid-600 hover:bg-velvet-orchid-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-velvet-orchid-500/30 transition-all disabled:opacity-50"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="animate-spin" size={18} />
                                            {uploading ? 'Subiendo...' : 'Creando...'}
                                        </>
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            Crear Outfit
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