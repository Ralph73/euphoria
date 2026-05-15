'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import useEmblaCarousel from 'embla-carousel-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Hooks
import { useHostLikes } from '@/hooks/useHostLikes';

// Componentes propios
import InitialLoader from "@/components/site/InitialLoader";
import Header from '@/components/site/Header';
import { Hero } from '@/components/site/Hero';
import { About } from '@/components/site/About';
import { Services } from '@/components/site/services';
import { Footer } from '@/components/site/Footer';
import HostessModal from "@/components/HostessModal";
import HostessCard from '@/components/HostessCard';
import { PromotionCarousel } from '@/components/site/PromotionCarousel';
import AppointmentModal from '@/components/site/AppointmentModal';

export default function Home() {
  const [hosts, setHosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHost, setSelectedHost] = useState<any | null>(null);

  // Estados para el modal de cita
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [selectedHostForAppointment, setSelectedHostForAppointment] = useState<{ id: string; name: string; schedule?: string } | null>(null);

  // Escuchar evento para abrir modal de cita
  useEffect(() => {
    const handleOpenAppointmentModal = (event: CustomEvent) => {
      setSelectedHostForAppointment(event.detail);
      setAppointmentModalOpen(true);
    };

    window.addEventListener('openAppointmentModal', handleOpenAppointmentModal as EventListener);

    return () => {
      window.removeEventListener('openAppointmentModal', handleOpenAppointmentModal as EventListener);
    };
  }, []);

  // Hook para manejar los likes
  const { handleLike, getHostLikes, hasHostLiked, isHostLiking } = useHostLikes(hosts);

  // 1. CONFIGURACIÓN DEL CARRUSEL
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: true,
    dragFree: true,
    containScroll: 'trimSnaps'
  });

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  // TRACKEAR INDEX DEL CARRUCEL
  const [selectedIndex, setSelectedIndex] = useState(0);

  // ACTUALIZA EL INDEX CUANDO CAMBIA EL CARRUCEL
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

  // 2. FETCH DE DATOS
  useEffect(() => {
    async function fetchData() {
      try {
        const { data, error } = await supabase
          .from("hosts")
          .select(`
            id, 
            nickname, 
            schedule, 
            status, 
            likes,
            is_new,
            host_media(*)
          `);

        if (error) throw error;

        const formattedData = (data || []).map(host => ({
          ...host,
          is_available: host.status === 'activo' || host.status === true
        }));

        setHosts(formattedData);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setTimeout(() => setLoading(false), 3500);
      }
    }
    fetchData();
  }, []);

  return (
    <main className="min-h-screen bg-velvet-orchid-50 dark:bg-velvet-orchid-950 transition-colors duration-500 overflow-x-hidden">
      <InitialLoader />

      {!loading && <Header />}

      <AnimatePresence>
        {!loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>

            {/* HERO SECTION */}
            <Hero />

            {/* ABOUT SECTION */}
            <About />

            {/* SECCIÓN HOSTESS */}
            <section id="hostess" className="py-16 md:py-20 max-w-full mx-auto px-4 md:px-12 scroll-mt-24 overflow-hidden">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-16 gap-4 md:gap-8">
                <div className="border-l-4 md:border-l-8 border-velvet-orchid-500 pl-4 md:pl-8">
                  <h2 className="text-3xl md:text-5xl lg:text-7xl font-black uppercase tracking-tighter dark:text-white leading-tight md:leading-none">
                    Nuestras <span className="text-velvet-orchid-500 not-italic">Hostess</span>
                  </h2>
                </div>

                {/* Controles del carrusel */}
                <div className="hidden md:flex gap-4">
                  <button onClick={scrollPrev} className="p-5 border border-velvet-orchid-200 dark:border-velvet-orchid-800 rounded-full hover:bg-velvet-orchid-500 hover:text-white transition-all text-velvet-orchid-500">
                    <ChevronLeft size={24} />
                  </button>
                  <button onClick={scrollNext} className="p-5 border border-velvet-orchid-200 dark:border-velvet-orchid-800 rounded-full hover:bg-velvet-orchid-500 hover:text-white transition-all text-velvet-orchid-500">
                    <ChevronRight size={24} />
                  </button>
                </div>
              </div>

              {/* Hostess Cards */}
              <div className="max-w-7xl mx-auto overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
                <div className="flex -ml-3 md:-ml-12">
                  {hosts.map((host) => (
                    <div
                      key={host.id}
                      className="flex-[0_0_85%] sm:flex-[0_0_50%] lg:flex-[0_0_33.33%] pl-3 md:pl-12"
                    >
                      <HostessCard
                        host={{
                          ...host,
                          likes: getHostLikes(host.id)
                        }}
                        onClick={() => setSelectedHost(host)}
                        onLike={() => handleLike(host.id)}
                        hasLiked={hasHostLiked(host.id)}
                        isLiking={isHostLiking(host.id)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Indicador de scroll en móvil */}
              <div className="flex justify-center gap-2 mt-6 md:hidden">
                {hosts.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => emblaApi?.scrollTo(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${index === selectedIndex
                      ? 'w-6 bg-velvet-orchid-500'
                      : 'w-2 bg-velvet-orchid-300/50 hover:bg-velvet-orchid-400'
                      }`}
                    aria-label={`Ir a hostess ${index + 1}`}
                  />
                ))}
              </div>
            </section>

            {/* PROMOTIONS SECTION */}
            <PromotionCarousel />

            {/* SERVICES SECTION */}
            <Services />

            <Footer />
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL EXTERNO */}
      <AnimatePresence>
        {selectedHost && (
          <HostessModal host={selectedHost} onClose={() => setSelectedHost(null)} />
        )}
      </AnimatePresence>

      {/* Modal de cita */}
      <AppointmentModal
        isOpen={appointmentModalOpen}
        onClose={() => {
          setAppointmentModalOpen(false);
          setSelectedHostForAppointment(null);
        }}
        hostId={selectedHostForAppointment?.id || ''}
        hostName={selectedHostForAppointment?.name || ''}
        hostSchedule={selectedHostForAppointment?.schedule}
      />

    </main>
  );
}