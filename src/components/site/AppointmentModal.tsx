'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Phone, MessageSquare, Calendar as CalendarIcon, Clock } from 'lucide-react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Swal from 'sweetalert2';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface AppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    hostId: string;
    hostName: string;
    hostSchedule?: string;
}

// Horarios disponibles predefinidos
const availableTimes = [
    '10:00', '11:00', '12:00', '13:00',
    '15:00', '16:00', '17:00', '18:00', '19:00'
];

export default function AppointmentModal({ isOpen, onClose, hostId, hostName, hostSchedule }: AppointmentModalProps) {
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [step, setStep] = useState<'form' | 'calendar'>('form');

    // Reset form cuando se cierra el modal
    useEffect(() => {
        if (!isOpen) {
            setName('');
            setEmail('');
            setPhone('');
            setMessage('');
            setSelectedTime('');
            setSelectedDate(new Date());
            setStep('form');
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !email || !phone || !selectedTime || !selectedDate) {
            Swal.fire({
                icon: 'error',
                title: 'Campos incompletos',
                text: 'Por favor completa todos los campos requeridos',
                background: '#1f2937',
                color: '#ffffff',
                customClass: { popup: 'rounded-2xl' }
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const formattedDate = selectedDate.toISOString().split('T')[0];

            const response = await fetch('/api/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    host_id: hostId,
                    name,
                    email,
                    phone,
                    appointment_date: formattedDate,
                    appointment_time: selectedTime,
                    message
                })
            });

            const result = await response.json();

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Cita solicitada!',
                    text: 'Revisa tu correo electrónico para confirmar la cita',
                    background: '#1f2937',
                    color: '#ffffff',
                    customClass: { popup: 'rounded-2xl' }
                });
                onClose();
            } else {
                throw new Error(result.error || 'Error al crear la cita');
            }
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Hubo un problema al crear la cita',
                background: '#1f2937',
                color: '#ffffff',
                customClass: { popup: 'rounded-2xl' }
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const tileClassName = ({ date, view }: { date: Date; view: string }) => {
        if (view === 'month') {
            const today = new Date();
            if (date.toDateString() === today.toDateString()) {
                return 'bg-velvet-orchid-500/20 text-velvet-orchid-400 rounded-full';
            }
        }
        return '';
    };

    const tileDisabled = ({ date, view }: { date: Date; view: string }) => {
        if (view === 'month') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return date < today;
        }
        return false;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative bg-linear-to-br from-velvet-orchid-950 to-velvet-orchid-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-white/10"
                    >
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-white/10 bg-linear-to-r from-velvet-orchid-800/50 to-transparent">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-black text-white">
                                        Agendar Cita con {hostName}
                                    </h2>
                                    <p className="text-xs text-velvet-orchid-400 mt-0.5">
                                        Completa el formulario para solicitar tu cita
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-white/10">
                            <button
                                onClick={() => setStep('form')}
                                className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-all ${step === 'form'
                                        ? 'text-velvet-orchid-400 border-b-2 border-velvet-orchid-500'
                                        : 'text-white/50 hover:text-white/70'
                                    }`}
                            >
                                Datos personales
                            </button>
                            <button
                                onClick={() => setStep('calendar')}
                                className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-all ${step === 'calendar'
                                        ? 'text-velvet-orchid-400 border-b-2 border-velvet-orchid-500'
                                        : 'text-white/50 hover:text-white/70'
                                    }`}
                            >
                                Fecha y hora
                            </button>
                        </div>

                        {/* Formulario */}
                        <form onSubmit={handleSubmit} className="p-6">
                            {step === 'form' ? (
                                <div className="space-y-4">
                                    {/* Campo: Nombre */}
                                    <div>
                                        <label className="text-sm font-medium text-white block mb-2">
                                            Nombre completo <span className="text-red-400">*</span>
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-velvet-orchid-400" size={18} />
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 pl-10 text-white placeholder:text-white/50 outline-none focus:border-velvet-orchid-500 transition-all"
                                                placeholder="Ingresa tu nombre"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Campo: Email */}
                                    <div>
                                        <label className="text-sm font-medium text-white block mb-2">
                                            Correo electrónico <span className="text-red-400">*</span>
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-velvet-orchid-400" size={18} />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 pl-10 text-white placeholder:text-white/50 outline-none focus:border-velvet-orchid-500 transition-all"
                                                placeholder="tucorreo@ejemplo.com"
                                                required
                                            />
                                        </div>
                                        <p className="text-xs text-velvet-orchid-400 mt-1">
                                            Te enviaremos el enlace de confirmación aquí
                                        </p>
                                    </div>

                                    {/* Campo: Teléfono */}
                                    <div>
                                        <label className="text-sm font-medium text-white block mb-2">
                                            Teléfono <span className="text-red-400">*</span>
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-velvet-orchid-400" size={18} />
                                            <input
                                                type="tel"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 pl-10 text-white placeholder:text-white/50 outline-none focus:border-velvet-orchid-500 transition-all"
                                                placeholder="+52 123 456 7890"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Campo: Mensaje */}
                                    <div>
                                        <label className="text-sm font-medium text-white block mb-2">
                                            Mensaje adicional <span className="text-velvet-orchid-400 text-xs">(opcional)</span>
                                        </label>
                                        <div className="relative">
                                            <MessageSquare className="absolute left-3 top-3 text-velvet-orchid-400" size={18} />
                                            <textarea
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                rows={3}
                                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 pl-10 text-white placeholder:text-white/50 outline-none focus:border-velvet-orchid-500 transition-all resize-none"
                                                placeholder="¿Algo que quieras agregar?"
                                            />
                                        </div>
                                    </div>

                                    {/* Botón siguiente */}
                                    <button
                                        type="button"
                                        onClick={() => setStep('calendar')}
                                        className="w-full py-3 bg-velvet-orchid-600 hover:bg-velvet-orchid-500 text-white font-bold rounded-xl transition-all mt-4"
                                    >
                                        Continuar →
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Calendario */}
                                    <div>
                                        <label className="text-sm font-medium text-white block mb-3">
                                            Selecciona una fecha
                                        </label>
                                        <Calendar
                                            onChange={(value) => {
                                                if (value instanceof Date) {
                                                    setSelectedDate(value);
                                                }
                                            }}
                                            value={selectedDate}
                                            minDate={new Date()}
                                            tileClassName={tileClassName}
                                            tileDisabled={tileDisabled}
                                            className="w-full border-0 bg-white/10 rounded-xl p-3 text-white"
                                        />
                                    </div>

                                    {/* Horarios */}
                                    <div>
                                        <label className="text-sm font-medium text-white block mb-3">
                                            Selecciona una hora
                                        </label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {availableTimes.map((time) => (
                                                <button
                                                    key={time}
                                                    type="button"
                                                    onClick={() => setSelectedTime(time)}
                                                    className={`py-2 rounded-xl font-medium transition-all ${selectedTime === time
                                                            ? 'bg-velvet-orchid-500 text-white'
                                                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                                                        }`}
                                                >
                                                    {time}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Resumen de la selección */}
                                    <div className="bg-white/5 rounded-xl p-4">
                                        <p className="text-sm text-white/70 mb-2">Resumen de tu cita:</p>
                                        <p className="text-white">
                                            📅 {selectedDate ? selectedDate.toLocaleDateString('es-MX', {
                                                weekday: 'long',
                                                day: 'numeric',
                                                month: 'long'
                                            }) : 'No seleccionada'}
                                            {selectedTime && ` a las ${selectedTime} hrs`}
                                        </p>
                                        <p className="text-white/50 text-xs mt-2">
                                            Con {hostName}
                                        </p>
                                    </div>

                                    {/* Botones de acción */}
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setStep('form')}
                                            className="flex-1 py-3 border border-white/30 text-white font-bold rounded-xl hover:bg-white/10 transition-all"
                                        >
                                            ← Volver
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting || !selectedTime}
                                            className="flex-1 py-3 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting ? 'Enviando...' : 'Solicitar cita'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}