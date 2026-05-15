"use client";

import { useState } from "react";
import {
    Plus, Edit, Trash2, Search,
    AlertTriangle, Loader2, User, Image as ImageIcon,
    Clock, Heart
} from "lucide-react";
import CreateHostModal from "@/components/CreateHostModal";
import EditHostModal from "@/components/EditHostModal";
import { useHosts } from "@/hooks/useHosts";

export default function HostsManagementPage() {
    const {
        filteredHosts,
        loading,
        searchTerm,
        setSearchTerm,
        deleteHost,
        refreshHosts,
    } = useHosts();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [hostToAction, setHostToAction] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const handleDelete = async () => {
        if (!hostToAction) return;
        setIsDeleting(true);

        const result = await deleteHost(hostToAction);

        if (result.success) {
            setShowDeleteModal(false);
            setHostToAction(null);
        }
        setIsDeleting(false);
    };

    // Componente para mostrar las imágenes en círculos apilados
    const MediaStack = ({ media }: { media: any[] }) => {
        if (!media || media.length === 0) return null;

        const images = media.filter((m: any) => m.type === 'image').slice(0, 4);
        const remainingCount = media.length - images.length;

        return (
            <div className="flex items-center -space-x-3 rtl:space-x-reverse">
                {images.map((img, idx) => (
                    <div
                        key={idx}
                        className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white dark:border-velvet-orchid-800 shadow-md hover:z-10 transition-all hover:scale-110"
                        style={{ zIndex: images.length - idx }}
                    >
                        <img
                            src={img.url}
                            alt=""
                            className="w-full h-full object-cover"
                        />
                    </div>
                ))}
                {remainingCount > 0 && (
                    <div className="relative w-10 h-10 rounded-full bg-velvet-orchid-500 border-2 border-white dark:border-velvet-orchid-800 shadow-md flex items-center justify-center text-white text-xs font-bold hover:z-10 transition-all hover:scale-110"
                        style={{ zIndex: 1 }}>
                        +{remainingCount}
                    </div>
                )}
            </div>
        );
    };

    // Skeleton para carga
    const SkeletonRow = () => (
        <div className="border-b border-velvet-orchid-100 dark:border-velvet-orchid-800 last:border-0 p-4 animate-pulse">
            <div className="grid grid-cols-12 gap-2 md:gap-4 items-center">
                <div className="col-span-3 md:col-span-2 flex items-center gap-2 md:gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-velvet-orchid-200/50 dark:bg-velvet-orchid-800/50"></div>
                    <div className="h-4 w-16 md:h-5 md:w-24 bg-velvet-orchid-200/50 dark:bg-velvet-orchid-800/50 rounded"></div>
                </div>
                <div className="col-span-3 md:col-span-3">
                    <div className="h-3 w-16 md:h-4 md:w-20 bg-velvet-orchid-200/50 dark:bg-velvet-orchid-800/50 rounded mb-1"></div>
                    <div className="h-3 w-12 md:h-4 md:w-16 bg-velvet-orchid-200/50 dark:bg-velvet-orchid-800/50 rounded"></div>
                </div>
                <div className="col-span-2 md:col-span-2">
                    <div className="flex gap-1">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-velvet-orchid-200/50 dark:bg-velvet-orchid-800/50"></div>
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-velvet-orchid-200/50 dark:bg-velvet-orchid-800/50"></div>
                    </div>
                </div>
                <div className="col-span-2 md:col-span-2">
                    <div className="h-5 w-12 md:h-6 md:w-16 bg-velvet-orchid-200/50 dark:bg-velvet-orchid-800/50 rounded-full"></div>
                </div>
                <div className="hidden lg:block col-span-1">
                    <div className="h-4 w-8 bg-velvet-orchid-200/50 dark:bg-velvet-orchid-800/50 rounded"></div>
                </div>
                <div className="col-span-2 flex justify-end gap-1 md:gap-2">
                    <div className="w-7 h-7 md:w-8 md:h-8 bg-velvet-orchid-200/50 dark:bg-velvet-orchid-800/50 rounded"></div>
                    <div className="w-7 h-7 md:w-8 md:h-8 bg-velvet-orchid-200/50 dark:bg-velvet-orchid-800/50 rounded"></div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="w-full p-3 md:p-8 mx-auto space-y-4 md:space-y-8 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4">
                <div>
                    <h1 className="text-xl md:text-3xl font-bold text-velvet-orchid-950 dark:text-white">
                        Gestión de Hostess
                    </h1>
                    <p className="text-velvet-orchid-600/70 dark:text-velvet-orchid-300 text-xs md:text-sm">
                        Administra el catálogo de perfiles. {filteredHosts.length} registros
                    </p>
                </div>

                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="w-full md:w-auto bg-velvet-orchid-600 hover:bg-velvet-orchid-700 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-velvet-orchid-200 active:scale-95 text-sm md:text-base"
                >
                    <Plus size={18} /> Nueva Hostess
                </button>
            </div>

            {/* Buscador */}
            <div className="relative w-full md:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-velvet-orchid-400" size={16} />
                <input
                    type="text"
                    placeholder="Buscar por nombre..."
                    className="w-full pl-9 pr-9 py-2.5 md:pl-10 md:pr-10 md:py-3 bg-white dark:bg-velvet-orchid-900 border border-velvet-orchid-100 dark:border-velvet-orchid-800 rounded-xl outline-none focus:ring-2 focus:ring-velvet-orchid-400 text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                    <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-velvet-orchid-400 hover:text-velvet-orchid-600"
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Tabla estilo proyectos */}
            <div className="bg-white dark:bg-velvet-orchid-950 rounded-xl md:rounded-2xl border border-velvet-orchid-100 dark:border-velvet-orchid-800 overflow-hidden shadow-sm">
                {/* Encabezado de tabla - visible en desktop */}
                <div className="hidden md:grid grid-cols-12 gap-2 lg:gap-4 px-4 lg:px-6 py-3 lg:py-4 bg-velvet-orchid-50/50 dark:bg-velvet-orchid-900/50 border-b border-velvet-orchid-100 dark:border-velvet-orchid-800 text-xs font-bold uppercase text-velvet-orchid-400">
                    <div className="col-span-3 lg:col-span-2">Hostess</div>
                    <div className="col-span-3 lg:col-span-3">Horario</div>
                    <div className="col-span-2 lg:col-span-2">Galería</div>
                    <div className="col-span-2 lg:col-span-2">Estado</div>
                    {/* Aceptación visible solo en lg y superiores */}
                    <div className="hidden lg:block lg:col-span-1">Aceptación</div>
                    <div className="col-span-2 lg:col-span-2 text-right">Acciones</div>
                </div>

                {/* Lista de hostess */}
                {loading ? (
                    <div>
                        {Array.from({ length: 3 }).map((_, i) => (
                            <SkeletonRow key={i} />
                        ))}
                    </div>
                ) : filteredHosts.length === 0 ? (
                    <div className="p-8 md:p-12 text-center">
                        <div className="w-14 h-14 md:w-16 md:h-16 mx-auto bg-velvet-orchid-100 dark:bg-velvet-orchid-800 rounded-full flex items-center justify-center mb-3 md:mb-4">
                            <User size={20} className="text-velvet-orchid-400" />
                        </div>
                        <p className="text-velvet-orchid-950 dark:text-white font-bold text-base md:text-lg mb-1 md:mb-2">
                            {searchTerm ? 'No se encontraron resultados' : 'No hay hostess registradas'}
                        </p>
                        <p className="text-velvet-orchid-500 dark:text-velvet-orchid-400 text-xs md:text-sm mb-4 md:mb-6">
                            {searchTerm
                                ? 'Intenta con otro término de búsqueda'
                                : 'Comienza registrando tu primera hostess'}
                        </p>
                    </div>
                ) : (
                    <div>
                        {filteredHosts.map((host) => {
                            const coverImage = host.host_media?.find((m: any) => m.is_cover)?.url;
                            const imageCount = host.host_media?.filter((m: any) => m.type === 'image').length || 0;
                            const videoCount = host.host_media?.filter((m: any) => m.type === 'video').length || 0;
                            const totalMedia = imageCount + videoCount;

                            return (
                                <div
                                    key={host.id}
                                    className="border-b border-velvet-orchid-100 dark:border-velvet-orchid-800 last:border-0 hover:bg-velvet-orchid-50/30 dark:hover:bg-velvet-orchid-900/30 transition-colors"
                                >
                                    {/* Versión Desktop/Tablet */}
                                    <div className="hidden md:grid grid-cols-12 gap-2 lg:gap-4 px-4 lg:px-6 py-3 lg:py-4 items-center">
                                        {/* Hostess */}
                                        <div className="col-span-3 lg:col-span-2">
                                            <div className="flex items-center gap-2 lg:gap-4">
                                                <div className="w-10 h-10 lg:w-14 lg:h-14 rounded-full overflow-hidden bg-velvet-orchid-100 border-2 border-white dark:border-velvet-orchid-800 shadow-md shrink-0">
                                                    {coverImage ? (
                                                        <img
                                                            src={coverImage}
                                                            className="w-full h-full object-cover"
                                                            alt={host.nickname}
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-velvet-orchid-400">
                                                            <User size={16} />
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="font-bold text-velvet-orchid-950 dark:text-white text-sm lg:text-lg">
                                                    {host.nickname}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Horario */}
                                        <div className="col-span-3 lg:col-span-3">
                                            <div className="flex items-center gap-1 lg:gap-2">
                                                <Clock size={14} className="text-velvet-orchid-400 shrink-0" />
                                                <span className="text-xs lg:text-sm text-velvet-orchid-700 dark:text-velvet-orchid-300 truncate">
                                                    {host.schedule || "No especificado"}
                                                </span>
                                            </div>
                                            <p className="text-[8px] lg:text-[10px] text-velvet-orchid-500 mt-0.5 lg:mt-1">
                                                {new Date(host.created_at).toLocaleDateString('es-MX', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </div>

                                        {/* Galería */}
                                        <div className="col-span-2 lg:col-span-2">
                                            {host.host_media && host.host_media.length > 0 ? (
                                                <div>
                                                    <MediaStack media={host.host_media} />
                                                    {totalMedia > 0 && (
                                                        <p className="text-[8px] lg:text-[10px] text-velvet-orchid-500 mt-1">
                                                            {imageCount} 📸 · {videoCount} 🎬
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-xs lg:text-sm text-velvet-orchid-400 italic">Sin imágenes</p>
                                            )}
                                        </div>

                                        {/* Estado */}
                                        <div className="col-span-2 lg:col-span-2">
                                            <span className={`inline-block px-2 lg:px-3 py-1 lg:py-1.5 rounded-full text-[8px] lg:text-xs font-bold uppercase ${host.status === 'activo'
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : host.status === 'pendiente'
                                                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                }`}>
                                                {host.status}
                                            </span>
                                        </div>

                                        {/* Aceptación - Visible solo en lg */}
                                        <div className="hidden lg:block lg:col-span-1">
                                            {host.likes ? (
                                                <p className="text-xs text-velvet-orchid-500 flex items-center gap-1">
                                                    <Heart size={12} className="fill-pink-400 text-pink-400" /> {host.likes}
                                                </p>
                                            ) : (
                                                <p className="text-xs text-velvet-orchid-400">—</p>
                                            )}
                                        </div>

                                        {/* Acciones */}
                                        <div className="col-span-2 lg:col-span-2 flex justify-end gap-1 lg:gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedId(host.id);
                                                    setIsEditModalOpen(true);
                                                }}
                                                className="p-1.5 lg:p-2.5 text-velvet-orchid-600 hover:text-velvet-orchid-700 hover:bg-velvet-orchid-50 dark:hover:bg-velvet-orchid-800 rounded-lg lg:rounded-xl transition-all"
                                                title="Editar"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setHostToAction(host);
                                                    setShowDeleteModal(true);
                                                }}
                                                className="p-1.5 lg:p-2.5 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg lg:rounded-xl transition-all"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Versión Móvil (sin cambios) */}
                                    <div className="block md:hidden p-3">
                                        {/* ... código móvil existente ... */}
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="w-12 h-12 rounded-full overflow-hidden bg-velvet-orchid-100 border-2 border-white dark:border-velvet-orchid-800 shadow-md shrink-0">
                                                {coverImage ? (
                                                    <img src={coverImage} className="w-full h-full object-cover" alt="" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-velvet-orchid-400">
                                                        <User size={20} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="font-bold text-velvet-orchid-950 dark:text-white">
                                                        {host.nickname}
                                                    </h3>
                                                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase ${host.status === 'activo'
                                                        ? 'bg-green-100 text-green-700'
                                                        : host.status === 'pendiente'
                                                            ? 'bg-yellow-100 text-yellow-700'
                                                            : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {host.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Clock size={12} className="text-velvet-orchid-400" />
                                                    <span className="text-xs text-velvet-orchid-600 dark:text-velvet-orchid-400">
                                                        {host.schedule || "No especificado"}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-velvet-orchid-500 mt-1">
                                                    {new Date(host.created_at).toLocaleDateString()}
                                                </p>
                                                <div className="flex items-center justify-between mt-3">
                                                    {host.host_media && host.host_media.length > 0 ? (
                                                        <MediaStack media={host.host_media} />
                                                    ) : (
                                                        <p className="text-xs text-velvet-orchid-400 italic">Sin imágenes</p>
                                                    )}
                                                    {host.likes ? (
                                                        <span className="text-xs flex items-center gap-1 text-velvet-orchid-500">
                                                            <Heart size={14} className="fill-pink-400 text-pink-400" /> {host.likes}
                                                        </span>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-2 mt-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedId(host.id);
                                                    setIsEditModalOpen(true);
                                                }}
                                                className="p-2 bg-velvet-orchid-100 dark:bg-velvet-orchid-800 rounded-lg"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setHostToAction(host);
                                                    setShowDeleteModal(true);
                                                }}
                                                className="p-2 bg-red-100 dark:bg-red-950/30 rounded-lg"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* MODALES (sin cambios) */}
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

            {/* MODAL DE CONFIRMACIÓN DE BORRADO */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-velvet-orchid-950/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-velvet-orchid-900 w-full max-w-md rounded-2xl p-6 md:p-8 shadow-2xl animate-in zoom-in duration-200">
                        <div className="flex items-center gap-3 text-red-600 mb-4">
                            <AlertTriangle size={24} />
                            <h3 className="text-lg md:text-xl font-bold">¿Confirmar eliminación?</h3>
                        </div>
                        <p className="text-sm md:text-base text-velvet-orchid-600 dark:text-velvet-orchid-300 mb-6 md:mb-8">
                            Estás borrando a <span className="font-bold underline text-velvet-orchid-950 dark:text-white">
                                {hostToAction?.nickname}
                            </span>.
                            Se eliminarán todos sus archivos multimedia permanentemente.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                disabled={isDeleting}
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setHostToAction(null);
                                }}
                                className="w-full sm:flex-1 py-3 font-semibold text-velvet-orchid-600 hover:bg-velvet-orchid-50 dark:hover:bg-velvet-orchid-800 rounded-xl transition-all disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                disabled={isDeleting}
                                onClick={handleDelete}
                                className="w-full sm:flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-200 dark:shadow-red-900/30 disabled:opacity-50"
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