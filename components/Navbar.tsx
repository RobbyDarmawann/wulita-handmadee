"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingCart, MessageSquare, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  
  // State Dinamis dari Supabase
  const [isAuth, setIsAuth] = useState(false); 
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState('Pengguna');

  // Simulasi data keranjang & chat (Nanti kita sambung ke API Prisma)
  const cartCount = 3;
  const unreadChat = 2;

  useEffect(() => {
    // 1. Cek sesi user saat Navbar pertama kali di-load
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      updateUserState(session);
    };

    checkUser();

    // 2. Dengarkan perubahan (misal user tiba-tiba login/logout di tab lain)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      updateUserState(session);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  // Fungsi helper untuk update state UI
  const updateUserState = (session: any) => {
    if (session) {
      setIsAuth(true);
      // Ambil nama dari metadata yang kita isi saat register/seeding
      const nameParts = session.user.user_metadata?.name?.split(' ') || ['Pengguna'];
      setUserName(nameParts[0]); // Ambil nama panggilan (kata pertama)
      
      // Deteksi Admin (sementara kita deteksi dari email tertentu)
      setIsAdmin(session.user.email === 'admin@wulita.com'); 
    } else {
      setIsAuth(false);
      setUserName('Pengguna');
      setIsAdmin(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

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

          {/* Menu Navigasi Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/katalog" 
              className={`font-medium transition ${pathname === '/katalog' ? 'text-amber-700 font-bold' : 'text-gray-600 hover:text-amber-700'}`}
            >
              Katalog
            </Link>

            <Link 
              href="/kategori" 
              className={`font-medium transition ${pathname === '/kategori' ? 'text-amber-700 font-bold' : 'text-gray-600 hover:text-amber-700'}`}
            >
              Kategori
            </Link>

            <Link href="/tentang" className="text-gray-600 hover:text-amber-700 font-medium transition">
              Tentang Kami
            </Link>
            
            {isAuth && !isAdmin && (
              <Link href="/pesanan" className="text-amber-700 font-bold hover:text-amber-900 transition underline decoration-2 underline-offset-8">
                Pesanan Saya
              </Link>
            )}

            {/* Menu Kanan (Auth/Cart/Chat) */}
            <div className="pl-4 border-l border-gray-200 flex items-center space-x-4">
              {isAuth ? (
                <>
                  <Link href="/chat" className="relative p-2 text-gray-600 hover:text-amber-700 transition-colors">
                    <MessageSquare size={24} strokeWidth={1.5} />
                    {unreadChat > 0 && (
                      <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border border-white transform translate-x-1 -translate-y-1 shadow-sm">
                        {unreadChat}
                      </span>
                    )}
                  </Link>

                  <Link href="/keranjang" className="relative p-2 text-gray-600 hover:text-amber-700 transition-colors">
                    <ShoppingCart size={24} strokeWidth={1.5} />
                    {cartCount > 0 && (
                      <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border border-white transform translate-x-1 -translate-y-1 shadow-sm">
                        {cartCount}
                      </span>
                    )}
                  </Link>

                  <div className="flex items-center gap-2 ml-2 border-l border-gray-100 pl-4">
                    <Link href={isAdmin ? '/admin/dashboard' : '/dashboard'} className="text-amber-700 font-bold hover:text-amber-800 transition">
                      Halo, {userName}
                      {isAdmin && <span className="text-[10px] bg-amber-100 px-2 py-0.5 rounded-md ml-1 uppercase">Admin</span>}
                    </Link>
                    
                    {/* Tombol Logout Tambahan */}
                    <button 
                      onClick={handleLogout} 
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                      title="Keluar Akun"
                    >
                      <LogOut size={18} strokeWidth={2} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-4">
                  <Link href="/login" className="text-gray-600 hover:text-amber-700 font-medium transition">
                    Masuk
                  </Link>
                  <Link 
                    href="/register" 
                    className="bg-amber-700 hover:bg-amber-800 text-white px-5 py-2.5 rounded-full font-medium transition shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    Daftar
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}