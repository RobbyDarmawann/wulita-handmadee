"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingCart, MessageSquare, LogOut, Menu, X, Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  // Navbar customer tidak perlu tampil di area admin.
  if (pathname.startsWith('/admin')) {
    return null;
  }
  
  // State Dinamis dari Supabase
  const [isAuth, setIsAuth] = useState(false); 
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState('Pengguna');

  // State untuk Mobile Menu & Angka Merah Dinamis
  const [isOpen, setIsOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [unreadChat, setUnreadChat] = useState(0);
  const [unreadNotif, setUnreadNotif] = useState(0); // STATE BARU: Notifikasi

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      updateUserState(session);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      updateUserState(session);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const updateUserState = async (session: any) => {
    if (session) {
      setIsAuth(true);
      const nameParts = session.user.user_metadata?.name?.split(' ') || ['Pengguna'];
      setUserName(nameParts[0]); 
      setIsAdmin(session.user.email === 'admin@wulita.com'); 

      // Panggil fungsi untuk mengambil angka notifikasi secara real/dinamis
      fetchDynamicCounts(session.user.id);
    } else {
      setIsAuth(false);
      setUserName('Pengguna');
      setIsAdmin(false);
      setCartCount(0);
      setUnreadChat(0);
      setUnreadNotif(0); // Reset notifikasi saat logout
    }
  };

  const fetchDynamicCounts = async (userId: string) => {
    try {
      // 1. Hitung isi keranjang
      const { count: cart } = await supabase
        .from('carts') 
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // 2. Hitung pesan chat belum dibaca
      const { count: chat } = await supabase
        .from('messages') 
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false)
        .neq('sender', 'user');

      // 3. Hitung NOTIFIKASI belum dibaca (TABEL BARU)
      // Asumsi: tabel bernama 'notifications' atau sesuaikan dengan schema Prisma Kapten
      const { count: notif } = await supabase
        .from('notifications') 
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      setCartCount(cart || 0);
      setUnreadChat(chat || 0);
      setUnreadNotif(notif || 0);
    } catch (error) {
      console.error("Gagal mengambil notifikasi:", error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsOpen(false); 
    router.push('/login');
    router.refresh();
  };

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <img 
              src="/images/logo.png" 
              alt="Logo Wulita" 
              className="h-12 w-12 object-contain rounded-full shadow-sm" 
            />
            <Link href="/" className="font-extrabold text-2xl tracking-tight text-amber-900">
              Wulita <span className="text-amber-600 font-medium">Handmade</span>
            </Link>
          </div>

          {/* TAMPILAN MOBILE (Lonceng, Keranjang, Burger) */}
          <div className="flex md:hidden items-center gap-3">
            {isAuth && !isAdmin && (
              <>
                {/* Ikon Lonceng Mobile */}
                <Link href="/notifikasi" className="relative p-2 text-gray-600 hover:text-amber-700 transition-colors">
                  <Bell size={24} strokeWidth={1.5} />
                  {unreadNotif > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border border-white transform translate-x-0.5 -translate-y-0.5 shadow-sm animate-pulse">
                      {unreadNotif > 9 ? '9+' : unreadNotif}
                    </span>
                  )}
                </Link>

                {/* Ikon Keranjang Mobile */}
                <Link href="/keranjang" className="relative p-2 text-gray-600 hover:text-amber-700 transition-colors">
                  <ShoppingCart size={24} strokeWidth={1.5} />
                  {cartCount > 0 && (
                    <span className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border border-white transform translate-x-0.5 -translate-y-0.5 shadow-sm">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </>
            )}
            <button 
              onClick={toggleMenu} 
              className="text-gray-700 hover:text-amber-700 focus:outline-none p-2 rounded-lg bg-gray-50 active:scale-95 transition-transform ml-1"
            >
              {isOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>

          {/* Menu Navigasi Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/katalog" className={`font-medium transition ${pathname === '/katalog' ? 'text-amber-700 font-bold' : 'text-gray-600 hover:text-amber-700'}`}>Katalog</Link>
            <Link href="/kategori" className={`font-medium transition ${pathname === '/kategori' ? 'text-amber-700 font-bold' : 'text-gray-600 hover:text-amber-700'}`}>Kategori</Link>
            <Link href="/tentang" className="text-gray-600 hover:text-amber-700 font-medium transition">Tentang Kami</Link>
            
            {isAuth && !isAdmin && (
              <Link href="/pesanan" className={`font-medium transition ${pathname === '/pesanan' ? 'text-amber-700 font-bold underline decoration-2 underline-offset-8' : 'text-gray-600 hover:text-amber-700'}`}>
                Pesanan Saya
              </Link>
            )}

            {/* Menu Kanan Desktop (Auth/Notif/Chat/Cart) */}
            <div className="pl-4 border-l border-gray-200 flex items-center space-x-4">
              {isAuth ? (
                <>
                  {!isAdmin && (
                    <>
                      {/* Ikon Lonceng (Baru) */}
                      <Link href="/notifikasi" className="relative p-2 text-gray-600 hover:text-amber-700 transition-colors group">
                        <Bell size={24} strokeWidth={1.5} className="group-hover:origin-top group-hover:animate-swing" />
                        {unreadNotif > 0 && (
                          <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border border-white transform translate-x-1 -translate-y-1 shadow-sm animate-pulse">
                            {unreadNotif > 9 ? '9+' : unreadNotif}
                          </span>
                        )}
                      </Link>

                      {/* Ikon Chat */}
                      <Link href="/chat" className="relative p-2 text-gray-600 hover:text-amber-700 transition-colors">
                        <MessageSquare size={24} strokeWidth={1.5} />
                        {unreadChat > 0 && (
                          <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border border-white transform translate-x-1 -translate-y-1 shadow-sm">
                            {unreadChat > 9 ? '9+' : unreadChat}
                          </span>
                        )}
                      </Link>

                      {/* Ikon Keranjang */}
                      <Link href="/keranjang" className="relative p-2 text-gray-600 hover:text-amber-700 transition-colors">
                        <ShoppingCart size={24} strokeWidth={1.5} />
                        {cartCount > 0 && (
                          <span className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border border-white transform translate-x-1 -translate-y-1 shadow-sm">
                            {cartCount}
                          </span>
                        )}
                      </Link>
                    </>
                  )}

                  <div className="flex items-center gap-2 ml-2 border-l border-gray-100 pl-4">
                    <Link href={isAdmin ? '/admin/dashboard' : '/dashboard'} className="text-amber-700 font-bold hover:text-amber-800 transition">
                      Halo, {userName}
                      {isAdmin && <span className="text-[10px] bg-amber-100 px-2 py-0.5 rounded-md ml-1 uppercase">Admin</span>}
                    </Link>
                    
                    <button onClick={handleLogout} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50" title="Keluar Akun">
                      <LogOut size={18} strokeWidth={2} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-4">
                  <Link href="/login" className="text-gray-600 hover:text-amber-700 font-medium transition">Masuk</Link>
                  <Link href="/register" className="bg-amber-700 hover:bg-amber-800 text-white px-5 py-2.5 rounded-full font-medium transition shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                    Daftar
                  </Link>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* TAMPILAN DROPDOWN MOBILE */}
      <div className={`md:hidden absolute w-full bg-white border-b border-gray-100 shadow-2xl transition-all duration-300 origin-top ${isOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'}`}>
        <div className="px-6 pt-4 pb-8 flex flex-col space-y-4">
          <Link href="/katalog" onClick={() => setIsOpen(false)} className={`font-medium py-3 border-b border-gray-50 ${pathname === '/katalog' ? 'text-amber-700 font-bold' : 'text-gray-600'}`}>Katalog</Link>
          <Link href="/kategori" onClick={() => setIsOpen(false)} className={`font-medium py-3 border-b border-gray-50 ${pathname === '/kategori' ? 'text-amber-700 font-bold' : 'text-gray-600'}`}>Kategori</Link>
          <Link href="/tentang" onClick={() => setIsOpen(false)} className="font-medium text-gray-600 py-3 border-b border-gray-50">Tentang Kami</Link>

          {isAuth ? (
            <>
              {!isAdmin && (
                <>
                  <Link href="/pesanan" onClick={() => setIsOpen(false)} className="font-bold text-amber-700 py-3 border-b border-gray-50">Pesanan Saya</Link>
                  
                  {/* Menu Notifikasi Mobile */}
                  <Link href="/notifikasi" onClick={() => setIsOpen(false)} className="flex justify-between items-center font-medium text-gray-600 py-3 border-b border-gray-50">
                    <span className="flex items-center gap-2"><Bell size={18}/> Notifikasi</span>
                    {unreadNotif > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full animate-pulse">{unreadNotif} Baru</span>}
                  </Link>
                  
                  <Link href="/chat" onClick={() => setIsOpen(false)} className="flex justify-between items-center font-medium text-gray-600 py-3 border-b border-gray-50">
                    <span className="flex items-center gap-2"><MessageSquare size={18}/> Chat Support</span>
                    {unreadChat > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full">{unreadChat} Baru</span>}
                  </Link>
                </>
              )}

              <div className="pt-4 flex items-center justify-between">
                <Link href={isAdmin ? '/admin/dashboard' : '/dashboard'} onClick={() => setIsOpen(false)} className="text-amber-700 font-bold">
                  Halo, {userName} {isAdmin && <span className="text-[10px] bg-amber-100 px-2 py-0.5 rounded-md ml-1 uppercase">Admin</span>}
                </Link>
                <button onClick={handleLogout} className="text-red-500 font-bold flex items-center gap-2 px-4 py-2 bg-red-50 rounded-xl active:scale-95 transition-transform">
                  <LogOut size={18} /> Keluar
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-3 pt-4">
              <Link href="/login" onClick={() => setIsOpen(false)} className="text-center font-bold text-gray-600 py-3 bg-gray-50 rounded-xl">Masuk</Link>
              <Link href="/register" onClick={() => setIsOpen(false)} className="text-center font-bold text-white py-3 bg-amber-700 rounded-xl">Daftar</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}