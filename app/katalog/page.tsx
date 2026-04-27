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
  searchParams: Promise<{ kategori_id?: string; cari?: string }>;
}) {
  // 1. Unwrapping searchParams (Wajib di Next.js 15)
  const params = await searchParams;
  const kategoriId = params.kategori_id ? parseInt(params.kategori_id) : undefined;
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
          kategoriId ? { categoryId: kategoriId } : {},
          cari ? { name: { contains: cari, mode: 'insensitive' } } : {},
        ]
      },
      orderBy: { createdAt: 'desc' }
    }),

    kategoriId ? prisma.category.findUnique({ where: { id: kategoriId } }) : null
  ]);

  // Helper untuk jalur gambar (Sesuaikan dengan folder upload kita)
  const getImagePath = (path: string | null) => {
    if (!path) return "/images/placeholder.png";
    if (path.startsWith('http') || path.startsWith('/')) return path;
    // Karena kita simpan di public/uploads/products, pastikan path diawali /
    return path.startsWith('uploads') ? `/${path}` : `/uploads/products/${path}`;
  };

  const currentYear = 2026;

  return (
    <div className="bg-[#FAFAFA] min-h-screen flex flex-col font-sans">
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          {/* HEADER & SEARCH BAR */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                {activeCategory ? (
                  <>Kategori: <span className="text-amber-600">{activeCategory.name}</span></>
                ) : (
                  <>Semua <span className="text-amber-600">Produk</span></>
                )}
              </h1>
              <p className="text-gray-500 mt-1 uppercase text-xs font-bold tracking-widest leading-none">
                Koleksi Kerajinan Tangan Gorontalo
              </p>
            </div>

            {/* Form Pencarian */}
            <form action="/katalog" method="GET" className="relative group">
              <input 
                type="text" 
                name="cari"
                defaultValue={cari}
                placeholder="Cari produk..."
                className="w-full md:w-80 pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all shadow-sm"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-amber-600" />
              {kategoriId && <input type="hidden" name="kategori_id" value={kategoriId} />}
            </form>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* SIDEBAR KATEGORI */}
            <aside className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm sticky top-28">
                <h3 className="font-black text-gray-900 mb-4 border-b pb-4 uppercase text-[10px] tracking-widest">Filter Kategori</h3>
                <div className="space-y-2">
                  <Link 
                    href="/katalog"
                    className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all ${!kategoriId ? 'bg-amber-900 text-white font-bold shadow-lg shadow-amber-900/20' : 'text-gray-600 hover:bg-amber-50 hover:text-amber-900'}`}
                  >
                    <span>Semua Produk</span>
                  </Link>

                  {categories.map((cat) => (
                    <Link 
                      key={cat.id}
                      href={`/katalog?kategori_id=${cat.id}`}
                      className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all group ${kategoriId === cat.id ? 'bg-amber-900 text-white font-bold shadow-lg shadow-amber-900/20' : 'text-gray-600 hover:bg-amber-50 hover:text-amber-900'}`}
                    >
                      <span>{cat.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-lg font-bold ${kategoriId === cat.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-amber-200 group-hover:text-amber-900'}`}>
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
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <div key={product.id} className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all group">
                      <Link href={`/produk/${product.slug}`}>
                        <div className="aspect-square overflow-hidden bg-gray-50 relative">
                          <img 
                            src={getImagePath(product.image)} 
                            alt={product.name} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        </div>
                        <div className="p-5">
                          <h3 className="font-bold text-gray-900 line-clamp-1 group-hover:text-amber-700 transition-colors uppercase text-xs tracking-tight">
                            {product.name}
                          </h3>
                          <p className="text-amber-900 font-black mt-2 text-lg">
                            Rp {new Intl.NumberFormat('id-ID').format(product.price)}
                          </p>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                /* EMPTY STATE */
                <div className="py-20 text-center bg-white rounded-[3rem] border border-dashed border-gray-200">
                  <img src="https://illustrations.popsy.co/amber/empty-state.svg" className="w-48 mx-auto mb-6 opacity-60" alt="Empty" />
                  <p className="text-gray-400 italic font-medium">Maaf, produk tidak ditemukan.</p>
                  <Link href="/katalog" className="text-amber-700 font-bold underline mt-4 inline-block hover:text-amber-900 text-xs uppercase tracking-widest">
                    Reset Filter
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-100 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">
          &copy; {currentYear} Wulita Handmade. Crafting Excellence.
        </div>
      </footer>
    </div>
  );
}