// components/HostMarquee.jsx
import { motion } from 'framer-motion';

export default function HostMarquee({ hosts }) {
  return (
    <div className="overflow-hidden whitespace-nowrap bg-velvet-orchid-900 py-10 dark:bg-black">
      <motion.div
        className="flex gap-8"
        animate={{ x:["0%", "-100%"] }}
        transition={{ repeat: Infinity, ease: "linear", duration: 25 }} // Velocidad del movimiento
      >
        {/* Duplicamos el array para crear el efecto infinito */}
        {[...hosts, ...hosts].map((host, index) => (
          <div 
            key={index} 
            className="inline-block relative w-64 h-96 rounded-xl overflow-hidden cursor-pointer group hover:scale-105 transition-transform"
            onClick={() => openHostGallery(host.id)} // Función para abrir el modal con sus 10 fotos y 3 videos
          >
            <img src={host.cover_image} alt={host.nickname} className="w-full h-full object-cover" />
            <div className="absolute bottom-0 inset-x-0 bg-linear-to-t from-black to-transparent p-4">
              <h3 className="text-velvet-orchid-100 text-xl font-bold">{host.nickname}</h3>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}