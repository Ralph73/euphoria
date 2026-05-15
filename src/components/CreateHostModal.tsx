"use client";

import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
    X, UploadCloud, Save, Loader2, Image as ImageIcon,
    Video, Star, Trash2, CheckCircle2, AlertCircle,
    Camera, Clock, Award, Plus, Search, ChevronDown, Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Tipos para Skills
interface Skill {
    id: string;
    nombre: string;
    descripcion: string | null;
}

interface MediaItem {
    id: string;
    url: string;
    type: "image" | "video";
    is_cover: boolean;
    file: File;
    uploadStatus: "waiting" | "uploading" | "done" | "error";
    uploadProgress?: number;
}

interface SelectedSkill {
    id: string; // temp id
    skill_id: string;
    nombre: string;
    personalizacion: string | null;
}

export default function CreateHostModal({ isOpen, onClose, onRefresh }: {
    isOpen: boolean; onClose: () => void; onRefresh: () => void
}) {
    const [isSaving, setIsSaving] = useState(false);
    const [nickname, setNickname] = useState("");
    const [schedule, setSchedule] = useState("");
    const [status, setStatus] = useState("activo");
    const [mediaList, setMediaList] = useState<MediaItem[]>([]);

    // Estados para Skills
    const [selectedSkills, setSelectedSkills] = useState<SelectedSkill[]>([]);
    const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
    const [showSkillSelector, setShowSkillSelector] = useState(false);
    const [selectedSkillId, setSelectedSkillId] = useState<string>("");
    const [skillPersonalization, setSkillPersonalization] = useState("");
    const [searchSkillTerm, setSearchSkillTerm] = useState("");
    const [loadingSkills, setLoadingSkills] = useState(false);

    const [validationError, setValidationError] = useState<string | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"info" | "gallery">("info");

    const fileInputRef = useRef<HTMLInputElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Cargar skills disponibles al abrir el modal
    useEffect(() => {
        if (isOpen) {
            fetchAvailableSkills();
        }
    }, [isOpen]);

    // Enfocar búsqueda cuando se abre el selector
    useEffect(() => {
        if (showSkillSelector && searchInputRef.current) {
            setTimeout(() => searchInputRef.current?.focus(), 100);
        }
    }, [showSkillSelector]);

    // Limpiar ObjectURLs al desmontar
    useEffect(() => {
        return () => {
            mediaList.forEach(m => {
                if (m.url.startsWith('blob:')) {
                    URL.revokeObjectURL(m.url);
                }
            });
        };
    }, [mediaList]);

    // Cerrar con Escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !isSaving) onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isSaving, onClose]);

    const fetchAvailableSkills = async () => {
        setLoadingSkills(true);
        try {
            const { data, error } = await supabase
                .from("skills")
                .select("*")
                .order("nombre");

            if (error) throw error;
            setAvailableSkills(data || []);
        } catch (error) {
            console.error("Error cargando skills:", error);
        } finally {
            setLoadingSkills(false);
        }
    };

    if (!isOpen) return null;

    const validateMediaCount = (type: "image" | "video"): boolean => {
        const images = mediaList.filter(m => m.type === "image").length;
        const videos = mediaList.filter(m => m.type === "video").length;

        if (type === "image" && images >= 10) {
            setValidationError("Máximo 10 imágenes permitidas");
            return false;
        }
        if (type === "video" && videos >= 2) {
            setValidationError("Máximo 2 videos permitidos");
            return false;
        }
        return true;
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setValidationError(null);

        files.forEach(file => {
            const type = file.type.startsWith('video') ? 'video' : 'image';

            if (!validateMediaCount(type)) return;

            const newItem: MediaItem = {
                id: crypto.randomUUID(),
                url: URL.createObjectURL(file),
                type: type as "image" | "video",
                is_cover: mediaList.length === 0 && type === 'image',
                file,
                uploadStatus: "waiting"
            };
            setMediaList(prev => [...prev, newItem]);
        });

        e.target.value = '';
    };

    const removeMedia = (item: MediaItem) => {
        if (item.url.startsWith('blob:')) {
            URL.revokeObjectURL(item.url);
        }
        setMediaList(prev => prev.filter(m => m.id !== item.id));
        setValidationError(null);
    };

    const setAsCover = (item: MediaItem) => {
        if (item.type !== 'image') {
            setValidationError("Solo imágenes pueden ser portada");
            return;
        }
        setMediaList(prev => prev.map(x => ({ ...x, is_cover: x.id === item.id })));
    };

    // Funciones para Skills
    const handleAddSkill = () => {
        if (!selectedSkillId) {
            setValidationError("Selecciona una habilidad");
            return;
        }

        const skillExists = selectedSkills.some(s => s.skill_id === selectedSkillId);
        if (skillExists) {
            setValidationError("Esta habilidad ya está asignada");
            return;
        }

        const selectedSkill = availableSkills.find(s => s.id === selectedSkillId);
        if (!selectedSkill) return;

        const newSkill: SelectedSkill = {
            id: `temp-${crypto.randomUUID()}`,
            skill_id: selectedSkillId,
            nombre: selectedSkill.nombre,
            personalizacion: skillPersonalization || null
        };

        setSelectedSkills(prev => [...prev, newSkill]);
        setSelectedSkillId("");
        setSkillPersonalization("");
        setShowSkillSelector(false);
        setValidationError(null);
    };

    const handleRemoveSkill = (skillId: string) => {
        setSelectedSkills(prev => prev.filter(s => s.id !== skillId));
    };

    const filteredSkills = availableSkills.filter(skill =>
        skill.nombre.toLowerCase().includes(searchSkillTerm.toLowerCase()) &&
        !selectedSkills.some(s => s.skill_id === skill.id)
    );

    const validateBeforeSave = (): boolean => {
        if (!nickname.trim()) {
            setValidationError("El nickname es obligatorio");
            return false;
        }

        if (!schedule.trim()) {
            setValidationError("El horario es obligatorio");
            return false;
        }

        const images = mediaList.filter(m => m.type === 'image');
        if (images.length === 0) {
            setValidationError("Debes subir al menos una imagen");
            return false;
        }

        if (!images.some(m => m.is_cover)) {
            setValidationError("Debes seleccionar una imagen como portada");
            return false;
        }

        return true;
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateBeforeSave()) return;

        setIsSaving(true);
        setValidationError(null);

        try {
            console.log("📝 INICIO CREACIÓN - Creando nuevo host");

            // 1. Crear Host
            const { data: host, error: hErr } = await supabase
                .from("hosts")
                .insert({
                    nickname,
                    schedule,
                    status
                })
                .select("id")
                .single();

            if (hErr) {
                console.error("❌ Error creando host:", hErr);
                throw hErr;
            }
            console.log("✅ Host creado con ID:", host.id);

            // 2. Subir medios
            console.log("📤 Procesando medios:", mediaList.length, "items");
            for (const [index, item] of mediaList.entries()) {
                console.log(`   📤 Item ${index + 1}/${mediaList.length}:`, { type: item.type, fileName: item.file.name });

                setMediaList(prev => prev.map(m =>
                    m.id === item.id ? { ...m, uploadStatus: "uploading" } : m
                ));

                try {
                    // Primero subir archivo
                    const fileExt = item.file.name.split('.').pop();
                    const fileName = `${crypto.randomUUID()}.${fileExt}`;
                    const filePath = `${host.id}/${fileName}`;

                    const { error: uploadError } = await supabase.storage
                        .from('host-media')
                        .upload(filePath, item.file);

                    if (uploadError) throw uploadError;

                    const { data: { publicUrl } } = supabase.storage
                        .from('host-media')
                        .getPublicUrl(filePath);

                    // Insertar en BD
                    const { data: dbMedia, error: insertError } = await supabase
                        .from("host_media")
                        .insert({
                            host_id: host.id,
                            type: item.type,
                            is_cover: item.is_cover,
                            url: publicUrl
                        })
                        .select('id')
                        .single();

                    if (insertError) throw insertError;

                    console.log(`   ✅ Medio ${index + 1} guardado con ID:`, dbMedia.id);

                    setMediaList(prev => prev.map(m =>
                        m.id === item.id ? { ...m, uploadStatus: "done" } : m
                    ));

                } catch (error: any) {
                    console.error(`   ❌ Error procesando item ${index + 1}:`, error);
                    setMediaList(prev => prev.map(m =>
                        m.id === item.id ? { ...m, uploadStatus: "error" } : m
                    ));
                    throw error;
                }
            }

            // 3. Guardar skills
            if (selectedSkills.length > 0) {
                console.log("🎯 Guardando skills:", selectedSkills.length, "items");

                for (const [index, skill] of selectedSkills.entries()) {
                    console.log(`   📍 Skill ${index + 1}:`, { skill_id: skill.skill_id, personalizacion: skill.personalizacion });

                    const { error: skillError } = await supabase
                        .from("host_skills")
                        .insert({
                            host_id: host.id,
                            skill_id: skill.skill_id,
                            personalizacion: skill.personalizacion
                        });

                    if (skillError) {
                        console.error(`   ❌ Error insertando skill ${index + 1}:`, skillError);
                        throw skillError;
                    }
                }
                console.log("✅ Skills guardadas correctamente");
            }

            console.log("🎉 TODAS LAS OPERACIONES COMPLETADAS EXITOSAMENTE");
            onRefresh();
            onClose();
        } catch (err: any) {
            console.error("❌❌❌ ERROR EN HANDLE SAVE ❌❌❌", err);
            setValidationError(err.message || "Error al guardar");
        } finally {
            setIsSaving(false);
        }
    };

    const imageCount = mediaList.filter(m => m.type === 'image').length;
    const videoCount = mediaList.filter(m => m.type === 'video').length;

    return (
        <>
            {/* Modal principal */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4"
                    >
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !isSaving && onClose()}
                            className="absolute inset-0 bg-velvet-orchid-950/80 backdrop-blur-md"
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="relative bg-white dark:bg-velvet-orchid-900 w-full max-w-6xl max-h-[95vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-velvet-orchid-200 dark:border-velvet-orchid-700"
                        >
                            {/* Header con gradiente */}
                            <div className="px-6 md:px-8 py-4 border-b border-velvet-orchid-100 dark:border-velvet-orchid-800 flex justify-between items-center bg-linear-to-r from-velvet-orchid-50 to-white dark:from-velvet-orchid-800 dark:to-velvet-orchid-900">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-velvet-orchid-500 rounded-xl shadow-lg shadow-velvet-orchid-500/30">
                                        <Camera className="text-white" size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl md:text-2xl font-black text-velvet-orchid-900 dark:text-white tracking-tighter">
                                            Registrar Nueva Hostess
                                        </h2>
                                        <p className="text-xs text-velvet-orchid-500 font-medium">Completa todos los campos</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    disabled={isSaving}
                                    className="p-2 hover:bg-velvet-orchid-200 dark:hover:bg-velvet-orchid-700 rounded-full text-velvet-orchid-400 transition-all disabled:opacity-50"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Tabs móvil con contadores */}
                            <div className="md:hidden flex border-b border-velvet-orchid-100 dark:border-velvet-orchid-800">
                                <button
                                    onClick={() => setActiveTab("info")}
                                    className={`flex-1 py-3 font-bold text-sm uppercase tracking-wider transition-all relative ${activeTab === "info"
                                        ? "text-velvet-orchid-500"
                                        : "text-velvet-orchid-400"
                                        }`}
                                >
                                    Información
                                    {activeTab === "info" && (
                                        <motion.div
                                            layoutId="activeTabCreate"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-velvet-orchid-500"
                                        />
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab("gallery")}
                                    className={`flex-1 py-3 font-bold text-sm uppercase tracking-wider transition-all relative ${activeTab === "gallery"
                                        ? "text-velvet-orchid-500"
                                        : "text-velvet-orchid-400"
                                        }`}
                                >
                                    Galería
                                    <span className="ml-2 text-xs bg-velvet-orchid-100 dark:bg-velvet-orchid-800 px-2 py-0.5 rounded-full">
                                        {imageCount}/10 · {videoCount}/2
                                    </span>
                                    {activeTab === "gallery" && (
                                        <motion.div
                                            layoutId="activeTabCreate"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-velvet-orchid-500"
                                        />
                                    )}
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="flex-1 overflow-y-auto">
                                <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {/* Panel Izquierdo - Información */}
                                    <motion.div
                                        initial={false}
                                        animate={{ opacity: 1 }}
                                        className={`space-y-6 ${activeTab === "info" ? "block" : "hidden md:block"}`}
                                    >
                                        {/* Nickname */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-velvet-orchid-400 uppercase tracking-widest flex items-center gap-2">
                                                <Camera size={14} />
                                                Nickname <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                autoFocus
                                                className="w-full bg-velvet-orchid-50 dark:bg-velvet-orchid-800/50 border-2 border-velvet-orchid-200 dark:border-velvet-orchid-700 rounded-xl p-4 outline-none focus:border-velvet-orchid-500 focus:ring-4 focus:ring-velvet-orchid-500/20 font-bold text-velvet-orchid-900 dark:text-white transition-all"
                                                placeholder="Ej: Mia Diamond"
                                                value={nickname}
                                                onChange={e => setNickname(e.target.value)}
                                                disabled={isSaving}
                                            />
                                        </div>

                                        {/* Schedule */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-velvet-orchid-400 uppercase tracking-widest flex items-center gap-2">
                                                <Clock size={14} />
                                                Horario <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                className="w-full bg-velvet-orchid-50 dark:bg-velvet-orchid-800/50 border-2 border-velvet-orchid-200 dark:border-velvet-orchid-700 rounded-xl p-4 outline-none focus:border-velvet-orchid-500 focus:ring-4 focus:ring-velvet-orchid-500/20 font-bold text-velvet-orchid-900 dark:text-white transition-all"
                                                placeholder="Ej: Lunes a Viernes 10am - 8pm"
                                                value={schedule}
                                                onChange={e => setSchedule(e.target.value)}
                                                disabled={isSaving}
                                            />
                                        </div>

                                        {/* Status */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-velvet-orchid-400 uppercase tracking-widest flex items-center gap-2">
                                                <Award size={14} />
                                                Estado Inicial
                                            </label>
                                            <select
                                                className="w-full bg-velvet-orchid-50 dark:bg-velvet-orchid-800/50 border-2 border-velvet-orchid-200 dark:border-velvet-orchid-700 rounded-xl p-4 outline-none focus:border-velvet-orchid-500 focus:ring-4 focus:ring-velvet-orchid-500/20 font-bold text-velvet-orchid-900 dark:text-white"
                                                value={status}
                                                onChange={e => setStatus(e.target.value)}
                                                disabled={isSaving}
                                            >
                                                <option value="activo">🟢 Activo</option>
                                                <option value="pendiente">🟡 Pendiente</option>
                                                <option value="inactivo">🔴 Inactivo</option>
                                            </select>
                                        </div>

                                        {/* Skills Section */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-black text-velvet-orchid-400 uppercase tracking-widest flex items-center gap-2">
                                                    <Award size={14} />
                                                    Habilidades
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowSkillSelector(true)}
                                                    className="text-xs bg-velvet-orchid-500/10 hover:bg-velvet-orchid-500/20 text-velvet-orchid-500 px-3 py-1.5 rounded-full font-bold transition-all flex items-center gap-1"
                                                >
                                                    <Plus size={12} />
                                                    Agregar Skill
                                                </button>
                                            </div>

                                            {/* Lista de Skills */}
                                            {selectedSkills.length === 0 ? (
                                                <div className="bg-velvet-orchid-50 dark:bg-velvet-orchid-800/30 rounded-xl p-6 text-center border-2 border-dashed border-velvet-orchid-200 dark:border-velvet-orchid-700">
                                                    <Award className="mx-auto text-velvet-orchid-300 mb-2" size={24} />
                                                    <p className="text-sm text-velvet-orchid-400 font-medium">
                                                        No hay habilidades seleccionadas
                                                    </p>
                                                    <p className="text-xs text-velvet-orchid-300 mt-1">
                                                        Agrega skills para destacar
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="flex flex-wrap gap-2">
                                                    <AnimatePresence>
                                                        {selectedSkills.map((skill) => (
                                                            <motion.span
                                                                key={skill.id}
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                exit={{ scale: 0 }}
                                                                className="group relative px-4 py-2 bg-velvet-orchid-500/10 border border-velvet-orchid-500/30 rounded-full text-sm font-medium text-velvet-orchid-200 flex items-center gap-2"
                                                            >
                                                                {skill.nombre}
                                                                {skill.personalizacion && (
                                                                    <span className="text-[10px] text-velvet-orchid-300 px-1.5 py-0.5 bg-velvet-orchid-500/20 rounded-full">
                                                                        {skill.personalizacion}
                                                                    </span>
                                                                )}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveSkill(skill.id)}
                                                                    className="opacity-0 group-hover:opacity-100 ml-1 text-red-400 hover:text-red-300 transition-all"
                                                                >
                                                                    <X size={14} />
                                                                </button>
                                                            </motion.span>
                                                        ))}
                                                    </AnimatePresence>
                                                </div>
                                            )}
                                        </div>

                                    </motion.div>

                                    {/* Panel Derecho - Galería */}
                                    <motion.div
                                        initial={false}
                                        className={`md:col-span-2 space-y-6 ${activeTab === "gallery" ? "block" : "hidden md:block"}`}
                                    >
                                        {/* Header de galería */}
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                            <div>
                                                <h3 className="text-lg font-black text-velvet-orchid-900 dark:text-white">
                                                    Galería Multimedia
                                                </h3>
                                                <p className="text-sm text-velvet-orchid-400 mt-1">
                                                    {imageCount}/10 imágenes · {videoCount}/2 videos
                                                </p>
                                            </div>
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={isSaving}
                                                className="flex items-center gap-2 text-sm font-bold text-white bg-velvet-orchid-600 px-6 py-3 rounded-xl hover:bg-velvet-orchid-500 transition-all disabled:opacity-50 shadow-lg shadow-velvet-orchid-500/20"
                                            >
                                                <UploadCloud size={18} />
                                                Subir Archivos
                                            </motion.button>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileSelect}
                                                multiple
                                                className="hidden"
                                                accept="image/*,video/*"
                                                disabled={isSaving}
                                            />
                                        </div>

                                        {/* Grid de medios */}
                                        {mediaList.length === 0 ? (
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="border-2 border-dashed border-velvet-orchid-200 dark:border-velvet-orchid-700 rounded-3xl p-16 text-center"
                                            >
                                                <div className="w-20 h-20 mx-auto bg-velvet-orchid-100 dark:bg-velvet-orchid-800 rounded-full flex items-center justify-center mb-4">
                                                    <ImageIcon className="text-velvet-orchid-400" size={32} />
                                                </div>
                                                <p className="text-velvet-orchid-900 dark:text-white font-bold text-lg mb-2">
                                                    No hay medios aún
                                                </p>
                                                <p className="text-velvet-orchid-400 text-sm">
                                                    Sube imágenes o videos para comenzar
                                                </p>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
                                            >
                                                {mediaList.map((m) => (
                                                    <motion.div
                                                        key={m.id}
                                                        layout
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.8 }}
                                                        transition={{ duration: 0.2 }}
                                                        className={`group relative aspect-3/4 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${m.is_cover
                                                            ? 'border-velvet-orchid-500 shadow-xl shadow-velvet-orchid-500/30'
                                                            : 'border-velvet-orchid-200 dark:border-velvet-orchid-700 hover:border-velvet-orchid-400'
                                                            }`}
                                                        onClick={() => setPreviewImage(m.url)}
                                                    >
                                                        {m.type === 'image' ? (
                                                            <img
                                                                src={m.url}
                                                                alt=""
                                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                            />
                                                        ) : (
                                                            <video
                                                                src={m.url}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        )}

                                                        {/* Overlay */}
                                                        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                                        {/* Badges */}
                                                        <div className="absolute top-2 left-2 flex gap-1">
                                                            <span className={`px-2 py-1 rounded-full text-[8px] font-bold uppercase flex items-center gap-1 backdrop-blur-sm ${m.type === 'image'
                                                                ? 'bg-blue-500/80 text-white'
                                                                : 'bg-purple-500/80 text-white'
                                                                }`}>
                                                                {m.type === 'image' ? <ImageIcon size={10} /> : <Video size={10} />}
                                                                {m.type === 'image' ? 'FOTO' : 'VIDEO'}
                                                            </span>
                                                        </div>

                                                        {m.is_cover && (
                                                            <div className="absolute top-2 right-2">
                                                                <span className="px-2 py-1 bg-velvet-orchid-500 text-white rounded-full text-[8px] font-bold uppercase flex items-center gap-1 shadow-lg">
                                                                    <Star size={10} /> PORTADA
                                                                </span>
                                                            </div>
                                                        )}

                                                        {/* Upload status */}
                                                        {m.uploadStatus === "uploading" && (
                                                            <div className="absolute inset-0 bg-velvet-orchid-900/90 backdrop-blur-sm flex flex-col items-center justify-center">
                                                                <Loader2 className="animate-spin text-white mb-2" size={24} />
                                                                <span className="text-white text-[10px] font-bold">SUBIENDO</span>
                                                            </div>
                                                        )}

                                                        {m.uploadStatus === "error" && (
                                                            <div className="absolute inset-0 bg-red-500/90 flex flex-col items-center justify-center">
                                                                <AlertCircle className="text-white mb-2" size={24} />
                                                                <span className="text-white text-[10px] font-bold">ERROR</span>
                                                            </div>
                                                        )}

                                                        {m.uploadStatus === "done" && (
                                                            <div className="absolute bottom-2 right-2 bg-green-500 text-white p-1 rounded-full">
                                                                <CheckCircle2 size={14} />
                                                            </div>
                                                        )}

                                                        {/* Controles hover */}
                                                        <div className="absolute bottom-0 inset-x-0 p-3 flex gap-2 translate-y-full group-hover:translate-y-0 transition-transform">
                                                            {m.type === 'image' && (
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => { e.stopPropagation(); setAsCover(m); }}
                                                                    className={`flex-1 py-2 text-[9px] font-bold rounded-lg transition-all ${m.is_cover
                                                                        ? 'bg-velvet-orchid-500 text-white'
                                                                        : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/40'
                                                                        }`}
                                                                >
                                                                    {m.is_cover ? 'COVER' : 'PORTADA'}
                                                                </button>
                                                            )}
                                                            <button
                                                                type="button"
                                                                onClick={(e) => { e.stopPropagation(); removeMedia(m); }}
                                                                className="p-2 bg-red-500/80 backdrop-blur-sm text-white rounded-lg hover:bg-red-600 transition-all"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </motion.div>
                                        )}
                                    </motion.div>
                                </div>
                            </form>

                            {/* Footer */}
                            <div className="px-6 md:px-8 py-4 border-t border-velvet-orchid-100 dark:border-velvet-orchid-800 flex flex-col sm:flex-row justify-between items-center gap-4 bg-linear-to-r from-white to-velvet-orchid-50 dark:from-velvet-orchid-900 dark:to-velvet-orchid-800">
                                {validationError && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex items-center gap-2 text-red-500 text-sm bg-red-50 dark:bg-red-950/30 px-4 py-2 rounded-xl"
                                    >
                                        <AlertCircle size={16} />
                                        <span className="font-medium">{validationError}</span>
                                    </motion.div>
                                )}

                                <div className="flex gap-3 ml-auto">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        disabled={isSaving}
                                        className="px-6 py-3 font-bold text-velvet-orchid-500 hover:bg-velvet-orchid-50 dark:hover:bg-velvet-orchid-800 rounded-xl transition-all disabled:opacity-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="bg-velvet-orchid-600 hover:bg-velvet-orchid-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-3 shadow-lg shadow-velvet-orchid-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="animate-spin" size={20} />
                                                Guardando...
                                            </>
                                        ) : (
                                            <>
                                                <Save size={20} />
                                                Finalizar Registro
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Selector de Skills Modal - MEJORADO SIN SCROLL */}
            <AnimatePresence>
                {showSkillSelector && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        onClick={() => setShowSkillSelector(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="relative bg-white dark:bg-velvet-orchid-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-velvet-orchid-200 dark:border-velvet-orchid-700"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="px-6 py-4 border-b border-velvet-orchid-100 dark:border-velvet-orchid-800 bg-linear-to-r from-velvet-orchid-50 to-white dark:from-velvet-orchid-800 dark:to-velvet-orchid-900">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-black text-velvet-orchid-900 dark:text-white">
                                            Agregar Habilidad
                                        </h3>
                                        <p className="text-xs text-velvet-orchid-500 mt-0.5">
                                            Selecciona una habilidad de la lista
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setShowSkillSelector(false)}
                                        className="p-2 hover:bg-velvet-orchid-200 dark:hover:bg-velvet-orchid-700 rounded-full text-velvet-orchid-400 transition-all"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Content - Grid de 2 columnas para evitar scroll */}
                            <div className="p-6">
                                {/* Search */}
                                <div className="relative mb-6">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-velvet-orchid-400" size={18} />
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        placeholder="Buscar habilidad..."
                                        value={searchSkillTerm}
                                        onChange={(e) => setSearchSkillTerm(e.target.value)}
                                        className="w-full bg-velvet-orchid-50 dark:bg-velvet-orchid-800/50 border-2 border-velvet-orchid-200 dark:border-velvet-orchid-700 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-velvet-orchid-500 focus:ring-4 focus:ring-velvet-orchid-500/20 font-medium text-velvet-orchid-900 dark:text-white"
                                    />
                                </div>

                                {/* Skills list - Grid de 2 columnas, altura fija con scroll solo si es necesario */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar mb-6">
                                    {filteredSkills.length === 0 ? (
                                        <div className="col-span-2 text-center py-12">
                                            <Award className="mx-auto text-velvet-orchid-300 mb-3" size={32} />
                                            <p className="text-velvet-orchid-500 font-medium">
                                                No hay habilidades disponibles
                                            </p>
                                            <p className="text-xs text-velvet-orchid-400 mt-1">
                                                Intenta con otro término de búsqueda
                                            </p>
                                        </div>
                                    ) : (
                                        filteredSkills.map((skill) => (
                                            <button
                                                key={skill.id}
                                                onClick={() => setSelectedSkillId(skill.id)}
                                                className={`text-left p-4 rounded-xl border-2 transition-all ${selectedSkillId === skill.id
                                                        ? 'border-velvet-orchid-500 bg-velvet-orchid-500/10'
                                                        : 'border-velvet-orchid-200 dark:border-velvet-orchid-700 hover:border-velvet-orchid-300'
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-velvet-orchid-900 dark:text-white truncate">
                                                            {skill.nombre}
                                                        </p>
                                                        {skill.descripcion && (
                                                            <p className="text-xs text-velvet-orchid-500 mt-1 line-clamp-2">
                                                                {skill.descripcion}
                                                            </p>
                                                        )}
                                                    </div>
                                                    {selectedSkillId === skill.id && (
                                                        <div className="w-5 h-5 rounded-full bg-velvet-orchid-500 flex items-center justify-center shrink-0">
                                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>

                                {/* Personalization */}
                                <div className="border-t border-velvet-orchid-100 dark:border-velvet-orchid-800 pt-4">
                                    <label className="text-xs font-black text-velvet-orchid-400 uppercase tracking-widest block mb-2">
                                        Personalización <span className="text-velvet-orchid-300 text-[10px]">(opcional)</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Especialista en masajes suecos"
                                        value={skillPersonalization}
                                        onChange={(e) => setSkillPersonalization(e.target.value)}
                                        className="w-full bg-velvet-orchid-50 dark:bg-velvet-orchid-800/50 border-2 border-velvet-orchid-200 dark:border-velvet-orchid-700 rounded-xl p-3 outline-none focus:border-velvet-orchid-500 focus:ring-4 focus:ring-velvet-orchid-500/20 font-medium text-velvet-orchid-900 dark:text-white"
                                    />
                                    <p className="text-[10px] text-velvet-orchid-400 mt-1">
                                        Añade un detalle específico de esta habilidad
                                    </p>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 border-t border-velvet-orchid-100 dark:border-velvet-orchid-800 bg-velvet-orchid-50/50 dark:bg-velvet-orchid-800/30 flex justify-end gap-3">
                                <button
                                    onClick={() => setShowSkillSelector(false)}
                                    className="px-5 py-2.5 font-bold text-velvet-orchid-600 hover:bg-velvet-orchid-100 dark:hover:bg-velvet-orchid-800 rounded-xl transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleAddSkill}
                                    disabled={!selectedSkillId}
                                    className="px-5 py-2.5 bg-velvet-orchid-600 hover:bg-velvet-orchid-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-velvet-orchid-500/30"
                                >
                                    Agregar Skill
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Preview modal */}
            <AnimatePresence>
                {previewImage && (
                    <motion.div
                        key="create-preview"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/90"
                        onClick={() => setPreviewImage(null)}
                    >
                        <motion.img
                            key={`preview-${previewImage}`}
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.8 }}
                            src={previewImage}
                            alt="Preview"
                            className="max-w-full max-h-full object-contain"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <button
                            onClick={() => setPreviewImage(null)}
                            className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/30 p-3 rounded-full transition-all"
                        >
                            <X size={32} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Estilos para scrollbar personalizada */}
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(181, 66, 189, 0.5);
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(181, 66, 189, 0.8);
                }
            `}</style>
        </>
    );
}