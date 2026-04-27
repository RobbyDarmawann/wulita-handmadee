"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, ImageIcon, Package, Info, Tags, Save } from "lucide-react";
import { addProduct } from "../actions";
import { useRouter } from "next/navigation";

export default function TambahProdukForm({ categories }: { categories: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // State untuk Varian Dinamis
  const [variants, setVariants] = useState([
    { id: Date.now(), name: "", price: "", stock: "", imagePreview: null as string | null }
  ]);

  // State untuk Preview Gambar Utama
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);

  // Auto-kalkulasi Stok Total (Setiap kali variants berubah)
  const totalStock = variants.reduce((acc, curr) => acc + (parseInt(curr.stock) || 0), 0);

  const handleAddVariant = () => {
    setVariants([...variants, { id: Date.now(), name: "", price: "", stock: "", imagePreview: null }]);
  };

  const handleRemoveVariant = (id: number) => {
    if (variants.length > 1) {
      setVariants(variants.filter(v => v.id !== id));
    }
  };

  const handleVariantChange = (id: number, field: string, value: any) => {
    setVariants(variants.map(v => {
      if (v.id === id) {
        if (field === "image") {
          const file = value.target.files[0];
          return { ...v, imagePreview: file ? URL.createObjectURL(file) : v.imagePreview };
        }
        return { ...v, [field]: value };
      }
      return v;
    }));
  };

  return (
    <form action={async (formData) => {
      setLoading(true);
      await addProduct(formData);
      router.push("/admin/produk");
    }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* --- KOLOM KIRI: INFO DASAR & VARIAN --- */}
      <div className="lg:col-span-2 space-y-8">
        
        {/* Section 1: Informasi Dasar */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
            <span className="w-10 h-10 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center text-sm font-black">01</span>
            Informasi Dasar Pusaka
          </h3>
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 ml-1 tracking-widest">Nama Produk</label>
              <input name="name" type="text" required placeholder="Contoh: Gelang Sulam Karawo Emas" className="w-full mt-2 px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-amber-500 text-sm font-bold shadow-inner" />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 ml-1 tracking-widest">Deskripsi Detail</label>
              <textarea name="description" rows={5} placeholder="Ceritakan keunikan produk buatan tangan ini..." className="w-full mt-2 px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-amber-500 text-sm font-medium shadow-inner"></textarea>
            </div>
          </div>
        </div>

        {/* Section 2: Manajemen Varian (Dinamis) */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
              <span className="w-10 h-10 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center text-sm font-black">02</span>
              Varian Produk
            </h3>
            <button type="button" onClick={handleAddVariant} className="px-4 py-2 bg-amber-50 text-amber-700 rounded-xl text-xs font-black uppercase hover:bg-amber-100 transition-all">
              + Tambah Baris
            </button>
          </div>

          <div className="space-y-4">
            {variants.map((v, index) => (
              <div key={v.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50/50 p-5 rounded-3xl border border-gray-100 relative group">
                <button 
                  type="button" 
                  onClick={() => handleRemoveVariant(v.id)}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-white text-red-500 rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                >
                  <Trash2 size={14} />
                </button>

                <div className="md:col-span-1">
                  <input name={`variants[${index}][name]`} value={v.name} onChange={(e) => handleVariantChange(v.id, 'name', e.target.value)} placeholder="Nama Varian" required className="w-full px-4 py-3 rounded-xl border-none bg-white text-xs font-bold shadow-sm focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <input name={`variants[${index}][price]`} value={v.price} onChange={(e) => handleVariantChange(v.id, 'price', e.target.value)} type="number" placeholder="Harga Opsional" className="w-full px-4 py-3 rounded-xl border-none bg-white text-xs font-bold shadow-sm focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <input name={`variants[${index}][stock]`} value={v.stock} onChange={(e) => handleVariantChange(v.id, 'stock', e.target.value)} type="number" placeholder="Stok" required className="w-full px-4 py-3 rounded-xl border-none bg-white text-xs font-bold shadow-sm focus:ring-2 focus:ring-amber-500" />
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex-1 cursor-pointer">
                    <div className="h-10 bg-white rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                      {v.imagePreview ? (
                        <img src={v.imagePreview} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon size={16} className="text-gray-300" />
                      )}
                    </div>
                    <input name={`variants[${index}][image]`} type="file" accept="image/*" className="hidden" onChange={(e) => handleVariantChange(v.id, 'image', e)} />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- KOLOM KANAN: MEDIA & PENGATURAN HARGA --- */}
      <div className="lg:col-span-1 space-y-8">
        
        {/* Foto Utama */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 text-center">
          <h3 className="text-sm font-black text-gray-900 mb-4 uppercase tracking-widest">Foto Utama</h3>
          <label className="cursor-pointer group">
            <div className="aspect-square bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center transition-all group-hover:border-amber-400 overflow-hidden relative">
              {mainImagePreview ? (
                <img src={mainImagePreview} className="w-full h-full object-cover" />
              ) : (
                <>
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-gray-300 mb-3 group-hover:scale-110 transition-transform">
                    <ImageIcon size={32} />
                  </div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Upload Foto Utama</span>
                </>
              )}
            </div>
            <input name="image" type="file" accept="image/*" required className="hidden" onChange={(e) => {
              const file = e.target.files?.[0];
              if(file) setMainImagePreview(URL.createObjectURL(file));
            }} />
          </label>
        </div>

        {/* Pengaturan Harga & Kategori */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-6">
          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1 tracking-widest flex items-center gap-1.5"><Tags size={12} /> Kategori</label>
            <select name="category_id" required className="w-full mt-2 px-5 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-amber-500 text-sm font-bold appearance-none">
              <option value="">Pilih Kategori</option>
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1 tracking-widest">Harga Utama (Rp)</label>
            <input name="price" type="number" required placeholder="0" className="w-full mt-2 px-5 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-amber-500 text-lg font-black text-amber-900" />
          </div>

          <div className="p-5 bg-red-50 rounded-3xl border border-red-100">
            <label className="text-[10px] font-black uppercase text-red-900 tracking-widest flex items-center gap-1.5"><Info size={12} /> Harga Promo (Opsional)</label>
            <input name="discount_price" type="number" placeholder="Tak ada promo" className="w-full mt-2 px-4 py-3 bg-white border-none rounded-xl focus:ring-2 focus:ring-red-500 text-sm font-bold text-red-600 shadow-sm" />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1 tracking-widest flex items-center gap-1.5"><Package size={12} /> Total Stok (Otomatis)</label>
            <input type="number" value={totalStock} readOnly className="w-full mt-2 px-5 py-3 bg-gray-100 border border-gray-200 rounded-2xl text-gray-400 font-black cursor-not-allowed" />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-amber-900 hover:bg-black text-white py-5 rounded-[2rem] font-black text-sm transition-all shadow-xl shadow-amber-900/30 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Menerbitkan..." : <><Save size={20} /> Terbitkan Pusaka</>}
          </button>
        </div>

      </div>
    </form>
  );
}