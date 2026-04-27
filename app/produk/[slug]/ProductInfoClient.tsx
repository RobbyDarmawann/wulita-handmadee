"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  ShoppingCart, Star, ChevronRight, Heart, 
  ShieldCheck, ArrowLeft, Truck, Package, MessageSquare, User, Edit3,
  CheckCircle2, Loader2, ImageIcon
} from 'lucide-react';
import { addToCart } from '@/app/keranjang/actions';

export default function ProductDetailClient({ product, userId }: { product: any, userId: string | null }) {
  const router = useRouter();
  
  // --- STATE ---
  const [isPending, setIsPending] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [qty, setQty] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<any>(product.variants?.[0] || null);

  // --- HELPER PATH GAMBAR ---
  const getImagePath = (img: string | null) => {
    if (!img || img.trim() === "") return null;
    if (img.startsWith('/uploads') || img.startsWith('http')) return img;
    if (!img.startsWith('/')) return `/images/${img}`;
    return img;
  };

  const [activeImage, setActiveImage] = useState<string | null>(
    selectedVariant?.image ? getImagePath(selectedVariant.image) : getImagePath(product.image)
  );

  // Perhitungan Harga
  const basePrice = product.discount_price > 0 ? product.discount_price : product.price;
  const currentPrice = selectedVariant 
    ? (selectedVariant.price > 0 ? selectedVariant.price : basePrice)
    : basePrice;

  const formatRupiah = (angka: number) => new Intl.NumberFormat('id-ID', { 
    style: 'currency', 
    currency: 'IDR', 
    minimumFractionDigits: 0 
  }).format(angka);

  const allImages = [
    getImagePath(product.image),
    ...(product.variants?.map((v: any) => getImagePath(v.image)).filter(Boolean) || [])
  ].filter(Boolean);

  // Logika Rating
  const reviews = product.reviews || [];
  const hasReviews = reviews.length > 0;
  const avgRating = hasReviews 
    ? (reviews.reduce((acc: number, item: any) => acc + item.rating, 0) / reviews.length).toFixed(1)
    : "0";

  const ratingStats = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter((r: any) => r.rating === star).length,
    percent: hasReviews ? (reviews.filter((r: any) => r.rating === star).length / reviews.length) * 100 : 0
  }));

  // --- FUNGSI UTAMA: TAMBAH KE KERANJANG ---
  const handleAddToCart = async () => {
    if (!userId) {
      alert("Silakan login terlebih dahulu untuk memasukkan barang ke palka!");
      router.push('/login');
      return;
    }

    setIsPending(true);
    const formData = new FormData();
    formData.append("productId", product.id.toString());
    formData.append("variantName", selectedVariant?.name || "");
    formData.append("price", currentPrice.toString());
    formData.append("quantity", qty.toString());

    try {
      const result = await addToCart(formData);
      
      if (result.success) {
        setShowToast(true);
        router.refresh(); 
        setTimeout(() => setShowToast(false), 4000);
      } else {
        alert(result.error || "Gagal memasukkan barang.");
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans pb-20 relative">
      
      {/* NOTIFIKASI TOAST */}
      {showToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="bg-white border-2 border-green-100 shadow-2xl shadow-green-900/20 px-8 py-5 rounded-[2.5rem] flex items-center gap-5 text-gray-800">
            <div className="bg-green-500 text-white p-2 rounded-full ring-4 ring-green-50">
              <CheckCircle2 size={28} />
            </div>
            <div>
              <p className="font-black text-sm tracking-tight leading-none mb-1 text-gray-900">Berhasil Masuk Palka!</p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Produk siap berlayar</p>
            </div>
            <Link href="/keranjang" className="ml-4 bg-amber-900 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">
              Cek Palka
            </Link>
          </div>
        </div>
      )}

      {/* TOMBOL EDIT ADMIN */}
      <div className="fixed bottom-8 right-8 z-50">
        <Link 
          href={`/admin/produk/edit/${product.id}`}
          className="bg-black text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-3 hover:bg-amber-900 transition-all font-black uppercase text-xs tracking-widest border-2 border-white/10"
        >
          <Edit3 size={18} /> Edit Produk (Admin)
        </Link>
      </div>

      {/* BREADCRUMB */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
          <Link href="/" className="hover:text-amber-700 flex items-center gap-1 transition-colors">
            <ArrowLeft size={16} /> Beranda
          </Link>
          <ChevronRight size={16} className="text-gray-300" />
          <Link href={`/katalog?kategori_id=${product.categoryId}`} className="hover:text-amber-700 transition-colors">
            {product.category?.name || 'Kategori'}
          </Link>
          <ChevronRight size={16} className="text-gray-300" />
          <span className="text-amber-900 font-bold truncate max-w-[200px]">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            
            {/* GALLERY */}
            <div className="lg:w-1/2 p-6 md:p-10 lg:border-r border-gray-100">
              <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-gray-50 mb-6 group flex items-center justify-center">
                {activeImage ? (
                  <Image src={activeImage} alt={product.name} fill unoptimized className="object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <Package size={64} className="text-gray-200" />
                )}
                {product.discount_price > 0 && (
                  <div className="absolute top-6 left-6 bg-red-500 text-white font-black text-sm px-4 py-2 rounded-full shadow-lg z-10">PROMO</div>
                )}
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {allImages.map((img: any, idx: number) => (
                  <button key={idx} onClick={() => setActiveImage(img)} className={`relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 border-4 transition-all ${activeImage === img ? 'border-amber-500 scale-105' : 'border-transparent'}`}>
                    <Image src={img} alt="Thumb" fill unoptimized className="object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* INFO PRODUK */}
            <div className="lg:w-1/2 p-6 md:p-10 flex flex-col">
              <div className="sticky top-28">
                <div className="flex justify-between items-start mb-2">
                  <h1 className="text-3xl md:text-4xl font-black text-amber-950 leading-tight">{product.name}</h1>
                  <button className="p-3 bg-red-50 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all"><Heart size={24} /></button>
                </div>

                <div className="flex items-center gap-4 mb-8">
                  <div className="flex items-center text-amber-500">
                    {[...Array(5)].map((_, i) => (
                       <Star key={i} size={20} fill={i < Math.round(Number(avgRating)) ? "currentColor" : "none"} className={i < Math.round(Number(avgRating)) ? "text-amber-500" : "text-gray-200"} />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-gray-400">{reviews.length} Ulasan</span>
                </div>

                <div className="mb-8 p-6 bg-gradient-to-br from-amber-50 to-[#F3E5DC]/30 rounded-[2rem] border border-amber-100">
                  <p className="text-xs font-black text-amber-900/60 uppercase tracking-widest mb-1">Harga</p>
                  <div className="flex items-end gap-4">
                    <span className="text-4xl font-black text-amber-900">{formatRupiah(currentPrice)}</span>
                  </div>
                </div>

                {/* VARIAN */}
                {product.variants?.length > 0 && (
                  <div className="mb-8">
                    <h3 className="font-extrabold text-amber-950 text-[10px] uppercase tracking-widest mb-4">Pilih Varian</h3>
                    <div className="flex flex-wrap gap-3">
                      {product.variants.map((variant: any) => (
                        <button
                          key={variant.id}
                          onClick={() => {
                            setSelectedVariant(variant);
                            if (variant.image) setActiveImage(getImagePath(variant.image));
                          }}
                          className={`px-5 py-3 rounded-2xl font-bold text-sm border-2 transition-all ${
                            selectedVariant?.id === variant.id 
                              ? 'bg-amber-900 text-white border-amber-900 shadow-md' 
                              : 'bg-white text-gray-600 border-gray-200 hover:border-amber-400'
                          }`}
                        >
                          {variant.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* QUANTITY & BUTTON */}
                <div className="flex gap-4 mt-10">
                  <div className="flex items-center bg-gray-50 border border-gray-200 rounded-2xl p-2">
                    <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 font-black text-xl text-amber-900">-</button>
                    <span className="w-12 text-center font-black text-lg text-amber-950">{qty}</span>
                    <button onClick={() => setQty(qty + 1)} className="w-10 h-10 font-black text-xl text-amber-900">+</button>
                  </div>
                  <button 
                    onClick={handleAddToCart}
                    disabled={isPending}
                    className={`flex-1 flex items-center justify-center gap-3 rounded-2xl font-black text-lg transition-all shadow-xl ${
                      isPending ? 'bg-gray-100 text-gray-400' : 'bg-amber-900 hover:bg-black text-white'
                    }`}
                  >
                    {isPending ? <Loader2 className="animate-spin" /> : <><ShoppingCart size={22} /> Masukkan Palka</>}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* DESKRIPSI & ULASAN */}
          <div className="border-t border-gray-100 bg-gray-50/50 p-6 md:p-10 lg:p-16">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12 text-gray-800">
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-black text-amber-950 mb-6 flex items-center gap-3"><Package className="text-amber-600" /> Detail Pusaka</h2>
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-gray-600 font-medium leading-relaxed">
                  <p>{product.description}</p>
                </div>
                
                {/* Bagian Ulasan */}
                <div className="mt-12">
                  <h3 className="text-2xl font-black text-amber-950 mb-6 flex items-center gap-3"><MessageSquare className="text-amber-600" /> Ulasan</h3>
                  {hasReviews ? (
                    <div className="space-y-6">
                      {reviews.map((review: any) => (
                        <div key={review.id} className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm transition-all hover:shadow-md">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-900 font-black shadow-inner uppercase">
                              {review.user?.name?.substring(0, 1) || <User size={20} />}
                            </div>
                            <div>
                              <p className="font-black text-gray-900 text-sm leading-tight">{review.user?.name || 'Anonim'}</p>
                              <div className="flex text-amber-400 mt-0.5">
                                {[...Array(5)].map((_, i) => <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "text-amber-500" : "text-gray-200"} />)}
                              </div>
                            </div>
                            <span className="ml-auto text-[10px] font-black text-gray-300 uppercase tracking-widest">
                              {new Date(review.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                            </span>
                          </div>

                          <p className="text-gray-600 text-sm pl-16 italic font-medium leading-relaxed">"{review.comment}"</p>

                          {/* Foto dari Pelanggan (Jika ada) */}
                          {review.image && (
                            <div className="mt-4 ml-16">
                              <a href={getImagePath(review.image)} target="_blank" rel="noreferrer" className="inline-block relative group/img overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
                                <img 
                                  src={getImagePath(review.image)} 
                                  alt="Bukti Produk" 
                                  className="w-24 h-24 md:w-32 md:h-32 object-cover group-hover/img:scale-110 transition-transform duration-500" 
                                />
                                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                  <ImageIcon className="text-white" size={20} />
                                </div>
                              </a>
                            </div>
                          )}

                          {/* BALASAN ADMIN (Dinamis dari Database) */}
                          {review.admin_reply && (
                            <div className="mt-6 ml-16 p-5 bg-amber-50 rounded-[1.5rem] border border-amber-100 relative overflow-hidden animate-in fade-in slide-in-from-left-4 duration-500">
                              {/* Latar Belakang Ikon Dekoratif */}
                              <div className="absolute -right-4 -top-4 opacity-5 rotate-12">
                                 <MessageSquare size={64} className="text-amber-900" />
                              </div>
                              
                              <div className="flex items-center gap-2 mb-3 relative z-10">
                                <div className="w-6 h-6 bg-amber-900 text-white rounded-full flex items-center justify-center shadow-md">
                                  <ShieldCheck size={14} strokeWidth={3} />
                                </div>
                                <p className="text-[10px] font-black text-amber-900 uppercase tracking-[0.2em]">Respon Wulita Handmade</p>
                              </div>
                              
                              <p className="text-xs text-amber-800 leading-relaxed font-bold italic relative z-10">
                                "{review.admin_reply}"
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white p-10 rounded-3xl text-center text-gray-400 font-bold italic border-2 border-dashed border-gray-100">
                      Belum ada ulasan untuk pusaka ini.
                    </div>
                  )}
                </div>
              </div>

              {/* Statistik Rating */}
              <div className="lg:col-span-1">
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 sticky top-28 shadow-sm">
                  <h3 className="text-lg font-black text-amber-950 mb-6 uppercase text-[10px] tracking-[0.3em]">Reputasi Produk</h3>
                  <div className="flex items-center gap-4 mb-8">
                    <span className="text-6xl font-black text-amber-900">{avgRating}</span>
                    <div className="flex flex-col">
                      <div className="flex text-amber-500">
                        {[...Array(5)].map((_, i) => <Star key={i} size={18} fill={i < Math.round(Number(avgRating)) ? "currentColor" : "none"} className={i < Math.round(Number(avgRating)) ? "text-amber-500" : "text-gray-200"} />)}
                      </div>
                      <span className="text-xs font-bold text-gray-400 mt-1">{reviews.length} Ulasan Terverifikasi</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {ratingStats.map((stat) => (
                      <div key={stat.star} className="flex items-center gap-3 text-xs font-black group">
                        <span className="w-3 text-gray-400 group-hover:text-amber-600 transition-colors">{stat.star}</span>
                        <Star size={14} className="text-amber-500" fill="currentColor" />
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                          <div 
                            className="h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-1000 ease-out shadow-sm" 
                            style={{ width: `${stat.percent}%` }}
                          ></div>
                        </div>
                        <span className="w-6 text-right text-gray-300 font-bold">{stat.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}