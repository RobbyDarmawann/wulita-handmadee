"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PackageX, ChevronDown, ImageIcon, CreditCard, Star, Clock, Truck, Store, Info } from "lucide-react";
import { resolveImageUrl } from '@/lib/image';

export default function PesananClient({ orders }: { orders: any[] }) {
  const router = useRouter();
  
  // State untuk melacak ID pesanan mana yang sedang dibuka rinciannya
  const [openDetailId, setOpenDetailId] = useState<number | null>(null);

  const formatRp = (angka: number) => new Intl.NumberFormat('id-ID').format(angka);
  const formatDate = (date: string) => new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const getStatusStyle = (status: string) => {
    const styles: Record<string, string> = {
      'menunggu pembayaran': 'bg-gray-100 text-gray-800 border-gray-200',
      'dibayar': 'bg-blue-100 text-blue-800 border-blue-200',
      'dikemas': 'bg-purple-100 text-purple-800 border-purple-200',
      'sedang_dikirim': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'siap_diambil': 'bg-sky-100 text-sky-800 border-sky-300 shadow-sm animate-pulse',
      'pesanan selesai': 'bg-green-100 text-green-800 border-green-200',
    };
    return styles[status.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getProgressPercentage = (status: string) => {
    const progress: Record<string, number> = {
      'menunggu pembayaran': 10,
      'dibayar': 30,
      'dikemas': 50,
      'sedang_dikirim': 80,
      'siap_diambil': 90,
      'pesanan selesai': 100,
    };
    return progress[status.toLowerCase()] || 10;
  };

  const toggleDetail = (id: number) => {
    setOpenDetailId(openDetailId === id ? null : id);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Pesanan Saya</h1>
          <p className="text-gray-500 font-medium">Pantau status kerajinan tangan pesananmu di sini.</p>
        </div>
        <button onClick={handleLogout} className="text-sm font-bold text-red-500 hover:text-red-700 transition-colors self-start md:self-auto bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl">
          Keluar Akun
        </button>
      </div>

      {orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order) => {
            const isDetailOpen = openDetailId === order.id;
            const progress = getProgressPercentage(order.status);
            
            return (
              <div key={order.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300">
                
                {/* BAGIAN ATAS CARD */}
                <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between gap-6">
                  
                  <div className="space-y-4 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-xs font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-lg">#ORDER-{order.id}</span>
                      <span className={`px-3 py-1.5 text-[10px] font-black rounded-full border uppercase tracking-wider ${getStatusStyle(order.status)}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-black text-2xl text-gray-900 tracking-tight">Total Tagihan: Rp {formatRp(order.totalPrice)}</h3>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5 font-medium"><Clock size={14} /> Dipesan pada {formatDate(order.createdAt)}</p>
                    </div>
                  </div>

                  {/* PESAN STATUS & TOMBOL AKSI UTAMA */}
                  <div className="flex flex-col justify-center min-w-[200px]">
                    {order.status === 'menunggu pembayaran' ? (
                      <Link href={`/pembayaran/${order.id}`} className="w-full bg-amber-900 text-white px-8 py-3.5 rounded-2xl font-black text-sm text-center hover:bg-black transition-all shadow-xl shadow-amber-900/20 active:scale-95 flex items-center justify-center gap-2">
                        <CreditCard size={18} /> Bayar Sekarang
                      </Link>
                    ) : order.status === 'pesanan selesai' ? (
                      <Link href={`/ulasan/tambah/${order.id}`} className="w-full bg-green-600 text-white px-8 py-3.5 rounded-2xl font-black text-sm text-center hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 active:scale-95 flex items-center justify-center gap-2">
                        <Star size={18} /> Beri Ulasan
                      </Link>
                    ) : order.status === 'siap_diambil' ? (
                      <div className="flex flex-col items-start md:items-end text-left md:text-right bg-sky-50 p-4 rounded-2xl border border-sky-100">
                        <span className="text-xs text-gray-400 font-bold mb-1 flex items-center gap-1"><Store size={14} /> Ambil Sendiri</span>
                        <span className="text-sky-700 font-black text-sm leading-tight">Pesananmu sudah siap! Yuk ambil ke toko 🎁</span>
                      </div>
                    ) : order.status === 'sedang_dikirim' ? (
                      <div className="flex flex-col items-start md:items-end text-left md:text-right bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                        <span className="text-xs text-gray-400 font-bold mb-1 flex items-center gap-1"><Truck size={14} /> Kurir ({order.deliveryOption})</span>
                        <span className="text-indigo-700 font-black text-sm leading-tight">Pesananmu sedang dalam perjalanan 🚚</span>
                        {order.resi && <span className="mt-2 text-[10px] font-black bg-white px-2 py-1 rounded-md text-indigo-900">Resi: {order.resi}</span>}
                      </div>
                    ) : (
                      <div className="flex flex-col items-start md:items-end text-left md:text-right bg-amber-50 p-4 rounded-2xl border border-amber-100">
                        <span className="text-xs text-amber-700/60 font-bold mb-1 uppercase tracking-widest flex items-center gap-1"><Info size={14} /> Proses</span>
                        <span className="text-amber-900 font-black text-sm">Pesanan sedang kami siapkan ✨</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* TOMBOL TOGGLE DETAIL (ACCORDION) */}
                <div className="px-6 md:px-8 pb-4">
                  <button onClick={() => toggleDetail(order.id)} className="w-full py-3 bg-gray-50 hover:bg-amber-50 text-gray-600 hover:text-amber-800 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-gray-100 hover:border-amber-200">
                    <span>{isDetailOpen ? 'Tutup Rincian' : 'Lihat Produk yang Dibeli'}</span>
                    <ChevronDown size={16} className={`transition-transform duration-300 ${isDetailOpen ? 'rotate-180 text-amber-600' : ''}`} />
                  </button>
                </div>

                {/* AREA DETAIL (TERSEMBUNYI SECARA DEFAULT) */}
                <div className={`transition-all duration-500 overflow-hidden ${isDetailOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="bg-white border-t border-gray-100">
                    <div className="px-6 md:px-8 py-6">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Daftar Barang</h4>
                      
                      <div className="space-y-4">
                        {order.items.map((item: any) => (
                          <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-gray-50 pb-4 last:border-0 last:pb-0 gap-4">
                            <div className="flex items-center gap-4">
                              {/* Gambar Produk */}
                              {item.product?.image ? (
                                <img src={resolveImageUrl(item.product.image, "products") || "/images/placeholder.png"} alt={item.productName} className="w-14 h-14 rounded-xl object-cover border border-gray-100 shadow-sm flex-shrink-0" />
                              ) : (
                                <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center text-gray-300 border border-gray-100 flex-shrink-0">
                                  <ImageIcon size={24} />
                                </div>
                              )}
                              
                              <div>
                                <p className="font-black text-gray-900 text-sm">{item.productName}</p>
                                <p className="text-xs text-gray-500 mt-1 font-medium">
                                  Varian: <span className="font-bold text-gray-700">{item.variantName || 'Standar'}</span> 
                                  <span className="mx-2 text-gray-300">•</span> 
                                  Qty: <span className="font-bold text-amber-700">{item.quantity} pcs</span>
                                </p>
                              </div>
                            </div>
                            
                            <div className="text-left sm:text-right w-full sm:w-auto">
                              <p className="font-black text-amber-900 text-sm">Rp {formatRp(item.price * item.quantity)}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {order.shippingCost > 0 && (
                        <div className="mt-6 pt-4 border-t border-dashed border-gray-200 flex justify-between items-center text-sm">
                          <span className="font-bold text-gray-500">Ongkos Kirim ({order.deliveryOption})</span>
                          <span className="font-black text-gray-900">Rp {formatRp(order.shippingCost)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* PROGRESS BAR BAWAH */}
                <div className="bg-gray-50 px-8 py-5 border-t border-gray-100 flex items-center gap-4">
                  <div className="flex-grow bg-gray-200 h-2 rounded-full overflow-hidden shadow-inner">
                    <div className="bg-gradient-to-r from-amber-500 to-amber-700 h-full transition-all duration-1000 ease-out" style={{ width: `${progress}%` }}></div>
                  </div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{progress}% Selesai</span>
                </div>
                
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-gray-100 shadow-sm">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <PackageX className="w-10 h-10 text-gray-300" />
          </div>
          <p className="text-gray-400 font-bold mb-8">Kamu belum pernah melakukan pemesanan.</p>
          <Link href="/katalog" className="bg-amber-900 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all shadow-xl shadow-amber-900/20 active:scale-95">
            Mulai Menjelajah
          </Link>
        </div>
      )}
    </>
  );
}