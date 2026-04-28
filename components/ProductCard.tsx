import Link from 'next/link';
import Image from 'next/image';

interface Product {
  id: number;
  name: string;
  price: number;
  discount_price?: number | null; 
  image: string | null;
  stock: number;
  slug: string;
  category?: {
    name: string;
  }
}

export default function ProductCard({ product }: { product: Product }) {
  // Cek apakah produk sedang promo (punya discount_price yang lebih dari 0)
  const isPromo = product.discount_price && product.discount_price > 0;

  // Optimasi URL Gambar
  const imageUrl = product.image && product.image.trim() !== "" 
    ? (product.image.startsWith('/') ? product.image : `/${product.image}`)
    : null;

  // Fungsi untuk format angka ke Rupiah
  const formatRupiah = (angka: number) => new Intl.NumberFormat('id-ID', { 
    style: 'currency', 
    currency: 'IDR', 
    minimumFractionDigits: 0 
  }).format(angka);

  return (
    <Link 
      href={`/produk/${product.slug}`} 
      className="block group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col h-full"
    >
      {/* Bagian Gambar */}
      <div className="relative h-64 bg-gray-50 overflow-hidden flex items-center justify-center shrink-0">
        {imageUrl ? (
          <Image 
            src={imageUrl} 
            alt={product.name} 
            fill
            unoptimized
            className="object-cover transition-transform duration-700 group-hover:scale-110" 
          />
        ) : (
          <span className="text-gray-300 font-medium">Tanpa Gambar</span>
        )}
        
        {/* Label Promo (Muncul otomatis jika ada diskon) */}
        {isPromo && (
          <div className="absolute top-4 left-4 bg-red-500 text-white font-black text-[10px] px-3 py-1.5 rounded-full shadow-lg z-10 uppercase tracking-widest">
            Promo
          </div>
        )}
      </div>

      {/* Detail Produk */}
      <div className="p-5 flex flex-col flex-grow">
        
        {/* Kategori */}
        {product.category && (
          <span className="text-[10px] font-black text-amber-600/70 uppercase tracking-widest mb-2 block">
            {product.category.name}
          </span>
        )}

        {/* Nama Produk */}
        <h3 className="font-bold text-gray-900 text-lg leading-tight mb-3 line-clamp-2">
          {product.name}
        </h3>

        {/* --- BAGIAN HARGA YANG DITAMBAHKAN --- */}
        <div className="mt-auto mb-4">
          {isPromo ? (
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 line-through font-medium">
                {formatRupiah(product.price)}
              </span>
              <span className="text-xl font-black text-red-600">
                {formatRupiah(product.discount_price!)}
              </span>
            </div>
          ) : (
            <span className="text-xl font-black text-amber-950 block">
              {formatRupiah(product.price)}
            </span>
          )}
        </div>
        {/* ------------------------------------- */}

        {/* Footer Card: Stok & Tombol Keranjang */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <span className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">
            Stok: {product.stock} Pcs
          </span>
          
          <div 
            className={`p-2.5 rounded-xl transition-all ${
              isPromo 
                ? 'bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white' 
                : 'bg-amber-50 text-amber-900 group-hover:bg-amber-950 group-hover:text-white'
            }`}
          >
            {/* Ikon Keranjang */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>

      </div>
    </Link>
  );
}