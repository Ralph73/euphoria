"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// Al agregar "& { children: React.ReactNode }", blindamos el tipado para React 19
export function ThemeProvider({
    children,
    ...props
}: React.ComponentProps<typeof NextThemesProvider> & { children: React.ReactNode }) {
    return (
        <NextThemesProvider {...props}>
            {children}
        </NextThemesProvider>
    );
}