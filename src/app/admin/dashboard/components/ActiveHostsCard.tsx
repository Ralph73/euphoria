// src/components/dashboard/ActiveHostsCard.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Users, Loader2, AlertCircle } from "lucide-react";

export default function ActiveHostsCard() {
    const [count, setCount] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        async function getCount() {
            try {
                const { count: activeCount, error: supabaseError } = await supabase
                    .from("hosts")
                    .select("*", { count: "exact", head: true })
                    .eq("status", "activo");

                if (supabaseError) throw supabaseError;
                setCount(activeCount);
            } catch (err) {
                console.error("Error fetching hosts count:", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        }
        getCount();
    }, []);

    return (
        <div className="bg-white dark:bg-velvet-orchid-950 p-6 rounded-2xl border border-velvet-orchid-100 dark:border-velvet-orchid-800 shadow-sm relative overflow-hidden group hover:border-velvet-orchid-300 transition-all">
            <div className="flex items-center gap-4 relative z-10">
                <div className="p-3 bg-velvet-orchid-50 dark:bg-velvet-orchid-900/50 rounded-xl text-velvet-orchid-600 dark:text-velvet-orchid-400">
                    <Users size={24} />
                </div>
                <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-velvet-orchid-300 uppercase tracking-wider">
                        Hostess Activas
                    </p>
                    <div className="flex items-baseline gap-2">
                        {loading ? (
                            <Loader2 className="w-6 h-6 animate-spin text-velvet-orchid-400 mt-2" />
                        ) : error ? (
                            <div className="flex items-center text-red-500 text-xs mt-1 gap-1">
                                <AlertCircle size={14} /> Error
                            </div>
                        ) : (
                            <p className="text-3xl font-bold text-velvet-orchid-950 dark:text-white mt-1">
                                {count ?? 0}
                            </p>
                        )}
                    </div>
                </div>
            </div>
            {/* Detalle visual: una barra de progreso sutil al fondo */}
            <div className="absolute bottom-0 left-0 h-1 bg-velvet-orchid-500 transition-all duration-1000" style={{ width: loading ? '0%' : '100%' }} />
        </div>
    );
}
