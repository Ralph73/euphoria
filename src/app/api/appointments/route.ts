import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createAppointment } from '@/lib/actions';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { host_id, name, email, phone, appointment_date, appointment_time, message } = body;

        // Validar campos requeridos
        if (!host_id || !name || !email || !phone || !appointment_date || !appointment_time) {
            return NextResponse.json(
                { error: 'Faltan campos requeridos' },
                { status: 400 }
            );
        }

        // Crear cita en la base de datos
        const result = await createAppointment({
            host_id,
            name,
            email,
            phone,
            appointment_date,
            appointment_time,
            message
        });

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || 'Error al crear la cita' },
                { status: 500 }
            );
        }

        // Obtener la URL base para el enlace de confirmación
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const confirmUrl = `${baseUrl}/api/appointments/confirm/${result.token}`;

        // Enviar email de confirmación con Resend
        const emailResult = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL!,
            to: email,
            subject: 'Confirma tu cita - Euphoria Massages',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #1a1a2e; color: #fff; border-radius: 16px;">
                    <h1 style="color: #b542bd; text-align: center;">✨ Euphoria Massages ✨</h1>
                    <h2 style="text-align: center;">¡Hola ${name}!</h2>
                    <p style="font-size: 16px;">Has solicitado una cita con nuestra hostess para el día:</p>
                    <div style="background-color: #2d2d44; padding: 15px; border-radius: 12px; margin: 15px 0; text-align: center;">
                        <p style="margin: 5px 0;"><strong>📅 Fecha:</strong> ${appointment_date}</p>
                        <p style="margin: 5px 0;"><strong>⏰ Hora:</strong> ${appointment_time}</p>
                    </div>
                    <p style="font-size: 16px;">Para confirmar tu cita, haz clic en el siguiente enlace:</p>
                    <div style="text-align: center; margin: 25px 0;">
                        <a href="${confirmUrl}" 
                           style="background-color: #b542bd; color: white; padding: 12px 30px; text-decoration: none; border-radius: 30px; font-weight: bold; display: inline-block;">
                            ✅ Confirmar mi cita
                        </a>
                    </div>
                    <p style="font-size: 14px; color: #aaa; text-align: center;">
                        Si no solicitaste esta cita, puedes ignorar este mensaje.
                    </p>
                    <hr style="border-color: #2d2d44; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #666; text-align: center;">
                        Euphoria Massages - Exclusividad Masculina
                    </p>
                </div>
            `,
        });

        console.log('Email enviado:', emailResult);

        return NextResponse.json({ 
            success: true, 
            message: 'Cita creada. Revisa tu email para confirmar.' 
        });

    } catch (error: any) {
        console.error('Error en POST /api/appointments:', error);
        return NextResponse.json(
            { error: error.message || 'Error interno del servidor' },
            { status: 500 }
        );
    }
}