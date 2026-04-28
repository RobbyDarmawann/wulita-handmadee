"use client";

import { useState } from "react";
import { Trash2, Save, RefreshCcw, ChevronDown, Check, Tags, Package, Info } from "lucide-react";
import ImagePreview from "../../../ImagePreview";
import { updateProduct } from "../../actions";
import { useRouter } from "next/navigation";

export default function EditProdukForm({ product, categories }: any) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // STATE CUSTOM DROPDOWN KATEGORI
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(product.categoryId.toString());
  
  const [variants, setVariants] = useState(
    product.variants.map((v: any) => ({
      ...v,
      isExisting: true,
      deleteFlag: false,
      tempImagePreview: v.image 
    }))
  );

  const totalStock = variants
    .filter((v: any) => !v.deleteFlag)
    .reduce((acc: number, curr: any) => acc + (parseInt(curr.stock) || 0), 0);

  const toggleDeleteVariant = (index: number) => {
    const newVariants = [...variants];
    if (!newVariants[index].isExisting) {
      setVariants(variants.filter((variant: any, i: number) => i !== index));
    } else {
      newVariants[index].deleteFlag = !newVariants[index].deleteFlag;
      setVariants(newVariants);
    }
  };

  const updateVariantStock = (index: number, val: string) => {
    const newVariants = [...variants];
    newVariants[index].stock = val;
    setVariants(newVariants);
  };

  const handleSubmit = async (formData: FormData) => {
    if (!selectedCategory) {
      alert("Kategori wajib dipilih!");
      return;
    }
    setLoading(true);
    formData.append("category_id", selectedCategory);
    await updateProduct(product.id, formData);
    router.push("/admin/produk");
  };

  const inputStyle = "w-full px-5 py-4 bg-amber-50/30 border-2 border-amber-100/80 rounded-[1.25rem] outline-none focus:border-amber-400 focus:ring-[4px] focus:ring-amber-500/10 transition-all duration-300 text-amber-950 font-medium shadow-inner";
  const labelStyle = "block text-[10px] font-black uppercase text-amber-900/50 ml-1 tracking-widest mb-2";

  return (
    <form action={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
      
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-amber-900/5 border border-amber-100/50">
          <h3 className="text-xl font-black text-amber-950 mb-8 flex items-center gap-3">
            <span className="w-10 h-10 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center text-sm font-black shadow-inner">01</span>
            Edit Informasi Dasar
          </h3>
          <div className="space-y-6">
            <div>
              <label className={labelStyle}>Nama Produk *</label>
              <input name="name" defaultValue={product.name} required className={inputStyle} />
            </div>
            <div>
              <label className={labelStyle}>Deskripsi Detail</label>
              <textarea name="description" defaultValue={product.description} rows={5} className={inputStyle} />
            </div>
          </div>
        </div>

        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-amber-900/5 border border-amber-100/50">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-amber-950 flex items-center gap-3">
              <span className="w-10 h-10 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center text-sm font-black shadow-inner">02</span>
              Manajemen Varian
            </h3>
            <button 
              type="button" 
              onClick={() => setVariants([...variants, { id: Date.now(), name: "", price: "", stock: 0, isExisting: false, deleteFlag: false }])}
              className="px-5 py-2.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-100 hover:-translate-y-0.5 transition-all"
            >
              + Tambah Varian Baru
            </button>
          </div>

          <div className="space-y-4">
            {variants.map((v: any, index: number) => (
              <div key={v.id} className={`grid grid-cols-1 md:grid-cols-4 gap-4 p-5 rounded-[1.5rem] border transition-all ${v.deleteFlag ? 'bg-red-50/40 border-red-100 grayscale' : 'bg-amber-50/20 border-amber-100/80 hover:border-amber-300'}`}>
                {v.isExisting && <input type="hidden" name={`variants[${index}][id]`} value={v.id} />}
                <input type="hidden" name={`variants[${index}][delete]`} value={v.deleteFlag ? "1" : "0"} />

                <input name={`variants[${index}][name]`} defaultValue={v.name} placeholder="Nama Varian" required={!v.deleteFlag} disabled={v.deleteFlag} className="px-4 py-3.5 rounded-xl border border-amber-100 outline-none bg-white text-xs font-bold shadow-sm focus:ring-2 focus:ring-amber-500 text-amber-950 disabled:bg-gray-100" />
                <input name={`variants[${index}][price]`} defaultValue={v.price === product.price ? "" : v.price} type="number" placeholder="Harga Khusus" disabled={v.deleteFlag} className="px-4 py-3.5 rounded-xl border border-amber-100 outline-none bg-white text-xs font-bold shadow-sm focus:ring-2 focus:ring-amber-500 text-amber-950 disabled:bg-gray-100" />
                <input name={`variants[${index}][stock]`} value={v.stock} type="number" onChange={(e) => updateVariantStock(index, e.target.value)} required={!v.deleteFlag} disabled={v.deleteFlag} className="px-4 py-3.5 rounded-xl border border-amber-100 outline-none bg-white text-xs font-bold shadow-sm focus:ring-2 focus:ring-amber-500 text-amber-950 disabled:bg-gray-100" />
                
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => toggleDeleteVariant(index)} className={`p-3.5 rounded-xl shadow-sm transition-all border ${v.deleteFlag ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-500 hover:text-white' : 'bg-white border-red-100 text-red-500 hover:bg-red-500 hover:text-white'}`}>
                    {v.deleteFlag ? <RefreshCcw size={16} /> : <Trash2 size={16} />}
                  </button>
                  <input type="file" name={`variants[${index}][image]`} accept="image/*" disabled={v.deleteFlag} className="text-[9px] w-full file:bg-amber-50 file:border-0 file:rounded-lg file:px-3 file:py-1.5 file:text-amber-700 file:font-black file:uppercase file:cursor-pointer hover:file:bg-amber-100 disabled:opacity-50" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:col-span-1 space-y-8">
        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-amber-900/5 border border-amber-100/50">
          <h3 className={labelStyle + " text-center mb-4"}>Foto Utama *</h3>
          <div className="rounded-[2rem] overflow-hidden border-2 border-dashed border-amber-200 hover:border-amber-400 transition-colors p-2 bg-amber-50/30">
             <ImagePreview name="image" defaultValue={product.image} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-[#F3E5DC]/50 p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-amber-900/5 border-2 border-white space-y-8 relative z-20">
          
          <div className="relative">
            <label className={labelStyle + " flex items-center gap-1.5"}><Tags size={12} /> Kategori Pusaka *</label>
            
            <div 
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className={`w-full px-5 py-4 bg-white border-2 rounded-[1.25rem] cursor-pointer flex justify-between items-center transition-all shadow-sm ${isCategoryOpen ? 'border-amber-400 ring-[4px] ring-amber-500/10' : 'border-amber-100/80 hover:border-amber-300'}`}
            >
              <span className={`font-bold text-sm ${selectedCategory ? 'text-amber-950' : 'text-amber-900/40'}`}>
                {selectedCategory ? categories.find((c: any) => c.id.toString() === selectedCategory.toString())?.name : "Pilih Kategori..."}
              </span>
              <ChevronDown size={20} className={`transition-transform duration-300 ${isCategoryOpen ? 'rotate-180 text-amber-600' : 'text-amber-900/40'}`} />
            </div>

            {isCategoryOpen && <div className="fixed inset-0 z-10" onClick={() => setIsCategoryOpen(false)}></div>}

            {isCategoryOpen && (
              <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-[1.25rem] border border-amber-100 shadow-2xl shadow-amber-900/20 overflow-hidden z-30 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="max-h-60 overflow-y-auto custom-scrollbar p-2">
                  {categories.map((cat: any) => (
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
            <input name="price" type="number" defaultValue={product.price} required className="w-full px-5 py-4 bg-white border border-amber-100 rounded-[1.25rem] focus:ring-2 focus:ring-amber-500 outline-none text-xl font-black text-amber-950 shadow-sm" />
          </div>

          <div className="p-5 bg-white/60 rounded-[1.5rem] border border-red-100 shadow-sm">
            <label className="text-[10px] font-black uppercase text-red-900/60 tracking-widest flex items-center gap-1.5 mb-2"><Info size={12} /> Harga Promo</label>
            <input name="discount_price" type="number" defaultValue={product.discount_price} className="w-full px-5 py-3.5 bg-white border border-red-100 rounded-xl focus:ring-2 focus:ring-red-400 outline-none text-sm font-bold text-red-600 shadow-sm" placeholder="Opsional" />
          </div>
          
          <div className="border-t border-amber-200/50 pt-6">
             <label className={labelStyle + " flex items-center gap-1.5"}><Package size={12} /> Total Stok Tersedia</label>
             <div className="w-full px-5 py-4 bg-amber-950/5 border border-amber-900/10 rounded-[1.25rem] flex items-center justify-between">
               <span className="text-2xl font-black text-amber-950">{totalStock}</span>
               <span className="text-[10px] font-black text-amber-900/40 uppercase tracking-widest">Pcs</span>
             </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-amber-950 hover:bg-black text-white py-5 rounded-[1.25rem] font-black uppercase text-xs tracking-[0.2em] transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-900/20 active:translate-y-0 flex items-center justify-center gap-3 disabled:bg-gray-300 disabled:shadow-none disabled:transform-none disabled:cursor-not-allowed">
            {loading ? "Menyimpan..." : <><Save size={18} /> Simpan Perubahan</>}
          </button>
        </div>
      </div>
    </form>
  );
}