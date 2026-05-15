// app/admin/hostess/HostessClient.tsx
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
    Plus, Edit, Trash2, Search,
    AlertTriangle, Loader2, User, Image as ImageIcon
} from "lucide-react";
import CreateHostModal from "@/components/CreateHostModal";
import EditHostModal from "@/components/EditHostModal";

// Interfaces (deben coincidir con actions.ts)
interface HostMedia {
    url: string;
    is_cover: boolean;
}

interface Host {
    id: string;
    nickname: string;
    schedule: string;
    status: string | boolean;
    is_available: boolean;
    host_media: HostMedia[];
}

interface HostessClientProps {
    initialHosts: Host[];
}

export default function HostessClient({ initialHosts }: HostessClientProps) {
    const [hosts, setHosts] = useState<Host[]>(initialHosts);
    const [searchTerm, setSearchTerm] = useState("");

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [hostToAction, setHostToAction] = useState<Host | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const handleDelete = async () => {
        if (!hostToAction) return;
        setIsDeleting(true);

        try {
            const mediaToDelete = (hostToAction as any).host_media || [];

            if (mediaToDelete.length > 0) {
                const paths = mediaToDelete.map((m: any) => {
                    const urlParts = m.url.split('host-media/');
                    return urlParts.length > 1 ? urlParts[1] : null;
                }).filter(Boolean);

                if (paths.length > 0) {
                    await supabase.storage.from('host-media').remove(paths);
                }
            }

            const { error } = await supabase
                .from("hosts")
                .delete()
                .eq("id", hostToAction.id);

            if (error) throw error;

            setHosts(prev => prev.filter(h => h.id !== hostToAction.id));
            setShowDeleteModal(false);
        } catch (err: any) {
            alert("Error al eliminar: " + err.message);
        } finally {
            setIsDeleting(false);
            setHostToAction(null);
        }
    };

    const refreshHosts = async () => {
        try {
            const { fetchHostess } = await import('@/lib/actions');
            const newHosts = await fetchHostess();
            setHosts(newHosts);
        } catch (error) {
            console.error("Error refrescando:", error);
        }
    };

    const filteredHosts = hosts.filter(h =>
        h.nickname.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="w-full p-4 md:p-8 mx-auto space-y-6 md:space-y-8 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-velvet-orchid-950 dark:text-white">Panel de Hostess</h1>
                    <p className="text-velvet-orchid-600/70 dark:text-velvet-orchid-300 text-xs md:text-sm">Gestiona el catálogo de perfiles y multimedia.</p>
                </div>

                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="w-full md:w-auto bg-velvet-orchid-600 hover:bg-velvet-orchid-700 text-white px-4 md:px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-velvet-orchid-200 active:scale-95"
                >
                    <Plus size={20} /> Registrar Hostess
                </button>
            </div>

            {/* Buscador */}
            <div className="relative w-full md:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                    type="text"
                    placeholder="Buscar por nombre..."
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-velvet-orchid-900 border border-velvet-orchid-100 dark:border-velvet-orchid-800 rounded-xl outline-none focus:ring-2 focus:ring-velvet-orchid-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Tabla */}
            <div className="bg-white dark:bg-velvet-orchid-950 rounded-2xl border border-velvet-orchid-100 dark:border-velvet-orchid-800 overflow-hidden shadow-sm">
                {/* Vista Desktop */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 dark:bg-velvet-orchid-900/50 border-b border-velvet-orchid-100 dark:border-velvet-orchid-800">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold uppercase text-velvet-orchid-300">Perfil</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase text-velvet-orchid-300">Estado</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase text-velvet-orchid-300">Multimedia</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase text-velvet-orchid-300 text-right">Opciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-velvet-orchid-800/50">
                            {filteredHosts.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                                        No se encontraron hostess
                                    </td>
                                </tr>
                            ) : (
                                filteredHosts.map((host) => {
                                    const cover = host.host_media?.find((m: any) => m.is_cover)?.url;
                                    return (
                                        <tr key={host.id} className="hover:bg-velvet-orchid-50/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 border-2 border-white dark:border-velvet-orchid-800 shadow-sm">
                                                        {cover ? (
                                                            <img src={cover} className="w-full h-full object-cover" alt="" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                                <User size={20} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="font-bold text-velvet-orchid-950 dark:text-white">{host.nickname}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${host.status === 'activo' || host.status === true
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-amber-100 text-amber-700'
                                                    }`}>
                                                    {host.status === 'activo' || host.status === true ? 'activo' : 'inactivo'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-velvet-orchid-50">
                                                <div className="flex items-center gap-1">
                                                    <ImageIcon size={18} />
                                                    <span>{host.host_media?.length || 0} archivos</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => { setSelectedId(host.id); setIsEditModalOpen(true); }}
                                                        className="p-3 text-velvet-orchid-50 hover:text-velvet-orchid-600 hover:bg-velvet-orchid-50 rounded-2xl transition-all"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => { setHostToAction(host); setShowDeleteModal(true); }}
                                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Vista Móvil */}
                <div className="block md:hidden">
                    {filteredHosts.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">
                            No se encontraron hostess
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-velvet-orchid-800">
                            {filteredHosts.map((host) => {
                                const cover = host.host_media?.find((m: any) => m.is_cover)?.url;
                                return (
                                    <div key={host.id} className="p-4 hover:bg-velvet-orchid-50/30 transition-colors">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 border-2 border-white dark:border-velvet-orchid-800 shadow-sm shrink-0">
                                                    {cover ? (
                                                        <img src={cover} className="w-full h-full object-cover" alt="" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                            <User size={20} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-velvet-orchid-950 dark:text-white truncate">
                                                        {host.nickname}
                                                    </h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase ${host.status === 'activo' || host.status === true
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-amber-100 text-amber-700'
                                                            }`}>
                                                            {host.status === 'activo' || host.status === true ? 'activo' : 'inactivo'}
                                                        </span>
                                                        <span className="text-xs text-velvet-orchid-50 flex items-center gap-1">
                                                            <ImageIcon size={14} />
                                                            {host.host_media?.length || 0}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-1 ml-2">
                                                <button
                                                    onClick={() => { setSelectedId(host.id); setIsEditModalOpen(true); }}
                                                    className="p-2.5 text-velvet-orchid-50 hover:text-velvet-orchid-600 hover:bg-velvet-orchid-50 rounded-xl transition-all"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => { setHostToAction(host); setShowDeleteModal(true); }}
                                                    className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Modales */}
            <CreateHostModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onRefresh={refreshHosts}
            />

            <EditHostModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                hostId={selectedId}
                onRefresh={refreshHosts}
            />

            {/* Modal de confirmación */}
            {showDeleteModal && hostToAction && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-velvet-orchid-950/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-velvet-orchid-900 w-full max-w-md rounded-2xl p-6 md:p-8 shadow-2xl">
                        <div className="flex items-center gap-3 text-red-600 mb-4">
                            <AlertTriangle size={24} />
                            <h3 className="text-lg md:text-xl font-bold">¿Confirmar eliminación?</h3>
                        </div>
                        <p className="text-sm md:text-base text-slate-600 dark:text-velvet-orchid-100 mb-6">
                            Estás borrando a <span className="font-bold underline">{hostToAction.nickname}</span>.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                disabled={isDeleting}
                                onClick={() => setShowDeleteModal(false)}
                                className="w-full sm:flex-1 py-3 font-semibold text-slate-500 hover:bg-slate-50 rounded-xl"
                            >
                                Cancelar
                            </button>
                            <button
                                disabled={isDeleting}
                                onClick={handleDelete}
                                className="w-full sm:flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center justify-center gap-2"
                            >
                                {isDeleting ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                                {isDeleting ? "Borrando..." : "Eliminar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}