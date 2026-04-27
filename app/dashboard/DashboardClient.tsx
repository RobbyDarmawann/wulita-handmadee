"use client";

import Link from "next/link";
import { logoutUser } from "./actions";
import { Settings, ShieldCheck, LogOut, ArrowRight, Medal, Crown } from "lucide-react";

export default function DashboardClient({ user, completedOrders }: { user: any, completedOrders: number }) {
  
  // LOGIKA TIER (Sesuai Blade Kapten)
  const tier = user.membership_tier?.toLowerCase() || 'bronze';
  const points = user.points || 0;

  let nextTier, neededOrders, target, progress, gradient, badgeName, benefit;

  if (tier === 'bronze') {
    nextTier = 'Silver';
    neededOrders = 11 - completedOrders;
    target = 11;
    progress = (completedOrders / 11) * 100;
    gradient = 'bg-gradient-to-br from-amber-600 to-amber-800'; 
    badgeName = 'Bronze Member';
    benefit = 'Nikmati diskon eksklusif dengan menaikkan levelmu!';
  } else if (tier === 'silver') {
    nextTier = 'Gold';
    neededOrders = 31 - completedOrders;
    target = 31;
    progress = ((completedOrders - 10) / 21) * 100;
    gradient = 'bg-gradient-to-br from-gray-400 to-gray-600'; 
    badgeName = 'Silver Member';
    benefit = 'Diskon Otomatis 3% di setiap transaksi!';
  } else {
    nextTier = 'Maksimal';
    neededOrders = 0;
    target = completedOrders;
    progress = 100;
    gradient = 'bg-gradient-to-br from-yellow-400 to-yellow-600'; 
    badgeName = 'Gold Member';
    benefit = 'Diskon Otomatis 5% + Layanan VIP Prioritas!';
  }

  return (
    <div className="space-y-10">
      
      <div className="mb-6">
        <h1 className="text-3xl font-black text-gray-900">Akun Saya</h1>
        <p className="text-gray-500 mt-2">Kelola informasi, keamanan, dan level membership kamu.</p>
      </div>

      {/* HEADER PROFIL */}
      <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-amber-50 rounded-full z-0 opacity-50"></div>
        <div className="w-24 h-24 bg-amber-900 text-amber-100 rounded-full flex items-center justify-center text-4xl font-black shadow-inner z-10 flex-shrink-0 uppercase">
          {user.name ? user.name.substring(0, 1) : 'U'}
        </div>
        <div className="text-center md:text-left z-10">
          <h2 className="text-2xl font-black text-gray-900 mb-1">{user.name || 'Pelanggan Wulita'}</h2>
          <p className="text-gray-500 mb-3">{user.email}</p>
          <div className="inline-block bg-amber-100 text-amber-900 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase shadow-sm">
            Pelanggan Aktif
          </div>
        </div>
      </div>

      {/* WULITA CLUB CARD */}
      <div className={`p-8 rounded-[2rem] ${gradient} text-white relative overflow-hidden shadow-xl shadow-gray-200 group`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-700"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-black opacity-10 rounded-full blur-2xl -ml-10 -mb-10"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="w-full md:w-1/2 flex flex-col h-full justify-between">
            <div>
              <p className="text-[10px] font-black opacity-80 mb-2 uppercase tracking-[0.2em] drop-shadow-sm flex items-center gap-1.5">
                <Medal size={14} /> Wulita Club Card
              </p>
              <h2 className="text-3xl font-black mb-1 drop-shadow-sm">{badgeName}</h2>
              <p className="text-sm font-medium opacity-90 mb-5">{benefit}</p>
              
              <div className="inline-flex items-center gap-2 bg-black/20 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-white/10 shadow-inner">
                <span className="font-bold text-sm">{points.toLocaleString('id-ID')} Poin Terkumpul</span>
              </div>
            </div>

            <Link href="/dashboard/membership" className="mt-8 w-fit inline-flex items-center gap-2 text-sm font-black text-white bg-white/20 hover:bg-white/30 px-6 py-3 rounded-xl backdrop-blur-md border border-white/40 transition-all hover:-translate-y-1 hover:shadow-lg group/btn">
              Lihat Detail Member
              <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="w-full md:w-1/2 bg-white/10 backdrop-blur-md p-6 rounded-[1.5rem] border border-white/20 shadow-inner">
            {tier === 'gold' ? (
              <>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold drop-shadow-sm text-yellow-100">Level Tertinggi!</span>
                  <span className="text-sm font-black drop-shadow-sm bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded">100%</span>
                </div>
                <div className="w-full bg-black/30 rounded-full h-3.5 mb-4 overflow-hidden border border-white/10">
                  <div className="bg-yellow-300 h-full rounded-full shadow-[0_0_10px_rgba(253,224,71,0.8)]" style={{ width: '100%' }}></div>
                </div>
                <p className="text-xs font-medium opacity-90 leading-relaxed">Kamu adalah <strong>Pelanggan Sultan</strong>. Klik tombol detail untuk melihat semua fasilitas VIP kamu.</p>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold drop-shadow-sm">Menuju {nextTier}</span>
                  <span className="text-xs font-black drop-shadow-sm bg-black/30 px-2.5 py-1 rounded-md border border-white/10">{completedOrders} / {target} Pesanan</span>
                </div>
                <div className="w-full bg-black/30 rounded-full h-3.5 mb-4 overflow-hidden border border-white/10">
                  <div className="bg-white h-full rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(255,255,255,0.5)]" style={{ width: `${progress}%` }}></div>
                </div>
                <p className="text-xs font-medium opacity-90 leading-relaxed">Hanya butuh <strong className="font-black text-white bg-black/20 px-1.5 rounded">{neededOrders} pesanan</strong> lagi untuk naik level.</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* MENU NAVIGASI PENGATURAN */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/dashboard/edit" className="group bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:border-amber-400 hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <h3 className="font-black text-gray-900 mb-1">Edit Profil</h3>
            <p className="text-xs text-gray-500">Ubah nama & alamat email</p>
          </div>
          <div className="w-10 h-10 bg-gray-50 group-hover:bg-amber-100 text-gray-400 group-hover:text-amber-600 rounded-full flex items-center justify-center transition-colors">
            <Settings size={20} />
          </div>
        </Link>

        <Link href="/dashboard/password" className="group bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:border-amber-400 hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <h3 className="font-black text-gray-900 mb-1">Keamanan Akun</h3>
            <p className="text-xs text-gray-500">Perbarui kata sandi</p>
          </div>
          <div className="w-10 h-10 bg-gray-50 group-hover:bg-amber-100 text-gray-400 group-hover:text-amber-600 rounded-full flex items-center justify-center transition-colors">
            <ShieldCheck size={20} />
          </div>
        </Link>
      </div>

      {/* LOGOUT */}
      <div className="bg-red-50 p-8 rounded-[2rem] border border-red-100 flex flex-col sm:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-lg font-black text-red-900 mb-1">Keluar dari Akun</h2>
          <p className="text-sm text-red-700/80">Sesi kamu akan diakhiri dengan aman.</p>
        </div>
        <button onClick={() => logoutUser()} className="w-full sm:w-auto bg-red-600 text-white px-8 py-3.5 rounded-2xl font-black text-sm hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 active:scale-[0.98] flex justify-center items-center gap-2">
          <LogOut size={20} /> LOGOUT
        </button>
      </div>

    </div>
  );
}