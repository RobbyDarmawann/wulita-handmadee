"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatus } from "../actions";
import Link from "next/link";
import { ArrowLeft, MapPin, Package, Receipt, Save, Loader2 } from "lucide-react";

export default function OrderDetailClient({ order }: { order: any }) {
  const router = useRouter();
  const [status, setStatus] = useState(order.status);
  const [isUpdating, setIsUpdating] = useState(false);

  const formatRp = (angka: number) => new Intl.NumberFormat('id-ID').format(angka);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    const res = await updateOrderStatus(order.id, status);
    if (res.success) {
      alert("Status pesanan berhasil diperbarui!");
      router.refresh();
    } else {
      alert(res.error);
    }
    setIsUpdating(false);
  };

  return (
    <div className="space-y-8">
      {/* Header navigasi */}
      <div className="flex items-center gap-4">
        <Link href="/admin/pesanan" className="p-3 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Detail Pesanan #ORD-{order.id}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* KOLOM KIRI */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
            <h2 className="font-black text-lg mb-6 flex items-center gap-2 border-b border-gray-100 pb-4"><MapPin className="text-amber-600" /> Informasi Pengiriman</h2>
            <div className="space-y-3">
              <p className="text-sm"><strong className="text-gray-500 w-24 inline-block">Penerima</strong> <span className="font-bold text-gray-900">{order.recipientName}</span></p>
              <p className="text-sm"><strong className="text-gray-500 w-24 inline-block">WhatsApp</strong> <span className="font-bold text-gray-900">{order.phoneNumber}</span></p>
              <p className="text-sm flex"><strong className="text-gray-500 w-24 flex-shrink-0">Alamat</strong> <span className="font-bold text-gray-900 leading-relaxed">{order.shippingAddress || '-'}</span></p>
              <div className="mt-4 pt-4 border-t border-gray-50">
                <span className={`inline-block px-4 py-1.5 text-xs font-black rounded-lg uppercase tracking-widest ${order.deliveryOption === 'diambil' ? 'bg-sky-50 text-sky-700' : 'bg-indigo-50 text-indigo-700'}`}>
                  Metode: {order.deliveryOption}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
            <h2 className="font-black text-lg mb-6 flex items-center gap-2 border-b border-gray-100 pb-4"><Package className="text-amber-600" /> Rincian Barang</h2>
            <div className="space-y-4">
              {order.items.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center text-sm border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="font-bold text-gray-900">{item.productName}</p>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">Varian: {item.variantName || 'Standar'} | Qty: {item.quantity}</p>
                  </div>
                  <span className="font-black text-gray-900">Rp {formatRp(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t-2 border-gray-100 flex justify-between items-center">
              <span className="font-black text-gray-400 uppercase tracking-widest text-xs">Total Pembayaran</span>
              <p className="text-2xl font-black text-amber-900">Rp {formatRp(order.totalPrice)}</p>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 text-center">
            <h2 className="font-black text-lg mb-6 flex items-center justify-center gap-2 border-b border-gray-100 pb-4"><Receipt className="text-amber-600" /> Bukti Transfer</h2>
            
            {order.paymentReceipt ? (
              <div className="group relative">
                <a href={order.paymentReceipt} target="_blank" rel="noreferrer" className="block">
                  {/* Gunakan img biasa karena source dari luar (Supabase) */}
                  <img 
                    src={order.paymentReceipt} 
                    alt="Bukti Transfer" 
                    className="w-full h-80 object-contain bg-gray-50 rounded-2xl border border-gray-200 hover:opacity-90 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center pointer-events-none">
                    <span className="bg-white text-gray-900 text-xs font-black px-4 py-2 rounded-lg uppercase tracking-widest">Lihat Layar Penuh</span>
                  </div>
                </a>
              </div>
            ) : (
              <div className="py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <p className="text-gray-400 font-bold">Belum ada bukti transfer.</p>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-[#F3E5DC]/30 p-8 rounded-[2rem] border border-amber-100">
            <h2 className="font-black text-amber-950 text-lg mb-6">Verifikasi & Update Status</h2>
            <form onSubmit={handleUpdate} className="space-y-6">
              
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)} 
                className="w-full px-5 py-4 bg-white border border-amber-200 rounded-2xl focus:ring-2 focus:ring-amber-500 font-bold text-amber-950 outline-none cursor-pointer shadow-sm"
              >
                <option value="menunggu pembayaran">Menunggu Pembayaran</option>
                <option value="dibayar">Sudah Dibayar (Menunggu Konfirmasi)</option>
                <option value="dikemas">Pesanan Sedang Dikemas</option>
                
                {/* Kondisi opsi pengiriman persis seperti Laravel */}
                {order.deliveryOption === 'diambil' ? (
                  <option value="siap_diambil">Siap Diambil di Toko</option>
                ) : (
                  <option value="sedang_dikirim">Sedang Dikirim (Kurir)</option>
                )}
                
                <option value="pesanan selesai">Pesanan Selesai</option>
              </select>
              
              <button 
                type="submit" 
                disabled={isUpdating}
                className="w-full bg-amber-900 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black active:scale-95 transition-all shadow-xl shadow-amber-900/20 flex items-center justify-center gap-2 disabled:bg-gray-400"
              >
                {isUpdating ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Simpan Perubahan Status</>}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}