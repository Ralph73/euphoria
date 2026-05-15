'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, DollarSign, Package, AlertTriangle, Loader2 } from 'lucide-react';
import { fetchServices, deleteService, type Service } from '@/lib/actions';
import CreateServiceModal from './components/CreateServiceModal';
import EditServiceModal from './components/EditServiceModal';
import Swal from 'sweetalert2';

export default function ServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        setLoading(true);
        try {
            const data = await fetchServices();
            setServices(data);
        } catch (error) {
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al cargar los servicios',
                background: '#1f2937',
                color: '#ffffff',
                customClass: { popup: 'rounded-2xl' }
            });
        }
        setLoading(false);
    };

    const confirmDelete = (service: Service) => {
        Swal.fire({
            title: '¿Eliminar servicio?',
            text: `Estás borrando "${service.name}". Esta acción no se puede deshacer.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6c2871',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            background: '#1f2937',
            color: '#ffffff',
            customClass: { popup: 'rounded-2xl' }
        }).then(async (result) => {
            if (result.isConfirmed) {
                setServiceToDelete(service);
                setIsDeleting(true);
                const deleteResult = await deleteService(service.id);
                if (deleteResult.success) {
                    await Swal.fire({
                        icon: 'success',
                        title: 'Eliminado',
                        text: 'Servicio eliminado correctamente',
                        timer: 2000,
                        showConfirmButton: false,
                        background: '#1f2937',
                        color: '#ffffff',
                        customClass: { popup: 'rounded-2xl' }
                    });
                    await loadServices();
                } else {
                    await Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: deleteResult.error || 'Error al eliminar',
                        background: '#1f2937',
                        color: '#ffffff',
                        customClass: { popup: 'rounded-2xl' }
                    });
                }
                setIsDeleting(false);
                setServiceToDelete(null);
            }
        });
    };

    const filteredServices = services.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const SkeletonCard = () => (
        <div className="bg-white dark:bg-velvet-orchid-900 rounded-2xl border border-velvet-orchid-100 dark:border-velvet-orchid-800 overflow-hidden shadow-sm animate-pulse">
            <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-velvet-orchid-200/50 dark:bg-velvet-orchid-800/50"></div>
                        <div className="space-y-2">
                            <div className="h-5 w-32 bg-velvet-orchid-200/50 dark:bg-velvet-orchid-800/50 rounded"></div>
                            <div className="h-4 w-20 bg-velvet-orchid-200/50 dark:bg-velvet-orchid-800/50 rounded"></div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <div className="w-8 h-8 bg-velvet-orchid-200/50 dark:bg-velvet-orchid-800/50 rounded"></div>
                        <div className="w-8 h-8 bg-velvet-orchid-200/50 dark:bg-velvet-orchid-800/50 rounded"></div>
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="h-4 w-full bg-velvet-orchid-200/50 dark:bg-velvet-orchid-800/50 rounded"></div>
                    <div className="h-4 w-3/4 bg-velvet-orchid-200/50 dark:bg-velvet-orchid-800/50 rounded"></div>
                </div>
                <div className="h-8 w-24 bg-velvet-orchid-200/50 dark:bg-velvet-orchid-800/50 rounded-full"></div>
            </div>
        </div>
    );

    return (
        <div className="w-full p-4 md:p-8 mx-auto space-y-6 md:space-y-8 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-velvet-orchid-950 dark:text-white">
                        Gestión de Servicios
                    </h1>
                    <p className="text-velvet-orchid-600/70 dark:text-velvet-orchid-300 text-xs md:text-sm">
                        Administra los servicios disponibles. {filteredServices.length} registros
                    </p>
                </div>

                <button
                    onClick={() => setShowCreateModal(true)}
                    className="w-full md:w-auto bg-velvet-orchid-600 hover:bg-velvet-orchid-700 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-velvet-orchid-200 active:scale-95"
                >
                    <Plus size={18} /> Nuevo Servicio
                </button>
            </div>

            {/* Buscador */}
            <div className="relative w-full md:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-velvet-orchid-400" size={18} />
                <input
                    type="text"
                    placeholder="Buscar por nombre o descripción..."
                    className="w-full pl-10 pr-10 py-3 bg-white dark:bg-velvet-orchid-900 border border-velvet-orchid-100 dark:border-velvet-orchid-800 rounded-xl outline-none focus:ring-2 focus:ring-velvet-orchid-400"
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

            {/* Grid de Servicios */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>
            ) : filteredServices.length === 0 ? (
                <div className="bg-white dark:bg-velvet-orchid-900 rounded-2xl border border-velvet-orchid-100 dark:border-velvet-orchid-800 p-12 text-center">
                    <div className="w-20 h-20 mx-auto bg-velvet-orchid-100 dark:bg-velvet-orchid-800 rounded-full flex items-center justify-center mb-4">
                        <Package size={32} className="text-velvet-orchid-400" />
                    </div>
                    <p className="text-velvet-orchid-950 dark:text-white font-bold text-lg mb-2">
                        {searchTerm ? 'No se encontraron resultados' : 'No hay servicios creados'}
                    </p>
                    <p className="text-velvet-orchid-500 dark:text-velvet-orchid-400 text-sm mb-6">
                        {searchTerm
                            ? 'Intenta con otro término de búsqueda'
                            : 'Comienza creando tu primer servicio'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredServices.map((service) => (
                        <div
                            key={service.id}
                            className="group bg-white dark:bg-velvet-orchid-900 rounded-2xl border border-velvet-orchid-100 dark:border-velvet-orchid-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className="p-6">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-velvet-orchid-100 dark:bg-velvet-orchid-800 flex items-center justify-center">
                                            <Package size={24} className="text-velvet-orchid-500" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-velvet-orchid-950 dark:text-white">
                                                {service.name}
                                            </h3>
                                            <div className="flex items-center gap-1 mt-0.5">
                                                <DollarSign size={14} className="text-green-500" />
                                                <span className="text-sm font-bold text-green-600 dark:text-green-400">
                                                    {typeof service.price === 'number' ? service.price.toFixed(2) : service.price}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => {
                                                setSelectedService(service);
                                                setShowEditModal(true);
                                            }}
                                            className="p-2 text-velvet-orchid-600 hover:text-velvet-orchid-700 hover:bg-velvet-orchid-50 dark:hover:bg-velvet-orchid-800 rounded-lg transition-all"
                                            title="Editar"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => confirmDelete(service)}
                                            className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all"
                                            title="Eliminar"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Descripción */}
                                {service.description ? (
                                    <p className="text-sm text-velvet-orchid-600 dark:text-velvet-orchid-400 line-clamp-3 mb-3">
                                        {service.description}
                                    </p>
                                ) : (
                                    <p className="text-sm text-velvet-orchid-400 dark:text-velvet-orchid-500 italic mb-3">
                                        Sin descripción
                                    </p>
                                )}

                                {/* Estado */}
                                <div className="flex items-center justify-between mt-2">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${service.status
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                        }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${service.status ? 'bg-green-500' : 'bg-red-500'}`} />
                                        {service.status ? 'Activo' : 'Inactivo'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modales */}
            <CreateServiceModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={loadServices}
            />

            <EditServiceModal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedService(null);
                }}
                onSuccess={loadServices}
                service={selectedService}
            />
        </div>
    );
}