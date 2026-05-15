'use client'

import { useState } from 'react'
import { uploadSettingsImage } from '@/lib/actions'
import { toast } from 'react-hot-toast'
import Image from 'next/image'
import { Upload, X } from 'lucide-react'

interface ImageUploaderProps {
    type: 'logo' | 'background'
    currentUrl: string | null
    onUploadComplete: (url: string) => void
    label: string
    description?: string
}

export default function ImageUploader({
    type,
    currentUrl,
    onUploadComplete,
    label,
    description
}: ImageUploaderProps) {
    const [uploading, setUploading] = useState(false)
    const [preview, setPreview] = useState<string | null>(currentUrl)
    const [dragActive, setDragActive] = useState(false)

    const handleFile = async (file: File) => {
        setUploading(true)
        try {
            const result = await uploadSettingsImage(file, type)

            if (result.success && result.url) {
                setPreview(result.url)
                onUploadComplete(result.url)
                toast.success(`${label} subida correctamente`)
            } else {
                toast.error(result.error || `Error al subir ${label}`)
            }
        } catch (error) {
            toast.error(`Error al subir ${label}`)
        } finally {
            setUploading(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0])
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setDragActive(true)
    }

    const handleDragLeave = () => {
        setDragActive(false)
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0])
        }
    }

    const removeImage = () => {
        setPreview(null)
        onUploadComplete('')
    }

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-velvet-orchid-700">
                {label}
            </label>
            {description && (
                <p className="text-xs text-velvet-orchid-500 mb-2">{description}</p>
            )}

            {preview ? (
                <div className="relative group">
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-velvet-orchid-200">
                        <Image
                            src={preview}
                            alt={label}
                            fill
                            className="object-contain"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <X size={16} />
                    </button>
                </div>
            ) : (
                <div
                    className={`
            relative border-2 border-dashed rounded-lg p-8
            transition-all duration-200
            ${dragActive
                            ? 'border-velvet-orchid-500 bg-velvet-orchid-50'
                            : 'border-velvet-orchid-200 hover:border-velvet-orchid-400'
                        }
          `}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />

                    <div className="text-center">
                        <Upload className="mx-auto h-12 w-12 text-velvet-orchid-400 mb-3" />
                        <p className="text-sm text-velvet-orchid-600 font-medium">
                            {uploading ? 'Subiendo...' : 'Arrastra o haz clic para subir'}
                        </p>
                        <p className="text-xs text-velvet-orchid-400 mt-1">
                            PNG, JPG, GIF hasta 5MB
                        </p>
                    </div>

                    {uploading && (
                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-velvet-orchid-500"></div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}