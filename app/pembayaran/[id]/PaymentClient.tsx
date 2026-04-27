"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { uploadPaymentReceipt } from "./actions";
import { CheckCircle, Clock, Upload, AlertCircle, Copy, Loader2 } from "lucide-react";

export default function PaymentClient({ order }: { order: any }) {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState("Menghitung...");
  const [isExpired, setIsExpired] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  // Timer 1 Jam (Sinkron dengan logic Laravel)
  useEffect(() => {
    // Menambahkan 1 jam (60 * 60 * 1000 ms) dari waktu pembuatan pesanan
    const expiry = new Date(order.createdAt).getTime() + 60 * 60 * 1000;
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft("00:00:00");
        clearInterval(interval);
      } else {
        const h = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, "0");
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, "0");
        const s = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, "0");
        setTimeLeft(`${h}:${m}:${s}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [order.createdAt]);

  const handleSubmitReceipt = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!file) {
      alert("Pilih file foto bukti transfer terlebih dahulu!");
      return;
    }

    setIsUploading(true);
    
    // Siapkan data untuk dikirim ke Server Action
    const formData = new FormData();
    formData.append("orderId", order.id.toString());
    formData.append("receipt", file);
    
    try {
      // Panggil fungsi Server Action yang sudah kita buat sebelumnya
      const res = await uploadPaymentReceipt(formData);
      
      if (res.success) {
        alert("Bukti pembayaran berhasil dikirim! Silakan tunggu verifikasi admin.");
        router.refresh(); // Memaksa halaman memuat ulang status terbaru dari DB
        // Opsional: Langsung arahkan ke dashboard
        // router.push("/dashboard"); 
      } else {
        alert(res.error || "Gagal mengunggah bukti pembayaran.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Terjadi kesalahan sistem atau gagal terhubung ke server.");
    } finally {
      setIsUploading(false);
    }
  };

  // Tampilan Utama Jika Status Sudah Berubah (Bukan "menunggu pembayaran")
  if (order.status !== "menunggu pembayaran") {
    return (
      <div className="bg-white p-12 rounded-[3rem] text-center shadow-2xl border border-gray-100 max-w-2xl mx-auto">
        <div className="w-24 h-24 bg-green-50 border-4 border-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle size={48} strokeWidth={2.5} />
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Pembayaran Diverifikasi!</h2>
        <p className="text-gray-500 mb-10 leading-relaxed max-w-sm mx-auto font-medium">
          Terima kasih. Bukti transfer Anda sedang kami periksa. Kami akan segera memproses pengiriman pusaka Anda.
        </p>
        <button 
          onClick={() => router.push("/dashboard")} 
          className="bg-amber-900 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-amber-900/20 hover:bg-black transition-all active:scale-95"
        >
          Lihat Riwayat Pesanan
        </button>
      </div>
    );
  }

  // Tampilan Menunggu Pembayaran
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header Timer */}
      <div className={`p-10 rounded-[3rem] text-center text-white shadow-2xl transition-all duration-500 ${isExpired ? "bg-red-600 shadow-red-900/20" : "bg-gradient-to-br from-amber-900 to-amber-950 shadow-amber-900/20"}`}>
        <p className="text-xs font-black uppercase tracking-[0.3em] opacity-70 mb-3">
          {isExpired ? "Pesanan Dibatalkan" : "Batas Waktu Pembayaran"}
        </p>
        <div className="text-6xl md:text-7xl font-black tabular-nums tracking-tighter">
          {timeLeft}
        </div>
        {isExpired && (
          <p className="mt-4 font-bold text-red-100 bg-red-950/30 inline-block px-4 py-2 rounded-xl">
            Waktu Habis! Silakan buat pesanan baru.
          </p>
        )}
      </div>

      <div className="bg-white p-8 md:p-12 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-200/50">
        <div className="text-center mb-10">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Total Tagihan</p>
          <h2 className="text-4xl md:text-5xl font-black text-amber-950">
            Rp {order.totalPrice.toLocaleString("id-ID")}
          </h2>
        </div>

        {/* Instruksi Bayar */}
        <div className="bg-[#FAFAFA] p-6 rounded-[2rem] mb-10 border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-3">
             <div className="w-8 h-8 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center">1</div>
             Transfer ke {order.paymentMethod}
          </h3>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 flex justify-between items-center shadow-sm">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">No. Rekening Wulita</p>
              <p className="text-2xl font-mono font-black text-gray-900 tracking-wider">8901 2345 67</p>
            </div>
            <button type="button" className="p-4 text-amber-700 hover:bg-amber-50 rounded-xl transition-colors border border-transparent hover:border-amber-200">
              <Copy size={24} />
            </button>
          </div>
        </div>

        {/* Form Upload */}
        {!isExpired && (
          <form onSubmit={handleSubmitReceipt} className="space-y-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-3">
               <div className="w-8 h-8 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center">2</div>
               Upload Bukti
            </h3>
            
            <div className={`relative border-2 border-dashed rounded-[2rem] p-12 text-center transition-all group ${file ? 'border-amber-500 bg-amber-50' : 'border-gray-200 bg-gray-50 hover:border-amber-300'}`}>
              <input 
                type="file" 
                accept="image/png, image/jpeg, image/jpg" 
                required 
                onChange={(e) => setFile(e.target.files?.[0] || null)} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
              />
              <div className="space-y-4">
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center transition-colors ${file ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'bg-gray-200 text-gray-400 group-hover:bg-amber-100 group-hover:text-amber-600'}`}>
                  <Upload size={32} />
                </div>
                <div>
                  <p className={`text-sm font-black ${file ? 'text-amber-900' : 'text-gray-600'}`}>
                    {file ? file.name : "Klik atau seret foto ke sini"}
                  </p>
                  {!file && <p className="text-xs text-gray-400 font-medium mt-1">Format JPG atau PNG. Maks 2MB.</p>}
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isUploading} 
              className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
                isUploading 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-amber-900 text-white shadow-xl shadow-amber-900/20 hover:bg-black active:scale-95'
              }`}
            >
              {isUploading ? (
                <><Loader2 className="animate-spin" size={20} /> Mengirim Bukti...</>
              ) : (
                "Kirim Bukti Pembayaran"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}