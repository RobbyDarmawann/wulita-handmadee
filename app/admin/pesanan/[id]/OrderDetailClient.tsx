"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatus } from "../actions";
import Link from "next/link";
import { ArrowLeft, MapPin, Package, Receipt, Save, Loader2, ChevronDown, Check, AlertTriangle } from "lucide-react";

export default function OrderDetailClient({ order }: { order: any }) {
  const router = useRouter();
  const [status, setStatus] = useState(order.status);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

  // List Opsi Status (Termasuk fitur baru: Ditolak/Batal)
  const statusOptions = [
    { value: "menunggu pembayaran", label: "Menunggu Pembayaran", color: "text-gray-600 bg-gray-50 border-gray-200" },
    { value: "dibayar", label: "Sudah Dibayar (Verifikasi)", color: "text-blue-700 bg-blue-50 border-blue-200" },
    { value: "dikemas", label: "Pesanan Dikemas", color: "text-purple-700 bg-purple-50 border-purple-200" },
    ...(order.deliveryOption === 'diambil' 
      ? [{ value: "siap_diambil", label: "Siap Diambil di Toko", color: "text-sky-700 bg-sky-50 border-sky-200" }]
      : [{ value: "sedang_dikirim", label: "Sedang Dikirim (Kurir)", color: "text-indigo-700 bg-indigo-50 border-indigo-200" }]),
    { value: "pesanan selesai", label: "Pesanan Selesai", color: "text-green-700 bg-green-50 border-green-200" },
    { value: "dibatalkan", label: "Dibatalkan Pembeli", color: "text-red-700 bg-red-50 border-red-200" },
    { value: "pembayaran ditolak", label: "Pembayaran Ditolak Admin", color: "text-red-700 bg-red-50 border-red-200" },
  ];

  const activeOption = statusOptions.find(opt => opt.value === status) || statusOptions[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header navigasi */}
      <div className="flex items-center gap-4">
        <Link href="/admin/pesanan" className="p-3 bg-white border-2 border-amber-100 rounded-full hover:bg-amber-50 transition-colors group">
          <ArrowLeft size={20} className="text-amber-900/60 group-hover:text-amber-900 group-hover:-translate-x-1 transition-all" />
        </Link>
        <h1 className="text-3xl font-black text-amber-950 tracking-tight">Detail #ORD-{order.id}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* KOLOM KIRI */}
        <div className="space-y-8">
          {/* Info Pengiriman */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-amber-100/50">
            <h2 className="font-black text-lg mb-6 flex items-center gap-3 border-b border-amber-100/50 pb-4 text-amber-950">
              <div className="p-2 bg-amber-50 rounded-xl"><MapPin className="text-amber-600" size={20} /></div> Informasi Ekspedisi
            </h2>
            <div className="space-y-4">
              <p className="text-sm"><strong className="text-amber-900/50 w-24 inline-block tracking-wide">Penerima</strong> <span className="font-bold text-amber-950">{order.recipientName}</span></p>
              <p className="text-sm"><strong className="text-amber-900/50 w-24 inline-block tracking-wide">WhatsApp</strong> <span className="font-bold text-amber-950">{order.phoneNumber}</span></p>
              <p className="text-sm flex"><strong className="text-amber-900/50 w-24 flex-shrink-0 tracking-wide">Alamat</strong> <span className="font-bold text-amber-950 leading-relaxed">{order.shippingAddress || '-'}</span></p>
              
              {order.customerNotes && (
                <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100/50 mt-2">
                   <p className="text-xs font-black text-amber-900/40 uppercase tracking-widest mb-1">Catatan Pembeli</p>
                   <p className="text-sm font-medium text-amber-900 italic">"{order.customerNotes}"</p>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-amber-50">
                <span className={`inline-block px-4 py-1.5 text-[10px] font-black rounded-lg uppercase tracking-[0.2em] border ${order.deliveryOption === 'diambil' ? 'bg-sky-50 text-sky-700 border-sky-100' : 'bg-indigo-50 text-indigo-700 border-indigo-100'}`}>
                  Metode: {order.deliveryOption}
                </span>
              </div>
            </div>
          </div>

          {/* Rincian Barang */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-amber-100/50">
            <h2 className="font-black text-lg mb-6 flex items-center gap-3 border-b border-amber-100/50 pb-4 text-amber-950">
               <div className="p-2 bg-amber-50 rounded-xl"><Package className="text-amber-600" size={20} /></div> Muatan Pesanan
            </h2>
            <div className="space-y-4">
              {order.items.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center text-sm border-b border-amber-50 pb-4 last:border-0 last:pb-0 group">
                  <div>
                    <p className="font-bold text-amber-950 group-hover:text-amber-700 transition-colors">{item.productName}</p>
                    <p className="text-[11px] text-amber-900/50 font-bold mt-1 uppercase tracking-wider">Varian: <span className="text-amber-900/80">{item.variantName || 'Standar'}</span> | Qty: <span className="text-amber-900/80">{item.quantity}</span></p>
                  </div>
                  <span className="font-black text-amber-950">Rp {formatRp(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            
            {/* Rincian Biaya (Termasuk Ongkir & Poin) */}
            <div className="mt-6 pt-6 border-t-2 border-dashed border-amber-100/80 space-y-2">
               <div className="flex justify-between items-center text-xs font-bold text-amber-900/60">
                 <span>Subtotal Barang</span>
                 <span>Rp {formatRp(order.totalPrice - order.shippingCost + (order.pointsUsed * 10))}</span>
               </div>
               <div className="flex justify-between items-center text-xs font-bold text-amber-900/60">
                 <span>Ongkos Kirim</span>
                 <span>Rp {formatRp(order.shippingCost)}</span>
               </div>
               {order.pointsUsed > 0 && (
                 <div className="flex justify-between items-center text-xs font-black text-green-600">
                   <span>Potongan Poin ({order.pointsUsed} pts)</span>
                   <span>- Rp {formatRp(order.pointsUsed * 10)}</span>
                 </div>
               )}
               <div className="flex justify-between items-center pt-4 mt-2 border-t border-amber-100/50">
                <span className="font-black text-amber-900/50 uppercase tracking-widest text-[10px]">Total Tagihan</span>
                <p className="text-3xl font-black text-amber-950 tracking-tighter">Rp {formatRp(order.totalPrice)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN */}
        <div className="space-y-8">
          {/* Bukti Transfer */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-amber-100/50 text-center relative z-10">
            <h2 className="font-black text-lg mb-6 flex items-center justify-center gap-3 border-b border-amber-100/50 pb-4 text-amber-950">
               <div className="p-2 bg-amber-50 rounded-xl"><Receipt className="text-amber-600" size={20} /></div> Bukti Transaksi
            </h2>
            
            {order.paymentReceipt ? (
              <div className="group relative">
                <a href={order.paymentReceipt} target="_blank" rel="noreferrer" className="block">
                  <img 
                    src={order.paymentReceipt} 
                    alt="Bukti Transfer" 
                    className="w-full h-80 object-cover object-top bg-amber-50/30 rounded-[1.5rem] border-2 border-amber-100 hover:border-amber-400 transition-all shadow-inner"
                  />
                  <div className="absolute inset-0 bg-amber-950/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-[1.5rem] flex items-center justify-center backdrop-blur-sm">
                    <span className="bg-white text-amber-950 text-[10px] font-black px-5 py-3 rounded-xl uppercase tracking-[0.2em] shadow-2xl scale-95 group-hover:scale-100 transition-transform">Lihat Penuh</span>
                  </div>
                </a>
              </div>
            ) : (
              <div className="py-24 bg-amber-50/30 rounded-[1.5rem] border-2 border-dashed border-amber-200 shadow-inner">
                <p className="text-amber-900/40 font-bold uppercase tracking-widest text-xs">Belum Ada Bukti</p>
              </div>
            )}
          </div>

          {/* Form Update Status */}
          <div className="bg-gradient-to-br from-amber-50 to-[#F3E5DC]/50 p-8 rounded-[2.5rem] border-2 border-white shadow-xl shadow-amber-900/5 relative z-20">
            <h2 className="font-black text-amber-950 text-xl mb-6 tracking-tight flex items-center justify-between">
              Update Status Pesanan
              {['dibatalkan', 'pembayaran ditolak'].includes(status) && (
                <span className="bg-red-100 text-red-600 text-[9px] font-black px-2 py-1 rounded uppercase tracking-wider flex items-center gap-1 animate-pulse"><AlertTriangle size={12}/> Stok Akan Kembali</span>
              )}
            </h2>
            
            <form onSubmit={handleUpdate} className="space-y-6">
              
              {/* ========================================= */}
              {/* CUSTOM DROPDOWN: STATUS PESANAN */}
              {/* ========================================= */}
              <div className="relative">
                <label className="block text-[10px] font-black text-amber-900/50 uppercase tracking-widest mb-2">Ubah Menjadi</label>
                
                <div 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`w-full py-4 px-5 bg-white border-2 rounded-[1.25rem] cursor-pointer flex justify-between items-center transition-all ${isDropdownOpen ? 'border-amber-400 ring-[4px] ring-amber-500/10' : 'border-amber-100/80 hover:border-amber-300'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full ${activeOption.color.split(' ')[1]}`}></span>
                    <span className="font-bold text-amber-950 text-sm truncate">{activeOption.label}</span>
                  </div>
                  <ChevronDown size={20} className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-amber-600' : 'text-amber-900/40'}`} />
                </div>

                {isDropdownOpen && <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)}></div>}

                {isDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-[1.25rem] border border-amber-100 shadow-2xl shadow-amber-900/20 overflow-hidden z-30 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="max-h-72 overflow-y-auto custom-scrollbar p-2">
                      {statusOptions.map((opt) => (
                        <div 
                          key={opt.value}
                          onClick={() => { setStatus(opt.value); setIsDropdownOpen(false); }}
                          className={`px-4 py-3.5 cursor-pointer rounded-xl flex justify-between items-center transition-all mb-1 last:mb-0 ${status === opt.value ? 'bg-amber-50' : 'hover:bg-gray-50'}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider border ${opt.color}`}>
                              {opt.value.split(' ')[0]}
                            </span>
                            <span className={`text-sm font-bold ${status === opt.value ? 'text-amber-950' : 'text-gray-600'}`}>
                              {opt.label}
                            </span>
                          </div>
                          {status === opt.value && <Check size={16} className="text-amber-600" />}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <button 
                type="submit" 
                disabled={isUpdating || status === order.status}
                className="w-full bg-amber-950 text-white py-5 rounded-[1.25rem] font-black uppercase text-xs tracking-[0.2em] hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-900/20 active:translate-y-0 transition-all flex items-center justify-center gap-3 disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none disabled:transform-none disabled:cursor-not-allowed"
              >
                {isUpdating ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Terapkan Status</>}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}