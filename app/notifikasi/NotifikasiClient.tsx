"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { markAsRead, markAllAsRead } from "./actions";
import { Bell, Package, Tag, Info, CheckCircle2, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function NotifikasiClient({ initialNotifications }: { initialNotifications: any[] }) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  const unreadCount = initialNotifications.filter(n => !n.isRead).length;

  const handleMarkAllRead = async () => {
    setIsUpdating(true);
    await markAllAsRead();
    setIsUpdating(false);
    router.refresh();
  };

  const handleNotificationClick = async (id: number, link: string | null, isRead: boolean) => {
    if (!isRead) {
      await markAsRead(id);
      router.refresh();
    }
    if (link) {
      router.push(link);
    }
  };

  // Fungsi untuk memformat waktu (Contoh: "2 jam yang lalu", "Kemarin")
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Baru saja";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit yang lalu`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam yang lalu`;
    if (diffInSeconds < 172800) return "Kemarin";
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Fungsi untuk menentukan ikon & warna berdasarkan tipe notifikasi
  const getIcon = (type: string, isRead: boolean) => {
    const baseClass = `flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner border transition-colors duration-300`;
    
    if (type === 'order') {
      return <div className={`${baseClass} ${isRead ? 'bg-gray-50 text-gray-400 border-gray-100' : 'bg-blue-100 text-blue-600 border-blue-200'}`}><Package size={24} /></div>;
    }
    if (type === 'promo') {
      return <div className={`${baseClass} ${isRead ? 'bg-gray-50 text-gray-400 border-gray-100' : 'bg-red-100 text-red-600 border-red-200'}`}><Tag size={24} /></div>;
    }
    // System / Info default
    return <div className={`${baseClass} ${isRead ? 'bg-gray-50 text-gray-400 border-gray-100' : 'bg-amber-100 text-amber-600 border-amber-200'}`}><Info size={24} /></div>;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-amber-950 tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 text-amber-700 rounded-2xl shadow-inner"><Bell size={24} /></div>
            Notifikasi
          </h1>
          <p className="mt-2 text-sm font-medium text-amber-900/60">
            {unreadCount > 0 ? (
              <span>Anda memiliki <strong className="text-red-500">{unreadCount} pesan baru</strong> yang belum dibaca.</span>
            ) : "Semua notifikasi sudah dibaca."}
          </p>
        </div>

        {unreadCount > 0 && (
          <button 
            onClick={handleMarkAllRead}
            disabled={isUpdating}
            className="text-xs font-black uppercase tracking-widest text-amber-700 bg-amber-50 hover:bg-amber-100 px-5 py-2.5 rounded-xl border border-amber-200 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle2 size={16} /> Tandai Semua Dibaca
          </button>
        )}
      </div>

      {/* FEED NOTIFIKASI */}
      <div className="bg-white rounded-[2.5rem] border border-amber-100/50 shadow-xl shadow-amber-900/5 overflow-hidden">
        <div className="divide-y divide-gray-50/80">
          
          {initialNotifications.length > 0 ? (
            initialNotifications.map((notif) => (
              <div 
                key={notif.id}
                onClick={() => handleNotificationClick(notif.id, notif.link, notif.isRead)}
                className={`p-6 sm:p-8 flex items-start gap-4 sm:gap-6 transition-all duration-300 group ${notif.isRead ? 'bg-white hover:bg-gray-50' : 'bg-amber-50/20 hover:bg-amber-50/50 cursor-pointer'}`}
              >
                {/* Indikator Belum Dibaca (Titik Merah) */}
                <div className="mt-4 flex-shrink-0 w-2 h-2">
                  {!notif.isRead && <div className="w-full h-full bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>}
                </div>

                {/* Ikon Dinamis */}
                {getIcon(notif.type, notif.isRead)}

                {/* Konten Pesan */}
                <div className={`flex-grow min-w-0 ${notif.link ? 'cursor-pointer' : ''}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <h3 className={`text-base truncate pr-4 ${notif.isRead ? 'font-bold text-gray-700' : 'font-black text-amber-950'}`}>
                      {notif.title}
                    </h3>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 whitespace-nowrap">
                      {formatTimeAgo(notif.createdAt)}
                    </span>
                  </div>
                  <p className={`text-sm leading-relaxed ${notif.isRead ? 'text-gray-500 font-medium' : 'text-amber-900/80 font-bold'}`}>
                    {notif.message}
                  </p>
                </div>

                {/* Panah Navigasi (Muncul saat di-hover jika ada link) */}
                {notif.link && (
                  <div className="flex-shrink-0 mt-3 text-amber-900/20 group-hover:text-amber-500 transition-colors group-hover:translate-x-1 duration-300">
                    <ChevronRight size={20} />
                  </div>
                )}
              </div>
            ))
          ) : (
            /* EMPTY STATE */
            <div className="py-24 flex flex-col items-center justify-center text-center px-6">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-gray-100">
                <Bell size={40} className="text-gray-300" />
              </div>
              <h3 className="text-xl font-black text-gray-800 tracking-tight mb-2">Belum Ada Notifikasi</h3>
              <p className="text-sm font-medium text-gray-500 max-w-sm">
                Saat ini kotak masuk notifikasi Anda masih kosong. Pesanan, promo, dan info penting akan muncul di sini.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}