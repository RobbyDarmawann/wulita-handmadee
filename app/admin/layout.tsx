"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { fetchAdminData } from './admin-actions'; 
import { 
  LayoutDashboard, ShoppingBag, Package, Tags, 
  MessageSquare, Star, BarChart3, LogOut, Bell, AlertTriangle, CheckCircle2, Menu, X
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
  
  // STATE BARU: Untuk kontrol Sidebar di Mobile/Tablet
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Ambil data saat komponen dimuat
  useEffect(() => {
    const date = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    setDateStr(date);

    fetchAdminData().then(data => setAdminData(data));
    
    // Auto-refresh data setiap 30 detik
    const interval = setInterval(() => {
      fetchAdminData().then(data => setAdminData(data));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Tutup sidebar otomatis saat route/halaman berubah (di mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const totalNotifications = adminData.newOrders.length + adminData.lowStockProducts.length;

  return (
    <div className="bg-[#FAFAFA] text-gray-800 font-sans antialiased flex h-screen overflow-hidden relative">
      
      {/* ========================================================= */}
      {/* OVERLAY GELAP (Muncul saat sidebar terbuka di Mobile) */}
      {/* ========================================================= */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-amber-950/40 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ========================================================= */}
      {/* SIDEBAR DINAMIS (Responsive) */}
      {/* ========================================================= */}
      <aside 
        className={`fixed lg:static top-0 left-0 h-screen w-72 bg-amber-950 text-amber-50 flex flex-col shadow-2xl z-50 transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-20 lg:h-24 flex items-center justify-between px-6 border-b border-amber-800/30">
          <h1 className="text-xl lg:text-2xl font-extrabold tracking-tighter text-white flex items-start gap-1">
            WULITA <span className="text-[9px] font-black bg-amber-500 text-amber-950 px-2 py-0.5 rounded-full mt-1 tracking-widest uppercase shadow-sm">Admin</span>
          </h1>
          {/* Tombol Tutup Sidebar (Hanya di Mobile) */}
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-amber-500 hover:text-white p-2">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 lg:px-6 py-6 lg:py-8 space-y-1.5 lg:space-y-2 overflow-y-auto custom-scrollbar">
          <p className="px-3 text-[10px] font-black text-amber-500/50 uppercase tracking-[0.2em] mb-3 lg:mb-4">Menu Utama</p>
          
          <Link href="/admin/dashboard" className={`flex items-center gap-3 px-4 py-3 lg:py-3.5 rounded-2xl transition-all duration-300 ${pathname === '/admin/dashboard' ? 'bg-amber-800 text-white font-bold shadow-lg' : 'text-amber-100/60 hover:bg-amber-900 hover:text-white'}`}>
            <LayoutDashboard size={20} /> Dashboard
          </Link>

          <Link href="/admin/pesanan" className={`flex items-center gap-3 px-4 py-3 lg:py-3.5 rounded-2xl transition-all duration-300 ${pathname.startsWith('/admin/pesanan') ? 'bg-amber-800 text-white font-bold shadow-lg' : 'text-amber-100/60 hover:bg-amber-900 hover:text-white'}`}>
            <ShoppingBag size={20} /> Daftar Pesanan
            {adminData.pendingOrdersCount > 0 && (
              <span className="ml-auto bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md animate-pulse">
                {adminData.pendingOrdersCount}
              </span>
            )}
          </Link>

          <p className="px-3 text-[10px] font-black text-amber-500/50 uppercase tracking-[0.2em] mb-3 mt-6 lg:mb-4 lg:mt-8">Katalog Pusaka</p>

          <Link href="/admin/produk" className={`flex items-center gap-3 px-4 py-3 lg:py-3.5 rounded-2xl transition-all duration-300 ${pathname.startsWith('/admin/produk') ? 'bg-amber-800 text-white font-bold shadow-lg' : 'text-amber-100/60 hover:bg-amber-900 hover:text-white'}`}>
            <Package size={20} /> Daftar Produk
            {adminData.lowStockProducts.length > 0 && (
              <span className="ml-auto bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md">!</span>
            )}
          </Link>

          <Link href="/admin/kategori" className={`flex items-center gap-3 px-4 py-3 lg:py-3.5 rounded-2xl transition-all duration-300 ${pathname.startsWith('/admin/kategori') ? 'bg-amber-800 text-white font-bold shadow-lg' : 'text-amber-100/60 hover:bg-amber-900 hover:text-white'}`}>
            <Tags size={20} /> Kategori
          </Link>

          <p className="px-3 text-[10px] font-black text-amber-500/50 uppercase tracking-[0.2em] mb-3 mt-6 lg:mb-4 lg:mt-8">CRM & Laporan</p>

          <Link href="/admin/chat" className={`flex items-center gap-3 px-4 py-3 lg:py-3.5 rounded-2xl transition-all duration-300 ${pathname.startsWith('/admin/chat') ? 'bg-amber-800 text-white font-bold shadow-lg' : 'text-amber-100/60 hover:bg-amber-900 hover:text-white'}`}>
            <MessageSquare size={20} /> Pesan Masuk
          </Link>

          <Link href="/admin/ulasan" className={`flex items-center gap-3 px-4 py-3 lg:py-3.5 rounded-2xl transition-all duration-300 ${pathname.startsWith('/admin/ulasan') ? 'bg-amber-800 text-white font-bold shadow-lg' : 'text-amber-100/60 hover:bg-amber-900 hover:text-white'}`}>
            <Star size={20} /> Ulasan Pembeli
            {adminData.unrepliedReviewsCount > 0 && (
              <span className="ml-auto bg-amber-500 text-amber-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-md">
                {adminData.unrepliedReviewsCount}
              </span>
            )}
          </Link>

          <Link href="/admin/laporan" className={`flex items-center gap-3 px-4 py-3 lg:py-3.5 rounded-2xl transition-all duration-300 ${pathname.startsWith('/admin/laporan') ? 'bg-amber-800 text-white font-bold shadow-lg' : 'text-amber-100/60 hover:bg-amber-900 hover:text-white'}`}>
            <BarChart3 size={20} /> Laporan Penjualan
          </Link>
        </nav>

        {/* Profil Bawah */}
        <div className="p-4 lg:p-6 border-t border-amber-800/30 bg-amber-950/50 backdrop-blur-md">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-4 py-3 lg:py-3.5 rounded-xl lg:rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-red-500/20 hover:border-red-500 active:scale-95 shadow-sm">
            <LogOut size={16} /> Keluar Sesi
          </button>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* KONTEN UTAMA & HEADER */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden w-full">
        
        {/* HEADER BAR */}
        <header className="bg-white/90 backdrop-blur-md shadow-sm border-b border-amber-100/50 px-4 md:px-8 py-4 md:py-5 flex justify-between items-center z-30">
          
          {/* Bagian Kiri: Tombol Hamburger & Judul */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-amber-950 hover:bg-amber-50 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
            <div>
              <h2 className="text-lg md:text-xl font-black text-amber-950 tracking-tight capitalize line-clamp-1">
                {pathname.split('/').pop() || 'Dashboard'}
              </h2>
              <p className="hidden sm:block text-[10px] font-bold text-amber-900/40 uppercase tracking-widest mt-0.5">{dateStr}</p>
            </div>
          </div>

          {/* Bagian Kanan: Lonceng Notifikasi */}
          <div className="flex items-center gap-4 md:gap-6">
            <div className="relative">
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="p-2.5 md:p-3 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-full transition-all border border-amber-100 relative group"
              >
                <Bell size={20} className={totalNotifications > 0 ? "group-hover:animate-swing" : ""} />
                {totalNotifications > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-black w-4 h-4 md:w-5 md:h-5 flex items-center justify-center rounded-full border-2 border-white transform translate-x-1 -translate-y-1 shadow-md animate-pulse">
                    {totalNotifications}
                  </span>
                )}
              </button>

              {/* DROPDOWN NOTIFIKASI MELAYANG */}
              {isNotifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)}></div>
                  <div className="absolute right-0 mt-3 w-[300px] sm:w-80 md:w-96 bg-white rounded-2xl md:rounded-[2rem] shadow-2xl shadow-amber-900/10 border border-amber-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="bg-amber-50/50 px-4 md:px-6 py-4 border-b border-amber-100 flex justify-between items-center">
                      <h3 className="font-black text-amber-950 text-sm md:text-base">Pusat Notifikasi</h3>
                      <span className="text-[9px] md:text-[10px] font-black bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md uppercase">{totalNotifications} Baru</span>
                    </div>

                    <div className="max-h-80 md:max-h-96 overflow-y-auto custom-scrollbar divide-y divide-amber-50">
                      
                      {/* Section: Pesanan Baru */}
                      {adminData.newOrders.map(order => (
                        <Link href={`/admin/pesanan/${order.id}`} key={`order-${order.id}`} onClick={() => setIsNotifOpen(false)} className="flex items-start gap-3 md:gap-4 p-4 md:p-5 hover:bg-amber-50/50 transition-colors group">
                          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200 shadow-inner group-hover:scale-110 transition-transform"><ShoppingBag size={16} className="md:w-[18px] md:h-[18px]" /></div>
                          <div>
                            <p className="text-xs md:text-sm font-bold text-amber-950 group-hover:text-amber-700">Baru: {order.recipientName}</p>
                            <p className="text-[10px] md:text-xs text-amber-900/60 font-medium mt-0.5">Rp {new Intl.NumberFormat('id-ID').format(order.totalPrice)} • Perlu Verifikasi</p>
                          </div>
                        </Link>
                      ))}

                      {/* Section: Stok Menipis */}
                      {adminData.lowStockProducts.map(product => (
                        <Link href={`/admin/produk/edit/${product.id}`} key={`stock-${product.id}`} onClick={() => setIsNotifOpen(false)} className="flex items-start gap-3 md:gap-4 p-4 md:p-5 hover:bg-amber-50/50 transition-colors group">
                          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 border border-red-200 shadow-inner group-hover:scale-110 transition-transform"><AlertTriangle size={16} className="md:w-[18px] md:h-[18px]" /></div>
                          <div>
                            <p className="text-xs md:text-sm font-bold text-amber-950 group-hover:text-amber-700">Kritis: {product.name}</p>
                            <p className="text-[10px] md:text-xs text-red-500 font-bold mt-0.5">Sisa {product.stock} pcs! Segera restock.</p>
                          </div>
                        </Link>
                      ))}

                      {/* Empty State */}
                      {totalNotifications === 0 && (
                        <div className="py-10 md:py-12 text-center flex flex-col items-center">
                          <CheckCircle2 size={32} className="text-green-400 mb-2 md:mb-3 md:w-10 md:h-10" />
                          <p className="text-xs md:text-sm font-bold text-amber-950">Semua Terkendali!</p>
                          <p className="text-[10px] md:text-xs text-amber-900/50 mt-1 px-4">Tidak ada masalah atau pesanan tertunda.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* AREA KONTEN UTAMA */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 md:p-8 lg:p-10">
          {children}
        </main>

      </div>
    </div>
  );
}