"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react'; // Tambahkan icon centang

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: '',
    address: '',
    password: '',
    password_confirmation: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false); // STATE BARU UNTUK NOTIFIKASI
  
  const router = useRouter();
  const supabase = createClient();

  // Kelas Tailwind standar yang mereplikasi CSS kustom Anda
  const inputClass = "bg-white text-[#451a03] border border-[#d6d3d1] rounded-xl px-4 py-2.5 w-full placeholder:text-[#a8a29e] focus:border-[#0284c7] focus:ring-[3px] focus:ring-[#0284c7]/15 focus:outline-none transition-all text-sm";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.password !== formData.password_confirmation) {
      setError("Kata sandi dan ulangi sandi tidak cocok!");
      setLoading(false);
      return;
    }

    // Mendaftarkan user ke Supabase Auth beserta Metadata-nya
    const { error: authError } = await supabase.auth.signUp({
      email: formData.email.trim(),
      password: formData.password,
      options: {
        data: {
          name: formData.name,
          phone_number: formData.phone_number,
          address: formData.address,
          role: 'user', // Set default role sebagai user
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      // TAMPILKAN NOTIFIKASI CUSTOM & REDIRECT OTOMATIS
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000); // Tunggu 3 detik sebelum pindah halaman
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center font-sans overflow-hidden">
      
      {/* NOTIFIKASI TOAST SUCCESS (Pengganti Alert) */}
      {success && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 duration-500 w-[90%] sm:w-auto transition-all">
          <div className="bg-white border-2 border-sky-100 shadow-2xl shadow-sky-900/20 px-6 sm:px-8 py-4 rounded-[2rem] flex items-center gap-4 text-gray-800">
            <div className="bg-sky-500 text-white p-2 rounded-full ring-4 ring-sky-50">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="font-black text-sm tracking-tight leading-none mb-1 text-gray-900">Pendaftaran Berhasil!</p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mengarahkan ke halaman login...</p>
            </div>
          </div>
        </div>
      )}

      {/* BACKGROUND (Persis Blade) */}
      <div className="fixed inset-0 bg-[#F3E5DC] z-[-1] overflow-hidden flex items-center justify-center">
        <svg className="absolute top-10 left-10 w-32 h-32 text-orange-300/50 rotate-12 drop-shadow-sm" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 1.5l3.09 6.6 7.11 1.04-5.14 5.23 1.21 7.13L12 18.05l-6.27 3.45 1.21-7.13-5.14-5.23 7.11-1.04L12 1.5z" strokeLinejoin="round" strokeLinecap="round"/>
        </svg>

        <svg className="absolute -bottom-10 -right-10 w-72 h-72 text-sky-200/60 -rotate-12 drop-shadow-sm" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path fill="currentColor" d="M42.7,-73.4C55.9,-66.1,67.6,-54.9,76.5,-41.7C85.4,-28.5,91.4,-14.2,90.2,-0.7C89,12.8,80.5,25.6,71.2,36.9C61.9,48.2,51.8,58.1,39.6,65.8C27.4,73.5,13.7,79,0.3,78.5C-13.1,78,-26.2,71.5,-37.9,63.4C-49.6,55.3,-59.9,45.5,-67.2,33.9C-74.5,22.3,-78.8,8.8,-76.7,-3.9C-74.5,-16.6,-66,-28.5,-57.1,-39.1C-48.2,-49.7,-38.9,-59,-27.6,-65.7C-16.3,-72.4,-8.1,-76.5,3.3,-82C14.7,-87.5,29.5,-80.7,42.7,-73.4Z" transform="translate(100 100)" />
        </svg>
      </div>

      {/* KOTAK FORM */}
      <div className="relative z-10 w-full max-w-lg mx-auto bg-white/95 backdrop-blur-md p-8 rounded-[2rem] shadow-xl border border-white/60 my-6">
        
        <div className="text-center space-y-4 mb-8">
          <div className="flex justify-center">
            <div className="bg-[#F3E5DC] p-3 rounded-full shadow-inner border-[3px] border-white">
              <img src="/images/logo.png" alt="Logo Wulita" className="h-12 w-12 object-contain" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-black text-amber-950 tracking-tight">Menyelam Bersama Wulita</h1>
            <p className="text-sm text-amber-900/70 mt-1">Buat akunmu dan temukan harta karun pesisir.</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 text-red-600 text-sm font-bold px-4 py-3 rounded-xl border border-red-100 text-center">
            {error}
          </div>
        )}

        {/* Jika Sukses, form di-disable agar tidak diisi lagi */}
        <form onSubmit={handleRegister} className={`flex flex-col gap-5 ${success ? 'opacity-50 pointer-events-none' : ''}`}>
          
          <div className="w-full">
            <label className="block text-[#451a03] font-extrabold text-sm mb-1.5">Nama Penjelajah (Lengkap)</label>
            <input name="name" value={formData.name} onChange={handleChange} type="text" required placeholder="Contoh: Budi Santoso" className={inputClass} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
            <div className="w-full">
              <label className="block text-[#451a03] font-extrabold text-sm mb-1.5">Alamat Email</label>
              <input name="email" value={formData.email} onChange={handleChange} type="email" required placeholder="budi@contoh.com" className={inputClass} />
            </div>
            <div className="w-full">
              <label className="block text-[#451a03] font-extrabold text-sm mb-1.5">Nomor WhatsApp</label>
              <input name="phone_number" value={formData.phone_number} onChange={handleChange} type="tel" required placeholder="0812xxxx" className={inputClass} />
            </div>
          </div>

          <div className="w-full">
            <label className="block text-[#451a03] font-extrabold text-sm mb-1.5">Alamat Pengiriman</label>
            <textarea name="address" value={formData.address} onChange={handleChange} required rows={2} placeholder="Nama jalan, nomor rumah, kota..." className={inputClass} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
            <div className="w-full">
              <label className="block text-[#451a03] font-extrabold text-sm mb-1.5">Kata Sandi</label>
              <input name="password" value={formData.password} onChange={handleChange} type="password" required placeholder="Min 8 karakter" className={inputClass} />
            </div>
            <div className="w-full">
              <label className="block text-[#451a03] font-extrabold text-sm mb-1.5">Ulangi Sandi</label>
              <input name="password_confirmation" value={formData.password_confirmation} onChange={handleChange} type="password" required placeholder="Ulangi sandi" className={inputClass} />
            </div>
          </div>

          <div className="mt-4">
            <button type="submit" disabled={loading || success} className="w-full bg-sky-600 hover:bg-sky-700 text-white py-3.5 rounded-xl font-bold text-sm tracking-wider uppercase transition-all shadow-lg hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-70 disabled:hover:translate-y-0">
              {loading ? 'Menyiapkan Kapal...' : (success ? 'Sukses!' : 'Mulai Petualangan')}
            </button>
          </div>
        </form>

        <div className="text-center mt-8 pt-5 border-t border-gray-100">
          <p className="text-sm text-gray-500 font-medium">
            Sudah berlabuh sebelumnya?
            <Link href="/login" className="text-sky-600 font-bold hover:text-sky-800 ml-1 transition-colors">Masuk Di Sini</Link>
          </p>
        </div>

      </div>
    </div>
  );
}