import Link from 'next/link';
import Image from 'next/image'; // Gunakan komponen Image Next.js agar lebih optimal

interface Product {
  id: number;
  name: string;
  price: number;
  discount_price?: number | null; 
  image: string | null;
  stock: number;
  slug: string;
}

export default function ProductCard({ product }: { product: Product }) {
  const isPromo = product.discount_price && product.discount_price > 0;

  // PERBAIKAN LOGIKA GAMBAR:
  // Kita pastikan src-nya benar dan menghapus penambahan "/images/" yang salah tadi
  const imageUrl = product.image && product.image.trim() !== "" 
    ? (product.image.startsWith('/') ? product.image : `/${product.image}`)
    : null;

  return (
    <Link 
      href={`/produk/${product.slug}`} 
      className="block group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
    >
      
      {/* Bagian Gambar */}
      <div className="relative h-64 bg-gray-50 overflow-hidden flex items-center justify-center">
        {imageUrl ? (
          <Image 
            src={imageUrl} 
            alt={product.name} 
            fill
            unoptimized // Agar tidak perlu setting domain di next.config
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-100 text-4xl">
            📷
          </div>
        )}

        {isPromo && (
          <div className="absolute top-4 left-4 bg-red-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-md z-10">
            PROMO
          </div>
        )}
      </div>

      {/* Bagian Info Produk */}
      <div className="p-5 flex flex-col h-full">
        <h3 className="text-base font-black text-gray-900 group-hover:text-amber-700 transition-colors line-clamp-2 mb-1 leading-tight">
          {product.name}
        </h3>
        
        <div className="mt-auto pt-4 flex items-end justify-between">
          <div className="flex flex-col">
            {isPromo ? (
              <>
                <span className="text-[10px] text-gray-400 font-bold line-through decoration-red-500 mb-0.5">
                  Rp {product.price.toLocaleString('id-ID')}
                </span>
                <span className="text-lg font-black text-red-600">
                  Rp {product.discount_price!.toLocaleString('id-ID')}
                </span>
              </>
            ) : (
              <span className="text-lg font-black text-amber-950">
                Rp {product.price.toLocaleString('id-ID')}
              </span>
            )}
            <span className="text-[9px] text-gray-400 font-black uppercase tracking-tighter mt-1">
              Stok: {product.stock} Pcs
            </span>
          </div>
          
          <button 
            className={`p-2.5 rounded-xl transition-all ${
              isPromo 
                ? 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white' 
                : 'bg-amber-50 text-amber-900 hover:bg-amber-950 hover:text-white'
            }`}
            onClick={(e) => {
              e.preventDefault(); 
              alert('Produk berhasil masuk keranjang!');
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </button>
        </div>
      </div>
    </Link>
  );
}