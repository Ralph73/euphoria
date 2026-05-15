"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Mail, Eye, EyeOff, AlertCircle, User, Sparkles, LogIn, UserPlus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { loginAdmin, type LoginResult } from "@/lib/actions";
import Swal from 'sweetalert2';

type AccessMode = 'login' | 'register';

export default function AdminAccess() {
    const router = useRouter();
    const [mode, setMode] = useState<AccessMode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);

        try {
            const result: LoginResult = await loginAdmin(formData);

            if (result.success) {
                await Swal.fire({
                    icon: 'success',
                    title: '¡Bienvenido!',
                    text: 'Inicio de sesión exitoso',
                    timer: 1500,
                    showConfirmButton: false,
                    background: '#1f2937',
                    color: '#ffffff',
                    customClass: { popup: 'rounded-2xl' }
                });
                router.push(result.redirectTo);
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError("Error inesperado");
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden");
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres");
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/admin/access`,
                }
            });

            if (error) throw error;

            if (data.user) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Registro exitoso',
                    text: 'Tu cuenta ha sido creada. Por favor verifica tu email.',
                    background: '#1f2937',
                    color: '#ffffff',
                    customClass: { popup: 'rounded-2xl' }
                });

                // Cambiar a modo login después de 2 segundos
                setTimeout(() => {
                    setMode('login');
                    setEmail('');
                    setPassword('');
                    setConfirmPassword('');
                }, 2000);
            }
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
            {/* Fondo animado */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-linear-to-br from-velvet-orchid-950 via-velvet-orchid-900 to-velvet-orchid-800" />

                {/* Ondas animadas */}
                <div className="absolute inset-0 opacity-30">
                    <motion.div
                        animate={{
                            x: ["-10%", "10%", "-10%"],
                            y: ["-5%", "5%", "-5%"],
                        }}
                        transition={{ duration: 20, repeat: Infinity }}
                        className="absolute top-1/4 -left-1/4 w-[150%] h-[150%] rounded-full"
                        style={{
                            background: "radial-gradient(circle, rgba(181, 66, 189, 0.1) 0%, transparent 70%)",
                        }}
                    />
                    <motion.div
                        animate={{
                            x: ["5%", "-15%", "5%"],
                            y: ["10%", "-10%", "10%"],
                        }}
                        transition={{ duration: 25, repeat: Infinity }}
                        className="absolute bottom-1/4 -right-1/4 w-[150%] h-[150%] rounded-full"
                        style={{
                            background: "radial-gradient(circle, rgba(147, 51, 234, 0.08) 0%, transparent 70%)",
                        }}
                    />
                </div>

                <div className="absolute inset-0 backdrop-blur-[1px] bg-black/10" />
            </div>

            {/* Contenedor principal */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
                className="relative z-10 w-full max-w-md"
            >
                {/* Tarjeta principal */}
                <div className="bg-white/5 dark:bg-velvet-orchid-950/40 backdrop-blur-xl rounded-3xl border border-white/10 dark:border-velvet-orchid-800/30 shadow-2xl overflow-hidden">

                    {/* Logo y título */}
                    <div className="text-center pt-8 pb-4">
                        <motion.div
                            animate={{ scale: isHovered ? 1.1 : 1 }}
                            transition={{ duration: 0.3 }}
                            className="inline-flex p-3 bg-linear-to-br from-velvet-orchid-600 to-velvet-orchid-700 rounded-2xl mb-4 shadow-lg shadow-velvet-orchid-900/50"
                        >
                            <Sparkles className="w-8 h-8 text-white" />
                        </motion.div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter italic text-white">
                            Euphoria
                        </h1>
                        <p className="text-velvet-orchid-300/70 text-xs uppercase tracking-widest font-bold mt-1">
                            Panel Administrativo
                        </p>
                    </div>

                    {/* Tabs de navegación */}
                    <div className="flex mx-6 mb-6 bg-velvet-orchid-900/30 rounded-xl p-1 border border-velvet-orchid-800/30">
                        <button
                            onClick={() => setMode('login')}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${mode === 'login'
                                    ? 'bg-linear-to-r from-velvet-orchid-600 to-velvet-orchid-500 text-white shadow-lg shadow-velvet-orchid-900/30'
                                    : 'text-velvet-orchid-300 hover:text-white'
                                }`}
                        >
                            <LogIn size={16} className="inline mr-2" />
                            Iniciar Sesión
                        </button>
                        <button
                            onClick={() => setMode('register')}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${mode === 'register'
                                    ? 'bg-linear-to-r from-velvet-orchid-600 to-velvet-orchid-500 text-white shadow-lg shadow-velvet-orchid-900/30'
                                    : 'text-velvet-orchid-300 hover:text-white'
                                }`}
                        >
                            <UserPlus size={16} className="inline mr-2" />
                            Registrarse
                        </button>
                    </div>

                    {/* Contenido animado */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={mode}
                            initial={{ opacity: 0, x: mode === 'login' ? -20 : 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: mode === 'login' ? 20 : -20 }}
                            transition={{ duration: 0.3 }}
                            className="px-6 pb-8"
                        >
                            <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-4">
                                {/* Email */}
                                <div>
                                    <label className="block text-velvet-orchid-300 text-xs uppercase tracking-wider font-bold mb-2">
                                        Correo Electrónico
                                    </label>
                                    <div className="relative group">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-velvet-orchid-500 group-focus-within:text-velvet-orchid-400 transition-colors" size={18} />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="w-full bg-velvet-orchid-950/40 border border-velvet-orchid-700/50 rounded-xl py-3 pl-10 pr-4 text-white placeholder-velvet-orchid-500/50 focus:outline-none focus:border-velvet-orchid-500 focus:ring-1 focus:ring-velvet-orchid-500/50 transition-all"
                                            placeholder="usuario@ejemplo.com"
                                        />
                                    </div>
                                </div>

                                {/* Contraseña */}
                                <div>
                                    <label className="block text-velvet-orchid-300 text-xs uppercase tracking-wider font-bold mb-2">
                                        Contraseña
                                    </label>
                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-velvet-orchid-500 group-focus-within:text-velvet-orchid-400 transition-colors" size={18} />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="w-full bg-velvet-orchid-950/40 border border-velvet-orchid-700/50 rounded-xl py-3 pl-10 pr-12 text-white placeholder-velvet-orchid-500/50 focus:outline-none focus:border-velvet-orchid-500 focus:ring-1 focus:ring-velvet-orchid-500/50 transition-all"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-velvet-orchid-500 hover:text-velvet-orchid-400 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirmar contraseña (solo en registro) */}
                                {mode === 'register' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                    >
                                        <label className="block text-velvet-orchid-300 text-xs uppercase tracking-wider font-bold mb-2">
                                            Confirmar Contraseña
                                        </label>
                                        <div className="relative group">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-velvet-orchid-500 group-focus-within:text-velvet-orchid-400 transition-colors" size={18} />
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                required
                                                className="w-full bg-velvet-orchid-950/40 border border-velvet-orchid-700/50 rounded-xl py-3 pl-10 pr-12 text-white placeholder-velvet-orchid-500/50 focus:outline-none focus:border-velvet-orchid-500 focus:ring-1 focus:ring-velvet-orchid-500/50 transition-all"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-velvet-orchid-500 hover:text-velvet-orchid-400 transition-colors"
                                            >
                                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Recordar contraseña (solo en login) */}
                                {mode === 'login' && (
                                    <div className="flex items-center justify-between">
                                        <label className="flex items-center gap-2 text-velvet-orchid-300 text-xs cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={rememberMe}
                                                onChange={(e) => setRememberMe(e.target.checked)}
                                                className="rounded border-velvet-orchid-700 bg-velvet-orchid-900 text-velvet-orchid-500 focus:ring-velvet-orchid-500/30"
                                            />
                                            <span>Recordar acceso</span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                Swal.fire({
                                                    title: 'Recuperar contraseña',
                                                    text: 'Funcionalidad en desarrollo',
                                                    icon: 'info',
                                                    background: '#1f2937',
                                                    color: '#ffffff',
                                                    customClass: { popup: 'rounded-2xl' }
                                                });
                                            }}
                                            className="text-velvet-orchid-400 hover:text-velvet-orchid-300 text-xs font-medium transition-colors"
                                        >
                                            ¿Olvidaste tu contraseña?
                                        </button>
                                    </div>
                                )}

                                {/* Mensaje de error */}
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center gap-2 text-red-400 text-sm bg-red-950/30 py-3 px-4 rounded-xl border border-red-900/50"
                                    >
                                        <AlertCircle size={16} className="shrink-0" />
                                        <span>{error}</span>
                                    </motion.div>
                                )}

                                {/* Botón de acción */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-linear-to-r from-velvet-orchid-600 to-velvet-orchid-500 hover:from-velvet-orchid-500 hover:to-velvet-orchid-600 text-white font-black uppercase tracking-widest py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 text-sm shadow-lg shadow-velvet-orchid-900/50"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            {mode === 'login' ? 'Verificando...' : 'Registrando...'}
                                        </>
                                    ) : (
                                        <>
                                            {mode === 'login' ? <LogIn size={18} /> : <UserPlus size={18} />}
                                            {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
                                        </>
                                    )}
                                </motion.button>
                            </form>

                            {/* Nota para registro */}
                            {mode === 'register' && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center text-velvet-orchid-500/70 text-[10px] uppercase tracking-wider mt-4"
                                >
                                    Al registrarte, aceptas los términos y condiciones
                                </motion.p>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}