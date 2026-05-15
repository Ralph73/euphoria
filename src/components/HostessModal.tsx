'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, ChevronLeft, ChevronRight, Clock, MessageCircle,
    Heart, Star, Award, ChevronDown, ChevronUp
} from 'lucide-react';
import { fetchHostessById } from '@/lib/actions';
import type { Host, HostWithDetails } from '@/types';

interface HostessModalProps {
    host: Host;
    onClose: () => void;
}

export default function HostessModal({ host, onClose }: HostessModalProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [hostDetails, setHostDetails] = useState<HostWithDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [showMobileInfo, setShowMobileInfo] = useState(false);

    useEffect(() => {
        const loadHostDetails = async () => {
            try {
                const details = await fetchHostessById(host.id);
                setHostDetails(details);
            } catch (error) {
                console.error('Error loading host details:', error);
            } finally {
                setLoading(false);
            }
        };

        loadHostDetails();
    }, [host.id]);

    const photos = host.host_media || [];
    const currentHost = hostDetails || host;

    const handleNext = () => setActiveIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
    const handlePrev = () => setActiveIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));

    const whatsappMessage = `Hola! Me gustaría solicitar información sobre ${currentHost.nickname}`;

    // Calcular rating promedio
    const averageRating = hostDetails?.feedback?.length
        ? (hostDetails.feedback.reduce((acc, f) => acc + f.rating, 0) / hostDetails.feedback.length).toFixed(1)
        : '0.0';

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-6 bg-black/90 backdrop-blur-xl"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative w-full h-full md:h-auto md:max-w-7xl md:max-h-[90vh] bg-linear-to-br from-velvet-orchid-950 to-velvet-orchid-900 md:border border-white/10 md:rounded-2xl shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Botón Cerrar - Siempre visible */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-velvet-orchid-500 backdrop-blur-md rounded-full p-2.5 shadow-xl border border-white/10 text-white transition-all duration-300 hover:scale-110 active:scale-95"
                    aria-label="Cerrar"
                >
                    <X size={20} />
                </button>

                {/* VERSIÓN MÓVIL - Imagen a pantalla completa */}
                <div className="block md:hidden h-full">
                    {/* Imagen a pantalla completa */}
                    <div className="relative h-full w-full bg-black">
                        {loading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-velvet-orchid-500"></div>
                            </div>
                        ) : (
                            <>
                                {/* Imagen que cubre todo el espacio */}
                                <div className="absolute inset-0">
                                    <Image
                                        src={photos[activeIndex]?.url || '/default-avatar.jpg'}
                                        alt={currentHost.nickname}
                                        fill
                                        className="object-cover"
                                        priority
                                        quality={85}
                                        sizes="(max-width: 768px) 100vw, 85vw"
                                    />
                                    {/* Overlay oscuro para mejorar legibilidad de los botones */}
                                    <div className="absolute inset-0 bg-black/30" />
                                </div>
                                {/* Likes sobre la imagen */}
                                <div className="absolute top-4 left-4 z-40 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                                    <Heart size={16} className="fill-pink-400 text-pink-400" />
                                    <span className="text-white font-bold text-sm">{currentHost.likes || 0}</span>
                                </div>

                                {/* Rating sobre la imagen (solo si existe feedback) */}
                                {hostDetails?.feedback && hostDetails.feedback.length > 0 && (
                                    <div className="absolute top-4 right-4 z-40 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                                        <Star size={14} className="fill-amber-400 text-amber-400" />
                                        <span className="text-white text-sm font-medium">{averageRating}</span>
                                    </div>
                                )}

                                {/* Navegación de fotos */}
                                {photos.length > 1 && (
                                    <>
                                        <button
                                            onClick={handlePrev}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-velvet-orchid-500 text-white rounded-full backdrop-blur-sm border border-white/10 shadow-lg z-40"
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                        <button
                                            onClick={handleNext}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-velvet-orchid-500 text-white rounded-full backdrop-blur-sm border border-white/10 shadow-lg z-40"
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                    </>
                                )}

                                {/* Contador de fotos */}
                                {photos.length > 0 && (
                                    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20 z-40">
                                        <span className="text-white text-xs font-medium">
                                            {activeIndex + 1} / {photos.length}
                                        </span>
                                    </div>
                                )}

                                {/* Botón para mostrar/ocultar info */}
                                <button
                                    onClick={() => setShowMobileInfo(!showMobileInfo)}
                                    className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-velvet-orchid-500 text-white px-8 py-3 rounded-full font-bold text-sm flex items-center gap-2 shadow-lg hover:bg-velvet-orchid-600 transition-colors z-40"
                                >
                                    {showMobileInfo ? 'Ocultar información' : 'Ver información'}
                                    {showMobileInfo ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                                </button>
                            </>
                        )}
                    </div>

                    {/* Panel de información deslizable */}
                    <AnimatePresence>
                        {showMobileInfo && (
                            <motion.div
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '100%' }}
                                transition={{ type: "spring", damping: 30, stiffness: 200 }}
                                drag="y"
                                dragConstraints={{ top: 0, bottom: 0 }}
                                dragElastic={0.2}
                                onDragEnd={(_, info) => {
                                    if (info.offset.y > 100) {
                                        setShowMobileInfo(false);
                                    }
                                }}
                                className="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-velvet-orchid-950 to-velvet-orchid-900 rounded-t-3xl border-t border-white/10 overflow-hidden z-50"
                            >
                                {/* Indicador de deslizamiento */}
                                <div className="sticky top-0 left-0 right-0 h-8 flex items-center justify-center pt-2 bg-linear-to-t from-transparent to-velvet-orchid-950/50 backdrop-blur-sm z-10">
                                    <div className="w-12 h-1.5 bg-white/30 rounded-full" />
                                </div>

                                {/* Contenido scrolleable */}
                                <div className="h-full overflow-y-auto p-6 pt-2 pb-20">
                                    {/* Header */}
                                    <div className="mb-6">
                                        <h2 className="text-3xl font-black tracking-tighter text-white">
                                            {currentHost.nickname}
                                        </h2>
                                        {currentHost.nombre && (
                                            <p className="text-velvet-orchid-300 text-sm mt-1">{currentHost.nombre}</p>
                                        )}
                                    </div>

                                    {/* Horario */}
                                    <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl mb-6">
                                        <Clock size={18} className="text-velvet-orchid-400" />
                                        <span className="text-white font-medium">{currentHost.schedule || "Disponible 24/7"}</span>
                                    </div>

                                    {/* Skills */}
                                    {hostDetails?.skills && hostDetails.skills.length > 0 && (
                                        <div className="mb-6">
                                            <h3 className="text-xs font-black uppercase tracking-wider text-velvet-orchid-400 mb-3 flex items-center gap-2">
                                                <Award size={14} /> Especialidades
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {hostDetails.skills.map((skill) => (
                                                    <span
                                                        key={skill.id}
                                                        className="px-3 py-1.5 bg-velvet-orchid-500/10 border border-velvet-orchid-500/20 rounded-full text-white text-xs font-medium"
                                                    >
                                                        {skill.skill?.nombre}
                                                        {skill.personalizacion && (
                                                            <span className="ml-1 text-velvet-orchid-300 text-[10px]">
                                                                • {skill.personalizacion}
                                                            </span>
                                                        )}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Miniaturas */}
                                    {photos.length > 1 && (
                                        <div className="mb-6">
                                            <h3 className="text-xs font-black uppercase tracking-wider text-velvet-orchid-400 mb-3">
                                                Galería
                                            </h3>
                                            <div className="grid grid-cols-4 gap-2">
                                                {photos.map((photo, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => {
                                                            setActiveIndex(idx);
                                                            setShowMobileInfo(false);
                                                        }}
                                                        className={`aspect-square rounded-lg overflow-hidden transition-all ${activeIndex === idx
                                                            ? 'ring-2 ring-velvet-orchid-500'
                                                            : 'opacity-60 hover:opacity-100'
                                                            }`}
                                                    >
                                                        <img
                                                            src={photo.url}
                                                            alt={`${currentHost.nickname} ${idx + 1}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Botón WhatsApp */}
                                    <a
                                        href={`https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-3 w-full py-4 bg-linear-to-r from-green-500 to-green-600 text-white font-black uppercase tracking-widest text-sm rounded-xl shadow-lg shadow-green-500/20 sticky bottom-0"
                                    >
                                        <MessageCircle size={18} />
                                        Contactar por WhatsApp
                                    </a>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* VERSIÓN DESKTOP */}
                <div className="hidden md:flex h-[85vh]">

                    {/* Lado Izquierdo - Galería */}
                    <div className="flex-1 relative bg-black/40 flex items-center justify-center group">

                        {/* Likes sobre la imagen */}
                        <div className="absolute top-4 left-4 z-40 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                            <Heart size={16} className="fill-pink-400 text-pink-400" />
                            <span className="text-white font-bold text-sm">{currentHost.likes || 0}</span>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-velvet-orchid-500"></div>
                            </div>
                        ) : (
                            <>
                                <AnimatePresence mode="wait">
                                    <motion.img
                                        key={activeIndex}
                                        src={photos[activeIndex]?.url || '/default-avatar.jpg'}
                                        initial={{ opacity: 0, scale: 1.1 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.3 }}
                                        className="w-full h-full object-contain"
                                        alt={currentHost.nickname}
                                    />
                                </AnimatePresence>

                                {photos.length > 1 && (
                                    <>
                                        <button
                                            onClick={handlePrev}
                                            className="absolute left-4 p-2 bg-black/50 hover:bg-velvet-orchid-500 text-white rounded-full backdrop-blur-sm border border-white/10 shadow-lg transition-all hover:scale-110"
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                        <button
                                            onClick={handleNext}
                                            className="absolute right-4 p-2 bg-black/50 hover:bg-velvet-orchid-500 text-white rounded-full backdrop-blur-sm border border-white/10 shadow-lg transition-all hover:scale-110"
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                    </>
                                )}

                                {photos.length > 0 && (
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20">
                                        <span className="text-white text-xs font-medium">
                                            {activeIndex + 1} / {photos.length}
                                        </span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Lado Derecho - Información */}
                    <div className="w-96 bg-linear-to-b from-velvet-orchid-950 to-velvet-orchid-900 flex flex-col">
                        {/* Header */}
                        <div className="p-6 border-b border-white/10">
                            <h2 className="text-3xl font-black tracking-tighter text-white mb-1">
                                {currentHost.nickname}
                            </h2>
                            {currentHost.nombre && (
                                <p className="text-velvet-orchid-300 text-sm">{currentHost.nombre}</p>
                            )}

                            <div className="flex items-center gap-3 mt-4">
                                <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full">
                                    <Clock size={14} className="text-velvet-orchid-400" />
                                    <span className="text-white text-sm font-medium">{currentHost.schedule || "24/7"}</span>
                                </div>
                            </div>
                        </div>

                        {/* Contenido scrolleable */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Skills */}
                            {hostDetails?.skills && hostDetails.skills.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-wider text-velvet-orchid-400 mb-3">
                                        Especialidades
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {hostDetails.skills.map((skill) => (
                                            <span
                                                key={skill.id}
                                                className="px-3 py-1.5 bg-velvet-orchid-500/10 border border-velvet-orchid-500/20 rounded-full text-white text-xs font-medium"
                                            >
                                                {skill.skill?.nombre}
                                                {skill.personalizacion && (
                                                    <span className="ml-1 text-velvet-orchid-300 text-[10px]">
                                                        • {skill.personalizacion}
                                                    </span>
                                                )}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Miniaturas */}
                            {photos.length > 1 && (
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-wider text-velvet-orchid-400 mb-3">
                                        Galería
                                    </h3>
                                    <div className="grid grid-cols-4 gap-2">
                                        {photos.map((photo, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setActiveIndex(idx)}
                                                className={`aspect-square rounded-lg overflow-hidden transition-all ${activeIndex === idx
                                                    ? 'ring-2 ring-velvet-orchid-500'
                                                    : 'opacity-60 hover:opacity-100'
                                                    }`}
                                            >
                                                <img
                                                    src={photo.url}
                                                    alt={`${currentHost.nickname} ${idx + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Botón WhatsApp */}
                        {/* <div className="p-6 border-t border-white/10">
                            <a
                                href={`https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-3 w-full py-4 bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-black uppercase tracking-widest text-sm rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-green-500/20"
                            >
                                <MessageCircle size={18} />
                                WhatsApp
                            </a>
                        </div> */}

                        {/* Botón Agendar Cita funcionando solo hay que activarlo*/}
                        {/* <div className="p-6 border-t border-white/10">
                            <button
                                onClick={() => {
                                    window.dispatchEvent(new CustomEvent('openAppointmentModal', {
                                        detail: {
                                            hostId: currentHost.id,
                                            hostName: currentHost.nickname,
                                            hostSchedule: currentHost.schedule
                                        }
                                    }));
                                }}
                                className="w-full py-4 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black uppercase tracking-widest text-sm rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-amber-500/20"
                            >
                                Agendar Citas
                            </button>
                        </div> */}


                    </div>
                </div>


            </motion.div>
        </motion.div>
    );
}