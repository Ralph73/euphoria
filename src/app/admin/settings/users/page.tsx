'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, User, Shield, AlertTriangle, Loader2 } from 'lucide-react';
import { fetchUsers, updateUserRole, deleteUser, type UserProfile } from '@/lib/actions';
import EditUserModal from './components/EditUserModal';
import DeleteUserModal from './components/DeleteUserModal';
import { toast } from 'react-hot-toast';

export default function UsersPage() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);

    // Cargar usuarios
    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const data = await fetchUsers();
            setUsers(data);
        } catch (error) {
            toast.error('Error al cargar usuarios');
        }
        setLoading(false);
    };

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Función para obtener color según el rol
    const getRoleBadge = (role: string | null) => {
        if (!role) return { color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400', label: 'Sin rol' };

        switch (role) {
            case 'superadmin':
                return { color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', label: 'Super Admin' };
            case 'admin':
                return { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', label: 'Admin' };
            default:
                return { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', label: 'Usuario' };
        }
    };

    // Skeleton para carga
    const SkeletonCard = () => (
        <div className="bg-white dark:bg-velvet-orchid-900 rounded-2xl border border-velvet-orchid-100 dark:border-velvet-orchid-800 overflow-hidden shadow-sm animate-pulse">
            <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-velvet-orchid-200/50 dark:bg-velvet-orchid-800/50"></div>
                        <div className="space-y-2">
                            <div className="h-5 w-40 bg-velvet-orchid-200/50 dark:bg-velvet-orchid-800/50 rounded"></div>
                            <div className="h-4 w-24 bg-velvet-orchid-200/50 dark:bg-velvet-orchid-800/50 rounded"></div>
                        </div>
                    </div>
                    <div className="flex gap-1">
                        <div className="w-8 h-8 bg-velvet-orchid-200/50 dark:bg-velvet-orchid-800/50 rounded"></div>
                        <div className="w-8 h-8 bg-velvet-orchid-200/50 dark:bg-velvet-orchid-800/50 rounded"></div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="w-full p-4 md:p-8 mx-auto space-y-6 md:space-y-8 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-velvet-orchid-950 dark:text-white">
                        Gestión de Usuarios
                    </h1>
                    <p className="text-velvet-orchid-600/70 dark:text-velvet-orchid-300 text-xs md:text-sm">
                        Administra los roles y permisos. {filteredUsers.length} registros
                    </p>
                </div>
            </div>

            {/* Buscador */}
            <div className="relative w-full md:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-velvet-orchid-400" size={18} />
                <input
                    type="text"
                    placeholder="Buscar por email..."
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

            {/* Grid de usuarios */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>
            ) : filteredUsers.length === 0 ? (
                <div className="bg-white dark:bg-velvet-orchid-900 rounded-2xl border border-velvet-orchid-100 dark:border-velvet-orchid-800 p-12 text-center">
                    <div className="w-20 h-20 mx-auto bg-velvet-orchid-100 dark:bg-velvet-orchid-800 rounded-full flex items-center justify-center mb-4">
                        <User size={32} className="text-velvet-orchid-400" />
                    </div>
                    <p className="text-velvet-orchid-950 dark:text-white font-bold text-lg mb-2">
                        {searchTerm ? 'No se encontraron resultados' : 'No hay usuarios registrados'}
                    </p>
                    <p className="text-velvet-orchid-500 dark:text-velvet-orchid-400 text-sm mb-6">
                        {searchTerm
                            ? 'Intenta con otro término de búsqueda'
                            : 'Los usuarios aparecerán aquí cuando se registren'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredUsers.map((user) => {
                        const badge = getRoleBadge(user.role);
                        const isSuperAdmin = user.role === 'superadmin';

                        return (
                            <div
                                key={user.id}
                                className="group bg-white dark:bg-velvet-orchid-900 rounded-2xl border border-velvet-orchid-100 dark:border-velvet-orchid-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                            >
                                <div className="p-6">
                                    {/* Header de la tarjeta */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-linear-to-br from-velvet-orchid-400 to-velvet-orchid-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                                                {user.email[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-velvet-orchid-950 dark:text-white break-all">
                                                    {user.email}
                                                </h3>
                                                <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold ${badge.color}`}>
                                                    {badge.label}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Acciones */}
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setShowEditModal(true);
                                                }}
                                                disabled={isSuperAdmin}
                                                className={`p-2 rounded-lg transition-all ${isSuperAdmin
                                                        ? 'text-velvet-orchid-300 cursor-not-allowed'
                                                        : 'text-velvet-orchid-600 hover:text-velvet-orchid-700 hover:bg-velvet-orchid-50 dark:hover:bg-velvet-orchid-800'
                                                    }`}
                                                title={isSuperAdmin ? 'No se puede editar' : 'Editar rol'}
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setUserToDelete(user);
                                                    setShowDeleteModal(true);
                                                }}
                                                disabled={isSuperAdmin}
                                                className={`p-2 rounded-lg transition-all ${isSuperAdmin
                                                        ? 'text-velvet-orchid-300 cursor-not-allowed'
                                                        : 'text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30'
                                                    }`}
                                                title={isSuperAdmin ? 'No se puede eliminar' : 'Eliminar usuario'}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* ID del usuario */}
                                    <p className="text-xs text-velvet-orchid-400 dark:text-velvet-orchid-500 mt-2 font-mono">
                                        ID: {user.id.substring(0, 8)}...
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modales */}
            <EditUserModal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                }}
                onSuccess={loadUsers}
                user={selectedUser}
            />

            <DeleteUserModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setUserToDelete(null);
                }}
                onSuccess={loadUsers}
                user={userToDelete}
            />
        </div>
    );
}