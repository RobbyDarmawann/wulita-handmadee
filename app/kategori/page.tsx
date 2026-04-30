import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/prisma';
import { ShoppingBag, Tags } from 'lucide-react'; 
import { resolveImageUrl } from '@/lib/image';

export const metadata = {
  title: "Kategori Produk - Wulita Handmade",
};

export const revalidate = 0;

export default async function KategoriPage() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  const currentYear = 2026; 

  return (
    <div className="bg-[#FAFAFA] min-h-screen flex flex-col font-sans">
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest mb-4">
              <Tags size={12} /> Koleksi Wulita
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
              Jelajahi Kategori <span className="text-amber-600">Produk</span>
            </h1>
            <p className="text-gray-500 font-medium leading-relaxed">
              Temukan berbagai macam kerajinan tangan autentik Gorontalo yang dirajut dengan dedikasi tinggi, dikelompokkan khusus untuk mempermudah pencarianmu.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {categories.length > 0 ? (
              categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/katalog?kategori=${category.slug}`}
                  className="group bg-white border border-gray-100 rounded-[2.5rem] p-8 hover:shadow-2xl hover:shadow-amber-900/10 hover:border-amber-200 transition-all duration-500 flex flex-col items-center justify-center text-center relative overflow-hidden"
                >
                  {/* Ornamen Latar Belakang saat Hover */}
                  <div className="absolute -right-4 -top-4 w-20 h-20 bg-amber-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="w-28 h-28 bg-gray-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-500 overflow-hidden border-4 border-white shadow-inner relative z-10">
                    {resolveImageUrl(category.image, "categories") ? (
                      <Image
                        src={resolveImageUrl(category.image, "categories")!} 
                        alt={category.name}
                        fill
                        unoptimized
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:rotate-3"
                      />
                    ) : (
                      <ShoppingBag className="w-12 h-12 text-gray-300 group-hover:text-amber-600 transition-colors" strokeWidth={1.5} />
                    )}
                  </div>
                  
                  <h3 className="font-black text-xl text-gray-900 group-hover:text-amber-900 transition-colors relative z-10">
                    {category.name}
                  </h3>
                  
                  <div className="mt-4 bg-gray-50 px-4 py-1.5 rounded-full group-hover:bg-amber-100 transition-all duration-300 relative z-10 border border-gray-100 group-hover:border-amber-200">
                    <p className="text-[10px] text-gray-500 group-hover:text-amber-700 font-black uppercase tracking-widest">
                      {category._count.products} Produk Tersedia
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                <Tags size={48} className="mx-auto text-gray-200 mb-4" />
                <p className="text-gray-400 font-bold italic">
                  Belum ada kategori yang ditambahkan oleh Admin.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-100 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
          &copy; {currentYear} Wulita Handmade • Luxury Artisanal Craft
        </div>
      </footer>
    </div>
  );
}