import { useState, useCallback, useEffect } from 'react';
import { likeHost } from '@/lib/actions';
import { toast } from 'react-hot-toast';

interface LikeState {
    [hostId: string]: {
        likes: number;
        hasLiked: boolean;
        isLiking: boolean;
    };
}

export function useHostLikes(initialHosts: { id: string; likes?: number }[]) {
    // Inicializar estado de likes
    const [likeState, setLikeState] = useState<LikeState>(() => {
        const initialState: LikeState = {};
        initialHosts.forEach(host => {
            initialState[host.id] = {
                likes: host.likes || 0,
                hasLiked: false,
                isLiking: false
            };
        });
        return initialState;
    });

    // Actualizar cuando cambien los hosts
    useEffect(() => {
        setLikeState(prev => {
            const newState = { ...prev };
            
            // Agregar nuevos hosts que no existen en el estado
            initialHosts.forEach(host => {
                if (!newState[host.id]) {
                    newState[host.id] = {
                        likes: host.likes || 0,
                        hasLiked: false,
                        isLiking: false
                    };
                }
            });
            
            return newState;
        });
    }, [initialHosts]);

    const handleLike = useCallback(async (hostId: string) => {
        const currentState = likeState[hostId];
        
        // Prevenir doble like o like mientras se procesa
        if (!currentState || currentState.hasLiked || currentState.isLiking) {
            if (currentState?.hasLiked) {
                toast.error('Ya has dado like a esta hostess');
            }
            return;
        }

        // Update optimista
        setLikeState(prev => ({
            ...prev,
            [hostId]: {
                ...prev[hostId],
                likes: prev[hostId].likes + 1,
                hasLiked: true,
                isLiking: true
            }
        }));

        try {
            const result = await likeHost(hostId);
            
            if (!result.success) {
                // Revertir si hay error
                setLikeState(prev => ({
                    ...prev,
                    [hostId]: {
                        ...prev[hostId],
                        likes: prev[hostId].likes - 1,
                        hasLiked: false,
                        isLiking: false
                    }
                }));
                toast.error(result.error || 'Error al dar like');
            } else {
                // Mantener el like exitoso pero quitar estado de loading
                setLikeState(prev => ({
                    ...prev,
                    [hostId]: {
                        ...prev[hostId],
                        isLiking: false
                    }
                }));
            }
        } catch (error) {
            // Revertir en caso de error
            setLikeState(prev => ({
                ...prev,
                [hostId]: {
                    ...prev[hostId],
                    likes: prev[hostId].likes - 1,
                    hasLiked: false,
                    isLiking: false
                }
            }));
            toast.error('Error al dar like');
        }
    }, [likeState]);

    return {
        likeState,
        handleLike,
        getHostLikes: (hostId: string) => likeState[hostId]?.likes || 0,
        hasHostLiked: (hostId: string) => likeState[hostId]?.hasLiked || false,
        isHostLiking: (hostId: string) => likeState[hostId]?.isLiking || false
    };
}