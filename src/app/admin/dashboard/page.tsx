// app/admin/dashboard/page.tsx
import { supabase } from '@/lib/supabase';
import {
    Sparkles, Eye, Users, Award, Plus, ArrowUpRight,
    Calendar, TrendingUp, ChevronRight,
    Heart
} from "lucide-react";
import Link from "next/link";
import { fetchHostess, getAuthenticatedUser, type Host } from "@/lib/actions";
import ActiveServicesCard from "@/app/admin/dashboard/components/ActiveServicesCard";

export default async function DashboardPage() {
    // 1. Verificar autenticación (redirige automáticamente si no hay sesión)
    const { user } = await getAuthenticatedUser();

    // 2. Cargar datos directamente (sin useEffect)
    let stats = {
        totalViews: 1240,
        recentHosts: [] as Host[],
        activeCount: 0,
        totalHosts: 0
    };

    try {
        const hosts = await fetchHostess();
        const activeCount = hosts.filter(h => h.status === 'activo' || h.status === true).length;

        stats = {
            totalViews: 1240, // Esto vendra de otra tabla en el futuro
            recentHosts: hosts.slice(0, 5),
            activeCount,
            totalHosts: hosts.length
        };
    } catch (error) {
        console.error("Error cargando dashboard:", error);
    }

    return (
        <div className="space-y-6 md:space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-velvet-orchid-950 dark:text-white">
                        Dashboard
                    </h1>
                    <p className="text-xs md:text-sm text-velvet-orchid-500/70 dark:text-velvet-orchid-400/70 font-medium">
                        {new Date().toLocaleDateString('es-MX', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                    <p className="text-xs text-velvet-orchid-400/50 mt-1">
                        Bienvenido, {user?.email || 'Administrador'}
                    </p>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {/* Total Hostess */}
                <div className="bg-linear-to-br from-velvet-orchid-50 to-white dark:from-velvet-orchid-900/50 dark:to-velvet-orchid-950 p-6 rounded-2xl border border-velvet-orchid-100 dark:border-velvet-orchid-800 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-velvet-orchid-500/70 dark:text-velvet-orchid-400/70 mb-1">
                                Total Hostess
                            </p>
                            <p className="text-3xl md:text-4xl font-black text-velvet-orchid-950 dark:text-white">
                                {stats.totalHosts}
                            </p>
                        </div>
                        <div className="p-3 bg-white dark:bg-velvet-orchid-900 rounded-xl shadow-sm border border-velvet-orchid-100 dark:border-velvet-orchid-700">
                            <Users className="text-velvet-orchid-600" size={24} />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs text-velvet-orchid-500/70">
                        <TrendingUp size={14} />
                        <span>+12% este mes</span>
                    </div>
                </div>

                {/* Hostess Activas */}
                <div className="bg-linear-to-br from-green-50 to-white dark:from-green-950/30 dark:to-velvet-orchid-950 p-6 rounded-2xl border border-green-100 dark:border-green-900/30 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-green-600/70 dark:text-green-400/70 mb-1">
                                Activas
                            </p>
                            <p className="text-3xl md:text-4xl font-black text-velvet-orchid-950 dark:text-white">
                                {stats.activeCount}
                            </p>
                        </div>
                        <div className="p-3 bg-white dark:bg-velvet-orchid-900 rounded-xl shadow-sm border border-green-100 dark:border-green-900/30">
                            <Award className="text-green-600" size={24} />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs text-green-600/70">
                        <Calendar size={14} />
                        <span>{((stats.activeCount / (stats.totalHosts || 1)) * 100).toFixed(0)}% del total</span>
                    </div>
                </div>

                {/* Servicios Activos (desde componente) */}
                <ActiveServicesCard />

                {/* Visitas Totales */}
                <div className="bg-linear-to-br from-amber-50 to-white dark:from-amber-950/30 dark:to-velvet-orchid-950 p-6 rounded-2xl border border-amber-100 dark:border-amber-900/30 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-amber-600/70 dark:text-amber-400/70 mb-1">
                                Visitas
                            </p>
                            <p className="text-3xl md:text-4xl font-black text-velvet-orchid-950 dark:text-white">
                                {stats.totalViews.toLocaleString()}
                            </p>
                        </div>
                        <div className="p-3 bg-white dark:bg-velvet-orchid-900 rounded-xl shadow-sm border border-amber-100 dark:border-amber-900/30">
                            <Eye className="text-amber-600" size={24} />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs text-amber-600/70">
                        <ArrowUpRight size={14} />
                        <span>+8% vs ayer</span>
                    </div>
                </div>
            </div>

            {/* Sección de Actividad Reciente */}
            <div className="bg-white dark:bg-velvet-orchid-950 rounded-2xl border border-velvet-orchid-100 dark:border-velvet-orchid-800 overflow-hidden">
                <div className="p-6 border-b border-velvet-orchid-100 dark:border-velvet-orchid-800">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-velvet-orchid-950 dark:text-white flex items-center gap-2">
                            <ArrowUpRight size={20} className="text-velvet-orchid-500" />
                            Últimas Hostess Registradas
                        </h2>
                        <Link
                            href="/admin/hostess"
                            className="text-sm font-medium text-velvet-orchid-600 hover:text-velvet-orchid-700 dark:text-velvet-orchid-400 dark:hover:text-velvet-orchid-300 flex items-center gap-1"
                        >
                            Ver todas <ChevronRight size={16} />
                        </Link>
                    </div>
                </div>

                <div className="divide-y divide-velvet-orchid-100 dark:divide-velvet-orchid-800">
                    {stats.recentHosts.length > 0 ? (
                        stats.recentHosts.map((host, index) => {
                            const coverUrl = host.host_media?.find((m: any) => m.is_cover)?.url;

                            return (
                                <div key={host.id || index} className="p-4 hover:bg-velvet-orchid-50/50 dark:hover:bg-velvet-orchid-900/30 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            {/* Avatar con imagen o inicial */}
                                            <div className="relative shrink-0">
                                                <div className="w-12 h-12 rounded-full bg-linear-to-br from-velvet-orchid-400 to-velvet-orchid-600 overflow-hidden flex items-center justify-center font-bold text-white shadow-md">
                                                    {coverUrl ? (
                                                        <img
                                                            src={coverUrl}
                                                            alt={host.nickname}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        host.nickname?.[0]?.toUpperCase() || 'H'
                                                    )}
                                                </div>

                                                {/* Badge "NUEVA" FUERA del círculo */}
                                                {host.is_new && (
                                                    <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-lg z-10 flex items-center gap-0.5">
                                                        <span className="text-[10px]">🔥</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-velvet-orchid-950 dark:text-white">
                                                        {host.nickname}
                                                    </p>
                                                    {(host.likes ?? 0) > 0 && (
                                                        <span className="flex items-center gap-1 text-pink-500 text-xs">
                                                            <Heart size={12} className="fill-pink-500" />
                                                            <span className="font-bold">{host.likes ?? 0}</span>
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <p className="text-xs text-velvet-orchid-500/70 dark:text-velvet-orchid-400/70">
                                                        {host.schedule || "Horario no especificado"}
                                                    </p>
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${host.status === 'activo' || host.status === true
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                        }`}>
                                                        {host.status === 'activo' || host.status === true ? 'Activa' : 'Inactiva'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-xs text-velvet-orchid-400/70">
                                                {new Date(host.created_at).toLocaleDateString()}
                                            </div>
                                            {/* Botones de acción */}
                                        </div>
                                    </div>
                                </div>
                            );

                        })
                    ) : (
                        <div className="p-12 text-center">
                            <p className="text-velvet-orchid-400/70 italic">No hay hostess registradas aún</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}