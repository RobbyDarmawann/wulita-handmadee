"use client";

import { useState } from "react";
import { Trash2, ImageIcon, Package, Info, Tags, Save, ChevronDown, Check } from "lucide-react";
import { addProduct } from "../actions";
import { useToast } from '@/context/ToastContext';
import { useRouter } from "next/navigation";

export default function TambahProdukForm({ categories }: { categories: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  
  // STATE CUSTOM DROPDOWN KATEGORI
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  
  // State Varian Dinamis
  const [variants, setVariants] = useState([
    { id: Date.now(), name: "", price: "", stock: "", imagePreview: null as string | null }
  ]);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);

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

  const handleSubmit = async (formData: FormData) => {
    if (!selectedCategory) {
      addToast("Pilih Kategori Pusaka terlebih dahulu, Kapten!", "warning");
      return;
    }
    setLoading(true);
    await addProduct(formData);
    router.push("/admin/produk");
  };

  const inputStyle = "w-full px-5 py-4 bg-amber-50/30 border-2 border-amber-100/80 rounded-[1.25rem] outline-none focus:border-amber-400 focus:ring-[4px] focus:ring-amber-500/10 transition-all duration-300 text-amber-950 placeholder:text-amber-900/30 font-medium shadow-inner";
  const labelStyle = "block text-[10px] font-black uppercase text-amber-900/50 ml-1 tracking-widest mb-2";

  return (
    <form action={handleSubmit} encType="multipart/form-data" className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
      
      {/* --- KOLOM KIRI: INFO DASAR & VARIAN --- */}
      <div className="lg:col-span-2 space-y-8">
        
        {/* Section 1: Informasi Dasar */}
        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-amber-900/5 border border-amber-100/50">
          <h3 className="text-xl font-black text-amber-950 mb-8 flex items-center gap-3">
            <span className="w-10 h-10 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center text-sm font-black shadow-inner">01</span>
            Informasi Dasar Pusaka
          </h3>
          <div className="space-y-6">
            <div>
              <label className={labelStyle}>Nama Produk *</label>
              <input name="name" type="text" required placeholder="Contoh: Gelang Sulam Karawo Emas" className={inputStyle} />
            </div>
            <div>
              <label className={labelStyle}>Deskripsi Detail</label>
              <textarea name="description" rows={5} placeholder="Ceritakan nilai filosofis dan detail produk ini..." className={inputStyle}></textarea>
            </div>
          </div>
        </div>

        {/* Section 2: Manajemen Varian */}
        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-amber-900/5 border border-amber-100/50">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-amber-950 flex items-center gap-3">
              <span className="w-10 h-10 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center text-sm font-black shadow-inner">02</span>
              Varian (Ukuran/Warna)
            </h3>
            <button type="button" onClick={handleAddVariant} className="px-5 py-2.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-100 hover:-translate-y-0.5 transition-all">
              + Tambah Varian
            </button>
          </div>

          <div className="space-y-4">
            {variants.map((v, index) => (
              <div key={v.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-amber-50/20 p-5 rounded-[1.5rem] border border-amber-100/80 relative group hover:border-amber-300 transition-colors">
                <button 
                  type="button" 
                  onClick={() => handleRemoveVariant(v.id)}
                  className="absolute -top-3 -right-3 w-8 h-8 bg-white border border-red-100 text-red-500 rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                >
                  <Trash2 size={14} />
                </button>

                <div className="md:col-span-1">
                  <input name={`variants[${index}][name]`} value={v.name} onChange={(e) => handleVariantChange(v.id, 'name', e.target.value)} placeholder="Nama Varian" required className="w-full px-4 py-3.5 rounded-xl border border-amber-100 outline-none bg-white text-xs font-bold shadow-sm focus:ring-2 focus:ring-amber-500 text-amber-950" />
                </div>
                <div>
                  <input name={`variants[${index}][price]`} value={v.price} onChange={(e) => handleVariantChange(v.id, 'price', e.target.value)} type="number" placeholder="Harga (+/-)" className="w-full px-4 py-3.5 rounded-xl border border-amber-100 outline-none bg-white text-xs font-bold shadow-sm focus:ring-2 focus:ring-amber-500 text-amber-950" />
                </div>
                <div>
                  <input name={`variants[${index}][stock]`} value={v.stock} onChange={(e) => handleVariantChange(v.id, 'stock', e.target.value)} type="number" placeholder="Stok" required className="w-full px-4 py-3.5 rounded-xl border border-amber-100 outline-none bg-white text-xs font-bold shadow-sm focus:ring-2 focus:ring-amber-500 text-amber-950" />
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex-1 cursor-pointer group/img">
                    <div className="h-11 bg-white rounded-xl border-2 border-dashed border-amber-200 flex items-center justify-center overflow-hidden group-hover/img:border-amber-400 transition-colors">
                      {v.imagePreview ? (
                        <img src={v.imagePreview} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon size={16} className="text-amber-900/30 group-hover/img:text-amber-500" />
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
        
        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-amber-900/5 border border-amber-100/50 text-center">
          <h3 className={labelStyle + " text-center mb-4"}>Foto Utama *</h3>
          <label className="cursor-pointer group">
            <div className="aspect-square bg-amber-50/30 rounded-[2rem] border-2 border-dashed border-amber-200 flex flex-col items-center justify-center transition-all group-hover:border-amber-500 overflow-hidden relative shadow-inner">
              {mainImagePreview ? (
                <img src={mainImagePreview} className="w-full h-full object-cover" />
              ) : (
                <>
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-amber-100 flex items-center justify-center text-amber-900/30 mb-3 group-hover:scale-110 group-hover:text-amber-500 transition-all">
                    <ImageIcon size={32} />
                  </div>
                  <span className="text-[10px] font-black text-amber-900/40 uppercase tracking-[0.2em]">Upload Foto Utama</span>
                </>
              )}
            </div>
            <input name="image" type="file" accept="image/*" required className="hidden" onChange={(e) => {
              const file = e.target.files?.[0];
              if(file) setMainImagePreview(URL.createObjectURL(file));
            }} />
          </label>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-[#F3E5DC]/50 p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-amber-900/5 border-2 border-white space-y-8 relative z-20">
          
          {/* ========================================= */}
          {/* CUSTOM DROPDOWN: KATEGORI */}
          {/* ========================================= */}
          <div className="relative">
            <label className={labelStyle + " flex items-center gap-1.5"}><Tags size={12} /> Kategori Pusaka *</label>
            <input type="hidden" name="category_id" value={selectedCategory} required />
            
            <div 
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className={`w-full px-5 py-4 bg-white border-2 rounded-[1.25rem] cursor-pointer flex justify-between items-center transition-all shadow-sm ${isCategoryOpen ? 'border-amber-400 ring-[4px] ring-amber-500/10' : 'border-amber-100/80 hover:border-amber-300'}`}
            >
              <span className={`font-bold text-sm ${selectedCategory ? 'text-amber-950' : 'text-amber-900/40'}`}>
                {selectedCategory ? categories.find(c => c.id.toString() === selectedCategory.toString())?.name : "Pilih Kategori..."}
              </span>
              <ChevronDown size={20} className={`transition-transform duration-300 ${isCategoryOpen ? 'rotate-180 text-amber-600' : 'text-amber-900/40'}`} />
            </div>

            {isCategoryOpen && <div className="fixed inset-0 z-10" onClick={() => setIsCategoryOpen(false)}></div>}

            {isCategoryOpen && (
              <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-[1.25rem] border border-amber-100 shadow-2xl shadow-amber-900/20 overflow-hidden z-30 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="max-h-60 overflow-y-auto custom-scrollbar p-2">
                  {categories.map((cat) => (
                    <div 
                      key={cat.id}
                      onClick={() => { setSelectedCategory(cat.id.toString()); setIsCategoryOpen(false); }}
                      className={`px-4 py-3.5 cursor-pointer rounded-xl flex justify-between items-center transition-all mb-1 last:mb-0 ${selectedCategory === cat.id.toString() ? 'bg-amber-50' : 'hover:bg-gray-50'}`}
                    >
                      <span className={`text-sm font-bold ${selectedCategory === cat.id.toString() ? 'text-amber-950' : 'text-gray-600'}`}>
                        {cat.name}
                      </span>
                      {selectedCategory === cat.id.toString() && <Check size={16} className="text-amber-600" />}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className={labelStyle}>Harga Utama (Rp) *</label>
            <input name="price" type="number" required placeholder="0" className="w-full px-5 py-4 bg-white border border-amber-100 rounded-[1.25rem] focus:ring-2 focus:ring-amber-500 outline-none text-xl font-black text-amber-950 shadow-sm" />
          </div>

          <div className="p-5 bg-white/60 rounded-[1.5rem] border border-red-100 shadow-sm">
            <label className="text-[10px] font-black uppercase text-red-900/60 tracking-widest flex items-center gap-1.5 mb-2"><Info size={12} /> Harga Promo</label>
            <input name="discount_price" type="number" placeholder="Lewati jika tak ada promo" className="w-full px-5 py-3.5 bg-white border border-red-100 rounded-xl focus:ring-2 focus:ring-red-400 outline-none text-sm font-bold text-red-600 shadow-sm placeholder:text-red-900/30" />
          </div>

          <div className="border-t border-amber-200/50 pt-6">
            <label className={labelStyle + " flex items-center gap-1.5"}><Package size={12} /> Total Stok Tersedia</label>
            <input type="number" value={totalStock} readOnly className="w-full px-5 py-4 bg-amber-950/5 border border-amber-900/10 rounded-[1.25rem] text-amber-950 font-black cursor-not-allowed outline-none" />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-amber-950 hover:bg-black text-white py-5 rounded-[1.25rem] font-black uppercase text-xs tracking-[0.2em] transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-900/20 active:translate-y-0 flex items-center justify-center gap-3 disabled:bg-gray-300 disabled:shadow-none disabled:transform-none disabled:cursor-not-allowed"
          >
            {loading ? "Menyimpan..." : <><Save size={18} /> Terbitkan Pusaka</>}
          </button>
        </div>

      </div>
    </form>
  );
}