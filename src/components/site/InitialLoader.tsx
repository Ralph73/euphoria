"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export default function InitialLoader() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // 3 segundos de carga
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 1, ease: "easeInOut" } }}
                    className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-velvet-orchid-950"
                >
                    {/* Aquí podrías poner una imagen de fondo después, por ahora es color sólido elegante */}
                    <motion.h1
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                        className="text-4xl md:text-6xl text-velvet-orchid-200 font-serif tracking-widest uppercase"
                    >
                        Euphoria
                    </motion.h1>
                    <motion.p
                        animate={{ opacity: [0.2, 0.8, 0.2] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0.5 }}
                        className="mt-4 text-velvet-orchid-400 tracking-widest text-sm"
                    >
                        Loading...
                    </motion.p>
                </motion.div>
            )}
        </AnimatePresence>
    );
}