"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateProfile } from "./actions";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

export default function EditProfileClient({ user }: { user: any }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  // KUNCI PERBAIKAN: Mengikat data ke State agar otomatis terisi dan bisa diedit
  const [inputName, setInputName] = useState(user?.name || "");
  const [inputPhone, setInputPhone] = useState(user?.phone_number || user?.phone || "");
  const [inputAddress, setInputAddress] = useState(user?.address || "");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Gunakan nilai dari state yang sudah diedit
    const formData = new FormData();
    formData.append("name", inputName);
    formData.append("phone", inputPhone);
    formData.append("address", inputAddress);
    
    const res = await updateProfile(formData);
    
    if (res.success) {
      alert("Profil berhasil diperbarui!");
      router.push("/dashboard");
      router.refresh(); // Memaksa update data terbaru
    } else {
      alert(res.error);
    }
    setIsSaving(false);
  };

  return (
    <>
      <div className="mb-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-amber-700 hover:text-amber-900 mb-6 transition-colors">
          <ArrowLeft size={16} /> Kembali ke Akun Saya
        </Link>
        <h1 className="text-3xl font-black text-gray-900">Edit Profil</h1>
        <p className="text-gray-500 mt-2">Perbarui data diri dan alamat pengirimanmu.</p>
      </div>

      <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Alamat Email</label>
            <input 
              type="email" 
              value={user?.email || ""} 
              disabled 
              className="w-full rounded-2xl border-transparent bg-gray-100 text-gray-500 text-sm font-bold px-5 py-4 cursor-not-allowed outline-none" 
            />
            <p className="text-[10px] text-amber-600 font-bold mt-2 px-1">*Email digunakan untuk login dan tidak dapat diubah.</p>
          </div>

          <div>
            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Nama Lengkap</label>
            <input 
              type="text" 
              name="name" 
              value={inputName} 
              onChange={(e) => setInputName(e.target.value)}
              required
              className="w-full rounded-2xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-amber-400 text-sm font-bold text-gray-900 transition-all px-5 py-4 outline-none" 
            />
          </div>

          <div>
            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Nomor WhatsApp / HP</label>
            <input 
              type="text" 
              name="phone" 
              value={inputPhone} 
              onChange={(e) => setInputPhone(e.target.value)}
              placeholder="Contoh: 081234567890"
              className="w-full rounded-2xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-amber-400 text-sm font-bold text-gray-900 transition-all px-5 py-4 outline-none" 
            />
          </div>

          <div>
            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Alamat Lengkap Pengiriman</label>
            <textarea 
              name="address" 
              rows={4} 
              placeholder="Nama Jalan, RT/RW, Kelurahan, Kecamatan, Kota, Provinsi, Kode Pos"
              value={inputAddress}
              onChange={(e) => setInputAddress(e.target.value)}
              className="w-full rounded-2xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-amber-400 text-sm font-bold text-gray-900 transition-all px-5 py-4 outline-none resize-none leading-relaxed"
            ></textarea>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={isSaving}
              className="w-full bg-amber-900 text-white py-4 rounded-2xl font-black text-sm hover:bg-black transition-all shadow-xl shadow-amber-900/20 active:scale-[0.98] uppercase tracking-widest flex justify-center items-center gap-2 disabled:bg-gray-400"
            >
              {isSaving ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Simpan Perubahan</>}
            </button>
          </div>

        </form>
      </section>
    </>
  );
}