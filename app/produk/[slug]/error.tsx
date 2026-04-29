'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Product page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-8 md:p-10 text-center">
          <div className="bg-red-50 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 md:w-10 md:h-10 text-red-500" />
          </div>
          
          <h1 className="text-2xl md:text-3xl font-black text-amber-950 mb-2">
            Gagal Memuat Produk
          </h1>
          
          <p className="text-gray-600 text-sm md:text-base mb-8 font-medium">
            Maaf, halaman detail produk tidak bisa dimuat. Silakan coba lagi atau kembali ke halaman utama.
          </p>

          <div className="flex flex-col gap-3 md:gap-4">
            <button
              onClick={() => reset()}
              className="w-full bg-amber-900 hover:bg-black text-white font-black py-3 md:py-4 rounded-xl md:rounded-2xl transition-all shadow-lg uppercase text-xs md:text-sm tracking-widest"
            >
              Coba Lagi
            </button>
            
            <Link
              href="/"
              className="w-full bg-gray-100 hover:bg-gray-200 text-amber-900 font-black py-3 md:py-4 rounded-xl md:rounded-2xl transition-all flex items-center justify-center gap-2 uppercase text-xs md:text-sm tracking-widest"
            >
              <ArrowLeft size={16} className="md:w-[18px] md:h-[18px]" />
              Kembali Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
