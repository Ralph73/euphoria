'use client';

import { Heart } from 'lucide-react';
import Image from 'next/image';

interface HostessCardProps {
    host: {
        id: string;
        nickname: string;
        schedule?: string;
        likes: number;
        is_new: boolean;
        host_media?: Array<{ url: string; is_cover: boolean }>;
    };
    onClick: () => void;
    onLike: () => void;
    hasLiked: boolean;
    isLiking: boolean;
}

export default function HostessCard({
    host,
    onClick,
    onLike,
    hasLiked,
    isLiking
}: HostessCardProps) {
    const coverImage = host.host_media?.find(m => m.is_cover)?.url || '/default-avatar.jpg';

    const handleLike = async (e: React.MouseEvent) => {
        e.stopPropagation();
        await onLike();
    };

    return (
        <div
            onClick={onClick}
            className="group relative aspect-3/4 w-full overflow-hidden rounded-2xl cursor-pointer"
        >
            <Image
                src={coverImage}
                alt={host.nickname}
                fill
                quality={85}
                sizes="(max-width: 768px) 100vw, 85vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
            />

            {/* Overlay gradiente */}
            <div className="absolute inset-0 bg-linear-to-t from-velvet-orchid-950 via-velvet-orchid-950/20 to-transparent" />

            {/* Contenido */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-2xl font-bold mb-2 text-velvet-orchid-50">{host.nickname}</h3>
                {host.schedule && (
                    <p className="text-sm text-velvet-orchid-200 mb-4">{host.schedule}</p>
                )}

                {/* Botón de like */}
                <button
                    onClick={handleLike}
                    disabled={isLiking}
                    className={`
                        flex items-center gap-2 px-4 py-2 rounded-full
                        transition-all transform active:scale-95
                        ${hasLiked
                            ? 'bg-velvet-orchid-500 text-white'
                            : 'bg-white/20 backdrop-blur-sm hover:bg-velvet-orchid-500/80 text-white'
                        }
                        ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                >
                    <Heart
                        size={18}
                        className={hasLiked ? 'fill-white' : ''}
                    />
                    <span className="font-bold">{host.likes}</span>
                </button>
            </div>

            {/* Badge de "Popular" si tiene muchos likes (opcional) */}
            {host.likes > 10 && (
                <div className="absolute top-4 left-4 bg-velvet-orchid-500 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                    🔥 Popular
                </div>
            )}

            {host.is_new && (
                <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    NUEVA
                </div>
            )}
        </div>
    );
}