'use client';

import React from 'react';
import { MapPin, Phone, Mail, Instagram, Facebook, Send } from 'lucide-react';
import { useFooter } from '@/hooks/useFooter';

export const Footer = () => {
  const { settings, loading } = useFooter();

  // Valores por defecto si no hay settings o mientras carga
  const address = settings?.direccion || "Henequén 104, Zaragoza, 32590 Cd. Juárez, Chih.";
  const phone = settings?.telefono || "+52 656 745-7746";
  const customMessage = "Hola, me gustaría recibir más información sobre sus servicios.";

  const email = settings?.email || "contacto@euphoria.com.mx";

  // Redes sociales
  const instagram = settings?.instagram_url || "#";
  const facebook = settings?.facebook_url || "#";

  // Extraer número de teléfono para WhatsApp (solo dígitos)
  // const whatsappNumber = phone.replace(/\D/g, '');
  let whatsappNumber = phone.replace(/\D/g, '');


  if (whatsappNumber.startsWith('52') && whatsappNumber.length === 12) {
    whatsappNumber = '521' + whatsappNumber.substring(2);
  }

  const encodedMessage = encodeURIComponent(customMessage);

  const openWhatsApp = () => {
    const baseUrl = /Android|iPhone|iPad/i.test(navigator.userAgent)
      ? 'https://whatsapp.com'
      : 'https://wa.me';

    window.open(`${baseUrl}?phone=${whatsappNumber}&text=${encodedMessage}`, '_blank');
  };

  // URL del mapa usando la dirección
  const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;

  return (
    <footer className="relative bg-white dark:bg-velvet-orchid-950">
      {/* SECCIÓN DEL MAPA */}
      <div className="relative h-64 md:h-80 lg:h-96 w-full overflow-hidden bg-gray-200 dark:bg-velvet-orchid-900">
        <iframe
          src={mapUrl}
          title={`Mapa de ${address}`}
          className="absolute inset-0 w-full h-full border-0"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>

      {/* NAVEGACIÓN INFERIOR CON TARJETA DE CONTACTO INTEGRADA */}
      <div className="bg-velvet-orchid-50 dark:bg-velvet-orchid-900/50 py-16 px-6 md:px-12 border-t border-velvet-orchid-100 dark:border-velvet-orchid-800">
        <div className="max-w-7xl mx-auto">
          {/* Grid de 4 columnas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

            {/* Columna 1: Logo y descripción */}
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter dark:text-white">
                {!loading && settings?.hero_logo_url ? (
                  <span>Euphoria</span> // O podrías mostrar el logo pequeño aquí
                ) : (
                  'Euphoria'
                )}
              </h2>
              <p className="text-[10px] text-gray-500 dark:text-velvet-orchid-300 uppercase font-bold">
                Massage para caballeros.
              </p>
            </div>

            {/* Columna 2: Navegación */}
            <div>
              <h4 className="font-black uppercase text-xs tracking-[0.3em] mb-6 text-velvet-orchid-500 text-center md:text-left">
                Navegación
              </h4>
              <ul className="space-y-3 text-sm font-bold uppercase dark:text-white text-center md:text-left">
                <li><a href="#inicio" className="hover:text-velvet-orchid-500 transition-colors">Inicio</a></li>
                <li><a href="#nosotros" className="hover:text-velvet-orchid-500 transition-colors">Nosotros</a></li>
                <li><a href="#hostess" className="hover:text-velvet-orchid-500 transition-colors">Hostess</a></li>
                <li><a href="#promociones" className="hover:text-velvet-orchid-500 transition-colors">Promociones</a></li>
                <li><a href="#servicios" className="hover:text-velvet-orchid-500 transition-colors">Servicios</a></li>
              </ul>
            </div>

            {/* Columna 3: Redes Sociales - DINÁMICO */}
            <div>
              <h4 className="font-black uppercase text-xs tracking-[0.3em] mb-6 text-velvet-orchid-500 text-center md:text-left">
                Social
              </h4>
              <div className="flex gap-4 justify-center md:justify-start">
                {instagram !== "#" && (
                  <a
                    href={instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-white dark:bg-velvet-orchid-800 rounded-full text-velvet-orchid-500 hover:bg-velvet-orchid-500 hover:text-white shadow-sm transition-all"
                  >
                    <Instagram size={18} />
                  </a>
                )}
                {facebook !== "#" && (
                  <a
                    href={facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-white dark:bg-velvet-orchid-800 rounded-full text-velvet-orchid-500 hover:bg-velvet-orchid-500 hover:text-white shadow-sm transition-all"
                  >
                    <Facebook size={18} />
                  </a>
                )}
                {/* Si no hay redes configuradas, mostrar placeholders vacíos o mensaje */}
                {instagram === "#" && facebook === "#" && (
                  <p className="text-xs text-gray-400 italic">No hay redes configuradas</p>
                )}
              </div>
            </div>

            {/* Columna 4: Tarjeta de Contacto - DINÁMICA */}
            <div>
              <h4 className="font-black uppercase text-xs tracking-[0.3em] mb-6 text-velvet-orchid-500 text-center md:text-left">
                Contacto
              </h4>

              <div className="flex items-start gap-3">
                <MapPin className="text-velvet-orchid-500 shrink-0" size={18} />
                <p className="text-xs text-gray-600 dark:text-velvet-orchid-200 font-bold uppercase tracking-tight leading-snug">
                  {address}
                </p>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <Phone className="text-velvet-orchid-500 shrink-0" size={18} />
                <p className="text-xs font-black dark:text-white">{phone}</p>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <Mail className="text-velvet-orchid-500 shrink-0" size={18} />
                <p className="text-xs font-bold dark:text-white lowercase truncate">{email}</p>
              </div>

              <button
                // onClick={() => window.open(`https://wa.me/${whatsappNumber}`, '_blank')}
                onClick={openWhatsApp}

                className="w-full mt-6 bg-green-500 hover:bg-green-600 text-white py-3 px-4 font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 active:scale-95 rounded-sm"
              >
                <Send size={14} /> WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* COPYRIGHT */}
      <div className="bg-velvet-orchid-100 dark:bg-velvet-orchid-900 py-6 px-4">
        <div className="text-center text-[10px] text-gray-600 dark:text-velvet-orchid-400 tracking-[0.2em] font-black">
          © {new Date().getFullYear()} Euphoria Masages. Cd. Juárez, Chih.
        </div>
      </div>
    </footer>
  );
};