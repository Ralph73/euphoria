"use client";

import { Toaster } from "sonner";
import { useTheme } from "next-themes";

export function ToastProvider() {
    const { theme } = useTheme();

    return (
        <Toaster
            position="bottom-right"
            richColors
            closeButton
            // Detecta automáticamente si el tema es dark o light
            theme={theme as "light" | "dark" | "system"}
            toastOptions={{
                // Aplicamos tu paleta Velvet Orchid directamente en las clases
                className: "border-velvet-orchid-200 dark:border-velvet-orchid-800 bg-white dark:bg-velvet-orchid-950 text-velvet-orchid-950 dark:text-white rounded-[1.5rem] shadow-2xl",
                style: {
                    fontFamily: 'inherit',
                },
            }}
        />
    );
}
