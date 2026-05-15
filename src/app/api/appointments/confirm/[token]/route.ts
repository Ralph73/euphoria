import { NextResponse } from 'next/server';
import { confirmAppointment, getAppointmentByToken } from '@/lib/actions';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(
    request: Request,
    { params }: { params: { token: string } }
) {
    try {
        const { token } = await params;

        // Obtener la cita para verificar que existe
        const appointment = await getAppointmentByToken(token);
        
        if (!appointment) {
            return NextResponse.redirect(
                new URL('/confirmacion-cita?error=no-encontrada', process.env.NEXT_PUBLIC_BASE_URL)
            );
        }

        if (appointment.status === 'confirmed') {
            return NextResponse.redirect(
                new URL('/confirmacion-cita?status=ya-confirmada', process.env.NEXT_PUBLIC_BASE_URL)
            );
        }

        // Confirmar la cita
        const result = await confirmAppointment(token);

        if (!result.success) {
            return NextResponse.redirect(
                new URL('/confirmacion-cita?error=error', process.env.NEXT_PUBLIC_BASE_URL)
            );
        }

        // Enviar email de confirmación al admin (opcional)
        await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL!,
            to: 'admin@euphoria.com', // Cambiar por el email del admin
            subject: 'Nueva cita confirmada',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #b542bd;">✅ Nueva cita confirmada</h2>
                    <p><strong>Cliente:</strong> ${appointment.name}</p>
                    <p><strong>Email:</strong> ${appointment.email}</p>
                    <p><strong>Teléfono:</strong> ${appointment.phone}</p>
                    <p><strong>Fecha:</strong> ${appointment.appointment_date}</p>
                    <p><strong>Hora:</strong> ${appointment.appointment_time}</p>
                    ${appointment.message ? `<p><strong>Mensaje:</strong> ${appointment.message}</p>` : ''}
                </div>
            `,
        });

        return NextResponse.redirect(
            new URL('/confirmacion-cita?status=confirmada', process.env.NEXT_PUBLIC_BASE_URL)
        );

    } catch (error: any) {
        console.error('Error confirmando cita:', error);
        return NextResponse.redirect(
            new URL('/confirmacion-cita?error=error', process.env.NEXT_PUBLIC_BASE_URL)
        );
    }
}