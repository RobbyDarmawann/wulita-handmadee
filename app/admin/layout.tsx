"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { fetchAdminData } from './admin-actions'; // IMPORT FUNGSI BARU
import { 
  LayoutDashboard, ShoppingBag, Package, Tags, 
  MessageSquare, Star, BarChart3, LogOut, Bell, AlertTriangle, CheckCircle2
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  
  // State untuk data dinamis
  const [adminData, setAdminData] = useState({
    pendingOrdersCount: 0,
    unrepliedReviewsCount: 0,
    lowStockProducts: [] as any[],
    newOrders: [] as any[]
  });

  const [dateStr, setDateStr] = useState('');
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Ambil data saat komponen dimuat
  useEffect(() => {
    const date = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    setDateStr(date);

    fetchAdminData().then(data => setAdminData(data));
    
    // Optional: Auto-refresh data setiap 30 detik
    const interval = setInterval(() => {
      fetchAdminData().then(data => setAdminData(data));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  // Hitung total notifikasi (Pesanan Baru + Stok Menipis)
  const totalNotifications = adminData.newOrders.length + adminData.lowStockProducts.length;

  return (
    <div className="bg-[#FAFAFA] text-gray-800 font-sans antialiased flex h-screen overflow-hidden">
      
      {/* ========================================================= */}
      {/* SIDEBAR DINAMIS */}
      {/* ========================================================= */}
      <aside className="w-72 bg-amber-950 text-amber-50 flex flex-col h-screen sticky top-0 shadow-2xl z-50 transition-all">
        <div className="h-24 flex items-center justify-center border-b border-amber-800/30">
          <h1 className="text-2xl font-extrabold tracking-tighter text-white flex items-start gap-1">
            WULITA <span className="text-[9px] font-black bg-amber-500 text-amber-950 px-2 py-0.5 rounded-full mt-1 tracking-widest uppercase shadow-sm">Admin</span>
          </h1>
        </div>

        <nav className="flex-1 px-6 py-8 space-y-2 overflow-y-auto custom-scrollbar">
          <p className="px-3 text-[10px] font-black text-amber-500/50 uppercase tracking-[0.2em] mb-4">Menu Utama</p>
          
          <Link href="/admin/dashboard" className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ${pathname === '/admin/dashboard' ? 'bg-amber-800 text-white font-bold shadow-lg' : 'text-amber-100/60 hover:bg-amber-900 hover:text-white'}`}>
            <LayoutDashboard size={20} /> Dashboard
          </Link>

          <Link href="/admin/pesanan" className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ${pathname.startsWith('/admin/pesanan') ? 'bg-amber-800 text-white font-bold shadow-lg' : 'text-amber-100/60 hover:bg-amber-900 hover:text-white'}`}>
            <ShoppingBag size={20} /> Daftar Pesanan
            {/* ANGKA DINAMIS PESANAN TERTUNDA */}
            {adminData.pendingOrdersCount > 0 && (
              <span className="ml-auto bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md animate-pulse">
                {adminData.pendingOrdersCount}
              </span>
            )}
          </Link>

          <p className="px-3 text-[10px] font-black text-amber-500/50 uppercase tracking-[0.2em] mb-4 mt-8">Katalog Pusaka</p>

          <Link href="/admin/produk" className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ${pathname.startsWith('/admin/produk') ? 'bg-amber-800 text-white font-bold shadow-lg' : 'text-amber-100/60 hover:bg-amber-900 hover:text-white'}`}>
            <Package size={20} /> Daftar Produk
            {/* ANGKA DINAMIS STOK KRITIS */}
            {adminData.lowStockProducts.length > 0 && (
              <span className="ml-auto bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md">
                !
              </span>
            )}
          </Link>

          <Link href="/admin/kategori" className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ${pathname.startsWith('/admin/kategori') ? 'bg-amber-800 text-white font-bold shadow-lg' : 'text-amber-100/60 hover:bg-amber-900 hover:text-white'}`}>
            <Tags size={20} /> Kategori
          </Link>

          <p className="px-3 text-[10px] font-black text-amber-500/50 uppercase tracking-[0.2em] mb-4 mt-8">CRM & Laporan</p>

          <Link href="/admin/chat" className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ${pathname.startsWith('/admin/chat') ? 'bg-amber-800 text-white font-bold shadow-lg' : 'text-amber-100/60 hover:bg-amber-900 hover:text-white'}`}>
            <MessageSquare size={20} /> Pesan Masuk
          </Link>

          <Link href="/admin/ulasan" className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ${pathname.startsWith('/admin/ulasan') ? 'bg-amber-800 text-white font-bold shadow-lg' : 'text-amber-100/60 hover:bg-amber-900 hover:text-white'}`}>
            <Star size={20} /> Ulasan Pembeli
            {/* ANGKA DINAMIS ULASAN BARU */}
            {adminData.unrepliedReviewsCount > 0 && (
              <span className="ml-auto bg-amber-500 text-amber-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-md">
                {adminData.unrepliedReviewsCount}
              </span>
            )}
          </Link>

          <Link href="/admin/laporan" className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ${pathname.startsWith('/admin/laporan') ? 'bg-amber-800 text-white font-bold shadow-lg' : 'text-amber-100/60 hover:bg-amber-900 hover:text-white'}`}>
            <BarChart3 size={20} /> Laporan Penjualan
          </Link>
        </nav>

        {/* Profil Bawah */}
        <div className="p-6 border-t border-amber-800/30 bg-amber-950/50 backdrop-blur-md">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-4 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-red-500/20 hover:border-red-500 active:scale-95 shadow-sm">
            <LogOut size={16} /> Keluar Sesi
          </button>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* KONTEN UTAMA & HEADER NOTIFIKASI */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* HEADER BAR (Pusat Notifikasi Admin) */}
        <header className="bg-white/90 backdrop-blur-md shadow-sm border-b border-amber-100/50 px-8 py-5 flex justify-between items-center z-40">
          <div>
            <h2 className="text-xl font-black text-amber-950 tracking-tight capitalize">
              {pathname.split('/').pop() || 'Dashboard'}
            </h2>
            <p className="text-[10px] font-bold text-amber-900/40 uppercase tracking-widest">{dateStr}</p>
          </div>

          <div className="flex items-center gap-6">
            
            {/* LONCENG NOTIFIKASI */}
            <div className="relative">
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="p-3 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-full transition-all border border-amber-100 relative group"
              >
                <Bell size={20} className={totalNotifications > 0 ? "group-hover:animate-swing" : ""} />
                {totalNotifications > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white transform translate-x-1 -translate-y-1 shadow-md animate-pulse">
                    {totalNotifications}
                  </span>
                )}
              </button>

              {/* DROPDOWN NOTIFIKASI MELAYANG */}
              {isNotifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)}></div>
                  <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-[2rem] shadow-2xl shadow-amber-900/10 border border-amber-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="bg-amber-50/50 px-6 py-4 border-b border-amber-100 flex justify-between items-center">
                      <h3 className="font-black text-amber-950">Pusat Notifikasi</h3>
                      <span className="text-[10px] font-black bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md uppercase">{totalNotifications} Baru</span>
                    </div>

                    <div className="max-h-96 overflow-y-auto custom-scrollbar divide-y divide-amber-50">
                      
                      {/* Section: Pesanan Baru */}
                      {adminData.newOrders.map(order => (
                        <Link href={`/admin/pesanan/${order.id}`} key={`order-${order.id}`} onClick={() => setIsNotifOpen(false)} className="flex items-start gap-4 p-5 hover:bg-amber-50/50 transition-colors group">
                          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200 shadow-inner group-hover:scale-110 transition-transform"><ShoppingBag size={18} /></div>
                          <div>
                            <p className="text-sm font-bold text-amber-950 group-hover:text-amber-700">Pesanan Baru: {order.recipientName}</p>
                            <p className="text-xs text-amber-900/60 font-medium">Rp {new Intl.NumberFormat('id-ID').format(order.totalPrice)} • Perlu Verifikasi</p>
                          </div>
                        </Link>
                      ))}

                      {/* Section: Stok Menipis */}
                      {adminData.lowStockProducts.map(product => (
                        <Link href={`/admin/produk/edit/${product.id}`} key={`stock-${product.id}`} onClick={() => setIsNotifOpen(false)} className="flex items-start gap-4 p-5 hover:bg-amber-50/50 transition-colors group">
                          <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 border border-red-200 shadow-inner group-hover:scale-110 transition-transform"><AlertTriangle size={18} /></div>
                          <div>
                            <p className="text-sm font-bold text-amber-950 group-hover:text-amber-700">Stok Kritis: {product.name}</p>
                            <p className="text-xs text-red-500 font-bold">Sisa {product.stock} pcs! Segera restock.</p>
                          </div>
                        </Link>
                      ))}

                      {/* Empty State */}
                      {totalNotifications === 0 && (
                        <div className="py-12 text-center flex flex-col items-center">
                          <CheckCircle2 size={40} className="text-green-400 mb-3" />
                          <p className="text-sm font-bold text-amber-950">Semua Terkendali!</p>
                          <p className="text-xs text-amber-900/50 mt-1">Tidak ada masalah atau pesanan tertunda.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>
        </header>

        {/* AREA KONTEN (Tabel, Form, dll) */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-10">
          {children}
        </main>

      </div>
    </div>
  );
}