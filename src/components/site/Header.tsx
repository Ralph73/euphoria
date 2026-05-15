'use client';

import { useTheme } from "next-themes";
import { Moon, Sun, Menu, X } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useSettings } from '@/hooks/useSettings';

export default function Header() {
    const { theme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState("inicio");
    const { settings, loading } = useSettings();

    const navLinks = [
        { name: "Inicio", href: "#inicio", id: "inicio" },
        { name: "Nosotros", href: "#nosotros", id: "nosotros" },
        { name: "Hostess", href: "#hostess", id: "hostess" },
        { name: "Outfit", href: "#Outfits", id: "outfits" },
        { name: "Servicios", href: "#servicios", id: "servicios" },
    ];

    // Función para scroll suave
    const scrollToSection = useCallback((e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();
        setIsOpen(false); // Cerrar menú móvil si está abierto
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }, []);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);

        // Configuración mejorada del IntersectionObserver
        const observerOptions = {
            root: null,
            rootMargin: '-45% 0px -45% 0px',
            threshold: [0, 0.25, 0.5, 0.75, 1]
        };

        const observerCallback = (entries: IntersectionObserverEntry[]) => {
            const visibleSections = entries
                .filter(entry => entry.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

            if (visibleSections.length > 0) {
                setActiveSection(visibleSections[0].target.id);
            }
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        navLinks.forEach((link) => {
            const element = document.getElementById(link.id);
            if (element) observer.observe(element);
        });

        window.addEventListener("scroll", handleScroll);
        handleScroll();

        return () => {
            window.removeEventListener("scroll", handleScroll);
            observer.disconnect();
        };
    }, [navLinks]);

    const hasLogo = !loading && settings?.hero_logo_url;

    return (
        <header
            className={`fixed w-full top-0 z-50 transition-all duration-700 ${scrolled
                ? "py-3 bg-white/90 dark:bg-velvet-orchid-950/90 backdrop-blur-xl border-b border-velvet-orchid-200/50 dark:border-velvet-orchid-800/50 shadow-lg shadow-velvet-orchid-500/5"
                : "py-6 bg-transparent"
                }`}
        >
            {/* Gradiente de fondo sutil cuando no hay scroll */}
            {!scrolled && (
                <div className="absolute inset-0 bg-linear-to-b from-velvet-orchid-50/50 to-transparent dark:from-velvet-orchid-950/50 pointer-events-none" />
            )}

            <div className="max-w-8xl mx-auto px-6 md:px-20 flex justify-between items-center relative z-10">

                {/* LOGO */}
                <Link href="/" className="group flex items-center gap-3 outline-none relative">
                    {!hasLogo && (
                        <div className="relative w-10 h-10 flex items-center justify-center">
                            <div
                                className="absolute inset-0 bg-velvet-orchid-500 rotate-45 group-hover:rotate-225 group-hover:rounded-sm transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"
                            />
                            <span className="relative text-white font-black text-sm z-10 italic group-hover:scale-125 transition-transform duration-500">
                                E
                            </span>
                        </div>
                    )}

                    {hasLogo ? (
                        <div className="relative w-32 md:w-40 h-12 md:h-16">
                            <Image
                                src={settings.hero_logo_url!}
                                alt="Logo Euphoria"
                                fill
                                className="object-contain"
                                priority
                                quality={75}
                                sizes="(max-width: 768px) 128px, 160px"
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col leading-none">
                            <span className="text-xl md:text-2xl font-black uppercase tracking-tighter italic text-velvet-orchid-900 dark:text-velvet-orchid-50">
                                Euphoria<span className="text-velvet-orchid-500 not-italic">.</span>
                            </span>
                            <motion.span
                                initial={{ width: 0 }}
                                whileHover={{ width: "100%" }}
                                className="h-px bg-velvet-orchid-500 mt-1 self-start transition-all duration-500"
                            />
                        </div>
                    )}
                </Link>

                {/* NAVEGACIÓN DESKTOP - MEJORADA */}
                <nav className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            onClick={(e) => scrollToSection(e, link.id)}
                            className="relative group py-2"
                        >
                            <span className={`
                                relative text-sm font-black uppercase tracking-[0.2em] 
                                transition-colors duration-300
                                ${activeSection === link.id
                                    ? 'text-velvet-orchid-500'
                                    : 'text-velvet-orchid-800 dark:text-velvet-orchid-200 hover:text-velvet-orchid-500'
                                }
                            `}>
                                {link.name}
                            </span>

                            {/* Indicador con animación mejorada */}
                            <motion.span
                                className="absolute -bottom-1 left-0 h-0.5 bg-velvet-orchid-500"
                                initial={{ width: 0 }}
                                animate={{
                                    width: activeSection === link.id ? '100%' : 0,
                                    opacity: activeSection === link.id ? 1 : 0
                                }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                            />

                            {/* Efecto hover suave */}
                            <span className="absolute inset-0 -z-10 bg-velvet-orchid-500/0 rounded-lg transition-all duration-300 group-hover:bg-velvet-orchid-500/5 group-hover:scale-110" />
                        </a>
                    ))}
                </nav>

                {/* ACCIONES */}
                <div className="flex items-center gap-3 md:gap-6">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="p-2 hover:bg-velvet-orchid-500/10 rounded-full text-velvet-orchid-900 dark:text-velvet-orchid-100 transition-colors"
                        aria-label="Cambiar tema"
                    >
                        {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden p-2 hover:bg-velvet-orchid-500/10 rounded-full text-velvet-orchid-900 dark:text-velvet-orchid-100 transition-colors"
                        aria-label="Menú"
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </motion.button>
                </div>
            </div>

            {/* MENÚ MÓVIL - MEJORADO */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 200 }}
                        className="fixed inset-0 h-screen bg-velvet-orchid-50 dark:bg-velvet-orchid-950 z-40 flex flex-col justify-center px-12 md:hidden"
                        style={{ top: 0 }}
                    >
                        {/* Botón cerrar en móvil */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-6 right-6 p-2 text-velvet-orchid-900 dark:text-velvet-orchid-100"
                            aria-label="Cerrar menú"
                        >
                            <X size={28} />
                        </button>

                        {/* Links de navegación */}
                        <div className="flex flex-col gap-6">
                            {navLinks.map((link, i) => (
                                <motion.a
                                    key={link.name}
                                    href={link.href}
                                    onClick={(e) => scrollToSection(e, link.id)}
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="relative group"
                                >
                                    <span className={`
                                        text-5xl font-black uppercase italic tracking-tighter 
                                        transition-all duration-300 inline-block
                                        ${activeSection === link.id
                                            ? 'text-velvet-orchid-500 translate-x-4'
                                            : 'text-velvet-orchid-900 dark:text-velvet-orchid-100 opacity-30 hover:opacity-100 hover:translate-x-2'
                                        }
                                    `}>
                                        {link.name}
                                    </span>

                                    {/* Línea decorativa en móvil */}
                                    {activeSection === link.id && (
                                        <motion.div
                                            className="absolute -left-8 top-1/2 -translate-y-1/2 w-1 h-12 bg-velvet-orchid-500 rounded-full"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", delay: i * 0.1 }}
                                        />
                                    )}
                                </motion.a>
                            ))}
                        </div>

                        {/* Footer del menú móvil */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="absolute bottom-12 left-12 text-sm text-velvet-orchid-500/50"
                        >
                            <p>© {new Date().getFullYear()} Euphoria</p>
                            <p className="text-xs mt-1">Exclusividad Masculina</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}