// hooks/useHosts.ts
import { useState, useEffect, useCallback } from 'react';
import { fetchHostess, type Host } from '@/lib/actions';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

interface UseHostsReturn {
    hosts: Host[];
    loading: boolean;
    error: string | null;
    refreshHosts: () => Promise<void>;
    selectedHost: Host | null;
    selectHost: (host: Host | null) => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    filteredHosts: Host[];
    deleteHost: (host: Host) => Promise<{ success: boolean; error?: string }>;
}

export function useHosts(): UseHostsReturn {
    const [hosts, setHosts] = useState<Host[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedHost, setSelectedHost] = useState<Host | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    // Debounce del término de búsqueda (Tailwind v4 compatible)
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const loadHosts = useCallback(async () => {
        try {
            setLoading(true);
            const data = await fetchHostess();
            setHosts(data);
            setError(null);
        } catch (err) {
            setError('Error al cargar las hostess');
            toast.error('Error al cargar las hostess');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteHost = useCallback(async (host: Host) => {
        try {
            // Eliminar archivos del storage si existen
            if (host.host_media && host.host_media.length > 0) {
                const paths = host.host_media
                    .map(m => {
                        const urlParts = m.url.split('host-media/');
                        return urlParts.length > 1 ? urlParts[1] : null;
                    })
                    .filter(Boolean) as string[];

                if (paths.length > 0) {
                    const { error: storageError } = await supabase.storage
                        .from('host-media')
                        .remove(paths);
                    
                    if (storageError) {
                        console.error("Error eliminando archivos:", storageError);
                    }
                }
            }

            // Eliminar host
            const { error } = await supabase
                .from("hosts")
                .delete()
                .eq("id", host.id);

            if (error) throw error;

            setHosts(prev => prev.filter(h => h.id !== host.id));
            toast.success(`${host.nickname} eliminada correctamente`);
            return { success: true };
        } catch (err: any) {
            console.error("Error deleting host:", err);
            toast.error(`Error al eliminar: ${err.message}`);
            return { success: false, error: err.message };
        }
    }, []);

    useEffect(() => {
        loadHosts();
    }, [loadHosts]);

    // Filtrar hosts por término de búsqueda
    const filteredHosts = hosts.filter(h =>
        h.nickname?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );

    return {
        hosts,
        filteredHosts,
        loading,
        error,
        refreshHosts: loadHosts,
        selectedHost,
        selectHost: setSelectedHost,
        searchTerm,
        setSearchTerm,
        deleteHost
    };
}