'use client'
import { ArrowRight } from 'lucide-react'

export const About = () => (
    <section id="nosotros" className="py-32 bg-velvet-orchid-100 dark:bg-velvet-orchid-800/10 px-6 md:px-12 scroll-mt-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-tight italic">
                Redefiniendo <br /> <span className="text-velvet-orchid-400">El Bienestar</span> Masculino.
            </h2>
            <div className="space-y-8">
                <p className="text-velvet-orchid-500 dark:text-velvet-orchid-200 text-lg font-light leading-relaxed">
                    En un mundo de exigencias constantes, el verdadero lujo es el tiempo y el silencio. EUPHORIA nace como un santuario diseñado para el caballero que comprende que la excelencia personal comienza con un cuerpo en calma y una mente despejada.
                </p>
                <button className="group flex items-center gap-4 text-stone-600 dark:text-amber-400 font-black uppercase tracking-widest text-xs">
                    Compruebalo <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                </button>
            </div>
        </div>
    </section>
)
