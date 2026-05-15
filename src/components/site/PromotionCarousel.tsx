'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { fetchPromotions } from '@/lib/actions';
import type { Promotion } from '@/types/promotion.types';
import Image from 'next/image';

const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export const PromotionCarousel = () => {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [loading, setLoading] = useState(true);
    const [todayIndex, setTodayIndex] = useState(-1);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isInitialized, setIsInitialized] = useState(false);

    // Configuración del carrusel (sin startIndex aquí)
    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: 'center',
        loop: true,
        dragFree: false,
        containScroll: 'trimSnaps',
        slidesToScroll: 1
    });

    // Mover al día actual después de que el carrusel y los datos estén listos
    useEffect(() => {
        if (emblaApi && todayIndex >= 0 && !isInitialized) {
            emblaApi.scrollTo(todayIndex);
            setIsInitialized(true);
        }
    }, [emblaApi, todayIndex, isInitialized]);
    const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;

        const onSelect = () => {
            setSelectedIndex(emblaApi.selectedScrollSnap());
        };

        emblaApi.on('select', onSelect);
        onSelect();

        return () => {
            emblaApi.off('select', onSelect);
        };
    }, [emblaApi]);

    // Mover al día actual después de inicializar el carrusel
    useEffect(() => {
        if (emblaApi && todayIndex >= 0 && !isInitialized) {
            emblaApi.scrollTo(todayIndex);
            setIsInitialized(true);
        }
    }, [emblaApi, todayIndex, isInitialized]);

    useEffect(() => {
        loadPromotions();
    }, []);

    const loadPromotions = async () => {
        try {
            const data = await fetchPromotions();
            setPromotions(data);

            const today = new Date().getDay();
            const dayOfWeek = today === 0 ? 7 : today;
            setTodayIndex(dayOfWeek - 1);
        } catch (error) {
            console.error('Error loading promotions:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <section className="py-16 md:py-24 bg-velvet-orchid-50 dark:bg-velvet-orchid-950/50">
                <div className="container mx-auto px-4 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-velvet-orchid-500 mx-auto"></div>
                </div>
            </section>
        );
    }

    if (!promotions.length) return null;

    return (
        <section id="outfits" className="py-16 md:py-24 bg-velvet-orchid-100 dark:bg-velvet-orchid-800/10">
            <div className="container mx-auto px-4 md:px-8">
                {/* Header */}
                <div className=" mt-10 text-center mb-12 md:mb-16">
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-velvet-orchid-950 dark:text-white">
                        Outfit de <span className="text-velvet-orchid-500">Hoy</span>
                    </h2>
                    <p className="text-velvet-orchid-600 dark:text-velvet-orchid-400 mt-2 max-w-2xl mx-auto">
                        Cada día una experiencia diferente. Desliza para descubrir todos los temas exclusivos.
                    </p>
                </div>

                {/* Carrusel */}
                <div className="relative max-w-5xl mx-auto">
                    {/* Botones de navegación */}
                    <button
                        onClick={scrollPrev}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 -ml-4 md:-ml-6 p-2 md:p-3 bg-white/80 dark:bg-velvet-orchid-800/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-velvet-orchid-500 hover:text-white transition-all"
                        aria-label="Anterior"
                    >
                        <ChevronLeft size={24} />
                    </button>

                    <button
                        onClick={scrollNext}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 -mr-4 md:-mr-6 p-2 md:p-3 bg-white/80 dark:bg-velvet-orchid-800/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-velvet-orchid-500 hover:text-white transition-all"
                        aria-label="Siguiente"
                    >
                        <ChevronRight size={24} />
                    </button>

                    {/* Embla Carousel */}
                    <div className="overflow-hidden py-8" ref={emblaRef}>
                        <div className="flex items-stretch">
                            {promotions.map((promo, idx) => {
                                const isToday = idx === todayIndex;
                                const isActive = idx === selectedIndex;

                                return (
                                    <div
                                        key={promo.id}
                                        className="flex-[0_0_85%] sm:flex-[0_0_60%] md:flex-[0_0_45%] lg:flex-[0_0_33.33%] pl-4"
                                    >
                                        <motion.div
                                            animate={{
                                                scale: isActive ? 1 : 0.95,
                                            }}
                                            transition={{ duration: 0.3 }}
                                            className={`
                                                relative rounded-2xl overflow-hidden transition-all duration-500 h-105 md:h-120
                                                ${isToday ? 'ring-2 ring-velvet-orchid-500 shadow-2xl shadow-velvet-orchid-500/30' : ''}
                                            `}
                                            style={{
                                                filter: !isToday ? 'blur(3px) grayscale(30%)' : 'blur(0) grayscale(0)',
                                                transition: 'filter 0.3s ease'
                                            }}
                                        >
                                            {/* Imagen de fondo */}
                                            {promo.image_url ? (
                                                <div className="absolute inset-0">
                                                    <Image
                                                        src={promo.image_url}
                                                        alt={promo.theme}
                                                        fill
                                                        quality={75}
                                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                    />
                                                    <div className="absolute inset-0 bg-linear-to-t from-velvet-orchid-950 via-velvet-orchid-950/60 to-transparent" />
                                                </div>
                                            ) : (
                                                <div className="absolute inset-0 bg-linear-to-br from-velvet-orchid-800 to-velvet-orchid-900" />
                                            )}

                                            {/* Contenido */}
                                            <div className="relative h-full p-6 flex flex-col justify-between">
                                                {/* Badge de día */}
                                                <div className="flex justify-between items-start">
                                                    <span className={`
                                                        px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                                                        ${isToday
                                                            ? 'bg-linear-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                                                            : 'bg-velvet-orchid-800/80 text-velvet-orchid-300 backdrop-blur-sm'
                                                        }
                                                    `}>
                                                        {daysOfWeek[idx]}
                                                    </span>

                                                    {isToday && (
                                                        <span className="px-2 py-1 bg-linear-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold rounded-full animate-pulse shadow-lg">
                                                            🔥 HOY
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Tema y descripción */}
                                                <div className="text-center">
                                                    <h3 className={`
                                                        text-2xl md:text-3xl font-black mb-2
                                                        ${isToday ? 'text-white drop-shadow-lg' : 'text-white/80'}
                                                    `}>
                                                        {promo.theme}
                                                    </h3>
                                                    <p className={`
                                                        text-sm md:text-base max-w-xs mx-auto line-clamp-2
                                                        ${isToday ? 'text-velvet-orchid-200' : 'text-velvet-orchid-300/70'}
                                                    `}>
                                                        {promo.teaser || promo.name}
                                                    </p>
                                                </div>

                                                {/* Botón */}
                                                <button className={`
                                                    w-full py-3 rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2
                                                    ${isToday
                                                        ? 'bg-linear-to-r from-amber-500 to-orange-500 text-white hover:scale-105 shadow-lg shadow-amber-500/30'
                                                        : 'bg-white/20 backdrop-blur-md text-white/80 hover:bg-white/30 hover:text-white'
                                                    }
                                                `}>
                                                    {isToday ? promo.cta_text : 'Ver detalles'}
                                                    <ChevronRight size={16} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Indicadores de página */}
                    <div className="flex justify-center gap-2 mt-6">
                        {promotions.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => emblaApi?.scrollTo(idx)}
                                className={`h-2 rounded-full transition-all duration-300 ${idx === selectedIndex
                                    ? 'w-6 bg-velvet-orchid-500'
                                    : 'w-2 bg-velvet-orchid-300/50 hover:bg-velvet-orchid-400'
                                    } ${idx === todayIndex ? 'ring-1 ring-velvet-orchid-500' : ''}`}
                                aria-label={`Ir al día ${idx + 1}`}
                            />
                        ))}
                    </div>

                    {/* Indicador de deslizamiento (móvil) */}
                    <p className="text-center text-velvet-orchid-400 text-xs mt-6 md:hidden">
                        ← Desliza para ver más días →
                    </p>
                </div>
            </div>
        </section>
    );
};