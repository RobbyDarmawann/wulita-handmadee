"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, ShoppingBag, Loader2, ArrowRight } from 'lucide-react';
import { removeFromCart, updateCartQty } from './actions';
import { resolveImageUrl } from '@/lib/image';

export default function KeranjangClient({ initialItems }: { initialItems: any[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const subtotal = initialItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalQty = initialItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleUpdateQty = async (id: number, inc: number) => {
    setLoadingId(id);
    await updateCartQty(id, inc);
    router.refresh(); // Ambil data terbaru dari server
    setLoadingId(null);
  };

  const handleRemove = async (id: number) => {
    if (confirm("Keluarkan pusaka ini dari palka?")) {
      setLoadingId(id);
      await removeFromCart(id);
      router.refresh(); // Ambil data terbaru dari server
      setLoadingId(null);
    }
  };

  if (initialItems.length === 0) {
    return (
      <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
        <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="h-12 w-12 text-amber-600" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Keranjangmu Kosong</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto italic font-medium">Belum ada pusaka yang Anda pilih untuk berlayar.</p>
        <Link href="/katalog" className="inline-block bg-amber-900 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all">
          Mulai Menjelajah
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      <div className="lg:col-span-2 space-y-4">
        {initialItems.map(item => (
          <div key={item.id} className={`bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center gap-6 relative transition-all duration-300 ${loadingId === item.id ? 'opacity-30 pointer-events-none' : 'hover:border-amber-200'}`}>
            <button onClick={() => handleRemove(item.id)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors p-2">
              <Trash2 size={20} />
            </button>
            
            <div className="w-28 h-28 bg-gray-50 rounded-2xl flex-shrink-0 overflow-hidden border border-gray-100 relative">
              <img 
                src={resolveImageUrl(item.product?.image, "products") || "/images/placeholder.png"} 
                alt={item.product?.name} 
                className="w-full h-full object-cover" 
              />
            </div>
            
            <div className="flex-grow text-center sm:text-left">
              <h3 className="text-lg font-black text-amber-950 uppercase tracking-tight">{item.product?.name}</h3>
              <p className="text-[10px] text-amber-600 mt-1 font-black bg-amber-50 inline-block px-3 py-1 rounded-lg border border-amber-100 uppercase tracking-widest">
                Varian: {item.variantName || 'Standar'}
              </p>
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="font-black text-xl text-gray-900">Rp {item.price.toLocaleString('id-ID')}</p>
                <div className="flex items-center bg-gray-50 border border-gray-100 rounded-xl p-1 shadow-inner">
                  <button onClick={() => handleUpdateQty(item.id, -1)} className="w-8 h-8 flex items-center justify-center font-black text-lg text-gray-400 hover:text-amber-900">-</button>
                  <span className="w-12 text-center font-black text-amber-950">{item.quantity}</span>
                  <button onClick={() => handleUpdateQty(item.id, 1)} className="w-8 h-8 flex items-center justify-center font-black text-lg text-gray-400 hover:text-amber-900">+</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="lg:col-span-1">
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-amber-950/5 sticky top-28">
          <h2 className="text-xl font-black text-amber-950 mb-6 uppercase tracking-widest">Ringkasan</h2>
          <div className="space-y-4 mb-6 text-sm font-bold text-gray-500">
            <div className="flex justify-between">
              <span>Total Barang ({totalQty})</span>
              <span className="text-gray-900">Rp {subtotal.toLocaleString('id-ID')}</span>
            </div>
          </div>
          <hr className="border-gray-50 mb-6" />
          <div className="flex justify-between mb-8">
            <span className="text-xs self-end opacity-50 font-black uppercase">Total Bayar</span>
            <span className="text-3xl font-black text-amber-900">Rp {subtotal.toLocaleString('id-ID')}</span>
          </div>
          <Link href="/checkout" className="block w-full bg-amber-900 text-white text-center py-5 rounded-2xl font-black shadow-xl shadow-amber-900/20 hover:bg-black transition-all active:scale-95 text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3">
            Checkout <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}