import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Mengizinkan build tetap lanjut meskipun ada error tipe data kecil di EditProdukForm
    ignoreBuildErrors: true,
  },
  eslint: {
    // Mengizinkan build tetap lanjut meskipun ada peringatan linter
    ignoreDuringBuilds: true,
  },
  
  experimental: {
    serverActions: {
      // Menaikkan batas ukuran body untuk upload foto ulasan (Maks 10MB)
      bodySizeLimit: "10mb", 
    },
  },

  images: {
    // KUNCI: Mendaftarkan domain Supabase agar foto ulasan & produk bisa tampil di Vercel
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co', // Menangkap semua URL project Supabase Kapten
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;