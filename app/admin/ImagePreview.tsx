"use client";

import { useState, useEffect } from "react";
import { ImageIcon, X } from "lucide-react";
import Image from "next/image";

interface ImagePreviewProps {
  name: string;
  defaultValue?: string | null;
}

export default function ImagePreview({ name, defaultValue }: ImagePreviewProps) {
  // --- LOGIKA PENGAMAN AWAL ---
  // Memastikan jika defaultValue adalah string kosong "", maka dianggap null
  const initialValue = defaultValue && defaultValue.trim() !== "" ? defaultValue : null;
  const [preview, setPreview] = useState<string | null>(initialValue);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Membersihkan URL lama dari memori jika ada (Good practice)
      if (preview?.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
      
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
    }
  };

  // Helper untuk menentukan Source Gambar yang aman
  const getSafeSrc = (src: string) => {
    if (src.startsWith('blob:') || src.startsWith('http')) return src;
    // Memastikan path dari database diawali dengan /
    return src.startsWith('/') ? src : `/${src}`;
  };

  return (
    <div className="mt-2">
      <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-gray-200 rounded-[2rem] cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all overflow-hidden relative group">
        {preview ? (
          <>
            {/* Menggunakan Image Next.js dengan validasi path */}
            <Image 
              src={getSafeSrc(preview)} 
              alt="Preview" 
              fill
              unoptimized
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 z-10">
              <ImageIcon size={24} className="text-white" />
              <p className="text-white text-[10px] font-black uppercase tracking-widest">Ganti Gambar</p>
            </div>
            
            {/* Tombol Hapus Preview (Tambahan) */}
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setPreview(null);
              }}
              className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm text-red-500 rounded-full z-20 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={16} />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-400">
            <ImageIcon size={28} className="mb-2" />
            <p className="text-[10px] font-black uppercase tracking-widest">Pilih Foto Utama</p>
          </div>
        )}
        <input 
          name={name} 
          type="file" 
          className="hidden" 
          accept="image/*" 
          onChange={handleImageChange} 
        />
      </label>
      
      {preview && (
        <p className="text-[9px] text-amber-600 font-bold mt-2 uppercase text-center tracking-tighter italic">
          * Visual pusaka siap diperbarui
        </p>
      )}
    </div>
  );
}