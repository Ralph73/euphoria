'use client'

import { motion } from 'framer-motion'
import { ChevronDown, ShieldCheck, Sparkles } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { fetchSettings, fetchPromotionByDay } from '@/lib/actions'
import type { Settings } from '@/types'
import type { Promotion } from '@/types/promotion.types'

export const Hero = () => {
    const [settings, setSettings] = useState<Settings | null>(null)
    const [promotion, setPromotion] = useState<Promotion | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            // Obtener día actual (0=Domingo, 1=Lunes... 6=Sábado)
            const today = new Date().getDay()
            // Convertir a formato de nuestra tabla: 1=Lunes, 2=Martes... 7=Domingo
            const dayOfWeek = today === 0 ? 7 : today

            const [settingsData, promotionData] = await Promise.all([
                fetchSettings(),
                fetchPromotionByDay(dayOfWeek)
            ])

            setSettings(settingsData)
            setPromotion(promotionData)
        } catch (error) {
            console.error('Error loading data:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <section className="relative h-screen flex items-center justify-center bg-velvet-orchid-50 dark:bg-velvet-orchid-950">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-velvet-orchid-500"></div>
            </section>
        )
    }

    const hasPromotion = promotion && promotion.active

    return (
        <section id="inicio" className="relative h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
            {/* Imagen de fondo */}
            <div className="absolute inset-0 z-0">
                {settings?.hero_background_url ? (
                    <Image
                        src={settings.hero_background_url}
                        alt="Background"
                        fill
                        className="object-cover"
                        priority
                        quality={90}
                        sizes="100vw"
                        style={{
                            maskImage: 'radial-gradient(circle at center, rgba(0,0,0,0.9) 40%, rgba(0,0,0,0.4) 90%, rgba(0,0,0,0) 100%)',
                            WebkitMaskImage: 'radial-gradient(circle at center, rgba(0,0,0,0.9) 40%, rgba(0,0,0,0.4) 90%, rgba(0,0,0,0) 100%)'
                        }}
                    />
                ) : (
                    <div className="absolute inset-0 bg-linear-to-br from-velvet-orchid-100 to-velvet-orchid-200 dark:from-velvet-orchid-900 dark:to-velvet-orchid-800" />
                )}
                <div className="absolute inset-0 bg-velvet-orchid-50 dark:bg-velvet-orchid-950 mix-blend-multiply opacity-40 dark:opacity-60" />
            </div>

            {/* Contenido */}
            <div className="relative z-10 max-w-9xl mx-auto px-4">
                {/* Badge */}
                <div className="inline-flex mb-2 items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-primary backdrop-blur-md">
                    <ShieldCheck color="green" size={20} />
                    Exclusividad Masculina
                </div>

                {/* Título */}
                <motion.h1
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="text-5xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter italic text-velvet-orchid-900 dark:text-white leading-[1.1] drop-shadow-2xl"
                >
                    {settings?.hero_title || 'Euphoria'}
                </motion.h1>

                {/* Subtítulo */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="mt-1 text-lg md:text-xl lg:text-4xl font-medium text-velvet-orchid-500 dark:text-velvet-orchid-200 max-w-4xl mx-auto"
                >
                    {settings?.hero_subtitle || 'Relajación Exclusiva para el Caballero Moderno'}
                </motion.p>

                {/* Banner de Promoción */}
                <div className="mt-10 md:mt-12">
                    {hasPromotion ? (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7, duration: 0.5 }}
                            className="relative max-w-lg mx-auto"
                        >
                            {/* Contenedor del banner con borde sólido y fondo opaco */}
                            <div className="backdrop-blur-sm rounded-2xl border border-velvet-orchid-500/40 shadow-2xl overflow-hidden">
                                {/* Línea decorativa superior */}
                                <div className="h-1 bg-linear-to-r from-amber-500 via-velvet-orchid-500 to-amber-500" />

                                <div className="p-5 md:p-6 text-center">

                                    {/* Badge con destello */}
                                    <div className="inline-flex items-center gap-1.5 mb-3 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 animate-pulse">
                                        <Sparkles size={12} className="text-amber-400" />
                                        <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-amber-400">
                                            Pase VIP de Hoy
                                        </span>
                                    </div>

                                    {/* Tema */}
                                    <h3 className="text-xl md:text-2xl font-black text-white mb-1">
                                        {promotion.name}
                                    </h3>

                                    {/* Frase de venta */}
                                    {promotion.teaser && (
                                        <p className="text-velvet-orchid-300 text-sm md:text-base max-w-md mx-auto mb-4">
                                            {promotion.teaser}
                                        </p>
                                    )}

                                    {/* Botón de acción */}
                                    <button
                                        onClick={() => window.location.href = '#outfits'}
                                        className="px-6 md:px-8 py-2.5 md:py-3 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm md:text-base rounded-full transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-amber-500/30 cursor-pointer">
                                        {promotion.cta_text}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7, duration: 0.5 }}
                            className="px-8 md:px-10 py-3 md:py-4 rounded-full border border-white/30 bg-white/10 backdrop-blur-md text-white font-bold text-base md:text-lg hover:bg-white/20 transition-all"
                        >
                            Reservar Ahora
                        </motion.button>
                    )}
                </div>
            </div>

            {/* Flecha hacia abajo */}
            <a href="#hostess" className="absolute bottom-8 animate-bounce text-velvet-orchid-500 z-10">
                <ChevronDown size={36} />
            </a>
        </section>
    )
}