'use client';

import { Heart } from 'lucide-react';
import Image from 'next/image';
import type { Host } from '@/lib/actions';

interface HostessCardProps {
    host: Host & { likes?: number };
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
                quality={75}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
            />

            <div className="absolute inset-0 bg-linear-to-t from-velvet-orchid-950 via-velvet-orchid-950/20 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-2xl font-bold mb-2 text-velvet-orchid-50">{host.nickname}</h3>
                {host.schedule && (
                    <p className="text-sm text-velvet-orchid-200 mb-4">{host.schedule}</p>
                )}

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
                    <span className="font-bold">{host.likes || 0}</span>
                </button>
            </div>
        </div>
    );
}