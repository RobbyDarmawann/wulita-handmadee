"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Lock, Mail, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = createClient();

  const labelClass = "block text-[#451a03] font-extrabold text-[0.85rem] mb-1.5 uppercase tracking-wider opacity-80";
  const inputClass = "bg-white text-[#451a03] border-2 border-[#e2e8f0] rounded-2xl px-12 py-4 w-full text-base transition-all duration-300 placeholder:text-[#94a3b8] focus:border-amber-500 focus:ring-[4px] focus:ring-amber-500/10 focus:outline-none shadow-inner";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Otentikasi ke Supabase
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (authError) {
        if (authError.message.includes("Email not confirmed")) {
          setError("Email Anda terdaftar tetapi belum dikonfirmasi. Silakan cek kotak masuk email Anda atau matikan fitur 'Confirm Email' di Dashboard Supabase.");
        } else {
          setError("Kredensial yang Anda masukkan tidak cocok dengan data kami.");
        }
        setLoading(false);
      } else if (data?.user) {
        // ========================================================
        // KUNCI PERBAIKAN: CEK ROLE SEBELUM REDIRECT
        // ========================================================
        const userRole = data.user.user_metadata?.role || 'user';

        if (userRole === 'admin') {
          router.push('/admin/dashboard'); // Lempar Admin ke ruang kemudi
        } else {
          router.push('/'); // Lempar User biasa ke beranda
        }
        
        router.refresh(); // Memaksa server memvalidasi session baru dan menjalankan middleware
      }
    } catch (err) {
      setError("Terjadi gangguan koneksi ke server. Silakan coba sesaat lagi.");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center font-sans p-4 overflow-hidden">
      
      {/* BACKGROUND ARTISANAL (Persis Blade) */}
      <div className="fixed inset-0 bg-[#F3E5DC] z-[-1] overflow-hidden flex items-center justify-center">
        <div className="absolute top-0 left-0 w-full h-full opacity-30 bg-[url('/images/pattern.png')] bg-repeat" />
        <svg className="absolute top-10 left-10 w-36 h-36 text-orange-300/40 rotate-12" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 1.5l3.09 6.6 7.11 1.04-5.14 5.23 1.21 7.13L12 18.05l-6.27 3.45 1.21-7.13-5.14-5.23 7.11-1.04L12 1.5z" />
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-lg mx-auto bg-white/95 backdrop-blur-xl p-8 md:p-12 rounded-[3rem] shadow-2xl border border-white my-8">
        
        <div className="text-center space-y-4 mb-10">
          <Link href="/" className="inline-flex items-center gap-2 text-amber-900/50 hover:text-amber-900 font-bold text-xs uppercase tracking-widest transition-all mb-4">
             <ArrowLeft size={14} /> Kembali ke Beranda
          </Link>
          <div className="flex justify-center">
            <div className="bg-[#F3E5DC] p-5 rounded-[2rem] shadow-inner border-[6px] border-white rotate-3">
              <img src="/images/logo.png" alt="Logo Wulita" className="h-12 w-12 object-contain" />
            </div>
          </div>
          
          <div>
            <h1 className="text-3xl font-black text-amber-950 tracking-tight">Selamat Datang</h1>
            <p className="text-sm text-amber-900/60 mt-2 font-medium">Lanjutkan perjalanan Anda di Wulita Handmade.</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 text-red-600 text-xs font-black p-4 rounded-2xl border border-red-100 flex items-center gap-3 animate-shake">
            <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          {/* Email Input */}
          <div className="relative group">
            <label htmlFor="email" className={labelClass}>Email Aktif</label>
            <Mail className="absolute left-4 top-[3.2rem] text-gray-400 group-focus-within:text-amber-600 transition-colors" size={20} />
            <input 
              id="email" 
              name="email" 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              autoFocus 
              autoComplete="email" 
              placeholder="Masukan email Anda" 
              className={inputClass}
            />
          </div>

          {/* Password Input */}
          <div className="relative group">
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="password" className={`${labelClass} !mb-0`}>Kata Sandi</label>
              <Link href="/lupa-password" id="forgot-password" className="text-[11px] font-black text-sky-600 hover:text-sky-800 uppercase tracking-tighter">
                Lupa Sandi?
              </Link>
            </div>
            <Lock className="absolute left-4 top-[3.2rem] text-gray-400 group-focus-within:text-amber-600 transition-colors" size={20} />
            <input 
              id="password" 
              name="password" 
              type={showPassword ? "text" : "password"} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              autoComplete="current-password" 
              placeholder="••••••••" 
              className={inputClass}
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-[3.2rem] text-gray-400 hover:text-amber-600 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-3 mt-2">
            <input 
              id="remember" 
              type="checkbox" 
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-5 h-5 border-2 border-slate-300 rounded-lg text-amber-600 focus:ring-amber-500 cursor-pointer"
            />
            <label htmlFor="remember" className="cursor-pointer text-sm font-bold text-amber-950/70">
              Ingat saya di perangkat ini
            </label>
          </div>

          {/* Submit Button */}
          <div className="mt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-amber-950 hover:bg-black text-white py-5 rounded-2xl font-black text-sm tracking-[0.2em] uppercase transition-all shadow-xl shadow-amber-950/20 hover:-translate-y-1 active:translate-y-0 disabled:opacity-50"
            >
              {loading ? 'Menghubungkan...' : 'Masuk Sekarang'}
            </button>
          </div>
        </form>

        <div className="text-center mt-10 pt-8 border-t border-gray-100">
          <p className="text-sm text-gray-500 font-medium">
            Belum punya akun Wulita?
            <Link href="/register" className="text-amber-900 font-black ml-2 underline decoration-2 underline-offset-4 hover:text-amber-700 transition-colors">
              Daftar Di Sini
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}