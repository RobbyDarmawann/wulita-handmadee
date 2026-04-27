"use client";

import Link from "next/link";
import { ArrowLeft, Check, X, Award, Star, Crown } from "lucide-react";

export default function MembershipClient({ user, completedOrders }: { user: any, completedOrders: number }) {
  const tier = user.membership_tier?.toLowerCase() || 'bronze';
  
  let nextTier, neededOrders, target, progress, gradient, badgeName, Icon;

  if (tier === 'bronze') {
    nextTier = 'Silver';
    neededOrders = 11 - completedOrders;
    target = 11;
    progress = (completedOrders / 11) * 100;
    gradient = 'bg-gradient-to-br from-amber-600 to-amber-800'; 
    badgeName = 'Bronze Member';
    Icon = Award;
  } else if (tier === 'silver') {
    nextTier = 'Gold';
    neededOrders = 31 - completedOrders;
    target = 31;
    progress = ((completedOrders - 10) / 21) * 100;
    gradient = 'bg-gradient-to-br from-gray-400 to-gray-600'; 
    badgeName = 'Silver Member';
    Icon = Star;
  } else {
    nextTier = 'Maksimal';
    neededOrders = 0;
    target = completedOrders;
    progress = 100;
    gradient = 'bg-gradient-to-br from-yellow-400 to-yellow-600'; 
    badgeName = 'Gold Member';
    Icon = Crown;
  }

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-gray-900">Wulita Club Member</h1>
          <p className="text-sm text-gray-500 mt-0.5">Pantau progres dan nikmati keuntungan eksklusifmu.</p>
        </div>
      </div>

      {/* HEADER BESAR MEMBERSHIP */}
      <div className={`p-8 md:p-10 rounded-[2.5rem] ${gradient} text-white relative overflow-hidden shadow-2xl shadow-gray-200/50`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -mr-10 -mt-10"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-black opacity-10 rounded-full blur-2xl -ml-10 -mb-10"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="w-24 h-24 md:w-32 md:h-32 bg-white/20 backdrop-blur-md rounded-full border-4 border-white/30 flex items-center justify-center shadow-inner flex-shrink-0">
            <Icon size={48} className="text-white drop-shadow-md" />
          </div>
          <div className="text-center md:text-left w-full flex-grow">
            <p className="text-xs font-black opacity-80 mb-2 uppercase tracking-[0.2em] drop-shadow-sm">Status Kamu Saat Ini</p>
            <h2 className="text-4xl md:text-5xl font-black mb-4 drop-shadow-md">{badgeName}</h2>
            
            <div className="bg-black/20 backdrop-blur-md p-5 rounded-2xl border border-white/20 shadow-inner w-full">
              {tier === 'gold' ? (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold drop-shadow-sm text-yellow-100">Level Tertinggi Dicapai!</span>
                    <span className="text-sm font-black drop-shadow-sm text-white">100%</span>
                  </div>
                  <div className="w-full bg-black/40 rounded-full h-3 mb-4 overflow-hidden border border-white/10">
                    <div className="bg-yellow-300 h-full rounded-full shadow-[0_0_10px_rgba(253,224,71,0.8)]" style={{ width: '100%' }}></div>
                  </div>
                  <p className="text-xs font-medium opacity-90 leading-relaxed text-yellow-50">Kamu sudah menikmati semua benefit maksimal dari Wulita Handmade. Terima kasih, Sultan!</p>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold drop-shadow-sm text-white">Progres menuju {nextTier}</span>
                    <span className="text-xs font-black drop-shadow-sm bg-white text-gray-900 px-3 py-1 rounded-lg">{completedOrders} / {target} Pesanan</span>
                  </div>
                  <div className="w-full bg-black/40 rounded-full h-3 mb-4 overflow-hidden border border-white/10">
                    <div className="bg-white h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,255,255,0.5)]" style={{ width: `${progress}%` }}></div>
                  </div>
                  <p className="text-xs font-medium opacity-90 leading-relaxed text-white">Ayo belanja <strong className="font-black text-white bg-black/30 px-1.5 py-0.5 rounded">{neededOrders} pesanan</strong> lagi untuk naik level dan membuka potongan harga permanen!</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
        <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
        Keuntungan Level Membership
      </h3>

      {/* GRID 3 KARTU BENEFIT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* KARTU BRONZE */}
        <div className={`bg-white p-6 rounded-3xl border relative flex flex-col transition-all ${tier === 'bronze' ? 'border-amber-600 shadow-lg ring-4 ring-amber-50' : 'border-gray-200 opacity-60'}`}>
          {tier === 'bronze' && <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-amber-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-md">Level Kamu</div>}
          <div className="flex items-center gap-3 mb-4 mt-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-800 text-white flex items-center justify-center shadow-md">
              <Award size={24} />
            </div>
            <div>
              <h4 className="font-black text-gray-900 text-lg">Bronze</h4>
              <p className="text-xs font-bold text-gray-500">0 - 10 Pesanan</p>
            </div>
          </div>
          <div className="space-y-3 mb-6 flex-grow">
            <div className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /><p className="text-sm text-gray-600">Akses katalog produk terbaru</p></div>
            <div className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /><p className="text-sm text-gray-600">Akses Chatbot Wulita Care</p></div>
            <div className="flex items-start gap-2 opacity-40"><X className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" /><p className="text-sm text-gray-600 line-through">Diskon Otomatis</p></div>
          </div>
        </div>

        {/* KARTU SILVER */}
        <div className={`bg-white p-6 rounded-3xl border relative flex flex-col transition-all ${tier === 'silver' ? 'border-gray-500 shadow-lg ring-4 ring-gray-100' : 'border-gray-200 opacity-60'}`}>
          {tier === 'silver' && <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gray-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-md">Level Kamu</div>}
          <div className="flex items-center gap-3 mb-4 mt-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-400 to-gray-600 text-white flex items-center justify-center shadow-md">
              <Star size={24} />
            </div>
            <div>
              <h4 className="font-black text-gray-900 text-lg">Silver</h4>
              <p className="text-xs font-bold text-gray-500">11 - 30 Pesanan</p>
            </div>
          </div>
          <div className="space-y-3 mb-6 flex-grow">
            <div className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /><p className="text-sm text-gray-600 font-bold">Diskon Checkout 3% Tanpa Batas</p></div>
            <div className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /><p className="text-sm text-gray-600">Semua benefit dari level Bronze</p></div>
          </div>
        </div>

        {/* KARTU GOLD */}
        <div className={`bg-white p-6 rounded-3xl border relative flex flex-col transition-all ${tier === 'gold' ? 'border-yellow-500 shadow-lg ring-4 ring-yellow-50' : 'border-gray-200 opacity-60'}`}>
          {tier === 'gold' && <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-md">Level Kamu</div>}
          <div className="flex items-center gap-3 mb-4 mt-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-600 text-white flex items-center justify-center shadow-md">
              <Crown size={24} />
            </div>
            <div>
              <h4 className="font-black text-gray-900 text-lg">Gold (Sultan)</h4>
              <p className="text-xs font-bold text-gray-500">&gt; 30 Pesanan</p>
            </div>
          </div>
          <div className="space-y-3 mb-6 flex-grow">
            <div className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /><p className="text-sm text-gray-600 font-bold text-yellow-600">Diskon Checkout 5% Tanpa Batas</p></div>
            <div className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /><p className="text-sm text-gray-600">Terdaftar di laporan "VIP Sultan" Admin</p></div>
            <div className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /><p className="text-sm text-gray-600">Semua benefit dari level Silver</p></div>
          </div>
        </div>

      </div>
    </div>
  );
}