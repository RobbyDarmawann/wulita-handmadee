"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updatePassword } from "./actions";
import { ArrowLeft, ShieldCheck, Loader2 } from "lucide-react";

export default function PasswordClient() {
  const router = useRouter();
  const { addToast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUpdating(true);
    
    const formData = new FormData(e.currentTarget);
    const res = await updatePassword(formData);
    
    if (res.success) {
      addToast("✓ Password berhasil diperbarui! Silakan gunakan password baru untuk login.", "success");
      router.push("/dashboard");
    } else {
      addToast(res.error, "error");
    }
    setIsUpdating(false);
  };

  return (
    <>
      <div className="mb-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-amber-700 hover:text-amber-900 mb-6 transition-colors">
          <ArrowLeft size={16} /> Kembali ke Akun Saya
        </Link>
        <h1 className="text-3xl font-black text-gray-900">Keamanan Akun</h1>
        <p className="text-gray-500 mt-2">Pastikan gunakan password yang kuat dan unik.</p>
      </div>

      <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex gap-3 mb-8">
            <ShieldCheck className="text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-900 font-medium">
              Sistem keamanan Wulita ditenagai oleh enkripsi tingkat tinggi. Password kamu tersimpan dengan sangat aman.
            </p>
          </div>

          <div>
            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Password Baru</label>
            <input 
              type="password" 
              name="password" 
              required 
              minLength={6}
              placeholder="Minimal 6 karakter"
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-amber-400 p-4 text-sm font-bold outline-none transition-all" 
            />
          </div>

          <div>
            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Konfirmasi Password Baru</label>
            <input 
              type="password" 
              name="password_confirmation" 
              required 
              placeholder="Ketik ulang password baru"
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-amber-400 p-4 text-sm font-bold outline-none transition-all" 
            />
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={isUpdating}
              className="w-full bg-amber-900 text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-amber-900/20 hover:bg-black transition-all active:scale-95 flex justify-center items-center gap-2 uppercase tracking-widest disabled:bg-gray-400"
            >
              {isUpdating ? <Loader2 className="animate-spin" size={18} /> : "Simpan Password Baru"}
            </button>
          </div>

        </form>
      </div>
    </>
  );
}