"use client";

import { useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { Search, X, Star, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface HomeClientProps {
  initialCategories: any[];
  initialProducts: any[];
  currentSearch?: string;
  currentCategory?: string;
}

export default function HomeClient({ 
  initialCategories, 
  initialProducts, 
  currentSearch = "", 
  currentCategory = "" 
}: HomeClientProps) {
  const [search, setSearch] = useState(currentSearch);

  return (
    <div className="bg-[#FAFAFA] min-h-screen font-sans">
      {/* --- HERO SECTION (Elegan Artisanal) --- */}
      <section className="relative bg-amber-50 overflow-hidden border-b border-amber-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-36 flex flex-col items-center text-center relative z-10">
          <span className="text-amber-600 text-xs font-black uppercase tracking-[0.4em] mb-6">Authentic Gorontalo Art</span>
          <h1 className="text-5xl md:text-8xl font-black text-amber-950 mb-8 tracking-tighter leading-[1.1]">
            Sentuhan Magis <br />
            <span className="italic font-serif text-amber-700 font-light">di Setiap Detail.</span>
          </h1>
          <p className="text-lg md:text-xl text-amber-900/60 mb-12 max-w-2xl font-medium leading-relaxed">
            Rayakan keindahan kerajinan tangan tradisional dengan koleksi aksesori eksklusif Wulita yang didesain untuk gaya modern Anda.
          </p>
          <div className="flex flex-col sm:flex-row gap-5">
            <a href="#katalog" className="bg-amber-900 hover:bg-amber-800 text-white px-12 py-5 rounded-full text-sm font-bold uppercase tracking-widest shadow-2xl shadow-amber-900/30 transition transform hover:-translate-y-1 flex items-center gap-3">
              Mulai Belanja <ArrowRight size={18} />
            </a>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-200/30 via-transparent to-transparent -z-0 opacity-50" />
      </section>

      {/* --- KATALOG UTAMA --- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20" id="katalog">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-16">
          <div className="max-w-xl">
            <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-4">Koleksi Terpilih</h2>
            <p className="text-gray-500 text-lg leading-relaxed">Keindahan yang lahir dari ketelatenan tangan para pengrajin lokal Gorontalo.</p>
          </div>

          {/* Filter Bar Artisanal */}
          <div className="bg-white p-4 rounded-[2.5rem] shadow-xl shadow-gray-200/40 border border-gray-100 flex flex-wrap items-center gap-4 w-full lg:w-auto">
            <form action="/" method="GET" className="relative flex-grow md:min-w-[300px]">
              <input 
                type="text" 
                name="cari"
                placeholder="Cari maha karya..." 
                defaultValue={search}
                suppressHydrationWarning
                className="pl-12 pr-4 py-3.5 w-full border-none bg-gray-50 rounded-2xl focus:ring-2 focus:ring-amber-500 transition-all text-sm font-medium"
              />
              <Search className="w-5 h-5 text-amber-700/40 absolute left-4 top-1/2 -translate-y-1/2" />
            </form>

            <div className="h-10 w-px bg-gray-100 hidden md:block" />

            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 md:pb-0">
              <Link 
                href="/" 
                className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${!currentCategory ? 'bg-amber-900 text-white shadow-lg' : 'text-gray-400 hover:text-amber-700'}`}
              >
                Semua
              </Link>
              {initialCategories.map((cat) => (
                <Link 
                  key={cat.id} 
                  href={`/?kategori=${cat.slug}`}
                  className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${currentCategory === cat.slug ? 'bg-amber-900 text-white shadow-lg' : 'text-gray-400 hover:text-amber-700'}`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* --- GRID PRODUK DINAMIS --- */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-12">
          {initialProducts.length > 0 ? (
            initialProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full py-32 text-center bg-white rounded-[4rem] border border-dashed border-gray-200">
              <Search className="w-16 h-16 text-gray-200 mx-auto mb-6" />
              <h3 className="text-2xl font-black text-gray-900">Produk Tidak Ditemukan</h3>
              <p className="text-gray-400 mt-2">Coba gunakan kata kunci lain atau reset filter Anda.</p>
              <Link href="/" className="mt-8 inline-block text-amber-700 font-black border-b-2 border-amber-700 pb-1 uppercase text-xs tracking-widest hover:text-amber-900 hover:border-amber-900 transition-all">
                Reset Pencarian
              </Link>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-amber-950 text-amber-50/40 py-20 text-center border-t border-amber-900/20 mt-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="font-serif text-3xl text-white italic mb-4">Wulita Handmade</div>
          <p className="text-xs uppercase tracking-[0.5em] mb-12">Fine Craftsmanship from Gorontalo</p>
          <p className="text-[10px] font-medium">&copy; 2026 Wulita Handmade. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}