"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { 
  LayoutDashboard, ShoppingBag, Package, Tags, 
  MessageSquare, Star, BarChart3, LogOut 
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    // Format tanggal dinamis ala Indonesia
    const date = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    setDateStr(date);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  // Dummy notifikasi (Nanti ditarik dari database di layout server)
  const pendingOrders = 2;
  const unrepliedReviews = 1;

  return (
    <div className="bg-gray-50 text-gray-800 font-sans antialiased flex h-screen overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-amber-950 text-amber-50 flex flex-col h-screen sticky top-0 shadow-2xl z-50 transition-all">
        <div className="h-20 flex items-center justify-center border-b border-amber-800/50">
          <h1 className="text-2xl font-extrabold tracking-wider text-white flex items-start gap-1">
            WULITA <span className="text-amber-500 text-[10px] bg-amber-900/50 px-2 py-0.5 rounded-full mt-1">ADMIN</span>
          </h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto scrollbar-hide">
          <p className="px-2 text-[10px] font-black text-amber-500/70 uppercase tracking-widest mb-3 mt-2">Menu Utama</p>
          
          <Link href="/admin/dashboard" className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${pathname === '/admin/dashboard' ? 'bg-amber-800 text-white font-bold shadow-md' : 'text-amber-100/70 hover:bg-amber-800 hover:text-white'}`}>
            <LayoutDashboard size={20} /> Dashboard
          </Link>

          <Link href="/admin/pesanan" className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${pathname.startsWith('/admin/pesanan') ? 'bg-amber-800 text-white font-bold shadow-md' : 'text-amber-100/70 hover:bg-amber-800 hover:text-white'}`}>
            <ShoppingBag size={20} /> Daftar Pesanan
            {pendingOrders > 0 && <span className="ml-auto bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">{pendingOrders}</span>}
          </Link>

          <p className="px-2 text-[10px] font-black text-amber-500/70 uppercase tracking-widest mb-3 mt-6">Katalog</p>

          <Link href="/admin/produk" className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${pathname.startsWith('/admin/produk') ? 'bg-amber-800 text-white font-bold shadow-md' : 'text-amber-100/70 hover:bg-amber-800 hover:text-white'}`}>
            <Package size={20} /> Daftar Produk
          </Link>

          <Link href="/admin/kategori" className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${pathname.startsWith('/admin/kategori') ? 'bg-amber-800 text-white font-bold shadow-md' : 'text-amber-100/70 hover:bg-amber-800 hover:text-white'}`}>
            <Tags size={20} /> Kategori
          </Link>

          <p className="px-2 text-[10px] font-black text-amber-500/70 uppercase tracking-widest mb-3 mt-6">CRM & Laporan</p>

          <Link href="/admin/chat" className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${pathname.startsWith('/admin/pesan') ? 'bg-amber-800 text-white font-bold shadow-md' : 'text-amber-100/70 hover:bg-amber-800 hover:text-white'}`}>
            <MessageSquare size={20} /> Pesan Masuk
          </Link>

          <Link href="/admin/ulasan" className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${pathname.startsWith('/admin/ulasan') ? 'bg-amber-800 text-white font-bold shadow-md' : 'text-amber-100/70 hover:bg-amber-800 hover:text-white'}`}>
            <Star size={20} /> Ulasan Pembeli
            {unrepliedReviews > 0 && <span className="ml-auto bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">{unrepliedReviews}</span>}
          </Link>

          <Link href="/admin/laporan" className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${pathname.startsWith('/admin/laporan') ? 'bg-amber-800 text-white font-bold shadow-md' : 'text-amber-100/70 hover:bg-amber-800 hover:text-white'}`}>
            <BarChart3 size={20} /> Laporan Penjualan
          </Link>
        </nav>

        {/* Profil Bawah */}
        <div className="p-5 border-t border-amber-800/50 bg-amber-900/30 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-amber-700 flex items-center justify-center font-black text-white shadow-inner uppercase border-2 border-amber-600">
              AD
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">Admin Wulita</p>
              <p className="text-[10px] text-amber-400 font-bold tracking-wider uppercase mt-0.5">Administrator</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all border border-red-500/20 hover:border-red-500 shadow-sm">
            <LogOut size={16} /> Keluar
          </button>
        </div>
      </aside>

      {/* KONTEN UTAMA */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-[#FAFAFA]">
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 px-8 py-5 flex justify-between items-center sticky top-0 z-40">
          <h2 className="text-2xl font-black text-gray-800 tracking-tight capitalize">
            {pathname.split('/').pop() || 'Dashboard'}
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-gray-400 bg-gray-50 px-4 py-2 rounded-full border border-gray-100 shadow-sm">
              {dateStr || 'Memuat tanggal...'}
            </span>
          </div>
        </header>

        <main className="flex-1">
          {children}
        </main>
      </div>

    </div>
  );
}