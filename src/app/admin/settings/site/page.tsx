'use client'

import { useState, useEffect } from 'react'
import { fetchSettings, updateSettings, getAuthenticatedUser, uploadSettingsImage } from '@/lib/actions'
import type { Settings } from '@/types'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import Swal from 'sweetalert2' // 👈 Importar SweetAlert2

type TabType = 'general' | 'hero' | 'contact' | 'social'

export default function SettingsPage() {
    const [settings, setSettings] = useState<Settings | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState<'logo' | 'background' | null>(null)
    const [activeTab, setActiveTab] = useState<TabType>('general')
    const [isAdmin, setIsAdmin] = useState(false)
    const [isSuperAdmin, setIsSuperAdmin] = useState(false)
    const [formData, setFormData] = useState<Partial<Settings>>({})
    const [localPreviews, setLocalPreviews] = useState<{
        logo?: { file: File; preview: string };
        background?: { file: File; preview: string };
    }>({});
    const [urlsToDelete, setUrlsToDelete] = useState<string[]>([]);

    useEffect(() => {
        loadData()

        // Cleanup al desmontar el componente
        return () => {
            // Liberar las URLs de los previews para evitar memory leaks
            if (localPreviews.logo) {
                URL.revokeObjectURL(localPreviews.logo.preview)
            }
            if (localPreviews.background) {
                URL.revokeObjectURL(localPreviews.background.preview)
            }
        }
    }, []) // ← Las dependencias vacías están bien aquí

    const loadData = async () => {
        try {
            // 1. Obtener datos
            const [settingsData, userData] = await Promise.all([
                fetchSettings(),
                getAuthenticatedUser()
            ])

            setSettings(settingsData)
            setFormData(settingsData || {})

            // 2. Verificar autenticación
            if (!userData.user) {
                console.error("Usuario no autenticado");
                setIsAdmin(false);
                setIsSuperAdmin(false);
                await Swal.fire({
                    icon: 'error',
                    title: 'No autenticado',
                    text: 'Debes iniciar sesión',
                    background: '#1f2937',
                    color: '#ffffff',
                    customClass: { popup: 'rounded-2xl' }
                });
                return;
            }

            // 3. Verificar admin con manejo de errores
            const { data: profile, error } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", userData.user.id)
                .single();

            if (error) {
                console.error("Error verificando admin o superadmin:", error);
                setIsAdmin(false);
                setIsSuperAdmin(false);
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al verificar permisos',
                    background: '#1f2937',
                    color: '#ffffff',
                    customClass: { popup: 'rounded-2xl' }
                });
                return;
            }

            // 4. Establecer estado de admin
            const adminStatus = profile?.role === 'admin';
            const superadminStatus = profile?.role === 'superadmin';
            setIsAdmin(adminStatus);
            setIsSuperAdmin(superadminStatus);

            if (!superadminStatus) {
                await Swal.fire({
                    icon: 'warning',
                    title: 'Permisos insuficientes',
                    text: 'No tienes permisos de super administrador',
                    background: '#1f2937',
                    color: '#ffffff',
                    customClass: { popup: 'rounded-2xl' }
                });
            }

        } catch (error) {
            console.error("Error en loadData:", error);
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al cargar configuración',
                background: '#1f2937',
                color: '#ffffff',
                customClass: { popup: 'rounded-2xl' }
            });
            setIsAdmin(false);
            setIsSuperAdmin(false);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'background') => {
        if (!e.target.files || !e.target.files[0]) return

        const file = e.target.files[0]

        // Crear preview local
        const preview = URL.createObjectURL(file)

        setLocalPreviews(prev => ({
            ...prev,
            [type]: { file, preview }
        }))

        Swal.fire({
            icon: 'success',
            title: 'Seleccionado',
            text: `${type === 'logo' ? 'Logo' : 'Fondo'} seleccionado (pendiente de guardar)`,
            timer: 2000,
            showConfirmButton: false,
            background: '#1f2937',
            color: '#ffffff',
            customClass: { popup: 'rounded-2xl' }
        });
        e.target.value = ''
    }

    const handleRemoveImage = async (type: 'logo' | 'background') => {
        // Si hay preview local, solo limpiar el preview
        if (localPreviews[type]) {
            URL.revokeObjectURL(localPreviews[type]!.preview);
            setLocalPreviews(prev => {
                const newPreviews = { ...prev };
                delete newPreviews[type];
                return newPreviews;
            });
            Swal.fire({
                icon: 'success',
                title: 'Removido',
                text: `${type === 'logo' ? 'Logo' : 'Fondo'} removido`,
                timer: 2000,
                showConfirmButton: false,
                background: '#1f2937',
                color: '#ffffff',
                customClass: { popup: 'rounded-2xl' }
            });
            return;
        }

        // Si es imagen existente, guardar la URL para eliminarla después
        const urlToDelete = type === 'logo' ? formData.hero_logo_url : formData.hero_background_url;

        // ✅ CORREGIDO: Solo agregar si existe y es string
        if (urlToDelete && typeof urlToDelete === 'string') {
            setUrlsToDelete(prev => [...prev, urlToDelete]);
        }

        // Limpiar del formData
        if (type === 'logo') {
            setFormData(prev => ({ ...prev, hero_logo_url: '' }));
        } else {
            setFormData(prev => ({ ...prev, hero_background_url: '' }));
        }

        Swal.fire({
            icon: 'success',
            title: 'Programado',
            text: `${type === 'logo' ? 'Logo' : 'Fondo'} será eliminado al guardar`,
            timer: 2000,
            showConfirmButton: false,
            background: '#1f2937',
            color: '#ffffff',
            customClass: { popup: 'rounded-2xl' }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!isSuperAdmin) {
            await Swal.fire({
                icon: 'error',
                title: 'Acceso denegado',
                text: 'No tienes permisos de Super administrador',
                background: '#1f2937',
                color: '#ffffff',
                customClass: { popup: 'rounded-2xl' }
            });
            return
        }

        setSaving(true)

        try {
            // 0. Eliminar imágenes marcadas para eliminar
            for (const url of urlsToDelete) {
                const path = url.split('/').pop();
                if (path) {
                    await supabase.storage
                        .from('settings_media')
                        .remove([path]);
                    console.log(`🗑️ Imagen eliminada: ${path}`);
                }
            }

            let updatedFormData = { ...formData }
            const imagesToUpload = []

            // 1. Subir logo si hay preview local
            if (localPreviews.logo) {
                imagesToUpload.push(
                    uploadSettingsImage(localPreviews.logo.file, 'logo')
                        .then(result => {
                            if (result.success && result.url) {
                                updatedFormData.hero_logo_url = result.url
                            } else {
                                throw new Error(result.error || 'Error al subir logo')
                            }
                        })
                )
            }

            // 2. Subir background si hay preview local
            if (localPreviews.background) {
                imagesToUpload.push(
                    uploadSettingsImage(localPreviews.background.file, 'background')
                        .then(result => {
                            if (result.success && result.url) {
                                updatedFormData.hero_background_url = result.url
                            } else {
                                throw new Error(result.error || 'Error al subir fondo')
                            }
                        })
                )
            }

            // 3. Esperar a que todas las imágenes se suban
            if (imagesToUpload.length > 0) {
                await Promise.all(imagesToUpload)
            }

            // 4. Preparar FormData para updateSettings
            const submitFormData = new FormData()
            Object.entries(updatedFormData).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    submitFormData.append(key, String(value))
                }
            })

            // 5. Guardar en la base de datos
            const result = await updateSettings(submitFormData)

            if (result.success) {
                // 6. Limpiar previews locales y URLs a eliminar
                if (localPreviews.logo) URL.revokeObjectURL(localPreviews.logo.preview)
                if (localPreviews.background) URL.revokeObjectURL(localPreviews.background.preview)
                setLocalPreviews({})
                setUrlsToDelete([])

                // 7. Actualizar settings con los datos nuevos
                if (result.data) {
                    setSettings(result.data)
                    setFormData(result.data)
                }

                await Swal.fire({
                    icon: 'success',
                    title: '¡Guardado!',
                    text: 'Configuración guardada exitosamente',
                    timer: 2000,
                    showConfirmButton: false,
                    background: '#1f2937',
                    color: '#ffffff',
                    customClass: { popup: 'rounded-2xl' }
                });
            } else {
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: result.error || 'Error al guardar',
                    background: '#1f2937',
                    color: '#ffffff',
                    customClass: { popup: 'rounded-2xl' }
                });
            }
        } catch (error) {
            console.error("Error:", error)
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al guardar la configuración',
                background: '#1f2937',
                color: '#ffffff',
                customClass: { popup: 'rounded-2xl' }
            });
        } finally {
            setSaving(false)
        }
    }

    const tabs = [
        { id: 'general', label: 'General', icon: '⚙️' },
        { id: 'hero', label: 'Home', icon: '🖼️' },
        { id: 'contact', label: 'Contacto', icon: '📞' },
        { id: 'social', label: 'Redes', icon: '🌐' }
    ]

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-velvet-orchid-500"></div>
            </div>
        )
    }

    if (!isSuperAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">🔒</div>
                    <h2 className="text-2xl font-bold text-velvet-orchid-800 mb-2">Acceso Restringido</h2>
                    <p className="text-velvet-orchid-600">Necesitas permisos de administrador para acceder a esta página.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-velvet-orchid-100 mb-2">
                        Configuración del Sitio
                    </h1>
                    <p className="text-velvet-orchid-500">
                        Administra la apariencia y contenido de tu sitio web
                    </p>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow-lg mb-6">
                    <div className="border-b border-velvet-orchid-100">
                        <nav className="flex -mb-px">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as TabType)}
                                    className={`
                                        flex items-center gap-2 px-6 py-4 text-sm font-medium
                                        ${activeTab === tab.id
                                            ? 'border-b-2 border-velvet-orchid-500 text-velvet-orchid-700'
                                            : 'text-velvet-orchid-500 hover:text-velvet-orchid-700 hover:border-velvet-orchid-300'
                                        }
                                    `}
                                >
                                    <span>{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6">
                    {/* Tab: General */}
                    {activeTab === 'general' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-velvet-orchid-800 mb-4">
                                Configuración General
                            </h2>

                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-velvet-orchid-700 mb-2">
                                        Título del Sitio
                                    </label>
                                    <input
                                        type="text"
                                        name="hero_title"
                                        value={formData.hero_title || ''}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-velvet-orchid-200 rounded-lg focus:ring-2 focus:ring-velvet-orchid-500 focus:border-transparent text-gray-900"
                                        placeholder="Mi Sitio Web"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-velvet-orchid-700 mb-2">
                                        Subtítulo
                                    </label>
                                    <input
                                        type="text"
                                        name="hero_subtitle"
                                        value={formData.hero_subtitle || ''}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-velvet-orchid-200 rounded-lg focus:ring-2 focus:ring-velvet-orchid-500 focus:border-transparent text-gray-900"
                                        placeholder="Subtítulo del sitio"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab: Hero Section */}
                    {activeTab === 'hero' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-velvet-orchid-800 mb-4">
                                Pagina Inicio - Logo y Fondo de pantalla
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                                {/* Logo Uploader */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-velvet-orchid-700">
                                        Logo del Sitio
                                    </label>
                                    <p className="text-xs text-velvet-orchid-500 mb-2">
                                        Sube el logo que aparecerá en el hero section
                                    </p>

                                    {(formData.hero_logo_url || localPreviews.logo) ? (
                                        <div className="relative group">
                                            <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-velvet-orchid-200 bg-white">
                                                <Image
                                                    src={localPreviews.logo?.preview || formData.hero_logo_url || ''}
                                                    alt="Logo"
                                                    fill
                                                    className="object-contain"
                                                    sizes="(max-width: 768px) 100vw, 80vw"
                                                />
                                                {localPreviews.logo && (
                                                    <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                                                        Preview
                                                    </div>
                                                )}
                                            </div>

                                            <div className="absolute top-2 right-2 flex gap-2">
                                                <label className="cursor-pointer w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => handleImageSelect(e, 'logo')}
                                                        className="hidden"
                                                        disabled={uploading === 'logo'}
                                                    />
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-velvet-orchid-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                    </svg>
                                                </label>

                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveImage('logo')}
                                                    className="w-10 h-10 bg-red-500/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>

                                            {uploading === 'logo' && (
                                                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-velvet-orchid-500"></div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <label className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-all duration-200 block
            ${uploading === 'logo'
                                                ? 'border-velvet-orchid-500 bg-velvet-orchid-50'
                                                : 'border-velvet-orchid-200 hover:border-velvet-orchid-400 hover:bg-velvet-orchid-50'
                                            }
        `}>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleImageSelect(e, 'logo')}
                                                className="hidden"
                                                disabled={uploading === 'logo'}
                                            />
                                            <div className="text-center">
                                                {uploading === 'logo' ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-velvet-orchid-500 mx-auto mb-2"></div>
                                                        <p className="text-sm text-velvet-orchid-600 font-medium">Subiendo...</p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="text-3xl mb-2">📸</div>
                                                        <p className="text-sm text-velvet-orchid-600 font-medium">
                                                            Haz clic para subir el logo
                                                        </p>
                                                        <p className="text-xs text-velvet-orchid-400 mt-1">
                                                            PNG, JPG, GIF hasta 5MB
                                                        </p>
                                                    </>
                                                )}
                                            </div>
                                        </label>
                                    )}
                                </div>

                                {/* Background Uploader */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-velvet-orchid-700">
                                        Imagen de Fondo
                                    </label>
                                    <p className="text-xs text-velvet-orchid-500 mb-2">
                                        Sube la imagen de fondo del hero section
                                    </p>

                                    {(formData.hero_background_url || localPreviews.background) ? (
                                        <div className="relative group">
                                            <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-velvet-orchid-200">
                                                <Image
                                                    src={localPreviews.background?.preview || formData.hero_background_url || ''}
                                                    alt="Background"
                                                    fill
                                                    className="object-cover"
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                />
                                                {localPreviews.background && (
                                                    <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                                                        Preview
                                                    </div>
                                                )}
                                            </div>

                                            <div className="absolute top-2 right-2 flex gap-2">
                                                <label className="cursor-pointer w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => handleImageSelect(e, 'background')}
                                                        className="hidden"
                                                        disabled={uploading === 'background'}
                                                    />
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-velvet-orchid-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                    </svg>
                                                </label>

                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveImage('background')}
                                                    className="w-10 h-10 bg-red-500/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>

                                            {uploading === 'background' && (
                                                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-velvet-orchid-500"></div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <label className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-all duration-200 block
            ${uploading === 'background'
                                                ? 'border-velvet-orchid-500 bg-velvet-orchid-50'
                                                : 'border-velvet-orchid-200 hover:border-velvet-orchid-400 hover:bg-velvet-orchid-50'
                                            }
        `}>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleImageSelect(e, 'background')}
                                                className="hidden"
                                                disabled={uploading === 'background'}
                                            />
                                            <div className="text-center">
                                                {uploading === 'background' ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-velvet-orchid-500 mx-auto mb-2"></div>
                                                        <p className="text-sm text-velvet-orchid-600 font-medium">Subiendo...</p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="text-3xl mb-2">🖼️</div>
                                                        <p className="text-sm text-velvet-orchid-600 font-medium">
                                                            Haz clic para subir el fondo
                                                        </p>
                                                        <p className="text-xs text-velvet-orchid-400 mt-1">
                                                            PNG, JPG, GIF hasta 5MB
                                                        </p>
                                                    </>
                                                )}
                                            </div>
                                        </label>
                                    )}
                                </div>

                            </div>

                            {/* Preview del Hero - CORREGIDO */}
                            {(formData.hero_logo_url || formData.hero_background_url) && (
                                <div className="mt-8 p-4 bg-velvet-orchid-50 rounded-lg">
                                    <h3 className="text-sm font-medium text-velvet-orchid-700 mb-3">Vista Previa del Hero:</h3>
                                    <div className="relative h-48 rounded-lg overflow-hidden border border-velvet-orchid-200">
                                        {/* Imagen de fondo con Next.js Image */}
                                        {formData.hero_background_url && (
                                            <>
                                                <Image
                                                    src={formData.hero_background_url}
                                                    alt="Background preview"
                                                    fill
                                                    className="object-cover"
                                                    priority
                                                    sizes="(max-width: 768px) 100vw, 85vw"
                                                />
                                                <div className="absolute inset-0 bg-black/40" />
                                            </>
                                        )}

                                        {/* Logo centrado */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            {formData.hero_logo_url && (
                                                <div className="relative w-24 h-24">
                                                    <Image
                                                        src={formData.hero_logo_url}
                                                        alt="Logo preview"
                                                        fill
                                                        className="object-contain"
                                                        priority
                                                        sizes="96px"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab: Contacto */}
                    {activeTab === 'contact' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-velvet-orchid-800 mb-4">
                                Información de Contacto
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-velvet-orchid-700 mb-2">
                                        Dirección
                                    </label>
                                    <input
                                        type="text"
                                        name="direccion"
                                        value={formData.direccion || ''}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-velvet-orchid-200 rounded-lg focus:ring-2 focus:ring-velvet-orchid-500 focus:border-transparent text-gray-900"
                                        placeholder="Calle, Ciudad, País"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-velvet-orchid-700 mb-2">
                                        Teléfono
                                    </label>
                                    <input
                                        type="tel"
                                        name="telefono"
                                        value={formData.telefono || ''}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-velvet-orchid-200 rounded-lg focus:ring-2 focus:ring-velvet-orchid-500 focus:border-transparent text-gray-900"
                                        placeholder="+123 456 7890"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-velvet-orchid-700 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email || ''}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-velvet-orchid-200 rounded-lg focus:ring-2 focus:ring-velvet-orchid-500 focus:border-transparent text-gray-900"
                                        placeholder="info@ejemplo.com"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab: Redes Sociales */}
                    {activeTab === 'social' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-velvet-orchid-800 mb-4">
                                Redes Sociales
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-velvet-orchid-700 mb-2">
                                        Facebook
                                    </label>
                                    <input
                                        type="url"
                                        name="facebook_url"
                                        value={formData.facebook_url || ''}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-velvet-orchid-200 rounded-lg focus:ring-2 focus:ring-velvet-orchid-500 focus:border-transparent text-gray-900"
                                        placeholder="https://facebook.com/..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-velvet-orchid-700 mb-2">
                                        Instagram
                                    </label>
                                    <input
                                        type="url"
                                        name="instagram_url"
                                        value={formData.instagram_url || ''}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-velvet-orchid-200 rounded-lg focus:ring-2 focus:ring-velvet-orchid-500 focus:border-transparent text-gray-900"
                                        placeholder="https://instagram.com/..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-velvet-orchid-700 mb-2">
                                        Twitter/X
                                    </label>
                                    <input
                                        type="url"
                                        name="twitter_url"
                                        value={formData.twitter_url || ''}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-velvet-orchid-200 rounded-lg focus:ring-2 focus:ring-velvet-orchid-500 focus:border-transparent text-gray-900"
                                        placeholder="https://twitter.com/..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-velvet-orchid-700 mb-2">
                                        YouTube
                                    </label>
                                    <input
                                        type="url"
                                        name="youtube_url"
                                        value={formData.youtube_url || ''}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-velvet-orchid-200 rounded-lg focus:ring-2 focus:ring-velvet-orchid-500 focus:border-transparent text-gray-900"
                                        placeholder="https://youtube.com/..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-velvet-orchid-700 mb-2">
                                        TikTok
                                    </label>
                                    <input
                                        type="url"
                                        name="tiktok_url"
                                        value={formData.tiktok_url || ''}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-velvet-orchid-200 rounded-lg focus:ring-2 focus:ring-velvet-orchid-500 focus:border-transparent text-gray-900"
                                        placeholder="https://tiktok.com/..."
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Botones de acción */}
                    <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-velvet-orchid-100">

                        <button
                            type="button"
                            onClick={() => {
                                // Limpiar previews locales
                                if (localPreviews.logo) URL.revokeObjectURL(localPreviews.logo.preview)
                                if (localPreviews.background) URL.revokeObjectURL(localPreviews.background.preview)
                                setLocalPreviews({})
                                setUrlsToDelete([])  // ← Limpiar URLs a eliminar
                                // Volver a los datos originales
                                setFormData(settings || {})
                            }}
                            className="px-6 py-2 border border-velvet-orchid-300 text-velvet-orchid-700 rounded-lg hover:bg-velvet-orchid-50 transition-colors"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className={`
                                px-6 py-2 bg-velvet-orchid-500 text-white rounded-lg
                                hover:bg-velvet-orchid-600 transition-colors
                                disabled:opacity-50 disabled:cursor-not-allowed
                                flex items-center gap-2
                            `}
                        >
                            {saving ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Guardando...
                                </>
                            ) : (
                                'Guardar Cambios'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}