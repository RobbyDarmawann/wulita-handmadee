// FILE: app/admin/pesanan/[id]/OrderDetailClient.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatus } from "../actions";
import Link from "next/link";
import { ArrowLeft, MapPin, Package, Receipt, Save, Loader2, ChevronDown, Check, AlertTriangle, CheckCircle2, X } from "lucide-react";

export default function OrderDetailClient({ order }: { order: any }) {
  const router = useRouter();
  const [status, setStatus] = useState(order.status);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const [toast, setToast] = useState<{ show: boolean, message: string, type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast({ ...toast, show: false }), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const formatRp = (angka: number) => new Intl.NumberFormat('id-ID').format(angka);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setIsDropdownOpen(false); 
    
    const res = await updateOrderStatus(order.id, status);
    
    if (res.success) {
      setToast({ show: true, message: "Pembaruan berhasil! Notifikasi WhatsApp telah dijadwalkan.", type: 'success' });
      router.refresh();
    } else {
      setToast({ show: true, message: res.error || "Gagal memperbarui status.", type: 'error' });
    }
    
    setIsUpdating(false);
  };

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
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      
      {toast.show && (
        <div className={`fixed top-8 right-8 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-top-10 fade-in duration-300 border ${toast.type === 'success' ? 'bg-amber-50 text-amber-900 border-amber-200' : 'bg-red-50 text-red-900 border-red-200'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="text-amber-600" size={24} /> : <AlertTriangle className="text-red-600" size={24} />}
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Status Sistem</span>
            <span className="text-sm font-bold">{toast.message}</span>
          </div>
          <button onClick={() => setToast({ ...toast, show: false })} className="ml-4 p-1 rounded-full hover:bg-black/5 transition-colors">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex items-center gap-4 relative z-10">
        <Link href="/admin/pesanan" className="p-3 bg-white border-2 border-amber-100 rounded-full hover:bg-amber-50 transition-colors group shadow-sm">
          <ArrowLeft size={20} className="text-amber-900/60 group-hover:text-amber-900 group-hover:-translate-x-1 transition-all" />
        </Link>
        <h1 className="text-3xl font-black text-amber-950 tracking-tight">Detail #ORD-{order.id}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-amber-900/5 border border-amber-100/50 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-50/50" />
            <h2 className="font-black text-lg mb-6 flex items-center gap-3 border-b border-amber-100/50 pb-4 text-amber-950 relative z-10">
              <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl shadow-inner"><MapPin size={20} /></div> Informasi Ekspedisi
            </h2>
            <div className="space-y-4 relative z-10">
              <p className="text-sm flex items-center"><strong className="text-amber-900/50 w-28 text-[10px] uppercase tracking-widest font-black">Penerima</strong> <span className="font-bold text-amber-950 text-base">{order.recipientName}</span></p>
              <p className="text-sm flex items-center"><strong className="text-amber-900/50 w-28 text-[10px] uppercase tracking-widest font-black">WhatsApp</strong> <span className="font-bold text-amber-950 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">{order.phoneNumber}</span></p>
              <div className="text-sm flex items-start mt-2 pt-2"><strong className="text-amber-900/50 w-28 text-[10px] uppercase tracking-widest font-black pt-1">Alamat</strong> <span className="font-bold text-amber-950 leading-relaxed flex-1">{order.shippingAddress || '-'}</span></div>
              
              {order.customerNotes && (
                <div className="bg-amber-50/80 p-5 rounded-[1.5rem] border border-amber-200 mt-4 shadow-inner">
                   <p className="text-[10px] font-black text-amber-900/40 uppercase tracking-[0.2em] mb-1.5">Catatan Pembeli</p>
                   <p className="text-sm font-bold text-amber-950 italic border-l-2 border-amber-400 pl-3">"{order.customerNotes}"</p>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-amber-100/50 flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-900/50">Metode Diinginkan</span>
                <span className={`inline-block px-4 py-2 text-[10px] font-black rounded-xl uppercase tracking-[0.2em] border shadow-sm ${order.deliveryOption === 'diambil' ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200'}`}>
                  {order.deliveryOption}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-amber-900/5 border border-amber-100/50">
            <h2 className="font-black text-lg mb-6 flex items-center gap-3 border-b border-amber-100/50 pb-4 text-amber-950">
               <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl shadow-inner"><Package size={20} /></div> Muatan Pesanan
            </h2>
            <div className="space-y-4">
              {order.items.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center text-sm border-b border-amber-50 pb-4 last:border-0 last:pb-0 group">
                  <div>
                    <p className="font-bold text-amber-950 group-hover:text-amber-700 transition-colors">{item.productName}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[9px] font-black bg-gray-100 text-gray-500 px-2 py-0.5 rounded uppercase tracking-wider border border-gray-200">{item.variantName || 'Standar'}</span>
                      <span className="text-[10px] font-bold text-amber-900/60">x{item.quantity}</span>
                    </div>
                  </div>
                  <span className="font-black text-amber-950">Rp {formatRp(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t-2 border-dashed border-amber-100/80 space-y-3">
               <div className="flex justify-between items-center text-xs font-bold text-amber-900/60">
                 <span>Subtotal Barang</span>
                 <span>Rp {formatRp(order.totalPrice - order.shippingCost + (order.pointsUsed * 10))}</span>
               </div>
               <div className="flex justify-between items-center text-xs font-bold text-amber-900/60">
                 <span>Ongkos Kirim</span>
                 <span>Rp {formatRp(order.shippingCost)}</span>
               </div>
               {order.pointsUsed > 0 && (
                 <div className="flex justify-between items-center text-xs font-black text-green-600 bg-green-50 p-2 rounded-lg border border-green-100">
                   <span>Potongan Rewards ({order.pointsUsed} pts)</span>
                   <span>- Rp {formatRp(order.pointsUsed * 10)}</span>
                 </div>
               )}
               <div className="flex justify-between items-center pt-5 mt-3 border-t border-amber-100/50">
                <span className="font-black text-amber-900/50 uppercase tracking-[0.2em] text-[10px]">Total Tagihan</span>
                <p className="text-3xl font-black text-amber-950 tracking-tighter">Rp {formatRp(order.totalPrice)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-amber-900/5 border border-amber-100/50 text-center relative z-10">
            <h2 className="font-black text-lg mb-6 flex items-center justify-center gap-3 border-b border-amber-100/50 pb-4 text-amber-950">
               <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl shadow-inner"><Receipt size={20} /></div> Bukti Transaksi
            </h2>
            
            {order.paymentReceipt ? (
              <div className="group relative">
                <a href={order.paymentReceipt} target="_blank" rel="noreferrer" className="block">
                  <img 
                    src={order.paymentReceipt} 
                    alt="Bukti Transfer" 
                    className="w-full h-80 object-cover object-top bg-amber-50/30 rounded-[1.5rem] border-2 border-amber-200 hover:border-amber-400 transition-all shadow-inner"
                  />
                  <div className="absolute inset-0 bg-amber-950/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-[1.5rem] flex items-center justify-center backdrop-blur-sm">
                    <span className="bg-white text-amber-950 text-[10px] font-black px-6 py-3 rounded-xl uppercase tracking-[0.2em] shadow-2xl scale-95 group-hover:scale-100 transition-transform">🔍 Buka Layar Penuh</span>
                  </div>
                </a>
              </div>
            ) : (
              <div className="py-24 bg-amber-50/30 rounded-[2rem] border-2 border-dashed border-amber-200 shadow-inner flex flex-col items-center justify-center">
                <Receipt className="text-amber-200 mb-3" size={40} />
                <p className="text-amber-900/40 font-bold uppercase tracking-[0.2em] text-[10px]">Belum Ada Bukti</p>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-[#F3E5DC]/50 p-8 rounded-[2.5rem] border-2 border-white shadow-2xl shadow-amber-900/10 relative z-20">
            <h2 className="font-black text-amber-950 text-xl mb-6 tracking-tight flex flex-col gap-2">
              Pengaturan Status
              {['dibatalkan', 'pembayaran ditolak'].includes(status) && (
                <span className="bg-red-100 text-red-600 text-[9px] font-black px-3 py-1.5 rounded-lg border border-red-200 uppercase tracking-wider flex items-center gap-1.5 self-start animate-pulse"><AlertTriangle size={12}/> Info: Stok akan otomatis dikembalikan ke Palka</span>
              )}
            </h2>
            
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="relative">
                <label className="block text-[10px] font-black text-amber-900/50 uppercase tracking-[0.2em] mb-2.5">Ubah Status Menjadi</label>
                
                <div 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`w-full py-4 px-5 bg-white border-2 rounded-[1.25rem] cursor-pointer flex justify-between items-center transition-all shadow-sm ${isDropdownOpen ? 'border-amber-400 ring-[4px] ring-amber-500/10' : 'border-amber-100/80 hover:border-amber-300'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-3.5 h-3.5 rounded-full shadow-inner ${activeOption.color.split(' ')[1]}`}></span>
                    <span className="font-bold text-amber-950 text-sm truncate">{activeOption.label}</span>
                  </div>
                  {/* Ikon panah diputar balik saat drop-up */}
                  <ChevronDown size={20} className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-0 text-amber-600' : 'rotate-180 text-amber-900/40'}`} />
                </div>

                {isDropdownOpen && <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)}></div>}

                {/* PERBAIKAN: "bottom-full mb-2" BIKIN DIA BUKA KE ATAS! */}
                {isDropdownOpen && (
                  <div className="absolute bottom-full left-0 mb-2 w-full bg-white rounded-[1.25rem] border border-amber-100 shadow-[0_-15px_40px_rgba(120,53,15,0.15)] overflow-hidden z-30 animate-in fade-in slide-in-from-bottom-2 duration-200 origin-bottom">
                    <div className="max-h-72 overflow-y-auto custom-scrollbar p-2">
                      {statusOptions.map((opt) => (
                        <div 
                          key={opt.value}
                          onClick={() => { setStatus(opt.value); setIsDropdownOpen(false); }}
                          className={`px-4 py-3.5 cursor-pointer rounded-xl flex justify-between items-center transition-all mb-1 last:mb-0 ${status === opt.value ? 'bg-amber-50' : 'hover:bg-gray-50'}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${opt.color}`}>
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
                {isUpdating ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Terapkan & Kirim Notifikasi</>}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}