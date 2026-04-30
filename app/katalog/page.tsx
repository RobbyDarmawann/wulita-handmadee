import Link from 'next/link';
import prisma from '@/lib/prisma';
import { Search } from 'lucide-react';

export const metadata = {
  title: "Katalog Produk - Wulita Handmade",
};

// Next.js 15: searchParams adalah Promise
export default async function KatalogPage({
  searchParams,
}: {
  // PERBAIKAN: Kita ubah menjadi 'kategori' (slug string) bukan 'kategori_id'
  searchParams: Promise<{ kategori?: string; cari?: string }>;
}) {
  // 1. Unwrapping searchParams (Wajib di Next.js 15)
  const params = await searchParams;
  const kategoriSlug = params.kategori; // Menangkap slug dari URL
  const cari = params.cari || "";

  // 2. Query Data dari Prisma secara bersamaan
  const [categories, products, activeCategory] = await Promise.all([
    prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' }
    }),
    
    prisma.product.findMany({
      where: {
        AND: [
          // PERBAIKAN: Cari produk berdasarkan slug kategorinya
          kategoriSlug ? { category: { slug: kategoriSlug } } : {},
          cari ? { name: { contains: cari, mode: 'insensitive' } } : {},
        ]
      },
      orderBy: { createdAt: 'desc' }
    }),

    // PERBAIKAN: Cari kategori yang sedang aktif berdasarkan slug-nya
    kategoriSlug ? prisma.category.findUnique({ where: { slug: kategoriSlug } }) : null
  ]);

  // Helper untuk jalur gambar
  const getImagePath = (path: string | null) => {
    if (!path) return "/images/placeholder.png";
    if (path.startsWith('http') || path.startsWith('/')) return path;
    return path.startsWith('uploads') ? `/${path}` : `/uploads/products/${path}`;
  };

  const currentYear = new Date().getFullYear();

  // --- STYLING KHUSUS WULITA HANDMADE ---
  const inputStyle = "w-full pl-12 pr-5 py-4 bg-amber-50/30 border-2 border-amber-100/80 rounded-[1.25rem] outline-none focus:border-amber-400 focus:ring-[4px] focus:ring-amber-500/10 transition-all duration-300 text-amber-950 placeholder:text-amber-900/40 font-medium shadow-inner";

  return (
    <div className="bg-[#FAFAFA] min-h-screen flex flex-col font-sans">
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          {/* HEADER & SEARCH BAR */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-amber-100/50 pb-8">
            <div>
              <h1 className="text-4xl font-black text-amber-950 tracking-tight leading-tight">
                {activeCategory ? (
                  <>Kategori: <br className="hidden md:block"/><span className="text-amber-600 font-serif italic font-medium">{activeCategory.name}</span></>
                ) : (
                  <>Semua <br className="hidden md:block"/><span className="text-amber-600 font-serif italic font-medium">Produk</span></>
                )}
              </h1>
              <p className="text-amber-900/60 mt-3 uppercase text-[10px] font-black tracking-[0.3em] leading-none">
                Koleksi Kerajinan Tangan Gorontalo
              </p>
            </div>

            {/* Form Pencarian */}
            <form action="/katalog" method="GET" className="relative group w-full md:w-96">
              <input 
                type="text" 
                name="cari"
                defaultValue={cari}
                placeholder="Cari maha karya..."
                className={inputStyle}
              />
              <Search className="w-5 h-5 text-amber-900/40 absolute left-5 top-1/2 -translate-y-1/2 group-focus-within:text-amber-600 transition-colors" />
              {/* PERBAIKAN: Kirim nama input sebagai 'kategori' agar filter gabungan tetap jalan */}
              {kategoriSlug && <input type="hidden" name="kategori" value={kategoriSlug} />}
            </form>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
            
            {/* SIDEBAR KATEGORI */}
            <aside className="space-y-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-amber-100/50 shadow-xl shadow-amber-900/5 sticky top-28">
                <h3 className="font-black text-amber-950 mb-6 border-b border-amber-100/50 pb-4 uppercase text-[10px] tracking-widest">
                  Filter Kategori
                </h3>
                <div className="space-y-3">
                  <Link 
                    href="/katalog"
                    // LOGIKA AKTIF: Jika tidak ada kategoriSlug di URL
                    className={`flex items-center justify-between px-5 py-3.5 rounded-[1.25rem] text-sm transition-all duration-300 ${!kategoriSlug ? 'bg-amber-950 text-white font-black shadow-lg shadow-amber-900/20 scale-105' : 'text-amber-900/70 font-medium hover:bg-amber-50 hover:text-amber-950 hover:scale-105'}`}
                  >
                    <span>Semua Produk</span>
                  </Link>

                  {categories.map((cat) => (
                    <Link 
                      key={cat.id}
                      href={`/katalog?kategori=${cat.slug}`} // PERBAIKAN URL
                      // LOGIKA AKTIF: Jika kategoriSlug sama dengan slug kategori ini
                      className={`flex items-center justify-between px-5 py-3.5 rounded-[1.25rem] text-sm transition-all duration-300 group ${kategoriSlug === cat.slug ? 'bg-amber-950 text-white font-black shadow-lg shadow-amber-900/20 scale-105' : 'text-amber-900/70 font-medium hover:bg-amber-50 hover:text-amber-950 hover:scale-105'}`}
                    >
                      <span>{cat.name}</span>
                      <span className={`text-[10px] px-2.5 py-1 rounded-lg font-black transition-colors ${kategoriSlug === cat.slug ? 'bg-white/20 text-white' : 'bg-amber-100/50 text-amber-900/50 group-hover:bg-amber-200/50 group-hover:text-amber-900'}`}>
                        {cat._count.products}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </aside>

            {/* GRID PRODUK */}
            <div className="lg:col-span-3">
              {products.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8">
                  {products.map((product) => {
                    const isPromo = product.discount_price && product.discount_price > 0;

                    return (
                      <div key={product.id} className="bg-white rounded-[2rem] border border-amber-100/50 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-amber-900/10 hover:-translate-y-2 transition-all duration-500 group flex flex-col h-full">
                        <Link href={`/produk/${product.slug}`} className="flex flex-col h-full">
                          <div className="aspect-square overflow-hidden bg-amber-50/30 relative flex-shrink-0">
                            <img 
                              src={getImagePath(product.image)} 
                              alt={product.name} 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            {isPromo && (
                               <div className="absolute top-4 left-4 bg-red-500 text-white font-black text-[10px] px-3 py-1.5 rounded-full shadow-lg z-10 uppercase tracking-widest">
                                 Promo
                               </div>
                            )}
                          </div>
                          
                          <div className="p-6 flex flex-col flex-grow">
                             <span className="text-[9px] font-black text-amber-600/70 uppercase tracking-widest mb-2 block">
                               {categories.find(c => c.id === product.categoryId)?.name || 'Kategori'}
                             </span>
                            
                            <h3 className="font-bold text-amber-950 text-base leading-snug mb-3 line-clamp-2 group-hover:text-amber-700 transition-colors">
                              {product.name}
                            </h3>
                            
                            <div className="mt-auto pt-2 border-t border-amber-50">
                              {isPromo ? (
                                <div className="flex flex-col">
                                  <span className="text-[10px] text-amber-900/40 line-through font-medium">
                                    Rp {new Intl.NumberFormat('id-ID').format(product.price)}
                                  </span>
                                  <span className="text-xl font-black text-red-600">
                                    Rp {new Intl.NumberFormat('id-ID').format(product.discount_price!)}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xl font-black text-amber-950 block">
                                  Rp {new Intl.NumberFormat('id-ID').format(product.price)}
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      </div>
                    )
                  })}
                </div>
              ) : (
                /* EMPTY STATE ELEGAN */
                <div className="py-32 px-6 text-center bg-white rounded-[3rem] border border-dashed border-amber-200/80 shadow-inner">
                  <Search className="w-16 h-16 text-amber-200 mx-auto mb-6" />
                  <h3 className="text-2xl font-black text-amber-950 mb-2">Pencarian Tidak Ditemukan</h3>
                  <p className="text-amber-900/60 font-medium max-w-md mx-auto">
                    Maha karya yang Anda cari belum tersedia. Cobalah menggunakan kata kunci lain atau telusuri kategori yang ada.
                  </p>
                  <Link href="/katalog" className="text-amber-700 font-black border-b-2 border-amber-700 mt-8 pb-1 inline-block hover:text-amber-950 hover:border-amber-950 transition-colors text-xs uppercase tracking-[0.2em]">
                    Reset Pencarian
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-amber-950 text-amber-50/40 py-12 mt-auto text-center border-t border-amber-900/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="font-serif text-2xl text-white italic mb-2 opacity-80">Wulita Handmade</div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-6 opacity-60">Fine Craftsmanship from Gorontalo</p>
          <p className="text-[9px] font-medium opacity-40">&copy; {currentYear} Wulita Handmade. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}