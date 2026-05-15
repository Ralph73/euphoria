// src/components/dashboard/ActiveServicesCard.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Briefcase, Loader2 } from "lucide-react";

export default function ActiveServicesCard() {
    const [count, setCount] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function getServices() {
            // Ajusta 'services' al nombre real de tu tabla de servicios
            const { count: serviceCount } = await supabase
                .from("services")
                .select("*", { count: "exact", head: true });

            setCount(serviceCount || 0);
            setLoading(false);
        }
        getServices();
    }, []);

    return (
        <div className="bg-white dark:bg-velvet-orchid-950 p-6 rounded-2xl border border-velvet-orchid-100 dark:border-velvet-orchid-800 shadow-sm group hover:border-velvet-orchid-300 transition-all">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-velvet-orchid-100/50 dark:bg-velvet-orchid-800/40 rounded-xl text-velvet-orchid-700 dark:text-velvet-orchid-200">
                    <Briefcase size={24} />
                </div>
                <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-velvet-orchid-300 uppercase tracking-wider">
                        Servicios Activos
                    </p>
                    {loading ? (
                        <Loader2 className="w-6 h-6 animate-spin text-velvet-orchid-400 mt-2" />
                    ) : (
                        <p className="text-3xl font-bold text-velvet-orchid-950 dark:text-white mt-1">
                            {count}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
