"use client";

import { useState, useEffect } from 'react';
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

  // Perhitungan Harga Dinamis
  const basePrice = product.discount_price > 0 ? product.discount_price : product.price;
  const currentPrice = selectedVariant 
    ? (selectedVariant.price > 0 ? selectedVariant.price : basePrice)
    : basePrice;

  // --- LOGIKA STOK DINAMIS (BARU) ---
  // Membaca stok dari varian yang dipilih. Jika tidak ada varian, baca dari stok utama produk.
  const currentStock = selectedVariant && selectedVariant.stock !== undefined
    ? selectedVariant.stock
    : (product.stock || 0);

  // Efek untuk mereset quantity ke 1 jika stok varian yang dipilih ternyata 0 atau kurang dari qty saat ini
  useEffect(() => {
    if (qty > currentStock) {
      setQty(Math.max(1, currentStock));
    }
  }, [currentStock, qty]);

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

    if (currentStock === 0) {
      alert("Maaf, stok untuk varian ini sedang kosong.");
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
    <div className="min-h-screen bg-[#FAFAFA] font-sans pb-20 relative overflow-hidden">
      
      {/* NOTIFIKASI TOAST */}
      {showToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 duration-500 w-[90%] sm:w-auto">
          <div className="bg-white border-2 border-green-100 shadow-2xl shadow-green-900/20 px-6 sm:px-8 py-4 sm:py-5 rounded-[2rem] sm:rounded-[2.5rem] flex flex-wrap sm:flex-nowrap items-center justify-center sm:justify-start gap-4 sm:gap-5 text-gray-800">
            <div className="bg-green-500 text-white p-2 rounded-full ring-4 ring-green-50 hidden sm:block">
              <CheckCircle2 size={28} />
            </div>
            <div className="text-center sm:text-left">
              <p className="font-black text-sm tracking-tight leading-none mb-1 text-gray-900">Berhasil Masuk Palka!</p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Produk siap berlayar</p>
            </div>
            <Link href="/keranjang" className="sm:ml-4 bg-amber-900 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all w-full sm:w-auto text-center mt-2 sm:mt-0">
              Cek Palka
            </Link>
          </div>
        </div>
      )}

      {/* TOMBOL EDIT ADMIN */}
      <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50">
        <Link 
          href={`/admin/produk/edit/${product.id}`}
          className="bg-black text-white px-4 py-3 md:px-6 md:py-4 rounded-full shadow-2xl flex items-center gap-2 md:gap-3 hover:bg-amber-900 transition-all font-black uppercase text-[10px] md:text-xs tracking-widest border-2 border-white/10"
        >
          <Edit3 size={16} className="md:w-[18px] md:h-[18px]" /> 
          <span className="hidden sm:inline">Edit Produk (Admin)</span>
          <span className="sm:hidden">Edit</span>
        </Link>
      </div>

      {/* BREADCRUMB */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
        <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-gray-500 font-medium">
          <Link href="/" className="hover:text-amber-700 flex items-center gap-1 transition-colors">
            <ArrowLeft size={16} /> Beranda
          </Link>
          <ChevronRight size={14} className="text-gray-300" />
          <Link href={`/katalog?kategori_id=${product.categoryId}`} className="hover:text-amber-700 transition-colors">
            {product.category?.name || 'Kategori'}
          </Link>
          <ChevronRight size={14} className="text-gray-300" />
          <span className="text-amber-900 font-bold truncate max-w-[150px] sm:max-w-[200px]">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            
            {/* GALLERY */}
            <div className="lg:w-1/2 p-5 sm:p-6 md:p-10 lg:border-r border-gray-100">
              <div className="relative w-full aspect-square rounded-[1.5rem] md:rounded-[2rem] overflow-hidden bg-gray-50 mb-4 md:mb-6 group flex items-center justify-center">
                {activeImage ? (
                  <Image src={activeImage} alt={product.name} fill unoptimized className="object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <Package size={64} className="text-gray-200" />
                )}
                {product.discount_price > 0 && (
                  <div className="absolute top-4 left-4 md:top-6 md:left-6 bg-red-500 text-white font-black text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2 rounded-full shadow-lg z-10">PROMO</div>
                )}
              </div>
              <div className="flex gap-3 md:gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {allImages.map((img: any, idx: number) => (
                  <button key={idx} onClick={() => setActiveImage(img)} className={`relative w-20 h-20 md:w-24 md:h-24 rounded-xl md:rounded-2xl overflow-hidden flex-shrink-0 border-4 transition-all ${activeImage === img ? 'border-amber-500 scale-105 md:scale-105' : 'border-transparent'}`}>
                    <Image src={img} alt="Thumb" fill unoptimized className="object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* INFO PRODUK */}
            <div className="lg:w-1/2 p-5 sm:p-6 md:p-10 flex flex-col">
              <div className="lg:sticky lg:top-28">
                <div className="flex justify-between items-start mb-2 gap-4">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-amber-950 leading-tight">{product.name}</h1>
                  <button className="p-2 md:p-3 bg-red-50 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all flex-shrink-0">
                    <Heart size={20} className="md:w-6 md:h-6" />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-6 md:mb-8">
                  <div className="flex items-center text-amber-500">
                    {[...Array(5)].map((_, i) => (
                       <Star key={i} size={16} className={`md:w-5 md:h-5 ${i < Math.round(Number(avgRating)) ? "text-amber-500" : "text-gray-200"}`} fill={i < Math.round(Number(avgRating)) ? "currentColor" : "none"} />
                    ))}
                  </div>
                  <span className="text-xs md:text-sm font-bold text-gray-400">{reviews.length} Ulasan</span>
                </div>

                <div className="mb-6 md:mb-8 p-5 md:p-6 bg-gradient-to-br from-amber-50 to-[#F3E5DC]/30 rounded-[1.5rem] md:rounded-[2rem] border border-amber-100">
                  <p className="text-[10px] md:text-xs font-black text-amber-900/60 uppercase tracking-widest mb-1">Harga</p>
                  <div className="flex items-end gap-4">
                    <span className="text-3xl md:text-4xl font-black text-amber-900">{formatRupiah(currentPrice)}</span>
                  </div>
                </div>

                {/* VARIAN */}
                {product.variants?.length > 0 && (
                  <div className="mb-6 md:mb-8">
                    <h3 className="font-extrabold text-amber-950 text-[10px] uppercase tracking-widest mb-3 md:mb-4">Pilih Varian</h3>
                    <div className="flex flex-wrap gap-2 md:gap-3">
                      {product.variants.map((variant: any) => (
                        <button
                          key={variant.id}
                          onClick={() => {
                            setSelectedVariant(variant);
                            if (variant.image) setActiveImage(getImagePath(variant.image));
                            // Qty otomatis reset ke 1 saat ganti varian agar tidak error
                            setQty(1); 
                          }}
                          className={`px-4 py-2 md:px-5 md:py-3 rounded-xl md:rounded-2xl font-bold text-xs md:text-sm border-2 transition-all ${
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

                {/* INFO STOK DINAMIS (Berdasarkan Varian Terpilih) */}
                <div className="flex items-center gap-2 mb-4 mt-2">
                  <div className={`w-2 h-2 rounded-full ${currentStock > 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                  <span className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest">
                    Persediaan: <span className={currentStock > 0 ? "text-amber-900" : "text-red-500"}>
                      {currentStock > 0 ? `${currentStock} Pcs` : 'Habis'}
                    </span>
                  </span>
                </div>

                {/* QUANTITY & BUTTON */}
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                  <div className={`flex items-center justify-between sm:justify-center border border-gray-200 rounded-xl md:rounded-2xl p-2 h-14 md:h-auto ${currentStock === 0 ? 'bg-gray-100 opacity-50' : 'bg-gray-50'}`}>
                    <button 
                      onClick={() => setQty(Math.max(1, qty - 1))} 
                      disabled={currentStock === 0}
                      className="w-10 h-full md:h-10 font-black text-2xl md:text-xl text-amber-900 flex items-center justify-center disabled:opacity-50"
                    >-</button>
                    
                    <span className="w-16 sm:w-12 text-center font-black text-lg text-amber-950">
                      {currentStock === 0 ? 0 : qty}
                    </span>
                    
                    {/* Logika Math.min mencegah pembeli menekan plus melebihi stok */}
                    <button 
                      onClick={() => setQty(Math.min(currentStock, qty + 1))} 
                      disabled={currentStock === 0 || qty >= currentStock}
                      className="w-10 h-full md:h-10 font-black text-2xl md:text-xl text-amber-900 flex items-center justify-center disabled:opacity-50"
                    >+</button>
                  </div>

                  <button 
                    onClick={handleAddToCart}
                    disabled={isPending || currentStock === 0}
                    className={`flex-1 flex items-center justify-center gap-2 md:gap-3 rounded-xl md:rounded-2xl font-black text-base md:text-lg py-4 md:py-0 transition-all shadow-xl ${
                      isPending || currentStock === 0 
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                        : 'bg-amber-900 hover:bg-black text-white'
                    }`}
                  >
                    {isPending ? <Loader2 className="animate-spin" /> : (
                      <>
                        <ShoppingCart size={20} className="md:w-[22px] md:h-[22px]" /> 
                        {currentStock === 0 ? 'Stok Habis' : 'Masukkan Palka'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* DESKRIPSI & ULASAN (Aman, 100% Tidak Disentuh!) */}
          <div className="border-t border-gray-100 bg-gray-50/50 p-5 sm:p-8 md:p-10 lg:p-16">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 text-gray-800">
              <div className="lg:col-span-2">
                <h2 className="text-xl md:text-2xl font-black text-amber-950 mb-4 md:mb-6 flex items-center gap-2 md:gap-3"><Package className="text-amber-600 w-5 h-5 md:w-6 md:h-6" /> Detail Pusaka</h2>
                <div className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-3xl shadow-sm border border-gray-100 text-sm md:text-base text-gray-600 font-medium leading-relaxed">
                  <p>{product.description}</p>
                </div>
                
                {/* Bagian Ulasan */}
                <div className="mt-10 md:mt-12">
                  <h3 className="text-xl md:text-2xl font-black text-amber-950 mb-4 md:mb-6 flex items-center gap-2 md:gap-3"><MessageSquare className="text-amber-600 w-5 h-5 md:w-6 md:h-6" /> Ulasan</h3>
                  {hasReviews ? (
                    <div className="space-y-4 md:space-y-6">
                      {reviews.map((review: any) => (
                        <div key={review.id} className="bg-white p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-gray-100 shadow-sm transition-all hover:shadow-md">
                          <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-900 font-black shadow-inner uppercase shrink-0">
                              {review.user?.name?.substring(0, 1) || <User size={18} />}
                            </div>
                            <div className="min-w-0">
                              <p className="font-black text-gray-900 text-xs md:text-sm leading-tight truncate">{review.user?.name || 'Anonim'}</p>
                              <div className="flex text-amber-400 mt-0.5 md:mt-1">
                                {[...Array(5)].map((_, i) => <Star key={i} size={10} className="md:w-3 md:h-3" fill={i < review.rating ? "currentColor" : "none"} />)}
                              </div>
                            </div>
                            <span className="ml-auto text-[9px] md:text-[10px] font-black text-gray-300 uppercase tracking-widest shrink-0">
                              {new Date(review.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                            </span>
                          </div>

                          <p className="text-gray-600 text-xs md:text-sm sm:pl-14 md:pl-16 italic font-medium leading-relaxed mt-2 sm:mt-0">"{review.comment}"</p>

                          {/* Foto dari Pelanggan */}
                          {review.image && (
                            <div className="mt-3 md:mt-4 sm:ml-14 md:ml-16">
                              <a href={getImagePath(review.image)} target="_blank" rel="noreferrer" className="inline-block relative group/img overflow-hidden rounded-xl md:rounded-2xl border border-gray-100 shadow-sm">
                                <img 
                                  src={getImagePath(review.image)} 
                                  alt="Bukti Produk" 
                                  className="w-20 h-20 md:w-32 md:h-32 object-cover group-hover/img:scale-110 transition-transform duration-500" 
                                />
                                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                  <ImageIcon className="text-white" size={20} />
                                </div>
                              </a>
                            </div>
                          )}

                          {/* BALASAN ADMIN */}
                          {review.admin_reply && (
                            <div className="mt-4 md:mt-6 sm:ml-14 md:ml-16 p-4 md:p-5 bg-amber-50 rounded-[1rem] md:rounded-[1.5rem] border border-amber-100 relative overflow-hidden animate-in fade-in slide-in-from-left-4 duration-500">
                              <div className="absolute -right-2 -top-2 md:-right-4 md:-top-4 opacity-5 rotate-12">
                                 <MessageSquare size={48} className="md:w-16 md:h-16 text-amber-900" />
                              </div>
                              
                              <div className="flex items-center gap-2 mb-2 md:mb-3 relative z-10">
                                <div className="w-5 h-5 md:w-6 md:h-6 bg-amber-900 text-white rounded-full flex items-center justify-center shadow-md shrink-0">
                                  <ShieldCheck size={12} className="md:w-[14px] md:h-[14px]" strokeWidth={3} />
                                </div>
                                <p className="text-[9px] md:text-[10px] font-black text-amber-900 uppercase tracking-[0.2em]">Respon Wulita</p>
                              </div>
                              
                              <p className="text-[11px] md:text-xs text-amber-800 leading-relaxed font-bold italic relative z-10">
                                "{review.admin_reply}"
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white p-6 md:p-10 rounded-[1.5rem] md:rounded-3xl text-center text-gray-400 font-bold italic border-2 border-dashed border-gray-100 text-sm md:text-base">
                      Belum ada ulasan untuk pusaka ini.
                    </div>
                  )}
                </div>
              </div>

              {/* Statistik Rating */}
              <div className="lg:col-span-1">
                <div className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-100 lg:sticky lg:top-28 shadow-sm">
                  <h3 className="text-base md:text-lg font-black text-amber-950 mb-4 md:mb-6 uppercase text-[10px] tracking-[0.3em]">Reputasi Produk</h3>
                  <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
                    <span className="text-4xl md:text-6xl font-black text-amber-900">{avgRating}</span>
                    <div className="flex flex-col">
                      <div className="flex text-amber-500">
                        {[...Array(5)].map((_, i) => <Star key={i} size={14} className="md:w-[18px] md:h-[18px]" fill={i < Math.round(Number(avgRating)) ? "currentColor" : "none"} />)}
                      </div>
                      <span className="text-[10px] md:text-xs font-bold text-gray-400 mt-1">{reviews.length} Ulasan Terverifikasi</span>
                    </div>
                  </div>
                  <div className="space-y-3 md:space-y-4">
                    {ratingStats.map((stat) => (
                      <div key={stat.star} className="flex items-center gap-2 md:gap-3 text-[10px] md:text-xs font-black group">
                        <span className="w-2 md:w-3 text-gray-400 group-hover:text-amber-600 transition-colors">{stat.star}</span>
                        <Star size={10} className="md:w-3.5 md:h-3.5 text-amber-500 shrink-0" fill="currentColor" />
                        <div className="flex-1 h-1.5 md:h-2 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                          <div 
                            className="h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-1000 ease-out shadow-sm" 
                            style={{ width: `${stat.percent}%` }}
                          ></div>
                        </div>
                        <span className="w-4 md:w-6 text-right text-gray-300 font-bold">{stat.count}</span>
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