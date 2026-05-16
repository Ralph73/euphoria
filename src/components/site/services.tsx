'use client';

import { useEffect, useState } from 'react';
import { fetchServices } from '@/lib/actions';
import type { Service } from '@/lib/actions';
import { DollarSign, Clock, Sparkles, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const Services = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        try {
            const data = await fetchServices();
            // Mostrar solo servicios activos
            setServices(data.filter(s => s.status === true));
        } catch (error) {
            console.error('Error loading services:', error);
        } finally {
            setLoading(false);
        }
    };

    // Iconos por índice para variedad visual
    const icons = [
        <Sparkles key="sparkles" size={24} className="text-velvet-orchid-500" />,
        <Clock key="clock" size={24} className="text-velvet-orchid-500" />,
        <DollarSign key="dollar" size={24} className="text-velvet-orchid-500" />,
        <Sparkles key="sparkles2" size={24} className="text-velvet-orchid-500" />
    ];

    if (loading) {
        return (
            <section id="servicios" className="py-32 bg-linear-to-t from-velvet-orchid-950 via-velvet-orchid-950/20 to-transparent px-6 md:px-12 scroll-mt-20">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-velvet-orchid-500 mx-auto"></div>
                </div>
            </section>
        );
    }

    if (services.length === 0) return null;

    return (
        <section id="servicios" className="py-24 md:py-32 bg-linear-to-t from-velvet-orchid-950 via-velvet-orchid-950/20 to-transparent px-6 md:px-12 scroll-mt-20">
            <div className="max-w-7xl mx-auto">
                {/* Título con efecto */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12 md:mb-16"
                >
                    <span className="inline-block text-velvet-orchid-500 text-sm font-bold uppercase tracking-wider mb-3">
                        Nuestros Servicios
                    </span>
                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter italic text-white leading-tight">
                        Experiencias <span className="text-velvet-orchid-500">Premium</span>
                    </h2>
                    <div className="w-24 h-1 bg-velvet-orchid-500 mx-auto mt-6 rounded-full" />
                </motion.div>

                {/* Grid de servicios */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {services.map((service, index) => (
                        <motion.div
                            key={service.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-velvet-orchid-500/50 transition-all duration-500 cursor-pointer overflow-hidden"
                        >
                            {/* Efecto de brillo al hacer hover */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-linear-to-br from-velvet-orchid-500/10 via-transparent to-transparent" />

                            {/* Icono decorativo */}
                            <div className="mb-4">
                                <div className="w-12 h-12 rounded-xl bg-velvet-orchid-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    {icons[index % icons.length]}
                                </div>
                            </div>

                            {/* Nombre del servicio */}
                            <h3 className="text-xl md:text-2xl font-black text-white mb-2 group-hover:text-velvet-orchid-500 transition-colors">
                                {service.name}
                            </h3>

                            {/* Descripción */}
                            {service.description && (
                                <p className="text-velvet-orchid-600 dark:text-velvet-orchid-300 text-sm mb-4 line-clamp-2">
                                    {service.description}
                                </p>
                            )}

                            {/* Precio */}
                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
                                <div className="flex items-center gap-1">
                                    <DollarSign size={16} className="text-green-400" />
                                    <span className="text-white font-bold text-lg">
                                        {typeof service.price === 'number' ? service.price.toFixed(2) : service.price}
                                    </span>
                                    <span className="text-stone-800 dark:text-velvet-orchid-300 text-xs">MXN</span>
                                </div>
                                <button className="flex items-center gap-1 text-amber-600 hover:text-white text-sm font-medium transition-colors group-hover:translate-x-1 duration-300">
                                    Reservar <ChevronRight size={14} />
                                </button>
                            </div>

                            {/* Línea decorativa inferior */}
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-velvet-orchid-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                        </motion.div>
                    ))}
                </div>

                {/* Mensaje si hay pocos servicios */}
                {services.length < 4 && (
                    <p className="text-center text-velvet-orchid-400 text-sm mt-8">
                        Más servicios disponibles próximamente
                    </p>
                )}
            </div>
        </section>
    );
};