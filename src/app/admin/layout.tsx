"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
    LayoutDashboard, Users, Sparkles, Settings, LogOut,
    ChevronRight, Menu, X, Bell, User, HelpCircle,
    Globe, UserCog, Award, ChevronDown,
    Calendar
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import Swal from 'sweetalert2';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [authChecked, setAuthChecked] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        const checkAuth = async () => {
            try {
                console.log('1️⃣ Verificando autenticación...');

                const timeout = setTimeout(() => {
                    if (isMounted) {
                        console.log('⚠️ Timeout - forzando cierre de carga');
                        setIsLoading(false);
                    }
                }, 5000);

                const { data: { session }, error } = await supabase.auth.getSession();

                clearTimeout(timeout);

                if (!isMounted) return;

                console.log('2️⃣ Sesión actual:', session ? `✅ ${session.user.email}` : '❌ No hay sesión');

                if (error) {
                    console.log('3️⃣ Error:', error);
                    throw error;
                }

                if (session?.user?.email) {
                    setUserEmail(session.user.email);

                    console.log('3️⃣ Buscando perfil para:', session.user.id);

                    try {
                        const { data: profile, error: profileError } = await supabase
                            .from('profiles')
                            .select('role')
                            .eq('id', session.user.id)
                            .single();

                        if (profileError) {
                            console.log('⚠️ Error obteniendo perfil:', profileError);
                        }

                        setIsSuperAdmin(profile?.role === 'superadmin');
                        /* console.log('👑 Es SuperAdmin:', profile?.role === 'superadmin'); */
                        setIsAdmin(profile?.role === 'admin');
                        /* console.log('👑 Es admin:', profile?.role === 'admin'); */
                    } catch (profileErr) {
                        /* console.log('⚠️ Excepción en perfil:', profileErr); */
                        setIsSuperAdmin(false);
                        setIsAdmin(false);
                    }
                } else {
                    setUserEmail(null);
                    setIsSuperAdmin(false);
                    setIsAdmin(false);
                }

                if (!session && pathname !== "/admin/login") {
                    /* console.log('4️⃣ Redirigiendo a login...'); */
                    router.push("/admin/login");
                    return;
                }

                if (session && pathname === "/admin/login") {
                    /* console.log('5️⃣ Redirigiendo a dashboard...'); */
                    router.push("/admin/dashboard");
                    return;
                }

                setAuthChecked(true);
                setIsLoading(false);

            } catch (err) {
                /* console.error('❌ Error crítico en checkAuth:', err); */
                if (isMounted) {
                    setIsLoading(false);
                    toast.error('Error al cargar el panel');
                }
            }
        };

        checkAuth();

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [pathname, router]);

    useEffect(() => {
        console.log('📍 Ruta cambiada a:', pathname);
        setIsMenuOpen(false);
        setOpenSubmenu(null);
    }, [pathname]);

    const toggleSubmenu = (label: string) => {
        console.log('🔄 toggleSubmenu:', label, 'abierto actualmente:', openSubmenu);
        setOpenSubmenu(openSubmenu === label ? null : label);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-linear-to-br from-velvet-orchid-950 to-velvet-orchid-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-velvet-orchid-700 border-t-velvet-orchid-400 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-velvet-orchid-300 font-medium mb-4">Cargando panel...</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-velvet-orchid-600 text-white rounded-lg text-sm hover:bg-velvet-orchid-700 transition-colors"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    if (pathname === "/admin/login") {
        return <>{children}</>;
    }

    const navItems = [
        { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard", exact: true },
        { href: "/admin/hostess", icon: Users, label: "Hostess" },
        { href: "/admin/servicios", icon: Sparkles, label: "Servicios" },
        { href: "/admin/skills", icon: Sparkles, label: "Habilidades" },
        { href: "/admin/outfits", icon: Calendar, label: "Outfits" },
        /* { href: "/admin/settings/outfits", icon: Calendar, label: "Outfits" }, */
    ];

    const configItems = {
        label: "Configuración",
        icon: Settings,
        submenu: [
            { href: "/admin/settings/site", icon: Globe, label: "Sitio" },
            { href: "/admin/settings/users", icon: UserCog, label: "Users" },
        ]
    };

    const userInitial = userEmail?.[0]?.toUpperCase() || 'A';

    return (
        <>
            <Toaster
                position="top-right"
                reverseOrder={false}
                gutter={8}
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#fff',
                        color: '#363636',
                        padding: '16px',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px -5px rgba(181, 66, 189, 0.2), 0 8px 10px -6px rgba(181, 66, 189, 0.1)',
                        border: '1px solid #e1b4e4',
                        fontSize: '14px',
                        fontWeight: '500',
                    },
                    success: {
                        style: {
                            background: '#fff',
                            border: '1px solid #b542bd',
                            color: '#6c2871',
                        },
                        iconTheme: {
                            primary: '#b542bd',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        style: {
                            background: '#fff',
                            border: '1px solid #EF4444',
                            color: '#991B1B',
                        },
                        iconTheme: {
                            primary: '#EF4444',
                            secondary: '#fff',
                        },
                    },
                }}
            />

            <div className="flex min-h-screen bg-linear-to-br from-velvet-orchid-50 to-white dark:from-velvet-orchid-950 dark:to-velvet-orchid-900">
                {/* Sidebar */}
                <aside className={`
                    fixed inset-y-0 left-0 z-40
                    w-72 bg-white/80 dark:bg-velvet-orchid-950/80 backdrop-blur-xl
                    border-r border-velvet-orchid-100 dark:border-velvet-orchid-800
                    shadow-2xl shadow-velvet-orchid-500/5
                    transform transition-transform duration-300 ease-in-out
                    ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                    lg:translate-x-0
                    flex flex-col h-screen
                `}>
                    {/* User Info Area */}
                    <div className="p-6 border-b border-velvet-orchid-100 dark:border-velvet-orchid-800">
                        <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-full bg-linear-to-br from-velvet-orchid-400 to-velvet-orchid-600 flex items-center justify-center text-white font-bold text-xl shadow-md shrink-0">
                                {userInitial}
                            </div>
                            <div className="min-w-0 flex-1">
                                <h2 className="text-xl font-black tracking-tighter text-velvet-orchid-950 dark:text-white truncate">
                                    Bienvenido
                                </h2>
                                <p className="text-xs text-velvet-orchid-500/50 dark:text-velvet-orchid-200 truncate">
                                    {userEmail || 'usuario@euphoria.com'}
                                </p>

                                <button
                                    onClick={async () => {
                                        const result = await Swal.fire({
                                            title: 'Cerrar sesión',
                                            text: '¿Estás seguro?',
                                            icon: 'warning',
                                            showCancelButton: true,
                                            confirmButtonColor: '#dc2626',
                                            cancelButtonColor: '#6c2871',
                                            confirmButtonText: 'Salir',
                                            cancelButtonText: 'Cancelar',
                                            background: '#1f2937',
                                            color: '#ffffff',
                                            customClass: { popup: 'rounded-2xl' }
                                        });

                                        if (result.isConfirmed) {
                                            await supabase.auth.signOut();
                                            router.push('/admin/login');
                                        }
                                    }}
                                    className="mt-2 text-xs text-red-400 hover:text-red-700 hover:cursor-pointer flex items-center gap-1 transition-colors"
                                >
                                    <LogOut size={14} />
                                    <span>Cerrar sesión</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
                        {/* Dashboard - visible para todos */}
                        <Link
                            href="/admin/dashboard"
                            onClick={() => setIsMenuOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative ${pathname === "/admin/dashboard"
                                ? 'bg-linear-to-r from-velvet-orchid-500 to-velvet-orchid-600 text-white shadow-lg shadow-velvet-orchid-500/30'
                                : 'text-velvet-orchid-700 dark:text-velvet-orchid-300 hover:bg-velvet-orchid-100 dark:hover:bg-velvet-orchid-800/50'
                                }`}
                        >
                            <LayoutDashboard size={20} />
                            <span className="font-medium text-sm">Dashboard</span>
                            {pathname === "/admin/dashboard" && (
                                <ChevronRight size={16} className="absolute right-4 text-white/70" />
                            )}
                        </Link>

                        {/* Hostess - visible solo para admin y superadmin */}
                        {(isAdmin || isSuperAdmin) && (
                            <Link
                                href="/admin/hostess"
                                onClick={() => setIsMenuOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative ${pathname.startsWith('/admin/hostess')
                                    ? 'bg-linear-to-r from-velvet-orchid-500 to-velvet-orchid-600 text-white shadow-lg shadow-velvet-orchid-500/30'
                                    : 'text-velvet-orchid-700 dark:text-velvet-orchid-300 hover:bg-velvet-orchid-100 dark:hover:bg-velvet-orchid-800/50'
                                    }`}
                            >
                                <Users size={20} />
                                <span className="font-medium text-sm">Hostess</span>
                                {pathname.startsWith('/admin/hostess') && (
                                    <ChevronRight size={16} className="absolute right-4 text-white/70" />
                                )}
                            </Link>
                        )}

                        {/* Servicios - visible solo para admin y superadmin */}
                        {(isAdmin || isSuperAdmin) && (
                            <Link
                                href="/admin/servicios"
                                onClick={() => setIsMenuOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative ${pathname.startsWith('/admin/servicios')
                                    ? 'bg-linear-to-r from-velvet-orchid-500 to-velvet-orchid-600 text-white shadow-lg shadow-velvet-orchid-500/30'
                                    : 'text-velvet-orchid-700 dark:text-velvet-orchid-300 hover:bg-velvet-orchid-100 dark:hover:bg-velvet-orchid-800/50'
                                    }`}
                            >
                                <Sparkles size={20} />
                                <span className="font-medium text-sm">Servicios</span>
                                {pathname.startsWith('/admin/servicios') && (
                                    <ChevronRight size={16} className="absolute right-4 text-white/70" />
                                )}
                            </Link>
                        )}

                        {/* Habilidades - visible solo para admin y superadmin */}
                        {(isAdmin || isSuperAdmin) && (
                            <Link
                                href="/admin/skills"
                                onClick={() => setIsMenuOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative ${pathname.startsWith('/admin/skills')
                                    ? 'bg-linear-to-r from-velvet-orchid-500 to-velvet-orchid-600 text-white shadow-lg shadow-velvet-orchid-500/30'
                                    : 'text-velvet-orchid-700 dark:text-velvet-orchid-300 hover:bg-velvet-orchid-100 dark:hover:bg-velvet-orchid-800/50'
                                    }`}
                            >
                                <Sparkles size={20} />
                                <span className="font-medium text-sm">Habilidades</span>
                                {pathname.startsWith('/admin/skills') && (
                                    <ChevronRight size={16} className="absolute right-4 text-white/70" />
                                )}
                            </Link>
                        )}

                        {/* Outfits - visible solo para admin y superadmin */}
                        {(isAdmin || isSuperAdmin) && (
                            <Link
                                href="/admin/outfits"
                                onClick={() => setIsMenuOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative ${pathname.startsWith('/admin/outfits')
                                    ? 'bg-linear-to-r from-velvet-orchid-500 to-velvet-orchid-600 text-white shadow-lg shadow-velvet-orchid-500/30'
                                    : 'text-velvet-orchid-700 dark:text-velvet-orchid-300 hover:bg-velvet-orchid-100 dark:hover:bg-velvet-orchid-800/50'
                                    }`}
                            >
                                <Sparkles size={20} />
                                <span className="font-medium text-sm">Outfits</span>
                                {pathname.startsWith('/admin/outfits') && (
                                    <ChevronRight size={16} className="absolute right-4 text-white/70" />
                                )}
                            </Link>
                        )}

                        {/* Configuración - solo para superadmin */}
                        {isSuperAdmin && (
                            <div className="space-y-1">
                                <button
                                    onClick={() => toggleSubmenu(configItems.label)}
                                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all group relative ${pathname.startsWith('/admin/settings') || openSubmenu === configItems.label
                                        ? 'bg-linear-to-r from-velvet-orchid-500 to-velvet-orchid-600 text-white shadow-lg shadow-velvet-orchid-500/30'
                                        : 'text-velvet-orchid-700 dark:text-velvet-orchid-300 hover:bg-velvet-orchid-100 dark:hover:bg-velvet-orchid-800/50'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Settings size={20} className={`shrink-0 ${pathname.startsWith('/admin/settings') || openSubmenu === configItems.label ? 'text-white' : ''}`} />
                                        <span className="font-medium text-sm">{configItems.label}</span>
                                    </div>
                                    <ChevronDown
                                        size={16}
                                        className={`transition-transform duration-200 ${openSubmenu === configItems.label ? 'rotate-180' : ''}`}
                                    />
                                </button>

                                <AnimatePresence>
                                    {openSubmenu === configItems.label && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="pl-9 space-y-1">
                                                {configItems.submenu.map((sub) => {
                                                    const isActive = pathname === sub.href;
                                                    return (
                                                        <Link
                                                            key={sub.href}
                                                            href={sub.href}
                                                            onClick={() => setIsMenuOpen(false)}
                                                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm ${isActive
                                                                ? 'bg-velvet-orchid-500/10 text-velvet-orchid-600 dark:text-velvet-orchid-400'
                                                                : 'text-velvet-orchid-600/70 dark:text-velvet-orchid-400/70 hover:bg-velvet-orchid-100 dark:hover:bg-velvet-orchid-800/50'
                                                                }`}
                                                        >
                                                            <sub.icon size={16} />
                                                            <span>{sub.label}</span>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </nav>



                </aside>

                {/* Overlay para móvil/tablet */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMenuOpen(false)}
                            className="fixed inset-0 z-30 bg-velvet-orchid-950/60 backdrop-blur-sm lg:hidden"
                        />
                    )}
                </AnimatePresence>

                {/* Header móvil */}
                <div className="lg:hidden fixed top-0 left-0 right-0 z-20 bg-white/80 dark:bg-velvet-orchid-950/80 backdrop-blur-xl border-b border-velvet-orchid-100 dark:border-velvet-orchid-800 px-4 py-3">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 hover:bg-velvet-orchid-100 dark:hover:bg-velvet-orchid-800 rounded-lg transition-colors"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                        <span className="font-black text-velvet-orchid-950 dark:text-white">Euphoria</span>
                        <div className="w-8 h-8 rounded-full bg-linear-to-br from-velvet-orchid-400 to-velvet-orchid-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                            {userInitial}
                        </div>
                    </div>
                </div>

                {/* Contenido principal */}
                <div className="flex-1 lg:ml-72">
                    {/* Main Content */}
                    <main className="p-4 md:p-8 pt-20 lg:pt-8">
                        {children}
                    </main>
                </div>
            </div>
        </>
    );
}