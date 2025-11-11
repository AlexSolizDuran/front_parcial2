import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true, // Esto ya lo tenías

  // --- AÑADE ESTO ---
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**', // Permite cualquier ruta dentro de ese hostname
      },
    ],
  },
  // --- FIN DE LA ADICIÓN ---
};

export default nextConfig;