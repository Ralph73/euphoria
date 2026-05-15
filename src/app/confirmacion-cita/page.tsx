'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Clock, CalendarCheck } from 'lucide-react';

function ConfirmationContent() {
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'already'>('loading');

    useEffect(() => {
        const error = searchParams.get('error');
        const statusParam = searchParams.get('status');

        if (error === 'no-encontrada') {
            setStatus('error');
        } else if (error === 'error') {
            setStatus('error');
        } else if (statusParam === 'ya-confirmada') {
            setStatus('already');
        } else if (statusParam === 'confirmada') {
            setStatus('success');
        } else {
            setStatus('success');
        }
    }, [searchParams]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-velvet-orchid-950 to-velvet-orchid-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-velvet-orchid-500"></div>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-velvet-orchid-950 to-velvet-orchid-900">
                <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center border border-white/20">
                    <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle size={40} className="text-green-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">¡Cita Confirmada!</h1>
                    <p className="text-velvet-orchid-200 mb-6">
                        Tu cita ha sido confirmada exitosamente. Te esperamos.
                    </p>
                    <Link
                        href="/"
                        className="inline-block px-6 py-3 bg-velvet-orchid-600 hover:bg-velvet-orchid-500 text-white font-bold rounded-xl transition-all"
                    >
                        Volver al inicio
                    </Link>
                </div>
            </div>
        );
    }

    if (status === 'already') {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-velvet-orchid-950 to-velvet-orchid-900">
                <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center border border-white/20">
                    <div className="w-20 h-20 mx-auto bg-yellow-500/20 rounded-full flex items-center justify-center mb-6">
                        <Clock size={40} className="text-yellow-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Cita ya confirmada</h1>
                    <p className="text-velvet-orchid-200 mb-6">
                        Esta cita ya ha sido confirmada anteriormente.
                    </p>
                    <Link
                        href="/"
                        className="inline-block px-6 py-3 bg-velvet-orchid-600 hover:bg-velvet-orchid-500 text-white font-bold rounded-xl transition-all"
                    >
                        Volver al inicio
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-velvet-orchid-950 to-velvet-orchid-900">
            <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center border border-white/20">
                <div className="w-20 h-20 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-6">
                    <XCircle size={40} className="text-red-400" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Error</h1>
                <p className="text-velvet-orchid-200 mb-6">
                    No pudimos procesar tu solicitud. El enlace puede ser inválido o haber expirado.
                </p>
                <Link
                    href="/"
                    className="inline-block px-6 py-3 bg-velvet-orchid-600 hover:bg-velvet-orchid-500 text-white font-bold rounded-xl transition-all"
                >
                    Volver al inicio
                </Link>
            </div>
        </div>
    );
}

export default function ConfirmacionPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-velvet-orchid-950 to-velvet-orchid-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-velvet-orchid-500"></div>
            </div>
        }>
            <ConfirmationContent />
        </Suspense>
    );
}