// hooks/useFooter.ts
import { useState, useEffect } from 'react';
import { fetchSettings } from '@/lib/actions';
import type { Settings } from '@/types';

export function useFooter() {
    const [settings, setSettings] = useState<Settings | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                setLoading(true);
                const data = await fetchSettings();
                setSettings(data);
                setError(null);
            } catch (err) {
                setError('Error al cargar configuración');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadSettings();
    }, []);

    return { settings, loading, error };
}